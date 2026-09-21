const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

// GET all employment records
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM public.employment
            ORDER BY employment_id DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching employment:", error);

        res.status(500).json({
            error: "Failed to fetch employment records"
        });
    }
});


// POST - Add new employment record
router.post("/", requireAdmin, async (req, res) => {
    try {
        const {
            trainee_id,
            employer,
            job_role,
            employment_type,
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
                joining_date,
                starting_salary,
                current_salary,
                retained,
                relevance
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *
            `,
            [
                trainee_id,
                employer,
                job_role,
                employment_type,
                joining_date,
                starting_salary,
                current_salary,
                retained,
                relevance
            ]
        );

        res.status(201).json({
            message: "Employment record added successfully",
            employment: result.rows[0]
        });

    } catch (error) {
        console.error("Error adding employment:", error);

        res.status(500).json({
            error: "Failed to add employment record"
        });
    }
});


// PUT - Update employment record
router.put("/:id", requireAdmin, async (req, res) => {
    try {
        const {
            trainee_id,
            employer,
            job_role,
            employment_type,
            joining_date,
            starting_salary,
            current_salary,
            retained,
            relevance
        } = req.body;

        const result = await pool.query(
            `
            UPDATE public.employment
            SET
                trainee_id = $1,
                employer = $2,
                job_role = $3,
                employment_type = $4,
                joining_date = $5,
                starting_salary = $6,
                current_salary = $7,
                retained = $8,
                relevance = $9
            WHERE employment_id = $10
            RETURNING *
            `,
            [
                trainee_id,
                employer,
                job_role,
                employment_type,
                joining_date,
                starting_salary,
                current_salary,
                retained,
                relevance,
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Employment record not found"
            });
        }

        res.json({
            message: "Employment record updated successfully",
            employment: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating employment:", error);

        res.status(500).json({
            error: "Failed to update employment record"
        });
    }
});


// DELETE - Delete employment record
router.delete("/:id", requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `
            DELETE FROM public.employment
            WHERE employment_id = $1
            RETURNING *
            `,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Employment record not found"
            });
        }

        res.json({
            message: "Employment record deleted successfully",
            employment: result.rows[0]
        });

    } catch (error) {
        console.error("Error deleting employment:", error);

        res.status(500).json({
            error: "Failed to delete employment record"
        });
    }
});

module.exports = router;