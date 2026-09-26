const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

// =====================================================
// GET ALL EMPLOYMENT RECORDS
// =====================================================
router.get("/", async (req, res) => {
    try {

        // ADMIN → sabhi employment records
        if (req.user.role === "admin") {

            const result = await pool.query(`
                SELECT *
                FROM public.employment
                ORDER BY employment_id DESC
            `);

            return res.json(result.rows);
        }

        // NORMAL USER → trainee profile linked hona chahiye
        if (!req.user.trainee_id) {
            return res.status(403).json({
                error: "No trainee profile linked to this account"
            });
        }

        // NORMAL USER → sirf apna employment data
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
// POST - ADD NEW EMPLOYMENT RECORD
// ADMIN ONLY
// =====================================================
router.post("/", requireAdmin, async (req, res) => {
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
                trainee_id,
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

        // Development ke liye actual database error bhi return hoga
        return res.status(500).json({
            error: "Failed to add employment record",
            details: error.message
        });
    }
});


// =====================================================
// PUT - UPDATE EMPLOYMENT RECORD
// ADMIN ONLY
// =====================================================
router.put("/:id", requireAdmin, async (req, res) => {
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

        // ID valid hai ya nahi
        if (!Number.isInteger(employmentId)) {
            return res.status(400).json({
                error: "Invalid employment ID"
            });
        }

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

        // Record nahi mila
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Employment record not found"
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
// DELETE - DELETE EMPLOYMENT RECORD
// ADMIN ONLY
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
            error: "Failed to delete employment record",
            details: error.message
        });
    }
});


module.exports = router;