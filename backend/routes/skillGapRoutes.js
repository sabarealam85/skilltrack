const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAdmin = require("../middleware/requireAdmin");

const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const GROQ_MODEL =
    process.env.GROQ_MODEL || "openai/gpt-oss-20b";


// =====================================================
// GROQ AI HELPER
// =====================================================

async function generateGroqContent(prompt) {
    try {
        const response =
            await groq.chat.completions.create({
                model: GROQ_MODEL,

                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],

                temperature: 0.2,

                response_format: {
                    type: "json_object"
                }
            });

        const content =
            response?.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error(
                "Groq returned an empty response."
            );
        }

        return content;
    } catch (error) {
        console.error(
            "Groq API Error:",
            error
        );

        throw error;
    }
}


// =====================================================
// COMMON HELPERS
// =====================================================

function clampScore(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(100, number)
    );
}


function cleanText(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value).trim();
}


function parseAIResponse(responseText) {
    if (!responseText) {
        throw new Error(
            "Groq returned an empty response."
        );
    }

    try {
        return JSON.parse(responseText);
    } catch (error) {
        const cleaned =
            String(responseText)
                .replace(
                    /^```json\s*/i,
                    ""
                )
                .replace(
                    /^```\s*/i,
                    ""
                )
                .replace(
                    /```\s*$/i,
                    ""
                )
                .trim();

        return JSON.parse(cleaned);
    }
}


// =====================================================
// NORMALIZE AI SKILL GAPS
// REMOVE DUPLICATE SKILLS
// =====================================================

function normalizeSkillGaps(data) {
    if (
        !data ||
        !Array.isArray(data.skillGaps)
    ) {
        return [];
    }

    const uniqueGaps = new Map();

    for (const item of data.skillGaps) {
        if (!item) {
            continue;
        }

        const skill =
            cleanText(
                item.required_skill
            );

        if (!skill) {
            continue;
        }

        const normalizedSkill =
            skill
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();

        const gap = {
            required_skill: skill,

            current_level:
                cleanText(
                    item.current_level
                ) || "Not Assessed",

            required_level:
                cleanText(
                    item.required_level
                ) || "Not Assessed",

            gap_score:
                clampScore(
                    item.gap_score
                ),

            recommendation:
                cleanText(
                    item.recommendation
                ) ||
                "No specific recommendation available from the available evidence."
        };

        const existing =
            uniqueGaps.get(
                normalizedSkill
            );

        if (!existing) {
            uniqueGaps.set(
                normalizedSkill,
                gap
            );

            continue;
        }

        if (
            gap.gap_score >
            existing.gap_score
        ) {
            uniqueGaps.set(
                normalizedSkill,
                gap
            );
        }
    }

    return Array.from(
        uniqueGaps.values()
    );
}


// =====================================================
// NORMALIZE FUTURE RECOMMENDATIONS
// REMOVE DUPLICATE SKILLS
// =====================================================

function normalizeRecommendations(data) {
    if (
        !data ||
        !Array.isArray(
            data.recommendations
        )
    ) {
        return [];
    }

    const uniqueRecommendations =
        new Map();

    for (
        const item of data.recommendations
    ) {
        if (!item) {
            continue;
        }

        const skill =
            cleanText(item.skill);

        if (!skill) {
            continue;
        }

        const normalizedSkill =
            skill
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();

        const recommendation = {
            skill,

            priority:
                [
                    "High",
                    "Medium",
                    "Low"
                ].includes(
                    cleanText(
                        item.priority
                    )
                )
                    ? cleanText(
                          item.priority
                      )
                    : "Medium",

            score:
                clampScore(
                    item.score
                ),

            reason:
                cleanText(
                    item.reason
                ) ||
                "Recommendation generated from the available trainee evidence.",

            learningPath:
                cleanText(
                    item.learningPath
                ) ||
                `Build practical capability in ${skill}.`,

            marketDemand:
                clampScore(
                    item.marketDemand
                ),

            growthRate:
                clampScore(
                    item.growthRate
                )
        };

        const existing =
            uniqueRecommendations.get(
                normalizedSkill
            );

        if (!existing) {
            uniqueRecommendations.set(
                normalizedSkill,
                recommendation
            );

            continue;
        }

        if (
            recommendation.score >
            existing.score
        ) {
            uniqueRecommendations.set(
                normalizedSkill,
                recommendation
            );
        }
    }

    return Array.from(
        uniqueRecommendations.values()
    );
}


// =====================================================
// NORMALIZE TRAINING RELEVANCE
// =====================================================

function normalizeTrainingRelevance(data) {
    if (
        !data ||
        !Array.isArray(
            data.trainingRelevance
        )
    ) {
        return [];
    }

    return data.trainingRelevance
        .filter((item) => item)
        .map((item) => ({
            skill:
                cleanText(
                    item.skill
                ),

            usage:
                [
                    "High",
                    "Medium",
                    "Low",
                    "Not Assessed"
                ].includes(
                    cleanText(
                        item.usage
                    )
                )
                    ? cleanText(
                          item.usage
                      )
                    : "Not Assessed",

            reason:
                cleanText(
                    item.reason
                ) ||
                "Insufficient evidence to determine usage."
        }))
        .filter(
            (item) => item.skill
        );
}


// =====================================================
// GET - VIEW SKILL GAPS
// ADMIN -> ALL
// NORMAL USER -> OWN TRAINEE ONLY
// =====================================================

router.get(
    "/",
    async (req, res) => {
        try {
            if (
                req.user.role ===
                "admin"
            ) {
                const result =
                    await pool.query(`
                        SELECT *
                        FROM public.skill_gap
                        ORDER BY gap_id DESC
                    `);

                return res.json(
                    result.rows
                );
            }

            if (
                !req.user.trainee_id
            ) {
                return res.status(403).json({
                    error:
                        "No trainee profile linked to this account"
                });
            }

            const result =
                await pool.query(
                    `
                    SELECT *
                    FROM public.skill_gap
                    WHERE trainee_id = $1
                    ORDER BY gap_id DESC
                    `,
                    [
                        req.user.trainee_id
                    ]
                );

            return res.json(
                result.rows
            );
        } catch (error) {
            console.error(
                "Error fetching skill gaps:",
                error
            );

            return res.status(500).json({
                error:
                    "Failed to fetch skill gaps"
            });
        }
    }
);


// =====================================================
// POST - MANUAL SKILL GAP
// ADMIN ONLY
// =====================================================

router.post(
    "/",
    requireAdmin,
    async (req, res) => {
        try {
            const {
                trainee_id,
                required_skill,
                current_level,
                required_level,
                gap_score,
                recommendation
            } = req.body;

            const result =
                await pool.query(
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
                    VALUES
                    ($1, $2, $3, $4, $5, $6)
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

            return res.status(201).json({
                message:
                    "Skill gap added successfully",

                skillGap:
                    result.rows[0]
            });
        } catch (error) {
            console.error(
                "Error adding skill gap:",
                error
            );

            return res.status(500).json({
                error:
                    "Failed to add skill gap"
            });
        }
    }
);


// =====================================================
// PUT - UPDATE SKILL GAP
// ADMIN ONLY
// =====================================================

router.put(
    "/:id",
    requireAdmin,
    async (req, res) => {
        try {
            const {
                trainee_id,
                required_skill,
                current_level,
                required_level,
                gap_score,
                recommendation
            } = req.body;

            const result =
                await pool.query(
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

            if (
                result.rows.length ===
                0
            ) {
                return res.status(404).json({
                    error:
                        "Skill gap not found"
                });
            }

            return res.json({
                message:
                    "Skill gap updated successfully",

                skillGap:
                    result.rows[0]
            });
        } catch (error) {
            console.error(
                "Error updating skill gap:",
                error
            );

            return res.status(500).json({
                error:
                    "Failed to update skill gap"
            });
        }
    }
);


// =====================================================
// DELETE - DELETE SKILL GAP
// ADMIN ONLY
// =====================================================

router.delete(
    "/:id",
    requireAdmin,
    async (req, res) => {
        try {
            const result =
                await pool.query(
                    `
                    DELETE FROM public.skill_gap
                    WHERE gap_id = $1
                    RETURNING *
                    `,
                    [
                        req.params.id
                    ]
                );

            if (
                result.rows.length ===
                0
            ) {
                return res.status(404).json({
                    error:
                        "Skill gap not found"
                });
            }

            return res.json({
                message:
                    "Skill gap deleted successfully",

                skillGap:
                    result.rows[0]
            });
        } catch (error) {
            console.error(
                "Error deleting skill gap:",
                error
            );

            return res.status(500).json({
                error:
                    "Failed to delete skill gap"
            });
        }
    }
);


// =====================================================
// LOAD COMPLETE TRAINEE EVIDENCE
// =====================================================

async function loadTraineeEvidence(
    traineeId
) {
    const traineeResult =
        await pool.query(
            `
            SELECT
                trainee_id,
                name,
                course,
                district,
                provider,
                gender,
                age
            FROM public.trainees
            WHERE trainee_id = $1
            `,
            [traineeId]
        );

    if (
        traineeResult.rows.length ===
        0
    ) {
        return null;
    }

    const trainee =
        traineeResult.rows[0];

    const currentSkillsResult =
        await pool.query(
            `
            SELECT
                s.skill_name,
                s.level
            FROM public.trainee_skills ts
            JOIN public.skills s
                ON ts.skill_id = s.skill_id
            WHERE ts.trainee_id = $1
            ORDER BY s.skill_name
            `,
            [traineeId]
        );

    const trainingResult =
        await pool.query(
            `
            SELECT
                training_id,
                course,
                course_provider,
                start_date,
                end_date,
                assessment_score
            FROM public.training
            WHERE trainee_id = $1
            ORDER BY
                start_date DESC NULLS LAST
            `,
            [traineeId]
        );

    const employmentResult =
        await pool.query(
            `
            SELECT
                employment_id,
                employer,
                job_role,
                employment_type
            FROM public.employment
            WHERE trainee_id = $1
            ORDER BY employment_id DESC
            `,
            [traineeId]
        );

    const followupResult =
        await pool.query(
            `
            SELECT
                followup_id,
                followup_date,
                type,
                response,
                status,
                source
            FROM public.followups
            WHERE trainee_id = $1
            ORDER BY
                followup_date DESC NULLS LAST
            `,
            [traineeId]
        );

    const evidenceResult =
        await pool.query(
            `
            SELECT
                evidence_id,
                source,
                verification_status,
                confidence_score,
                verified_date
            FROM public.outcome_evidence
            WHERE trainee_id = $1
            ORDER BY
                verified_date DESC NULLS LAST
            `,
            [traineeId]
        );

    const skillGapResult =
        await pool.query(
            `
            SELECT
                required_skill,
                current_level,
                required_level,
                gap_score,
                recommendation
            FROM public.skill_gap
            WHERE trainee_id = $1
            ORDER BY
                gap_score DESC NULLS LAST
            `,
            [traineeId]
        );

    const marketResult =
        await pool.query(
            `
            SELECT
                skill_name,
                demand_score,
                growth_rate,
                source,
                as_of_date,
                aliases
            FROM public.market_skill_demand
            ORDER BY
                demand_score DESC NULLS LAST
            LIMIT 50
            `
        );

    return {
        trainee,

        currentSkills:
            currentSkillsResult.rows,

        trainingHistory:
            trainingResult.rows,

        employmentHistory:
            employmentResult.rows,

        followups:
            followupResult.rows,

        outcomeEvidence:
            evidenceResult.rows,

        existingSkillGaps:
            skillGapResult.rows,

        marketData:
            marketResult.rows
    };
}


// =====================================================
// GROQ - FUTURE SKILL RECOMMENDATION
// =====================================================
router.post(
    "/recommendations/:traineeId",
    async (req, res) => {
        try {
            const { traineeId } = req.params;

            // -------------------------------------------------
            // RBAC
            // -------------------------------------------------

            if (req.user.role !== "admin") {
                if (!req.user.trainee_id) {
                    return res.status(403).json({
                        error:
                            "No trainee is assigned to this account"
                    });
                }

                if (
                    req.user.trainee_id !==
                    traineeId
                ) {
                    return res.status(403).json({
                        error:
                            "You can only generate recommendations for your own trainee profile"
                    });
                }
            }

            // -------------------------------------------------
            // GROQ API KEY CHECK
            // -------------------------------------------------

            if (!process.env.GROQ_API_KEY) {
                return res.status(500).json({
                    error:
                        "Groq API key is not configured on the backend"
                });
            }

            // -------------------------------------------------
            // LOAD COMPLETE TRAINEE EVIDENCE
            // -------------------------------------------------

            const evidence =
                await loadTraineeEvidence(
                    traineeId
                );

            if (!evidence) {
                return res.status(404).json({
                    error:
                        "Trainee not found"
                });
            }

            // -------------------------------------------------
            // BUILD TRAINEE-SPECIFIC EVIDENCE SUMMARY
            // This makes the AI focus on the individual
            // instead of only the common market data.
            // -------------------------------------------------

            const traineeSpecificEvidence = {
                trainee: {
                    traineeId:
                        evidence.trainee
                            .trainee_id,

                    name:
                        evidence.trainee
                            .name,

                    course:
                        evidence.trainee
                            .course,

                    district:
                        evidence.trainee
                            .district,

                    provider:
                        evidence.trainee
                            .provider,

                    gender:
                        evidence.trainee
                            .gender,

                    age:
                        evidence.trainee
                            .age
                },

                currentSkills:
                    evidence.currentSkills,

                trainingHistory:
                    evidence.trainingHistory,

                employmentHistory:
                    evidence.employmentHistory,

                followups:
                    evidence.followups,

                outcomeEvidence:
                    evidence.outcomeEvidence,

                existingSkillGaps:
                    evidence.existingSkillGaps
            };

            // -------------------------------------------------
            // EXISTING GAP SKILLS
            // These are explicitly blocked from being copied
            // as future recommendations.
            // -------------------------------------------------

            const existingGapSkills =
                new Set(
                    evidence.existingSkillGaps
                        .map(
                            (gap) =>
                                cleanText(
                                    gap.required_skill
                                )
                                    .toLowerCase()
                                    .replace(
                                        /\s+/g,
                                        " "
                                    )
                                    .trim()
                        )
                        .filter(Boolean)
                );

            // -------------------------------------------------
            // AI PROMPT
            // -------------------------------------------------

            const prompt = `
You are the AI intelligence engine of SkillTrack.

Your task is to independently determine the most useful FUTURE SKILLS
for THIS SPECIFIC TRAINEE.

This is NOT a generic career-advice task.

You must analyze the individual trainee's actual evidence and determine
what capability they may reasonably need to learn NEXT.

====================================================
CORE OBJECTIVE
====================================================

The recommendation must answer:

"What should THIS trainee learn next, based on the evidence we actually
have about THIS trainee?"

Do NOT answer:

"What skills are popular in the technology market?"

Do NOT answer:

"What skills are commonly required for this course?"

Do NOT answer:

"What skills appear in the existing skill-gap table?"

====================================================
STRICT INDIVIDUALIZATION RULES
====================================================

1. Analyze this trainee independently.

2. Recommendations must primarily come from this trainee's own evidence.

3. Do NOT give a generic list of popular technologies.

4. Do NOT use fixed career mappings.

5. Do NOT assume that all trainees from the same course need the same
   future skills.

6. Do NOT recommend a skill merely because it has high market demand.

7. Do NOT recommend a skill merely because its growth rate is high.

8. Market data is supporting evidence only.

9. A market skill may be recommended only when there is a clear
   trainee-specific reason connecting that skill to this trainee.

10. The trainee's actual employment and job role should receive high
    importance when available.

11. Follow-up responses should receive high importance when they contain
    an actual work problem, missing capability, or learning need.

12. Assessment results should influence recommendations when available.

13. Training history should be considered when deciding whether a skill
    is a logical next learning step.

14. Current skills should be considered to determine whether a proposed
    skill is a realistic progression.

15. Outcome evidence should be considered when available.

====================================================
EXISTING SKILL GAP RULE
====================================================

Existing skill gaps are CONTEXT ONLY.

NEVER simply copy an existing skill gap into the future recommendations.

If the trainee already has an existing gap for a skill, that exact skill
must NOT be recommended as a future skill.

For example:

Existing gap:
Node.js

Do NOT return:

Future skill:
Node.js

Instead, only recommend a related advanced capability if there is
independent evidence showing that the trainee actually needs that
advanced capability.

A current skill gap and a future learning need are NOT automatically
the same thing.

====================================================
TRAINEE-SPECIFIC EVIDENCE REQUIREMENT
====================================================

Every recommendation MUST be justified by evidence belonging to this
specific trainee.

The reason MUST mention at least one concrete trainee-specific factor,
such as:

- their actual course
- a current skill
- a current skill level
- an assessment result
- an actual employer
- an actual job role
- employment type
- a follow-up response
- verified outcome evidence
- a training history item

Generic reasons are NOT acceptable.

Bad reason:

"This skill is highly demanded in the market."

Bad reason:

"This skill is useful for developers."

Bad reason:

"This is an important modern technology."

Good reason:

"The trainee is currently working as X and the follow-up response
indicates Y capability is being used or is missing."

Only use facts that actually exist in the supplied evidence.

====================================================
DO NOT INVENT INFORMATION
====================================================

Never invent:

- job roles
- employers
- career goals
- salary expectations
- workplace problems
- assessment scores
- skill levels
- follow-up responses
- training history
- employment history

If something is missing, treat it as missing.

====================================================
MARKET DATA RULE
====================================================

Market demand and growth are secondary evidence.

Never select a skill only because it has:

- high demand
- high growth
- a high score
- a popular technology name

The trainee-specific evidence must come first.

For example:

If AWS has demand 95 but there is no trainee-specific evidence
connecting AWS to this trainee, DO NOT recommend AWS.

====================================================
FUTURE SKILL DECISION PROCESS
====================================================

For every possible future skill, internally evaluate:

A. What does this trainee currently know?

B. What did this trainee study or train in?

C. What does the trainee's assessment show?

D. Is the trainee currently employed?

E. If employed, what is the actual job role?

F. Does the employment context create a realistic need for this skill?

G. Do follow-ups show a real need?

H. Does outcome evidence support the need?

I. Is this a genuine progression from the trainee's current capability?

J. Does market data provide supporting evidence?

K. Is there enough evidence to confidently recommend it?

Only recommend a skill when the evidence is sufficiently strong.

====================================================
RECOMMENDATION COUNT
====================================================

Do NOT try to produce 5 or 6 recommendations automatically.

You may return:

0
1
2
3
4
5
or 6

recommendations.

Quality is more important than quantity.

If evidence is weak, return fewer recommendations.

If evidence is insufficient, return:

"recommendations": []

Do NOT manufacture recommendations to fill the list.

====================================================
IMPORTANT DIFFERENT-TRAINEE RULE
====================================================

Do not intentionally make recommendations different merely for the sake
of being different.

However, when trainees have different evidence, their recommendations
should reflect those differences.

For example:

Trainee A:
- different course
- different current skills
- different employment role
- different follow-up evidence

Trainee B:
- different course
- different current skills
- different employment role
- different follow-up evidence

The recommendation analysis should reflect those differences.

====================================================
SCORE
====================================================

Score must be an evidence-based confidence/relevance score from 0 to 100.

Do NOT simply copy market demand into score.

The trainee-specific evidence must have greater influence than market
demand.

Priority must be:

High
Medium
Low

====================================================
LEARNING PATH
====================================================

The learningPath must be practical and specific to the recommended skill.

Do not write generic text such as:

"Learn this skill."

Instead provide a realistic learning direction based on the trainee's
existing capability.

====================================================
TRAINING RELEVANCE
====================================================

Also determine whether the trainee's learned training skills appear
useful in actual work.

Use only:

High
Medium
Low
Not Assessed

If reliable work/employment evidence does not exist, use:

Not Assessed

Do not confuse:

training completed

with:

training proved useful in actual work.

====================================================
OUTPUT FORMAT
====================================================

Return valid JSON only.

Use exactly this structure:

{
  "recommendations": [
    {
      "skill": "skill name",
      "priority": "High",
      "score": 0,
      "reason": "specific evidence-based explanation connected to this exact trainee",
      "learningPath": "specific practical learning path based on the trainee's evidence",
      "marketDemand": 0,
      "growthRate": 0
    }
  ],
  "trainingRelevance": [
    {
      "skill": "learned skill",
      "usage": "High",
      "reason": "evidence-based explanation"
    }
  ],
  "overallTrainingRelevance": "overall evidence-based interpretation"
}

Scores must be between 0 and 100.

====================================================
TRAINEE-SPECIFIC EVIDENCE
====================================================

${JSON.stringify(
    traineeSpecificEvidence,
    null,
    2
)}

====================================================
MARKET DATA
====================================================

Use the following market data only as supporting evidence.

Never recommend a market skill without a trainee-specific connection.

${JSON.stringify(
    evidence.marketData,
    null,
    2
)}
`;

            // -------------------------------------------------
            // CALL GROQ
            // -------------------------------------------------

            const responseText =
                await generateGroqContent(
                    prompt
                );

            const aiData =
                parseAIResponse(
                    responseText
                );

            // -------------------------------------------------
            // NORMALIZE AI RESULT
            // -------------------------------------------------

            let recommendations =
                normalizeRecommendations(
                    aiData
                );

            const trainingRelevance =
                normalizeTrainingRelevance(
                    aiData
                );

            const overallTrainingRelevance =
                cleanText(
                    aiData
                        .overallTrainingRelevance
                ) ||
                "Insufficient evidence to determine overall training relevance.";

            // -------------------------------------------------
            // BACKEND VALIDATION
            // Never allow exact existing skill gaps
            // to become future recommendations.
            // -------------------------------------------------

            recommendations =
                recommendations.filter(
                    (recommendation) => {
                        const normalizedSkill =
                            recommendation.skill
                                .toLowerCase()
                                .replace(
                                    /\s+/g,
                                    " "
                                )
                                .trim();

                        return !existingGapSkills.has(
                            normalizedSkill
                        );
                    }
                );

            // -------------------------------------------------
            // REMOVE GENERIC / WEAK REASONS
            // -------------------------------------------------

            const genericReasonPatterns = [
                "high market demand",
                "high demand in the market",
                "growing demand",
                "popular technology",
                "widely used",
                "commonly used",
                "important skill",
                "modern technology",
                "industry demand",
                "market demand"
            ];

            recommendations =
                recommendations.filter(
                    (recommendation) => {
                        const reason =
                            recommendation.reason
                                .toLowerCase()
                                .trim();

                        if (
                            reason.length < 35
                        ) {
                            return false;
                        }

                        const onlyGeneric =
                            genericReasonPatterns.some(
                                (pattern) =>
                                    reason ===
                                    pattern
                            );

                        return !onlyGeneric;
                    }
                );

            // -------------------------------------------------
            // LIMIT TO MAXIMUM 6
            // -------------------------------------------------

            recommendations =
                recommendations
                    .sort(
                        (a, b) =>
                            b.score -
                            a.score
                    )
                    .slice(0, 6);

            // -------------------------------------------------
            // SAVE FRESH AI RESULT
            // -------------------------------------------------

            const client =
                await pool.connect();

            try {
                await client.query(
                    "BEGIN"
                );

                await client.query(
                    `
                    DELETE FROM public.ai_skill_recommendations
                    WHERE trainee_id = $1
                    `,
                    [
                        traineeId
                    ]
                );

                for (
                    const recommendation
                    of recommendations
                ) {
                    const relevance =
                        trainingRelevance.find(
                            (item) =>
                                item.skill
                                    .toLowerCase()
                                    .trim() ===
                                recommendation.skill
                                    .toLowerCase()
                                    .trim()
                        );

                    await client.query(
                        `
                        INSERT INTO public.ai_skill_recommendations
                        (
                            trainee_id,
                            skill,
                            priority,
                            score,
                            reason,
                            learning_path,
                            market_demand,
                            growth_rate,
                            training_relevance,
                            training_relevance_reason,
                            overall_training_relevance
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
                            $11
                        )
                        `,
                        [
                            traineeId,

                            recommendation.skill,

                            recommendation.priority,

                            recommendation.score,

                            recommendation.reason,

                            recommendation.learningPath,

                            recommendation.marketDemand,

                            recommendation.growthRate,

                            relevance
                                ? relevance.usage
                                : "Not Assessed",

                            relevance
                                ? relevance.reason
                                : "Insufficient evidence to determine usage.",

                            overallTrainingRelevance
                        ]
                    );
                }

                await client.query(
                    "COMMIT"
                );
            } catch (
                databaseError
            ) {
                await client.query(
                    "ROLLBACK"
                );

                throw databaseError;
            } finally {
                client.release();
            }

            // -------------------------------------------------
            // RETURN FRESH RESULT
            // -------------------------------------------------

            return res.json({
                trainee: {
                    trainee_id:
                        evidence.trainee
                            .trainee_id,

                    name:
                        evidence.trainee
                            .name,

                    course:
                        evidence.trainee
                            .course
                },

                currentSkills:
                    evidence.currentSkills,

                skillGaps:
                    evidence.existingSkillGaps,

                recommendations,

                trainingRelevance,

                overallTrainingRelevance,

                aiAnalysis: {
                    trainingRelevance,

                    overallTrainingRelevance
                },

                context: {
                    trainingHistory:
                        evidence.trainingHistory,

                    employmentHistory:
                        evidence.employmentHistory,

                    followups:
                        evidence.followups,

                    outcomeEvidence:
                        evidence.outcomeEvidence
                },

                marketData:
                    evidence.marketData,

                existing: false,

                message:
                    "Fresh AI future skill recommendations generated and saved successfully."
            });

        } catch (error) {
            console.error(
                "AI Future Recommendation Error:",
                error
            );

            if (
                error?.status === 429
            ) {
                return res.status(429).json({
                    error:
                        "Groq API rate limit reached. Please try again later.",

                    details:
                        process.env.NODE_ENV ===
                        "development"
                            ? error.message
                            : undefined
                });
            }

            return res.status(502).json({
                error:
                    "AI recommendation service failed. Existing trainee recommendations were not changed.",

                details:
                    process.env.NODE_ENV ===
                    "development"
                        ? error.message
                        : undefined
            });
        }
    }
);


// =====================================================
// GROQ - AI SKILL GAP GENERATION
// ADMIN ONLY
// =====================================================

router.post(
    "/generate/:traineeId",
    requireAdmin,
    async (req, res) => {
        try {
            const {
                traineeId
            } = req.params;

            // -------------------------------------------------
            // CHECK IF AI SKILL GAP ALREADY EXISTS
            // -------------------------------------------------

            const existingResult =
                await pool.query(
                    `
                    SELECT *
                    FROM public.skill_gap
                    WHERE trainee_id = $1
                    ORDER BY
                        gap_score DESC NULLS LAST,
                        gap_id DESC
                    `,
                    [traineeId]
                );

            if (
                existingResult.rows.length > 0
            ) {
                const traineeResult =
                    await pool.query(
                        `
                        SELECT
                            trainee_id,
                            name,
                            course
                        FROM public.trainees
                        WHERE trainee_id = $1
                        `,
                        [traineeId]
                    );

                if (
                    traineeResult.rows.length === 0
                ) {
                    return res.status(404).json({
                        error:
                            "Trainee not found"
                    });
                }

                return res.json({
                    message:
                        "AI skill gap already exists for this trainee. Existing result returned.",

                    trainee:
                        traineeResult.rows[0],

                    skillGaps:
                        existingResult.rows,

                    trainingRelevance: [],

                    overallTrainingRelevance:
                        "Existing AI skill-gap analysis returned. No new AI analysis was generated.",

                    aiAnalysis: {
                        trainingRelevance: [],

                        overallTrainingRelevance:
                            "Existing AI skill-gap analysis returned. No new AI analysis was generated."
                    },

                    existing: true
                });
            }

            // -------------------------------------------------
            // GROQ API KEY CHECK
            // -------------------------------------------------

            if (
                !process.env.GROQ_API_KEY
            ) {
                return res.status(500).json({
                    error:
                        "Groq API key is not configured on the backend"
                });
            }

            // -------------------------------------------------
            // LOAD TRAINEE EVIDENCE
            // -------------------------------------------------

            const evidence =
                await loadTraineeEvidence(
                    traineeId
                );

            if (!evidence) {
                return res.status(404).json({
                    error:
                        "Trainee not found"
                });
            }

            // -------------------------------------------------
            // AI PROMPT
            // -------------------------------------------------

            const prompt = `
You are the AI skill-gap intelligence engine of SkillTrack.

Your task is to identify the CURRENT skill gaps of this specific trainee.

A skill gap means a capability that the trainee appears to need but does not currently demonstrate at the required level, based on the evidence provided.

IMPORTANT:

1. This is an individual trainee analysis.
2. Do NOT return a fixed number of skills.
3. Do NOT always return the same skills.
4. Do NOT automatically return Node.js, AWS, Docker, Cloud Security or any other predefined skills.
5. Do NOT copy every Job Requirement from the database.
6. Do NOT invent evidence.
7. Use actual trainee course, current skills, training history, assessment results, employment/job role, follow-ups, outcome evidence and market information.
8. Identify only meaningful skill gaps supported by the evidence.
9. If no reliable skill gap can be established, return an empty skillGaps array.
10. "Not Assessed" means there is insufficient evidence about the current level; it must not automatically be treated as a skill gap.
11. The required level should be based on the trainee's actual work/career context and available evidence.
12. gap_score is your AI estimate from 0 to 100 based on evidence.
13. Give a specific recommendation for each identified gap.
14. Do not make every trainee identical.
15. Do not use passwords, tokens or account credentials.
16. Return valid JSON only.

Also analyze how useful the trainee's learned training skills appear to be in actual employment/work.

Use:

- High
- Medium
- Low
- Not Assessed

for training relevance.

Return exactly:

{
  "skillGaps": [
    {
      "required_skill": "skill name",
      "current_level": "Basic",
      "required_level": "Intermediate",
      "gap_score": 0,
      "recommendation": "specific evidence-based recommendation"
    }
  ],
  "trainingRelevance": [
    {
      "skill": "learned skill",
      "usage": "High",
      "reason": "evidence-based explanation"
    }
  ],
  "overallTrainingRelevance": "overall evidence-based interpretation"
}

Possible current_level values:

- Basic
- Intermediate
- Advanced
- Not Assessed

Possible required_level values:

- Basic
- Intermediate
- Advanced
- Not Assessed

Scores must be between 0 and 100.

TRAINEE EVIDENCE:

${JSON.stringify(
    evidence,
    null,
    2
)}
`;

            const responseText =
                await generateGroqContent(
                    prompt
                );

            const aiData =
                parseAIResponse(
                    responseText
                );

            const skillGaps =
                normalizeSkillGaps(
                    aiData
                );

            const trainingRelevance =
                normalizeTrainingRelevance(
                    aiData
                );

            // -------------------------------------------------
            // SAVE AI RESULT
            // -------------------------------------------------

            const client =
                await pool.connect();

            try {
                await client.query(
                    "BEGIN"
                );

                for (
                    const gap of skillGaps
                ) {
                    await client.query(
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
                        VALUES
                        ($1, $2, $3, $4, $5, $6)
                        `,
                        [
                            traineeId,
                            gap.required_skill,
                            gap.current_level,
                            gap.required_level,
                            gap.gap_score,
                            gap.recommendation
                        ]
                    );
                }

                await client.query(
                    "COMMIT"
                );
            } catch (
                databaseError
            ) {
                await client.query(
                    "ROLLBACK"
                );

                throw databaseError;
            } finally {
                client.release();
            }

            // -------------------------------------------------
            // RETURN SAVED RESULT
            // -------------------------------------------------

            const savedResult =
                await pool.query(
                    `
                    SELECT *
                    FROM public.skill_gap
                    WHERE trainee_id = $1
                    ORDER BY
                        gap_score DESC NULLS LAST,
                        gap_id DESC
                    `,
                    [traineeId]
                );

            return res.json({
                message:
                    "AI skill gap analysis generated successfully",

                trainee: {
                    trainee_id:
                        evidence.trainee
                            .trainee_id,

                    name:
                        evidence.trainee
                            .name,

                    course:
                        evidence.trainee
                            .course
                },

                skillGaps:
                    savedResult.rows,

                trainingRelevance,

                overallTrainingRelevance:
                    cleanText(
                        aiData
                            .overallTrainingRelevance
                    ) ||
                    "Insufficient evidence to determine overall training relevance.",

                aiAnalysis: {
                    trainingRelevance,

                    overallTrainingRelevance:
                        cleanText(
                            aiData
                                .overallTrainingRelevance
                        ) ||
                        "Insufficient evidence to determine overall training relevance."
                },

                existing: false
            });
        } catch (error) {
            console.error(
                "AI Skill Gap Generation Error:",
                error
            );

            if (
                error?.status === 429
            ) {
                return res.status(429).json({
                    error:
                        "Groq API rate limit reached. Please try again later.",

                    details:
                        process.env.NODE_ENV ===
                        "development"
                            ? error.message
                            : undefined
                });
            }

            return res.status(502).json({
                error:
                    "AI skill-gap generation failed. Existing skill-gap records were not changed.",

                details:
                    process.env.NODE_ENV ===
                    "development"
                        ? error.message
                        : undefined
            });
        }
    }
);


module.exports = router;