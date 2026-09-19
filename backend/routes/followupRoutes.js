const express = require("express");
const router = express.Router();
const pool = require("../db");

// ========================================
// GET - All follow-ups
// ========================================
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM public.followups
            ORDER BY followup_id DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching follow-ups:", error);

        res.status(500).json({
            error: "Failed to fetch follow-ups"
        });
    }
});


// ========================================
// PUT - Update follow-up status
// ========================================
router.put("/:id", async (req, res) => {
    try {

        const { status } = req.body;

        const result = await pool.query(
            `
            UPDATE public.followups
            SET status = $1
            WHERE followup_id = $2
            RETURNING *
            `,
            [
                status,
                req.params.id
            ]
        );

        // Follow-up ID nahi mila
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Follow-up not found"
            });
        }

        // Successfully updated
        res.json({
            message: "Follow-up updated successfully",
            followup: result.rows[0]
        });

    } catch (error) {

        console.error("Error updating follow-up:", error);

        res.status(500).json({
            error: "Failed to update follow-up"
        });
    }
});


// ========================================
// Export router
// ========================================
module.exports = router;