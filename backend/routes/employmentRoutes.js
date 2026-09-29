const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");


// =====================================================
// HELPER
// AUTOMATICALLY CREATE 3 / 6 / 12 MONTH FOLLOW-UPS
// =====================================================
async function generateEmploymentFollowups(
    db,
    traineeId,
    employment
) {
    if (!traineeId) {
        return;
    }

    // Follow-ups tabhi create honge jab joining date available ho
    if (!employment?.joining_date) {
        return;
    }

    // Agar employment type explicitly unemployed hai,
    // to employment follow-ups create nahi karne hain.
    const employmentType = String(
        employment.employment_type || ""
    )
        .trim()
        .toLowerCase();

    if (employmentType === "unemployed") {
        return;
    }

    const followups = [
        {
            type: "3-Month Follow-up",
            months: 3
        },
        {
            type: "6-Month Follow-up",
            months: 6
        },
        {
            type: "12-Month Follow-up",
            months: 12
        }
    ];

    for (const followup of followups) {

        // -------------------------------------------------
        // 1. Agar follow-up already exist karta hai
        //    to duplicate create nahi hoga.
        // -------------------------------------------------
        const existing = await db.query(
            `
            SELECT followup_id, status
            FROM public.followups
            WHERE trainee_id = $1
              AND type = $2
            ORDER BY followup_id DESC
            LIMIT 1
            `,
            [
                traineeId,
                followup.type
            ]
        );

        // -------------------------------------------------
        // 2. Agar existing follow-up PENDING hai,
        //    to employment ki latest details sync karo.
        //    Completed follow-up ko change nahi karenge.
        // -------------------------------------------------
        if (existing.rows.length > 0) {

            if (
                existing.rows[0].status === "Pending" ||
                existing.rows[0].status === "In Progress"
            ) {
                await db.query(
                    `
                    UPDATE public.followups
                    SET
                        followup_date = (
                            $3::date + ($4 || ' months')::interval
                        )::date,
                        employer = $5,
                        job_role = $6,
                        current_salary = $7,
                        source = 'Automatic Employment Follow-up'
                    WHERE followup_id = $1
                      AND trainee_id = $2
                    `,
                    [
                        existing.rows[0].followup_id,
                        traineeId,
                        employment.joining_date,
                        followup.months,
                        employment.employer || null,
                        employment.job_role || null,
                        employment.current_salary ?? null
                    ]
                );
            }

            continue;
        }

        // -------------------------------------------------
        // 3. New follow-up create karo
        // -------------------------------------------------
        await db.query(
            `
            INSERT INTO public.followups
            (
                trainee_id,
                followup_date,
                type,
                response,
                status,
                source,
                employment_status,
                employer,
                job_role,
                current_salary,
                reason,
                salary_updated
            )
            VALUES
            (
                $1,
                (
                    $2::date + ($3 || ' months')::interval
                )::date,
                $4,
                '',
                'Pending',
                'Automatic Employment Follow-up',
                NULL,
                $5,
                $6,
                $7,
                NULL,
                FALSE
            )
            `,
            [
                traineeId,
                employment.joining_date,
                followup.months,
                followup.type,
                employment.employer || null,
                employment.job_role || null,
                employment.current_salary ?? null
            ]
        );
    }
}


// =====================================================
// GET EMPLOYMENT RECORDS
// ADMIN → ALL
// NORMAL USER → OWN ONLY
// =====================================================
router.get("/", async (req, res) => {
    try {

        // ADMIN → sabhi records
        if (req.user.role === "admin") {

            const result = await pool.query(
                `
                SELECT *
                FROM public.employment
                ORDER BY employment_id DESC
                `
            );

            return res.json(result.rows);
        }

        // NORMAL USER → trainee profile required
        if (!req.user.trainee_id) {

            return res.status(403).json({
                error: "No trainee profile linked to this account"
            });
        }

        // NORMAL USER → sirf apna data
        const result = await pool.query(
            `
            SELECT *
            FROM public.employment
            WHERE trainee_id = $1
            ORDER BY employment_id DESC
            `,
            [req.user.trainee_id]
        );

        return res.json(result.rows);

    } catch (error) {

        console.error(
            "Error fetching employment:",
            error
        );

        return res.status(500).json({
            error: "Failed to fetch employment records"
        });
    }
});


// =====================================================
// POST - ADD EMPLOYMENT
// ADMIN + NORMAL USER (OWN RECORD)
// =====================================================
router.post("/", async (req, res) => {

    const client = await pool.connect();

    try {

        const {
            trainee_id,
            employer,
            job_role,
            employment_type,
            outcome_status,
            joining_date,
            starting_salary,
            current_salary,
            retained,
            relevance
        } = req.body;

        const isAdmin =
            req.user.role === "admin";

        // NORMAL USER → trainee profile required
        if (
            !isAdmin &&
            !req.user.trainee_id
        ) {

            return res.status(403).json({
                error:
                    "No trainee profile linked to this account"
            });
        }

        // ADMIN → body se trainee_id
        // USER → token se trainee_id
        const finalTraineeId = isAdmin
            ? trainee_id
            : req.user.trainee_id;

        // Safety check
        if (!finalTraineeId) {

            return res.status(400).json({
                error: "Trainee ID is required"
            });
        }

        await client.query("BEGIN");

        // -------------------------------------------------
        // EMPLOYMENT CREATE
        // -------------------------------------------------
        const result = await client.query(
            `
            INSERT INTO public.employment
            (
                trainee_id,
                employer,
                job_role,
                employment_type,
                outcome_status,
                joining_date,
                starting_salary,
                current_salary,
                retained,
                relevance
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10
            )
            RETURNING *
            `,
            [
                finalTraineeId,
                employer,
                job_role,
                employment_type,
                outcome_status,
                joining_date || null,
                starting_salary ?? null,
                current_salary ?? null,
                retained ?? false,
                relevance || null
            ]
        );

        const employmentRecord =
            result.rows[0];

        // -------------------------------------------------
        // AUTOMATIC FOLLOW-UP GENERATION
        // -------------------------------------------------
        await generateEmploymentFollowups(
            client,
            finalTraineeId,
            employmentRecord
        );

        await client.query("COMMIT");

        return res.status(201).json({
            message:
                "Employment record added successfully and follow-ups scheduled",
            employment: employmentRecord
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(
            "Error adding employment:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to add employment record",
            details: error.message
        });

    } finally {

        client.release();
    }
});


// =====================================================
// PUT - UPDATE EMPLOYMENT
// ADMIN + NORMAL USER (OWN RECORD)
// =====================================================
router.put("/:id", async (req, res) => {

    const client = await pool.connect();

    try {

        const {
            trainee_id,
            employer,
            job_role,
            employment_type,
            outcome_status,
            joining_date,
            starting_salary,
            current_salary,
            retained,
            relevance
        } = req.body;

        const employmentId =
            Number(req.params.id);

        if (!Number.isInteger(employmentId)) {

            return res.status(400).json({
                error: "Invalid employment ID"
            });
        }

        const isAdmin =
            req.user.role === "admin";

        await client.query("BEGIN");

        // =================================================
        // ADMIN → FULL UPDATE
        // =================================================
        if (isAdmin) {

            const result =
                await client.query(
                    `
                    UPDATE public.employment
                    SET
                        trainee_id = $1,
                        employer = $2,
                        job_role = $3,
                        employment_type = $4,
                        outcome_status = $5,
                        joining_date = $6,
                        starting_salary = $7,
                        current_salary = $8,
                        retained = $9,
                        relevance = $10
                    WHERE employment_id = $11
                    RETURNING *
                    `,
                    [
                        trainee_id,
                        employer,
                        job_role,
                        employment_type,
                        outcome_status,
                        joining_date || null,
                        starting_salary ?? null,
                        current_salary ?? null,
                        retained ?? false,
                        relevance || null,
                        employmentId
                    ]
                );

            if (result.rows.length === 0) {

                await client.query("ROLLBACK");

                return res.status(404).json({
                    error:
                        "Employment record not found"
                });
            }

            const employmentRecord =
                result.rows[0];

            // Re-generate/sync only pending follow-ups
            await generateEmploymentFollowups(
                client,
                employmentRecord.trainee_id,
                employmentRecord
            );

            await client.query("COMMIT");

            return res.json({
                message:
                    "Employment record updated successfully and follow-ups synchronized",
                employment:
                    employmentRecord
            });
        }

        // =================================================
        // NORMAL USER → OWN PROFILE REQUIRED
        // =================================================
        if (!req.user.trainee_id) {

            await client.query("ROLLBACK");

            return res.status(403).json({
                error:
                    "No trainee profile linked to this account"
            });
        }

        // =================================================
        // NORMAL USER → ONLY OWN RECORD
        // =================================================
        const result =
            await client.query(
                `
                UPDATE public.employment
                SET
                    employer = $1,
                    job_role = $2,
                    employment_type = $3,
                    outcome_status = $4,
                    joining_date = $5,
                    starting_salary = $6,
                    current_salary = $7,
                    retained = $8,
                    relevance = $9
                WHERE employment_id = $10
                  AND trainee_id = $11
                RETURNING *
                `,
                [
                    employer,
                    job_role,
                    employment_type,
                    outcome_status,
                    joining_date || null,
                    starting_salary ?? null,
                    current_salary ?? null,
                    retained ?? false,
                    relevance || null,
                    employmentId,
                    req.user.trainee_id
                ]
            );

        if (result.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(403).json({
                error:
                    "You can only update your own employment record"
            });
        }

        const employmentRecord =
            result.rows[0];

        // -------------------------------------------------
        // FOLLOW-UPS SYNC
        // -------------------------------------------------
        await generateEmploymentFollowups(
            client,
            req.user.trainee_id,
            employmentRecord
        );

        await client.query("COMMIT");

        return res.json({
            message:
                "Employment record updated successfully and follow-ups synchronized",
            employment:
                employmentRecord
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(
            "Error updating employment:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to update employment record",
            details: error.message
        });

    } finally {

        client.release();
    }
});


// =====================================================
// DELETE - ADMIN ONLY
// =====================================================
router.delete(
    "/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const employmentId =
                Number(req.params.id);

            if (!Number.isInteger(employmentId)) {

                return res.status(400).json({
                    error:
                        "Invalid employment ID"
                });
            }

            const result =
                await pool.query(
                    `
                    DELETE FROM public.employment
                    WHERE employment_id = $1
                    RETURNING *
                    `,
                    [employmentId]
                );

            if (result.rows.length === 0) {

                return res.status(404).json({
                    error:
                        "Employment record not found"
                });
            }

            return res.json({
                message:
                    "Employment record deleted successfully",
                employment:
                    result.rows[0]
            });

        } catch (error) {

            console.error(
                "Error deleting employment:",
                error
            );

            return res.status(500).json({
                error:
                    "Failed to delete employment record"
            });
        }
    }
);


module.exports = router;