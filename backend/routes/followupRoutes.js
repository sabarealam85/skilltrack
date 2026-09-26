const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

// ========================================
// GET - Follow-ups
// Admin → सभी follow-ups
// Normal user → केवल अपना follow-up data
// ========================================
router.get("/", async (req, res) => {
    try {

        // Admin सभी follow-ups देख सकता है
        if (req.user.role === "admin") {

            const result = await pool.query(`
                SELECT *
                FROM public.followups
                ORDER BY followup_id DESC
            `);

            return res.json(result.rows);
        }

        // Normal user के लिए trainee_id जरूरी है
        if (!req.user.trainee_id) {
            return res.status(403).json({
                error: "No trainee profile linked to this account"
            });
        }

        // Normal user केवल अपने trainee के follow-ups देखेगा
        const result = await pool.query(
            `
            SELECT *
            FROM public.followups
            WHERE trainee_id = $1
            ORDER BY followup_id DESC
            `,
            [req.user.trainee_id]
        );

        res.json(result.rows);

    } catch (error) {

        console.error("Error fetching follow-ups:", error);

        res.status(500).json({
            error: "Failed to fetch follow-ups"
        });
    }
});
// ========================================
// POST - Add new follow-up
// केवल Admin
// ========================================
router.post("/", requireAdmin, async (req, res) => {
    try {

        const {
            trainee_id,
            followup_date,
            type,
            response,
            status,
            source
        } = req.body;


        // Required fields check
        if (!trainee_id || !followup_date || !type) {
            return res.status(400).json({
                error: "Trainee, follow-up date and type are required"
            });
        }


        // Allowed statuses
        const allowedStatuses = [
            "Pending",
            "In Progress",
            "Completed"
        ];

        const finalStatus = status || "Pending";

        if (!allowedStatuses.includes(finalStatus)) {
            return res.status(400).json({
                error: "Invalid follow-up status"
            });
        }


        // Check trainee exists
        const traineeCheck = await pool.query(
            `
            SELECT trainee_id
            FROM public.trainees
            WHERE trainee_id = $1
            `,
            [trainee_id]
        );

        if (traineeCheck.rows.length === 0) {
            return res.status(404).json({
                error: "Trainee not found"
            });
        }


        // Insert follow-up
        const result = await pool.query(
            `
            INSERT INTO public.followups
            (
                trainee_id,
                followup_date,
                type,
                response,
                status,
                source
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [
                trainee_id,
                followup_date,
                type,
                response || "",
                finalStatus,
                source || ""
            ]
        );


        res.status(201).json({
            message: "Follow-up added successfully",
            followup: result.rows[0]
        });


    } catch (error) {

        console.error("Error adding follow-up:", error);

        res.status(500).json({
            error: "Failed to add follow-up"
        });
    }
});


// ========================================
// PUT - Edit follow-up
// केवल Admin
// ========================================
router.put("/:id", requireAdmin, async (req, res) => {
    try {

        const {
            trainee_id,
            followup_date,
            type,
            response,
            status,
            source
        } = req.body;

        // Required fields check
        if (!trainee_id || !followup_date || !type) {
            return res.status(400).json({
                error: "Trainee, follow-up date and type are required"
            });
        }

        // Allowed statuses
        const allowedStatuses = [
            "Pending",
            "In Progress",
            "Completed"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                error: "Invalid follow-up status"
            });
        }

        // Check trainee exists
        const traineeCheck = await pool.query(
            `
            SELECT trainee_id
            FROM public.trainees
            WHERE trainee_id = $1
            `,
            [trainee_id]
        );

        if (traineeCheck.rows.length === 0) {
            return res.status(404).json({
                error: "Trainee not found"
            });
        }

        // Update follow-up
        const result = await pool.query(
            `
            UPDATE public.followups
            SET
                trainee_id = $1,
                followup_date = $2,
                type = $3,
                response = $4,
                status = $5,
                source = $6
            WHERE followup_id = $7
            RETURNING *
            `,
            [
                trainee_id,
                followup_date,
                type,
                response || "",
                status,
                source || "",
                req.params.id
            ]
        );

        // Follow-up not found
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Follow-up not found"
            });
        }

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
// DELETE - Delete follow-up
// केवल Admin
// ========================================
router.delete("/:id", requireAdmin, async (req, res) => {
    try {

        const result = await pool.query(
            `
            DELETE FROM public.followups
            WHERE followup_id = $1
            RETURNING *
            `,
            [req.params.id]
        );

        // Follow-up not found
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Follow-up not found"
            });
        }

        res.json({
            message: "Follow-up deleted successfully",
            followup: result.rows[0]
        });

    } catch (error) {

        console.error("Error deleting follow-up:", error);

        res.status(500).json({
            error: "Failed to delete follow-up"
        });
    }
});


// ========================================
// Export router
// ========================================
module.exports = router;