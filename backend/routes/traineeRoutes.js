const requireAdmin = require("../middleware/requireAdmin");
const express = require("express");
const pool = require("../db");

const router = express.Router();


// =====================================================
// GET ALL TRAINEES
// Admin → all trainees
// Normal user → only own trainee
// =====================================================

router.get("/", async (req, res) => {
    try {

        if (req.user.role === "admin") {

            const result = await pool.query(`
                SELECT 
                    trainee_id,
                    name,
                    email,
                    date_of_birth,
                    location,
                    phone,
                    course,
                    district,
                    COALESCE(location, district) AS city,
                    provider,
                    gender,
                    age,
                    training_year,
                    status,
                    confidence
                FROM public.trainees
                ORDER BY trainee_id
            `);

            return res.json(result.rows);
        }


        if (!req.user.trainee_id) {

            return res.status(403).json({
                error: "No trainee profile linked to this account"
            });
        }


        const result = await pool.query(
            `
            SELECT 
                trainee_id,
                name,
                email,
                date_of_birth,
                location,
                phone,
                course,
                district,
                COALESCE(location, district) AS city,
                provider,
                gender,
                age,
                training_year,
                status,
                confidence
            FROM public.trainees
            WHERE trainee_id = $1
            `,
            [req.user.trainee_id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                error: "Trainee profile not found"
            });
        }


        return res.json(result.rows);

    } catch (error) {

        console.error(
            "Error fetching trainees:",
            error
        );

        res.status(500).json({
            error: "Failed to fetch trainees"
        });
    }
});


// =====================================================
// GET ONE TRAINEE BY ID
// Admin → any trainee
// Normal user → only own trainee
// =====================================================

router.get("/:id", async (req, res) => {

    try {

        if (req.user.role !== "admin") {

            if (!req.user.trainee_id) {

                return res.status(403).json({
                    error:
                        "No trainee profile linked to this account"
                });
            }


            if (
                req.user.trainee_id !==
                req.params.id
            ) {

                return res.status(403).json({
                    error:
                        "You can only view your own trainee profile"
                });
            }
        }


        const result = await pool.query(
            `
            SELECT
                trainee_id,
                name,
                email,
                date_of_birth,
                location,
                phone,
                course,
                district,
                COALESCE(location, district) AS city,
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


        return res.json(result.rows[0]);

    } catch (error) {

        console.error(
            "Error fetching trainee:",
            error
        );

        return res.status(500).json({
            error: "Failed to fetch trainee"
        });
    }
});


// =====================================================
// ADD NEW TRAINEE
// ADMIN ONLY
// =====================================================

router.post(
    "/",
    requireAdmin,
    async (req, res) => {

        try {

            const {
                trainee_id,
                name,
                email,
                date_of_birth,
                location,
                phone,
                course,
                district,
                provider,
                gender,
                age,
                training_year,
                status,
                confidence
            } = req.body;


            if (!trainee_id || !name || !email) {

                return res.status(400).json({
                    error:
                        "Trainee ID, name and email are required"
                });
            }


            const existingTrainee =
                await pool.query(
                    `
                    SELECT trainee_id
                    FROM public.trainees
                    WHERE trainee_id = $1
                    LIMIT 1
                    `,
                    [trainee_id.trim()]
                );


            if (existingTrainee.rows.length > 0) {

                return res.status(409).json({
                    error:
                        "Trainee ID already exists"
                });
            }


            const result = await pool.query(
                `
                INSERT INTO public.trainees
                (
                    trainee_id,
                    name,
                    email,
                    date_of_birth,
                    location,
                    phone,
                    course,
                    district,
                    provider,
                    gender,
                    age,
                    training_year,
                    status,
                    confidence
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9,
                    $10,
                    $11,
                    $12,
                    $13,
                    $14
                )
                RETURNING *
                `,
                [
                    trainee_id.trim(),
                    name.trim(),
                    email.trim().toLowerCase(),
                    date_of_birth || null,
                    location?.trim() || null,
                    phone?.trim() || null,
                    course?.trim() || null,
                    district?.trim() || null,
                    provider?.trim() || null,
                    gender?.trim() || null,
                    age || null,
                    training_year || null,
                    status || null,
                    confidence || null
                ]
            );


            res.status(201).json(
                result.rows[0]
            );

        } catch (error) {

            console.error(
                "Error adding trainee:",
                error
            );

            res.status(500).json({
                error: "Failed to add trainee"
            });
        }
    }
);


// =====================================================
// UPDATE TRAINEE
//
// Admin → can update any trainee
// Normal user → can update only own basic details
// =====================================================

router.put(
    "/:id",
    async (req, res) => {

        try {

            const traineeId =
                req.params.id;

            const isAdmin =
                req.user.role === "admin";


            // ==========================================
            // NORMAL USER SECURITY
            // ==========================================

            if (!isAdmin) {

                if (!req.user.trainee_id) {

                    return res.status(403).json({
                        error:
                            "No trainee profile linked to this account"
                    });
                }


                if (
                    req.user.trainee_id !==
                    traineeId
                ) {

                    return res.status(403).json({
                        error:
                            "You can only update your own profile"
                    });
                }
            }


            // ==========================================
            // ADMIN UPDATE
            // ==========================================

            if (isAdmin) {

                const {
                    name,
                    email,
                    date_of_birth,
                    location,
                    phone,
                    course,
                    district,
                    provider,
                    gender,
                    age,
                    training_year,
                    status,
                    confidence
                } = req.body;


                if (!name || !email) {

                    return res.status(400).json({
                        error:
                            "Name and email are required"
                    });
                }


                const result = await pool.query(
                    `
                    UPDATE public.trainees
                    SET
                        name = $1,
                        email = $2,
                        date_of_birth = $3,
                        location = $4,
                        phone = $5,
                        course = $6,
                        district = $7,
                        provider = $8,
                        gender = $9,
                        age = $10,
                        training_year = $11,
                        status = $12,
                        confidence = $13
                    WHERE trainee_id = $14
                    RETURNING *
                    `,
                    [
                        name.trim(),
                        email.trim().toLowerCase(),
                        date_of_birth || null,
                        location?.trim() || null,
                        phone?.trim() || null,
                        course?.trim() || null,
                        district?.trim() || null,
                        provider?.trim() || null,
                        gender?.trim() || null,
                        age || null,
                        training_year || null,
                        status || null,
                        confidence || null,
                        traineeId
                    ]
                );


                if (result.rows.length === 0) {

                    return res.status(404).json({
                        error:
                            "Trainee not found"
                    });
                }


                return res.json(
                    result.rows[0]
                );
            }


            // ==========================================
            // NORMAL TRAINEE → BASIC DETAILS ONLY
            // ==========================================

            const {
                name,
                email,
                date_of_birth,
                location,
                phone
            } = req.body;


            if (!name || !email) {

                return res.status(400).json({
                    error:
                        "Name and email are required"
                });
            }


            const result = await pool.query(
                `
                UPDATE public.trainees
                SET
                    name = $1,
                    email = $2,
                    date_of_birth = $3,
                    location = $4,
                    phone = $5
                WHERE trainee_id = $6
                RETURNING *
                `,
                [
                    name.trim(),
                    email.trim().toLowerCase(),
                    date_of_birth || null,
                    location?.trim() || null,
                    phone?.trim() || null,
                    traineeId
                ]
            );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    error:
                        "Trainee not found"
                });
            }


            return res.json(
                result.rows[0]
            );

        } catch (error) {

            console.error(
                "Error updating trainee:",
                error
            );

            return res.status(500).json({
                error:
                    "Failed to update trainee"
            });
        }
    }
);


// =====================================================
// DELETE TRAINEE
// ADMIN ONLY
// =====================================================

router.delete(
    "/:id",
    requireAdmin,
    async (req, res) => {

        const client =
            await pool.connect();

        try {

            await client.query(
                "BEGIN"
            );

            const traineeId =
                req.params.id;


            await client.query(
                `
                DELETE FROM public.employment
                WHERE trainee_id = $1
                `,
                [traineeId]
            );


            await client.query(
                `
                DELETE FROM public.followups
                WHERE trainee_id = $1
                `,
                [traineeId]
            );


            await client.query(
                `
                DELETE FROM public.outcome_evidence
                WHERE trainee_id = $1
                `,
                [traineeId]
            );


            await client.query(
                `
                DELETE FROM public.skill_gap
                WHERE trainee_id = $1
                `,
                [traineeId]
            );


            await client.query(
                `
                DELETE FROM public.trainee_skills
                WHERE trainee_id = $1
                `,
                [traineeId]
            );


            await client.query(
                `
                DELETE FROM public.training
                WHERE trainee_id = $1
                `,
                [traineeId]
            );


            const result =
                await client.query(
                    `
                    DELETE FROM public.trainees
                    WHERE trainee_id = $1
                    RETURNING *
                    `,
                    [traineeId]
                );


            if (result.rows.length === 0) {

                await client.query(
                    "ROLLBACK"
                );

                return res.status(404).json({
                    error:
                        "Trainee not found"
                });
            }


            await client.query(
                "COMMIT"
            );


            res.json({
                message:
                    "Trainee deleted successfully",

                trainee:
                    result.rows[0]
            });

        } catch (error) {

            await client.query(
                "ROLLBACK"
            );

            console.error(
                "Error deleting trainee:",
                error
            );

            res.status(500).json({
                error:
                    "Failed to delete trainee"
            });

        } finally {

            client.release();
        }
    }
);


module.exports = router;