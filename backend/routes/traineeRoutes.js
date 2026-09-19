
const express = require("express");
const pool = require("../db");

const router = express.Router();

// Get all trainees
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                trainee_id,
                name,
                course,
                district,
                provider,
                gender,
                age,
                training_year,
                status,
                confidence
          FROM public.trainees
            ORDER BY trainee_id
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching trainees:", error);
        res.status(500).json({
            error: "Failed to fetch trainees"
        });
    }
});


// Get one trainee by ID
router.get("/:id", async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                trainee_id,
                name,
                course,
                district,
                provider,
                gender,
                age,
                training_year,
                status,
                confidence
            FROM public.trainees
            WHERE trainee_id = $1
            `,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Trainee not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error fetching trainee:", error);
        res.status(500).json({
            error: "Failed to fetch trainee"
        });
    }
});
// Add a new trainee
router.post("/", async (req, res) => {
    try {
        const {
            trainee_id,
            name,
            course,
            district,
            provider,
            gender,
            age,
            training_year,
            status,
            confidence
        } = req.body;

        const result = await pool.query(
            `
            INSERT INTO public.trainees
            (
                trainee_id,
                name,
                course,
                district,
                provider,
                gender,
                age,
                training_year,
                status,
                confidence
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *
            `,
            [
                trainee_id,
                name,
                course,
                district,
                provider,
                gender,
                age,
                training_year,
                status,
                confidence
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error adding trainee:", error);

        res.status(500).json({
            error: "Failed to add trainee"
        });
    }
});
// Update an existing trainee
router.put("/:id", async (req, res) => {
    try {
        const {
            name,
            course,
            district,
            provider,
            gender,
            age,
            training_year,
            status,
            confidence
        } = req.body;

        const result = await pool.query(
            `
           UPDATE public.trainees
            SET
                name = $1,
                course = $2,
                district = $3,
                provider = $4,
                gender = $5,
                age = $6,
                training_year = $7,
                status = $8,
                confidence = $9
            WHERE trainee_id = $10
            RETURNING *
            `,
            [
                name,
                course,
                district,
                provider,
                gender,
                age,
                training_year,
                status,
                confidence,
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Trainee not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error updating trainee:", error);

        res.status(500).json({
            error: "Failed to update trainee"
        });
    }
});
// Delete a trainee
router.delete("/:id", async (req, res) => {
    try {
        const result = await pool.query(
            `
            DELETE FROM public.trainees
            WHERE trainee_id = $1
            RETURNING *
            `,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Trainee not found"
            });
        }

        res.json({
            message: "Trainee deleted successfully",
            trainee: result.rows[0]
        });

    } catch (error) {
        console.error("Error deleting trainee:", error);

        res.status(500).json({
            error: "Failed to delete trainee"
        });
    }
});

module.exports = router;