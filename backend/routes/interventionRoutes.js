const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

// GET - Get all interventions
// Normal user + Admin दोनों देख सकते हैं
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM public.interventions
            ORDER BY intervention_id DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching interventions:", error);

        res.status(500).json({
            error: "Failed to fetch interventions"
        });
    }
});


// POST - Create intervention
// केवल Admin
router.post("/", requireAdmin, async (req, res) => {
    try {
        const {
            intervention_name,
            description
        } = req.body;

        const result = await pool.query(
            `
            INSERT INTO public.interventions
            (
                intervention_name,
                description
            )
            VALUES ($1, $2)
            RETURNING *
            `,
            [
                intervention_name,
                description
            ]
        );

        res.status(201).json({
            message: "Intervention created successfully",
            intervention: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating intervention:", error);

        res.status(500).json({
            error: "Failed to create intervention"
        });
    }
});


// PUT - Update intervention
// केवल Admin
router.put("/:id", requireAdmin, async (req, res) => {
    try {
        const {
            intervention_name,
            description
        } = req.body;

        const result = await pool.query(
            `
            UPDATE public.interventions
            SET
                intervention_name = $1,
                description = $2
            WHERE intervention_id = $3
            RETURNING *
            `,
            [
                intervention_name,
                description,
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Intervention not found"
            });
        }

        res.json({
            message: "Intervention updated successfully",
            intervention: result.rows[0]
        });

    } catch (error) {
        console.error("Error updating intervention:", error);

        res.status(500).json({
            error: "Failed to update intervention"
        });
    }
});


// DELETE - Delete intervention
// केवल Admin
router.delete("/:id", requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `
            DELETE FROM public.interventions
            WHERE intervention_id = $1
            RETURNING *
            `,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Intervention not found"
            });
        }

        res.json({
            message: "Intervention deleted successfully",
            intervention: result.rows[0]
        });

    } catch (error) {
        console.error("Error deleting intervention:", error);

        res.status(500).json({
            error: "Failed to delete intervention"
        });
    }
});


module.exports = router;