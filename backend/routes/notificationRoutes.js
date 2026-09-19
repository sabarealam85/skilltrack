const express = require("express");
const router = express.Router();
const pool = require("../db");

// ========================================
// GET - Real notifications
// ========================================
router.get("/", async (req, res) => {
    try {
        const notifications = [];

        // Pending follow-ups
        const followupResult = await pool.query(`
            SELECT COUNT(*) AS count
            FROM followups
            WHERE status IS NULL
               OR LOWER(status) <> 'completed'
        `);

        const pendingFollowups = Number(followupResult.rows[0].count);

        if (pendingFollowups > 0) {
            notifications.push({
                id: "followups",
                type: "followup",
                title: "Follow-up reminder",
                message: `${pendingFollowups} follow-up(s) need attention.`
            });
        }
        // Skill gap notifications
const skillGapResult = await pool.query(`
    SELECT COUNT(*) AS count
    FROM skill_gap
`);

const skillGapCount = Number(skillGapResult.rows[0].count);

if (skillGapCount > 0) {
    notifications.push({
        id: "skill-gaps",
        type: "skillgap",
        title: "Skill gap detected",
        message: `${skillGapCount} skill gap(s) found in trainee records.`
    });
}

        res.json(notifications);

    } catch (error) {
        console.error("Error fetching notifications:", error);

        res.status(500).json({
            error: "Failed to fetch notifications"
        });
    }
});

module.exports = router;