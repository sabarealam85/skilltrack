const express = require("express");
const router = express.Router();

const pool = require("../db");

// Get all training records
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
    SELECT
        training.training_id,
        training.trainee_id,
        trainees.name AS trainee_name,
        training.course,
        training.course_provider,
        training.start_date,
        training.end_date,
        training.assessment_score
    FROM public.training
    LEFT JOIN trainees
        ON training.trainee_id = trainees.trainee_id
    ORDER BY training.training_id DESC
`);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching training:", error);

        res.status(500).json({
            error: "Failed to fetch training records"
        });
    }
});
router.post("/", async (req, res) => {
    try {
        const {
            trainee_id,
            course,
            course_provider,
            start_date,
            end_date,
            assessment_score
        } = req.body;

        const result = await pool.query(
            `
            INSERT INTO training
            (
                trainee_id,
                course,
                course_provider,
                start_date,
                end_date,
                assessment_score
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [
                trainee_id,
                course,
                course_provider,
                start_date,
                end_date,
                assessment_score
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error adding training:", error);

        res.status(500).json({
            error: "Failed to add training record"
        });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const result = await pool.query(
            `
            DELETE FROM public.training
            WHERE training_id = $1
            RETURNING *
            `,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Training record not found"
            });
        }

        res.json({
            message: "Training record deleted successfully",
            training: result.rows[0]
        });

    } catch (error) {
        console.error("Error deleting training:", error);

        res.status(500).json({
            error: "Failed to delete training record"
        });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const {
            trainee_id,
            course,
            course_provider,
            start_date,
            end_date,
            assessment_score
        } = req.body;

        const result = await pool.query(
            `
            UPDATE training
            SET
                trainee_id = $1,
                course = $2,
                course_provider = $3,
                start_date = $4,
                end_date = $5,
                assessment_score = $6
            WHERE training_id = $7
            RETURNING *
            `,
            [
                trainee_id,
                course,
                course_provider,
                start_date,
                end_date,
                assessment_score,
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Training record not found"
            });
        }

        res.json({
            message: "Training record updated successfully",
            training: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating training:", error);

        res.status(500).json({
            error: "Failed to update training record"
        });
    }
});

module.exports = router;