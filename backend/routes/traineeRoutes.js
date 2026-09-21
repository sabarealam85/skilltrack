const requireAdmin = require("../middleware/requireAdmin");
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
router.post("/", requireAdmin, async (req, res) => {
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
router.put("/:id", requireAdmin, async (req, res) => {
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
router.delete("/:id", requireAdmin, async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const traineeId = req.params.id;

        // Delete all records that depend on this trainee
        await client.query(
            `DELETE FROM public.employment WHERE trainee_id = $1`,
            [traineeId]
        );

        await client.query(
            `DELETE FROM public.followups WHERE trainee_id = $1`,
            [traineeId]
        );

        await client.query(
            `DELETE FROM public.outcome_evidence WHERE trainee_id = $1`,
            [traineeId]
        );

        await client.query(
            `DELETE FROM public.skill_gap WHERE trainee_id = $1`,
            [traineeId]
        );

        await client.query(
            `DELETE FROM public.trainee_skills WHERE trainee_id = $1`,
            [traineeId]
        );

        await client.query(
            `DELETE FROM public.training WHERE trainee_id = $1`,
            [traineeId]
        );

        // Finally delete the trainee
        const result = await client.query(
            `
            DELETE FROM public.trainees
            WHERE trainee_id = $1
            RETURNING *
            `,
            [traineeId]
        );

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                error: "Trainee not found"
            });
        }

        await client.query("COMMIT");

        res.json({
            message: "Trainee deleted successfully",
            trainee: result.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Error deleting trainee:", error);

        res.status(500).json({
            error: "Failed to delete trainee"
        });

    } finally {
        client.release();
    }
});
module.exports = router;