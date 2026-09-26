const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../db");

const JWT_SECRET =
    process.env.JWT_SECRET || "skilltrack-secret-key";

async function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    const token =
        authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Authentication required"
        });
    }

    jwt.verify(
        token,
        JWT_SECRET,
        async (err, user) => {
            if (err) {
                return res.status(403).json({
                    error: "Invalid or expired token"
                });
            }

            try {
                const tokenHash = crypto
                    .createHash("sha256")
                    .update(token)
                    .digest("hex");

                const revokedToken = await pool.query(
                    `
                    SELECT id
                    FROM public.revoked_tokens
                    WHERE token_hash = $1
                    AND expires_at > CURRENT_TIMESTAMP
                    LIMIT 1
                    `,
                    [tokenHash]
                );

                if (revokedToken.rows.length > 0) {
                    return res.status(403).json({
                        error: "Token has been revoked"
                    });
                }

                req.user = user;

                next();

            } catch (error) {
                console.error(
                    "Token validation error:",
                    error
                );

                return res.status(500).json({
                    error: "Authentication validation failed"
                });
            }
        }
    );
}

module.exports = authenticateToken;