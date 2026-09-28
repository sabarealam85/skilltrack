const express = require("express");
const router = express.Router();

const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");


// =====================================================
// GET TRAINING RECORDS
// ADMIN → ALL
// NORMAL USER → OWN ONLY
// =====================================================

router.get("/", async (req, res) => {
    try {

        // =================================================
        // ADMIN → SABHI TRAINING RECORDS
        // =================================================

        if (req.user.role === "admin") {

            const result = await pool.query(`
                SELECT
                    training.training_id,
                    training.trainee_id,
                    trainees.name AS trainee_name,
                    training.skill,
                    training.course_provider,
                    training.start_date,
                    training.end_date,
                    training.assessment_score
                FROM public.training
                LEFT JOIN public.trainees
                    ON training.trainee_id = trainees.trainee_id
                ORDER BY training.training_id DESC
            `);

            return res.json(result.rows);
        }


        // =================================================
        // NORMAL USER → TRAINEE PROFILE REQUIRED
        // =================================================

        if (!req.user.trainee_id) {

            return res.status(403).json({
                error: "No trainee profile linked to this account"
            });
        }


        // =================================================
        // NORMAL USER → SIRF APNI TRAINING
        // =================================================

        const result = await pool.query(
            `
            SELECT
                training.training_id,
                training.trainee_id,
                trainees.name AS trainee_name,
                training.skill,
                training.course_provider,
                training.start_date,
                training.end_date,
                training.assessment_score
            FROM public.training
            LEFT JOIN public.trainees
                ON training.trainee_id = trainees.trainee_id
            WHERE training.trainee_id = $1
            ORDER BY training.training_id DESC
            `,
            [req.user.trainee_id]
        );

        return res.json(result.rows);

    } catch (error) {

        console.error(
            "Error fetching training:",
            error
        );

        return res.status(500).json({
            error: "Failed to fetch training records"
        });
    }
});


// =====================================================
// POST - ADD TRAINING
// ADMIN + NORMAL USER (OWN TRAINING)
// =====================================================

router.post("/", async (req, res) => {
    try {

        const {
            trainee_id,
            skill,
            course_provider,
            start_date,
            end_date,
            assessment_score
        } = req.body;


        const isAdmin =
            req.user.role === "admin";


        // =================================================
        // NORMAL USER → PROFILE REQUIRED
        // =================================================

        if (
            !isAdmin &&
            !req.user.trainee_id
        ) {

            return res.status(403).json({
                error:
                    "No trainee profile linked to this account"
            });
        }


        // =================================================
        // TRAINEE ID
        //
        // ADMIN → body se
        // USER  → token se
        // =================================================

        const finalTraineeId =
            isAdmin
                ? trainee_id
                : req.user.trainee_id;


        // =================================================
        // BASIC VALIDATION
        // =================================================

        if (!finalTraineeId) {

            return res.status(400).json({
                error: "Trainee ID is required"
            });
        }


        if (!skill || !skill.trim()) {

            return res.status(400).json({
                error: "Skill is required"
            });
        }


        // =================================================
        // INSERT TRAINING
        // =================================================

        const result = await pool.query(
            `
            INSERT INTO public.training
            (
                trainee_id,
                skill,
                course_provider,
                start_date,
                end_date,
                assessment_score
            )
            VALUES
            ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [
                finalTraineeId,
                skill.trim(),
                course_provider?.trim() || null,
                start_date || null,
                end_date || null,
                assessment_score ?? null
            ]
        );


        // =================================================
        // IMPORTANT
        //
        // Training Skill ko Trainee Course me sync
        // NAHI kiya jayega.
        //
        // Trainee Course aur Training Skill
        // completely separate rahenge.
        // =================================================


        return res.status(201).json({
            message:
                "Training record added successfully",
            training:
                result.rows[0]
        });

    } catch (error) {

        console.error(
            "Error adding training:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to add training record",
            details:
                error.message
        });
    }
});


// =====================================================
// PUT - UPDATE TRAINING
// ADMIN + NORMAL USER (OWN TRAINING)
// =====================================================

router.put("/:id", async (req, res) => {
    try {

        const {
            trainee_id,
            skill,
            course_provider,
            start_date,
            end_date,
            assessment_score
        } = req.body;


        const trainingId =
            Number(req.params.id);


        // =================================================
        // ID VALIDATION
        // =================================================

        if (!Number.isInteger(trainingId)) {

            return res.status(400).json({
                error:
                    "Invalid training ID"
            });
        }


        const isAdmin =
            req.user.role === "admin";


        // =================================================
        // ADMIN → FULL UPDATE
        // =================================================

        if (isAdmin) {

            if (!trainee_id) {

                return res.status(400).json({
                    error:
                        "Trainee ID is required"
                });
            }


            if (!skill || !skill.trim()) {

                return res.status(400).json({
                    error:
                        "Skill is required"
                });
            }


            const result = await pool.query(
                `
                UPDATE public.training
                SET
                    trainee_id = $1,
                    skill = $2,
                    course_provider = $3,
                    start_date = $4,
                    end_date = $5,
                    assessment_score = $6
                WHERE training_id = $7
                RETURNING *
                `,
                [
                    trainee_id,
                    skill.trim(),
                    course_provider?.trim() || null,
                    start_date || null,
                    end_date || null,
                    assessment_score ?? null,
                    trainingId
                ]
            );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    error:
                        "Training record not found"
                });
            }


            return res.json({
                message:
                    "Training record updated successfully",
                training:
                    result.rows[0]
            });
        }


        // =================================================
        // NORMAL USER → PROFILE REQUIRED
        // =================================================

        if (!req.user.trainee_id) {

            return res.status(403).json({
                error:
                    "No trainee profile linked to this account"
            });
        }


        // =================================================
        // NORMAL USER → ONLY OWN RECORD
        //
        // trainee_id body se update nahi hoga.
        // Ownership database level par check hogi.
        // =================================================

        if (!skill || !skill.trim()) {

            return res.status(400).json({
                error:
                    "Skill is required"
            });
        }


        const result = await pool.query(
            `
            UPDATE public.training
            SET
                skill = $1,
                course_provider = $2,
                start_date = $3,
                end_date = $4,
                assessment_score = $5
            WHERE training_id = $6
              AND trainee_id = $7
            RETURNING *
            `,
            [
                skill.trim(),
                course_provider?.trim() || null,
                start_date || null,
                end_date || null,
                assessment_score ?? null,
                trainingId,
                req.user.trainee_id
            ]
        );


        // =================================================
        // RECORD NOT FOUND / OTHER TRAINEE
        // =================================================

        if (result.rows.length === 0) {

            return res.status(403).json({
                error:
                    "You can only update your own training record"
            });
        }


        return res.json({
            message:
                "Training record updated successfully",
            training:
                result.rows[0]
        });

    } catch (error) {

        console.error(
            "Error updating training:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to update training record",
            details:
                error.message
        });
    }
});


// =====================================================
// DELETE - ADMIN ONLY
// =====================================================

router.delete(
    "/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const trainingId =
                Number(req.params.id);


            if (!Number.isInteger(trainingId)) {

                return res.status(400).json({
                    error:
                        "Invalid training ID"
                });
            }


            const result = await pool.query(
                `
                DELETE FROM public.training
                WHERE training_id = $1
                RETURNING *
                `,
                [trainingId]
            );


            if (result.rows.length === 0) {

                return res.status(404).json({
                    error:
                        "Training record not found"
                });
            }


            return res.json({
                message:
                    "Training record deleted successfully",
                training:
                    result.rows[0]
            });

        } catch (error) {

            console.error(
                "Error deleting training:",
                error
            );

            return res.status(500).json({
                error:
                    "Failed to delete training record"
            });
        }
    }
);


module.exports = router;