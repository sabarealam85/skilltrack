const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM public.employers
            ORDER BY employer_id DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching employers:", error);

        res.status(500).json({
            error: "Failed to fetch employers"
        });
    }
});

module.exports = router;