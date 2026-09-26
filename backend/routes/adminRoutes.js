const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");
const crypto = require("crypto");

// =====================================================
// GET ADMIN CONTACT
// AUTHENTICATED USERS ONLY
// Used by Help Centre
// =====================================================
router.get("/contact", async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                name,
                email
            FROM public.users
            WHERE role = 'admin'
            ORDER BY user_id ASC
            LIMIT 1
        `);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Administrator contact information not found"
            });
        }

        return res.json({
            name: result.rows[0].name,
            email: result.rows[0].email
        });

    } catch (error) {

        console.error(
            "Admin Contact Error:",
            error
        );

        return res.status(500).json({
            error: "Failed to fetch administrator contact"
        });
    }
});


// =====================================================
// GET ALL USERS
// ADMIN ONLY
// =====================================================
router.get("/users", requireAdmin, async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                user_id,
                name,
                email,
                role,
                trainee_id,
                admin_id
            FROM public.users
            ORDER BY user_id DESC
        `);

        return res.json(result.rows);

    } catch (error) {

        console.error("Admin - Get Users Error:", error);

        return res.status(500).json({
            error: "Failed to fetch users",
            details: error.message
        });
    }
});


// =====================================================
// CHANGE USER ROLE
// ADMIN ONLY
// =====================================================
router.put("/users/:id/role", requireAdmin, async (req, res) => {
    try {

        const userId = Number(req.params.id);
        const { role } = req.body;

        if (!Number.isInteger(userId)) {
            return res.status(400).json({
                error: "Invalid user ID"
            });
        }

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({
                error: "Role must be either user or admin"
            });
        }

        if (userId === Number(req.user.user_id)) {
            return res.status(400).json({
                error: "You cannot change your own role"
            });
        }

        let adminId = null;

        if (role === "admin") {

            adminId =
                "ADM-" +
                crypto.randomBytes(4)
                    .toString("hex")
                    .toUpperCase();

        }

        const result = await pool.query(
            `
            UPDATE public.users
            SET
                role = $1,
                admin_id = $2
            WHERE user_id = $3
            RETURNING
                user_id,
                name,
                email,
                role,
                trainee_id,
                admin_id
            `,
            [
                role,
                adminId,
                userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        return res.json({
            message: "User role updated successfully",
            user: result.rows[0]
        });

    } catch (error) {

        console.error("Admin - Change Role Error:", error);

        return res.status(500).json({
            error: "Failed to update user role",
            details: error.message
        });
    }
});


// =====================================================
// DELETE USER
// ADMIN ONLY
// =====================================================
router.delete("/users/:id", requireAdmin, async (req, res) => {
    try {

        const userId = Number(req.params.id);

        if (!Number.isInteger(userId)) {
            return res.status(400).json({
                error: "Invalid user ID"
            });
        }

        if (userId === Number(req.user.user_id)) {
            return res.status(400).json({
                error: "You cannot delete your own account"
            });
        }

        const userResult = await pool.query(
            `
            SELECT
                user_id,
                name,
                email,
                role
            FROM public.users
            WHERE user_id = $1
            `,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const user = userResult.rows[0];

        if (user.role === "admin") {

            const adminCountResult = await pool.query(`
                SELECT COUNT(*)::int AS count
                FROM public.users
                WHERE role = 'admin'
            `);

            const adminCount =
                adminCountResult.rows[0].count;

            if (adminCount <= 1) {
                return res.status(400).json({
                    error: "The last admin account cannot be deleted"
                });
            }
        }

        const result = await pool.query(
            `
            DELETE FROM public.users
            WHERE user_id = $1
            RETURNING
                user_id,
                name,
                email,
                role
            `,
            [userId]
        );

        return res.json({
            message: "User deleted successfully",
            user: result.rows[0]
        });

    } catch (error) {

        console.error("Admin - Delete User Error:", error);

        return res.status(500).json({
            error: "Failed to delete user",
            details: error.message
        });
    }
});


module.exports = router;