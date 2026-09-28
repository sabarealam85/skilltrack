const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

// =====================================================
// GET EMPLOYMENT RECORDS
// ADMIN → ALL
// NORMAL USER → OWN ONLY
// =====================================================
router.get("/", async (req, res) => {
    try {
        // ADMIN → sabhi records
        if (req.user.role === "admin") {
            const result = await pool.query(`
                SELECT *
                FROM public.employment
                ORDER BY employment_id DESC
            `);

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
        console.error("Error fetching employment:", error);

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

        const isAdmin = req.user.role === "admin";

        // NORMAL USER → trainee profile required
        if (!isAdmin && !req.user.trainee_id) {
            return res.status(403).json({
                error: "No trainee profile linked to this account"
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

        const result = await pool.query(
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
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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

        return res.status(201).json({
            message: "Employment record added successfully",
            employment: result.rows[0]
        });

    } catch (error) {
        console.error("Error adding employment:", error);

        return res.status(500).json({
            error: "Failed to add employment record",
            details: error.message
        });
    }
});


// =====================================================
// PUT - UPDATE EMPLOYMENT
// ADMIN + NORMAL USER (OWN RECORD)
// =====================================================
router.put("/:id", async (req, res) => {
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

        const employmentId = Number(req.params.id);

        if (!Number.isInteger(employmentId)) {
            return res.status(400).json({
                error: "Invalid employment ID"
            });
        }

        const isAdmin = req.user.role === "admin";

        // =================================================
        // ADMIN → FULL UPDATE
        // =================================================
        if (isAdmin) {
            const result = await pool.query(
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
                return res.status(404).json({
                    error: "Employment record not found"
                });
            }

            return res.json({
                message: "Employment record updated successfully",
                employment: result.rows[0]
            });
        }

        // =================================================
        // NORMAL USER → OWN PROFILE REQUIRED
        // =================================================
        if (!req.user.trainee_id) {
            return res.status(403).json({
                error: "No trainee profile linked to this account"
            });
        }

        // =================================================
        // NORMAL USER → ONLY OWN RECORD
        // =================================================
        const result = await pool.query(
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
            return res.status(403).json({
                error: "You can only update your own employment record"
            });
        }

        return res.json({
            message: "Employment record updated successfully",
            employment: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating employment:", error);

        return res.status(500).json({
            error: "Failed to update employment record",
            details: error.message
        });
    }
});


// =====================================================
// DELETE - ADMIN ONLY
// =====================================================
router.delete("/:id", requireAdmin, async (req, res) => {
    try {
        const employmentId = Number(req.params.id);

        if (!Number.isInteger(employmentId)) {
            return res.status(400).json({
                error: "Invalid employment ID"
            });
        }

        const result = await pool.query(
            `
            DELETE FROM public.employment
            WHERE employment_id = $1
            RETURNING *
            `,
            [employmentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Employment record not found"
            });
        }

        return res.json({
            message: "Employment record deleted successfully",
            employment: result.rows[0]
        });

    } catch (error) {
        console.error("Error deleting employment:", error);

        return res.status(500).json({
            error: "Failed to delete employment record"
        });
    }
});


module.exports = router;