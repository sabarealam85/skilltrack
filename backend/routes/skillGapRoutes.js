const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

// GET - View all skill gaps
// Normal user + Admin दोनों देख सकते हैं
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
// केवल Admin
router.post("/", requireAdmin, async (req, res) => {
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
// केवल Admin
router.put("/:id", requireAdmin, async (req, res) => {
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
// केवल Admin
router.delete("/:id", requireAdmin, async (req, res) => {
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


// =====================================================
// POST - Generate future skill recommendations
// Admin + Normal User
// Normal User -> केवल अपने trainee के लिए
// Admin -> किसी भी trainee के लिए
// =====================================================
router.post("/recommendations/:traineeId", async (req, res) => {
    try {
        const { traineeId } = req.params;

        // -------------------------------------------------
        // SECURITY CHECK
        // -------------------------------------------------
        // Normal user दूसरे trainee की recommendation
        // generate नहीं कर सकता.
        if (req.user.role !== "admin") {
            if (!req.user.trainee_id) {
                return res.status(403).json({
                    error: "No trainee is assigned to this account"
                });
            }

            if (req.user.trainee_id !== traineeId) {
                return res.status(403).json({
                    error: "You can only generate recommendations for your own trainee profile"
                });
            }
        }


        // -------------------------------------------------
        // CHECK TRAINEE EXISTS
        // -------------------------------------------------
        const traineeResult = await pool.query(
            `
            SELECT trainee_id, name, course
            FROM public.trainees
            WHERE trainee_id = $1
            `,
            [traineeId]
        );

        if (traineeResult.rows.length === 0) {
            return res.status(404).json({
                error: "Trainee not found"
            });
        }

        const trainee = traineeResult.rows[0];


        // -------------------------------------------------
        // CURRENT SKILLS
        // -------------------------------------------------
        const currentSkillsResult = await pool.query(
            `
            SELECT s.skill_name, ts.level
            FROM public.trainee_skills ts
            JOIN public.skills s
                ON ts.skill_id = s.skill_id
            WHERE ts.trainee_id = $1
            `,
            [traineeId]
        );


        // -------------------------------------------------
        // SKILL GAPS
        // -------------------------------------------------
        const gapResult = await pool.query(
            `
            SELECT
                required_skill,
                current_level,
                required_level,
                gap_score
            FROM public.skill_gap
            WHERE trainee_id = $1
            `,
            [traineeId]
        );


        const currentSkills = currentSkillsResult.rows;
        const skillGaps = gapResult.rows;

        const recommendations = [];


        // -------------------------------------------------
        // RECOMMEND FROM SKILL GAPS
        // -------------------------------------------------
        skillGaps.forEach((gap) => {

            const gapScore = Number(gap.gap_score || 0);

            let priority = "Low";

            if (gapScore >= 70) {
                priority = "High";
            } else if (gapScore >= 40) {
                priority = "Medium";
            }

            recommendations.push({
                skill: gap.required_skill,
                priority,
                reason:
                    `Current level is ${gap.current_level}, while required level is ${gap.required_level}. Gap score is ${gapScore}.`,
                learningPath:
                    `Strengthen ${gap.required_skill} from ${gap.current_level} to ${gap.required_level}.`
            });
        });


        // -------------------------------------------------
        // FUTURE SKILL RECOMMENDATION
        // Based on existing skills
        // -------------------------------------------------
        const currentSkillNames = currentSkills.map(
            skill => skill.skill_name.toLowerCase()
        );


        const futureSkillMap = {
            javascript: ["React", "Node.js"],
            html: ["React", "JavaScript"],
            css: ["React", "UI/UX"],
            react: ["Node.js", "Cloud"],
            "node.js": ["Cloud", "Docker"],
            python: ["Data Analytics", "Machine Learning"],
            sql: ["Data Analytics", "Data Engineering"],
            java: ["Spring Boot", "Cloud"]
        };


        currentSkillNames.forEach((skill) => {

            const futureSkills = futureSkillMap[skill] || [];

            futureSkills.forEach((futureSkill) => {

                const alreadyRecommended = recommendations.some(
                    item =>
                        item.skill.toLowerCase() === futureSkill.toLowerCase()
                );

                if (!alreadyRecommended) {

                    recommendations.push({
                        skill: futureSkill,
                        priority: "Medium",
                        reason:
                            `Recommended based on the trainee's current ${skill} skill.`,
                        learningPath:
                            `Build ${futureSkill} skills on top of existing ${skill} knowledge.`
                    });

                }
            });
        });


        // -------------------------------------------------
        // FINAL RESPONSE
        // -------------------------------------------------
        res.json({
            trainee: {
                trainee_id: trainee.trainee_id,
                name: trainee.name,
                course: trainee.course
            },
            currentSkills,
            skillGaps,
            recommendations
        });

    } catch (error) {

        console.error("Recommendation error:", error);

        res.status(500).json({
            error: "Failed to generate skill recommendations"
        });
    }
});


module.exports = router;