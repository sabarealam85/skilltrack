const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM public.skill_gap
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching skill gaps:", error);

        res.status(500).json({
            error: "Failed to fetch skill gaps"
        });
    }
});


// POST - Add new skill gap
router.post("/", async (req, res) => {
    try {
        const {
            trainee_id,
            required_skill,
            current_level,
            required_level,
            gap_score,
            recommendation
        } = req.body;

        const result = await pool.query(
            `
            INSERT INTO public.skill_gap
            (
                trainee_id,
                required_skill,
                current_level,
                required_level,
                gap_score,
                recommendation
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [
                trainee_id,
                required_skill,
                current_level,
                required_level,
                gap_score,
                recommendation
            ]
        );

        res.status(201).json({
            message: "Skill gap added successfully",
            skillGap: result.rows[0]
        });

    } catch (error) {
        console.error("Error adding skill gap:", error);

        res.status(500).json({
            error: "Failed to add skill gap"
        });
    }
});


// PUT - Update skill gap
router.put("/:id", async (req, res) => {
    try {
        const {
            trainee_id,
            required_skill,
            current_level,
            required_level,
            gap_score,
            recommendation
        } = req.body;

        const result = await pool.query(
            `
            UPDATE public.skill_gap
            SET
                trainee_id = $1,
                required_skill = $2,
                current_level = $3,
                required_level = $4,
                gap_score = $5,
                recommendation = $6
            WHERE gap_id = $7
            RETURNING *
            `,
            [
                trainee_id,
                required_skill,
                current_level,
                required_level,
                gap_score,
                recommendation,
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Skill gap not found"
            });
        }

        res.json({
            message: "Skill gap updated successfully",
            skillGap: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating skill gap:", error);

        res.status(500).json({
            error: "Failed to update skill gap"
        });
    }
});


// DELETE - Delete skill gap
router.delete("/:id", async (req, res) => {
    try {
        const result = await pool.query(
            `
            DELETE FROM public.skill_gap
            WHERE gap_id = $1
            RETURNING *
            `,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Skill gap not found"
            });
        }

        res.json({
            message: "Skill gap deleted successfully",
            skillGap: result.rows[0]
        });

    } catch (error) {
        console.error("Error deleting skill gap:", error);

        res.status(500).json({
            error: "Failed to delete skill gap"
        });
    }
});

module.exports = router;