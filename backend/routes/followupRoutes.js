const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

// ======================================================
// HELPERS
// ======================================================

const allowedStatuses = [
    "Pending",
    "In Progress",
    "Completed"
];

const toNullableNumber = (value) => {
    if (
        value === "" ||
        value === undefined ||
        value === null
    ) {
        return null;
    }

    const number = Number(value);

    return Number.isNaN(number)
        ? null
        : number;
};

const toBoolean = (value) => {
    if (value === true || value === false) {
        return value;
    }

    if (
        value === "true" ||
        value === "1" ||
        value === 1 ||
        value === "yes" ||
        value === "Yes"
    ) {
        return true;
    }

    return false;
};


// ======================================================
// GET - Follow-ups
// Admin -> सभी follow-ups
// Normal user -> केवल अपना follow-up data
// ======================================================

router.get("/", async (req, res) => {

    try {

        if (req.user.role === "admin") {

            const result = await pool.query(`
                SELECT *
                FROM public.followups
                ORDER BY followup_date ASC, followup_id ASC
            `);

            return res.json(result.rows);
        }


        if (!req.user.trainee_id) {

            return res.status(403).json({
                error:
                    "No trainee profile linked to this account"
            });
        }


        const result = await pool.query(
            `
            SELECT *
            FROM public.followups
            WHERE trainee_id = $1
            ORDER BY followup_date ASC, followup_id ASC
            `,
            [req.user.trainee_id]
        );


        res.json(result.rows);

    } catch (error) {

        console.error(
            "Error fetching follow-ups:",
            error
        );

        res.status(500).json({
            error:
                "Failed to fetch follow-ups"
        });
    }
});


// ======================================================
// POST - Add new follow-up
// केवल Admin
// ======================================================

router.post(
    "/",
    requireAdmin,
    async (req, res) => {

        try {

            const {
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
            } = req.body;


            if (
                !trainee_id ||
                !followup_date ||
                !type
            ) {

                return res.status(400).json({
                    error:
                        "Trainee, follow-up date and type are required"
                });
            }


            const finalStatus =
                status || "Pending";


            if (
                !allowedStatuses.includes(
                    finalStatus
                )
            ) {

                return res.status(400).json({
                    error:
                        "Invalid follow-up status"
                });
            }


            // Check trainee

            const traineeCheck =
                await pool.query(
                    `
                    SELECT trainee_id
                    FROM public.trainees
                    WHERE trainee_id = $1
                    `,
                    [trainee_id]
                );


            if (
                traineeCheck.rows.length === 0
            ) {

                return res.status(404).json({
                    error:
                        "Trainee not found"
                });
            }


            const result =
                await pool.query(
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
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8,
                        $9,
                        $10,
                        $11,
                        $12
                    )
                    RETURNING *
                    `,
                    [
                        trainee_id,
                        followup_date,
                        type,
                        response || "",
                        finalStatus,
                        source || "",

                        employment_status ||
                            null,

                        employer ||
                            null,

                        job_role ||
                            null,

                        toNullableNumber(
                            current_salary
                        ),

                        reason ||
                            null,

                        toBoolean(
                            salary_updated
                        )
                    ]
                );


            res.status(201).json({

                message:
                    "Follow-up added successfully",

                followup:
                    result.rows[0]
            });


        } catch (error) {

            console.error(
                "Error adding follow-up:",
                error
            );

            res.status(500).json({
                error:
                    "Failed to add follow-up"
            });
        }
    }
);


// ======================================================
// PUT - Update / Start / Complete Follow-up
//
// Admin -> किसी भी follow-up को update कर सकता है
// Normal user -> केवल अपना follow-up update कर सकता है
// ======================================================

router.put(
    "/:id",
    async (req, res) => {

        try {

            const followupId =
                req.params.id;


            const {
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
            } = req.body;


            if (
                !trainee_id ||
                !followup_date ||
                !type
            ) {

                return res.status(400).json({
                    error:
                        "Trainee, follow-up date and type are required"
                });
            }


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({
                    error:
                        "Invalid follow-up status"
                });
            }


            // ------------------------------------------
            // Find existing follow-up
            // ------------------------------------------

            const existingResult =
                await pool.query(
                    `
                    SELECT *
                    FROM public.followups
                    WHERE followup_id = $1
                    `,
                    [followupId]
                );


            if (
                existingResult.rows.length === 0
            ) {

                return res.status(404).json({
                    error:
                        "Follow-up not found"
                });
            }


            const existing =
                existingResult.rows[0];


            // ------------------------------------------
            // ADMIN
            // ------------------------------------------

            if (
                req.user.role === "admin"
            ) {

                // Admin can update any follow-up.

            } else {

                // --------------------------------------
                // NORMAL USER
                // --------------------------------------

                if (
                    !req.user.trainee_id
                ) {

                    return res.status(403).json({
                        error:
                            "No trainee profile linked to this account"
                    });
                }


                // User can only update own follow-up.

                if (
                    String(
                        existing.trainee_id
                    ) !==
                    String(
                        req.user.trainee_id
                    )
                ) {

                    return res.status(403).json({
                        error:
                            "You can only update your own follow-up"
                    });
                }


                // Prevent user from changing
                // follow-up ownership.

                if (
                    String(
                        trainee_id
                    ) !==
                    String(
                        req.user.trainee_id
                    )
                ) {

                    return res.status(403).json({
                        error:
                            "Invalid trainee ownership"
                    });
                }

            }


            // ------------------------------------------
            // Verify trainee exists
            // ------------------------------------------

            const traineeCheck =
                await pool.query(
                    `
                    SELECT trainee_id
                    FROM public.trainees
                    WHERE trainee_id = $1
                    `,
                    [trainee_id]
                );


            if (
                traineeCheck.rows.length === 0
            ) {

                return res.status(404).json({
                    error:
                        "Trainee not found"
                });
            }


            // ------------------------------------------
            // Update
            // ------------------------------------------

            const result =
                await pool.query(
                    `
                    UPDATE public.followups

                    SET
                        trainee_id = $1,
                        followup_date = $2,
                        type = $3,
                        response = $4,
                        status = $5,
                        source = $6,
                        employment_status = $7,
                        employer = $8,
                        job_role = $9,
                        current_salary = $10,
                        reason = $11,
                        salary_updated = $12

                    WHERE followup_id = $13

                    RETURNING *
                    `,
                    [
                        trainee_id,
                        followup_date,
                        type,

                        response || "",

                        status,

                        source || "",

                        employment_status ||
                            null,

                        employer ||
                            null,

                        job_role ||
                            null,

                        toNullableNumber(
                            current_salary
                        ),

                        reason ||
                            null,

                        toBoolean(
                            salary_updated
                        ),

                        followupId
                    ]
                );


            res.json({

                message:
                    "Follow-up updated successfully",

                followup:
                    result.rows[0]
            });


        } catch (error) {

            console.error(
                "Error updating follow-up:",
                error
            );

            res.status(500).json({
                error:
                    "Failed to update follow-up"
            });
        }
    }
);


// ======================================================
// DELETE - Follow-up
// केवल Admin
// ======================================================

router.delete(
    "/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const result =
                await pool.query(
                    `
                    DELETE FROM public.followups
                    WHERE followup_id = $1
                    RETURNING *
                    `,
                    [req.params.id]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({
                    error:
                        "Follow-up not found"
                });
            }


            res.json({

                message:
                    "Follow-up deleted successfully",

                followup:
                    result.rows[0]
            });


        } catch (error) {

            console.error(
                "Error deleting follow-up:",
                error
            );

            res.status(500).json({
                error:
                    "Failed to delete follow-up"
            });
        }
    }
);


// ======================================================
// GENERATE 3 / 6 / 12 MONTH FOLLOW-UPS
// केवल Admin
// ======================================================

router.post(
    "/generate/:trainee_id",
    requireAdmin,
    async (req, res) => {

        try {

            const {
                trainee_id
            } = req.params;


            // ------------------------------------------
            // Find latest employment
            // ------------------------------------------

            const employmentResult =
                await pool.query(
                    `
                    SELECT
                        trainee_id,
                        employer,
                        job_role,
                        employment_type,
                        joining_date,
                        current_salary

                    FROM public.employment

                    WHERE trainee_id = $1

                    ORDER BY
                        joining_date DESC

                    LIMIT 1
                    `,
                    [trainee_id]
                );


            if (
                employmentResult.rows.length === 0
            ) {

                return res.status(404).json({
                    error:
                        "No employment record found for this trainee"
                });
            }


            const employment =
                employmentResult.rows[0];


            if (
                !employment.joining_date
            ) {

                return res.status(400).json({
                    error:
                        "Employment joining date is required before generating follow-ups"
                });
            }


            // ------------------------------------------
            // Create 3 / 6 / 12 month dates
            // ------------------------------------------

            const milestones = [

                {
                    months: 3,
                    type:
                        "3-Month Follow-up"
                },

                {
                    months: 6,
                    type:
                        "6-Month Follow-up"
                },

                {
                    months: 12,
                    type:
                        "12-Month Follow-up"
                }

            ];


            const created = [];


            for (
                const milestone
                of milestones
            ) {

                const date =
                    new Date(
                        employment.joining_date
                    );


                date.setMonth(
                    date.getMonth() +
                    milestone.months
                );


                // --------------------------------------
                // Avoid duplicate milestone
                // --------------------------------------

                const existing =
                    await pool.query(
                        `
                        SELECT followup_id
                        FROM public.followups

                        WHERE
                            trainee_id = $1
                            AND type = $2

                        LIMIT 1
                        `,
                        [
                            trainee_id,
                            milestone.type
                        ]
                    );


                if (
                    existing.rows.length > 0
                ) {

                    continue;
                }


                // --------------------------------------
                // Insert pending follow-up
                // --------------------------------------

                const result =
                    await pool.query(
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
                            $2,
                            $3,
                            '',
                            'Pending',
                            'Automatic Employment Follow-up',
                            NULL,
                            $4,
                            $5,
                            $6,
                            NULL,
                            FALSE
                        )

                        RETURNING *
                        `,
                        [
                            trainee_id,
                            date,

                            milestone.type,

                            employment.employer ||
                                null,

                            employment.job_role ||
                                null,

                            toNullableNumber(
                                employment.current_salary
                            )
                        ]
                    );


                created.push(
                    result.rows[0]
                );
            }


            res.status(201).json({

                message:
                    "3, 6 and 12 month follow-ups generated",

                followups:
                    created
            });


        } catch (error) {

            console.error(
                "Error generating follow-ups:",
                error
            );

            res.status(500).json({
                error:
                    "Failed to generate employment follow-ups"
            });
        }
    }
);


// ======================================================
// EXPORT
// ======================================================

module.exports = router;