
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const supabase = require("../config/supabase");

const router = express.Router();

// Verify the user's Supabase access token.
const supabaseAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        }
    }
);

// Validate a positive integer ID.
function getValidId(value) {
    const id = Number(value);

    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// Verify the logged-in user using their access token.
async function getAuthenticatedUser(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return {
            user: null,
            message: "Please log in to continue."
        };
    }

    const accessToken = authHeader.slice(7).trim();

    if (!accessToken) {
        return {
            user: null,
            message: "Your login session is missing."
        };
    }

    const { data, error } = await supabaseAuth.auth.getUser(accessToken);

    if (error || !data.user) {
        return {
            user: null,
            message: "Your login session is invalid or expired. Please log in again."
        };
    }

    return {
        user: data.user,
        message: null
    };
}

// Check whether a user has an active enrollment.
async function getActiveEnrollment(userId, pathId) {
    const { data, error } = await supabase
        .from("enrollment")
        .select(`
            enrollment_id,
            user_id,
            path_id,
            enrolled_at,
            status,
            path_xp,
            current_level
        `)
        .eq("user_id", userId)
        .eq("path_id", pathId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data || String(data.status).toLowerCase() !== "active") {
        return null;
    }

    return data;
}

// Test route.
router.get("/test-route", (req, res) => {
    res.json({
        message: "The PATH routes file is loaded!"
    });
});

// GET /api/paths
// Fetch all learning paths.
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("learning_path")
            .select("*")
            .order("path_id", { ascending: true });

        if (error) {
            console.error("Fetch paths error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to load learning paths."
            });
        }

        return res.status(200).json({
            success: true,
            paths: data
        });
    } catch (error) {
        console.error("Path API error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while loading paths."
        });
    }
});

// GET /api/paths/:pathId/modules
// Fetch modules for a selected learning path.
router.get("/:pathId/modules", async (req, res) => {
    try {
        const pathId = getValidId(req.params.pathId);

        if (!pathId) {
            return res.status(400).json({
                success: false,
                message: "Invalid learning path ID."
            });
        }

        const { data: path, error: pathError } = await supabase
            .from("learning_path")
            .select("path_id, path_name, description, status")
            .eq("path_id", pathId)
            .maybeSingle();

        if (pathError) {
            console.error("Fetch learning path error:", pathError);

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve the learning path."
            });
        }

        if (!path) {
            return res.status(404).json({
                success: false,
                message: "Learning path not found."
            });
        }

        const { data: modules, error: modulesError } = await supabase
            .from("module")
            .select("module_id, path_id, module_number, module_name, description")
            .eq("path_id", pathId)
            .order("module_number", { ascending: true });

        if (modulesError) {
            console.error("Fetch modules error:", modulesError);

            return res.status(500).json({
                success: false,
                message: "Unable to load the modules."
            });
        }

        return res.status(200).json({
            success: true,
            path,
            modules: modules || []
        });
    } catch (error) {
        console.error("Modules API error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while loading modules."
        });
    }
});


// GET /api/paths/:pathId/enrollment
// Check enrollment and return the learner's current XP totals.
router.get("/:pathId/enrollment", async (req, res) => {
    try {
        const pathId = getValidId(req.params.pathId);

        if (!pathId) {
            return res.status(400).json({
                success: false,
                message: "Invalid learning path ID."
            });
        }

        const { user, message } = await getAuthenticatedUser(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message
            });
        }

        const enrollment = await getActiveEnrollment(user.id, pathId);

        // Get the learner's total XP across all learning paths.
        
const { data: profile, error: profileError } = await supabase
    .from("user_profile")
    .select("overall_xp, timezone, username, profile_picture_url")
    .eq("user_id", user.id)
    .maybeSingle();


        if (profileError) throw profileError;

        return res.status(200).json({
            success: true,
            enrolled: Boolean(enrollment),
            enrollment,
            xp: {
                overallXp: Number(profile?.overall_xp || 0),
                pathXp: Number(enrollment?.path_xp || 0)
            }
        });
    } catch (error) {
        console.error("Check enrollment error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to check your enrollment."
        });
    }
});



/*
 * GET /api/paths/modules/:moduleId/lessons
 * Return lesson titles and the logged-in learner's progress.
 */
router.get("/modules/:moduleId/lessons", async (req, res) => {
    try {
        const moduleId = getValidId(req.params.moduleId);

        if (!moduleId) {
            return res.status(400).json({
                success: false,
                message: "Invalid module ID."
            });
        }

        const { user, message } = await getAuthenticatedUser(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message
            });
        }

        const { data: module, error: moduleError } = await supabase
            .from("module")
            .select("module_id, path_id, module_number, module_name")
            .eq("module_id", moduleId)
            .maybeSingle();

        if (moduleError) throw moduleError;

        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Module not found."
            });
        }

        const enrollment = await getActiveEnrollment(
            user.id,
            module.path_id
        );

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "Enroll in this learning path first."
            });
        }

        const { data: lessons, error: lessonsError } = await supabase
            .from("lesson")
            .select(`
                lesson_id,
                module_id,
                lesson_number,
                title,
                estimated_minutes,
                status
            `)
            .eq("module_id", moduleId)
            .order("lesson_number", { ascending: true });

        if (lessonsError) throw lessonsError;

        const { data: progressRecords, error: progressError } =
            await supabase
                .from("lesson_progress")
                .select("lesson_id, status, completed_at")
                .eq("user_id", user.id)
                .in(
                    "lesson_id",
                    (lessons || []).map(lesson => lesson.lesson_id)
                );

        if (progressError) throw progressError;

        const progressByLesson = new Map(
            (progressRecords || []).map(progress => [
                Number(progress.lesson_id),
                progress
            ])
        );

        let previousLessonCompleted = true;

        const navigationLessons = (lessons || []).map(lesson => {
            const progress = progressByLesson.get(
                Number(lesson.lesson_id)
            );

            const completed = progress?.status === "completed";
            const published =
                String(lesson.status || "").toLowerCase() === "published";

            const canAccess =
                published &&
                (previousLessonCompleted || completed);

            const item = {
                ...lesson,
                progress_status: progress?.status || "not_started",
                completed,
                published,
                can_access: canAccess
            };

            // Later lessons unlock only after the current lesson is completed.
            previousLessonCompleted = completed;

            return item;
        });

        return res.status(200).json({
            success: true,
            module,
            lessons: navigationLessons
        });
    } catch (error) {
        console.error("Load module lessons error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load module lessons."
        });
    }
});




// POST /api/paths/enroll
// Create an enrollment after the user clicks Enroll Now.
router.post("/enroll", async (req, res) => {
    try {
        const { user, message } = await getAuthenticatedUser(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message
            });
        }

        const pathId = getValidId(req.body.path_id);

        if (!pathId) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid learning path."
            });
        }

        const { data: path, error: pathError } = await supabase
            .from("learning_path")
            .select("path_id, path_name, status")
            .eq("path_id", pathId)
            .maybeSingle();

        if (pathError) {
            console.error("Verify path error:", pathError);

            return res.status(500).json({
                success: false,
                message: "Unable to verify the selected learning path."
            });
        }

        if (!path) {
            return res.status(404).json({
                success: false,
                message: "Learning path not found."
            });
        }

        if (String(path.status).toLowerCase() !== "available") {
            return res.status(400).json({
                success: false,
                message: "This learning path is not available yet."
            });
        }

        // Return the existing active enrollment instead of creating another.
        const existingEnrollment = await getActiveEnrollment(
            user.id,
            pathId
        );

        if (existingEnrollment) {
            return res.status(200).json({
                success: true,
                alreadyEnrolled: true,
                message: "You are already enrolled in this learning path.",
                enrollment: existingEnrollment
            });
        }

        const { data: enrollment, error: enrollmentError } = await supabase
            .from("enrollment")
            .insert({
                user_id: user.id,
                path_id: pathId,
                status: "active",
                path_xp: 0,
                current_level: 1
            })
            .select(`
                enrollment_id,
                user_id,
                path_id,
                enrolled_at,
                status,
                path_xp,
                current_level
            `)
            .single();

        if (enrollmentError) {
            console.error("Save enrollment error:", enrollmentError);

            if (enrollmentError.code === "23505") {
                return res.status(409).json({
                    success: false,
                    message: "An enrollment record already exists. Please refresh the page."
                });
            }

            return res.status(500).json({
                success: false,
                message: "Unable to save your enrollment. Please try again."
            });
        }

        return res.status(201).json({
            success: true,
            alreadyEnrolled: false,
            message: "Enrollment saved successfully.",
            enrollment
        });
    } catch (error) {
        console.error("Save enrollment API error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while saving your enrollment."
        });
    }
});

// GET /api/paths/lessons/:lessonId
// Return lesson content only to authenticated, actively enrolled users.
router.get("/lessons/:lessonId", async (req, res) => {
    try {
        const lessonId = getValidId(req.params.lessonId);

        if (!lessonId) {
            return res.status(400).json({
                success: false,
                message: "A valid lesson ID is required."
            });
        }

        const { user, message } = await getAuthenticatedUser(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message
            });
        }

        const { data: lesson, error: lessonError } = await supabase
            .from("lesson")
            .select(`
                lesson_id,
                module_id,
                lesson_number,
                title,
                slug,
                summary,
                difficulty,
                estimated_minutes,
                status
            `)
            .eq("lesson_id", lessonId)
            .maybeSingle();

        if (lessonError) {
            console.error("Lesson lookup error:", lessonError);

            return res.status(500).json({
                success: false,
                message: "Unable to load the lesson."
            });
        }

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: "Lesson not found."
            });
        }

        if (String(lesson.status).toLowerCase() !== "published") {
            return res.status(404).json({
                success: false,
                message: "This lesson is not available yet."
            });
        }

        // Find which learning path contains this lesson.
        const { data: module, error: moduleError } = await supabase
            .from("module")
            .select("module_id, path_id")
            .eq("module_id", lesson.module_id)
            .maybeSingle();

        if (moduleError) {
            console.error("Lesson module lookup error:", moduleError);

            return res.status(500).json({
                success: false,
                message: "Unable to verify the lesson's learning path."
            });
        }

        if (!module) {
            return res.status(404).json({
                success: false,
                message: "The learning path for this lesson was not found."
            });
        }

        // Ensure the user is enrolled in the path containing this lesson.
        const enrollment = await getActiveEnrollment(
            user.id,
            module.path_id
        );

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "Enroll in this learning path before accessing the lesson."
            });
        }

        const { data: sections, error: sectionsError } = await supabase
            .from("lesson_section")
            .select(`
                section_id,
                lesson_id,
                display_order,
                section_type,
                section_title,
                section_content,
                quiz_id
            `)
            .eq("lesson_id", lessonId)
            .order("display_order", { ascending: true });

        if (sectionsError) {
            console.error("Lesson sections lookup error:", sectionsError);

            return res.status(500).json({
                success: false,
                message: "Unable to load the lesson content."
            });
        }

        return res.status(200).json({
            success: true,
            lesson,
            sections: sections || []
        });
    } catch (error) {
        console.error("Load lesson error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while loading the lesson."
        });
    }
});



/*
 * GET /api/paths/lessons/:lessonId/progress
 * Retrieve the logged-in learner's saved lesson progress.
 */
router.get("/lessons/:lessonId/progress", async (req, res) => {
    try {
        const lessonId = getValidId(req.params.lessonId);

        if (!lessonId) {
            return res.status(400).json({
                success: false,
                message: "A valid lesson ID is required."
            });
        }

        const { user, message } = await getAuthenticatedUser(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message
            });
        }

        const { data: lesson, error: lessonError } = await supabase
            .from("lesson")
            .select("lesson_id, module_id, status")
            .eq("lesson_id", lessonId)
            .maybeSingle();

        if (lessonError) throw lessonError;

        if (!lesson || String(lesson.status).toLowerCase() !== "published") {
            return res.status(404).json({
                success: false,
                message: "Published lesson not found."
            });
        }

        const { data: module, error: moduleError } = await supabase
            .from("module")
            .select("module_id, path_id")
            .eq("module_id", lesson.module_id)
            .maybeSingle();

        if (moduleError) throw moduleError;

        if (!module) {
            return res.status(404).json({
                success: false,
                message: "The lesson's learning path was not found."
            });
        }

        const enrollment = await getActiveEnrollment(
            user.id,
            module.path_id
        );

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "Enroll in this learning path first."
            });
        }

        const { data: progress, error: progressError } = await supabase
            .from("lesson_progress")
            .select(`
                progress_id,
                user_id,
                lesson_id,
                status,
                started_at,
                completed_at,
                updated_at
            `)
            .eq("user_id", user.id)
            .eq("lesson_id", lessonId)
            .maybeSingle();

        if (progressError) throw progressError;

        return res.status(200).json({
            success: true,
            progress: progress || {
                lesson_id: lessonId,
                status: "not_started",
                started_at: null,
                completed_at: null
            }
        });
    } catch (error) {
        console.error("Get lesson progress error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve lesson progress."
        });
    }
});


/*
 * POST /api/paths/lessons/:lessonId/progress
 * Save lesson progress and award 10 XP for a completed lesson.
 */
router.post("/lessons/:lessonId/progress", async (req, res) => {
    try {
        const lessonId = getValidId(req.params.lessonId);

        if (!lessonId) {
            return res.status(400).json({
                success: false,
                message: "A valid lesson ID is required."
            });
        }

        const requestedStatus = String(req.body.status || "")
            .trim()
            .toLowerCase();

        if (!["in_progress", "completed"].includes(requestedStatus)) {
            return res.status(400).json({
                success: false,
                message: "Status must be in_progress or completed."
            });
        }

        // Verify the existing login session.
        const { user, message } = await getAuthenticatedUser(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message
            });
        }

        // Find the lesson.
        const { data: lesson, error: lessonError } = await supabase
            .from("lesson")
            .select("lesson_id, module_id, status")
            .eq("lesson_id", lessonId)
            .maybeSingle();

        if (lessonError) throw lessonError;

        if (!lesson || String(lesson.status).toLowerCase() !== "published") {
            return res.status(404).json({
                success: false,
                message: "Published lesson not found."
            });
        }

        // Find the learning path containing the lesson.
        const { data: module, error: moduleError } = await supabase
            .from("module")
            .select("module_id, path_id")
            .eq("module_id", lesson.module_id)
            .maybeSingle();

        if (moduleError) throw moduleError;

        if (!module) {
            return res.status(404).json({
                success: false,
                message: "The lesson's learning path was not found."
            });
        }

        // Only actively enrolled learners can save progress or earn XP.
        const enrollment = await getActiveEnrollment(
            user.id,
            module.path_id
        );

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "Enroll in this learning path first."
            });
        }

        // Check the learner's existing progress.
        const { data: existing, error: existingError } = await supabase
            .from("lesson_progress")
            .select("progress_id, status, started_at, completed_at")
            .eq("user_id", user.id)
            .eq("lesson_id", lessonId)
            .maybeSingle();

        if (existingError) throw existingError;

        // A completed lesson cannot be changed back to in progress.
        const finalStatus =
            existing?.status === "completed"
                ? "completed"
                : requestedStatus;

        /*
         * Before marking a lesson completed, check every quiz linked
         * to one of its lesson sections.
         */
        if (finalStatus === "completed") {
            const { data: sections, error: sectionsError } = await supabase
                .from("lesson_section")
                .select("quiz_id")
                .eq("lesson_id", lessonId);

            if (sectionsError) throw sectionsError;

            const quizIds = [
                ...new Set(
                    (sections || [])
                        .map(section => section.quiz_id)
                        .filter(id => id !== null && id !== undefined)
                        .map(Number)
                )
            ];

            if (quizIds.length > 0) {
                const { data: passedAttempts, error: attemptsError } =
                    await supabase
                        .from("quiz_attempt")
                        .select("quiz_id")
                        .eq("user_id", user.id)
                        .in("quiz_id", quizIds)
                        .eq("passed", true);

                if (attemptsError) throw attemptsError;

                const passedQuizIds = new Set(
                    (passedAttempts || []).map(attempt =>
                        Number(attempt.quiz_id)
                    )
                );

                const incompleteQuizIds = quizIds.filter(
                    quizId => !passedQuizIds.has(quizId)
                );

                if (incompleteQuizIds.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Complete and pass all quizzes linked to this lesson before marking it as completed.",
                        incompleteQuizIds
                    });
                }
            }
        }

        const now = new Date().toISOString();

        const progressRecord = {
            user_id: user.id,
            lesson_id: lessonId,
            status: finalStatus,
            started_at: existing?.started_at || now,
            completed_at:
                finalStatus === "completed"
                    ? existing?.completed_at || now
                    : null,
            updated_at: now
        };

        // Save progress first. The reward can be retried safely if needed.
        const { data: progress, error: saveError } = await supabase
            .from("lesson_progress")
            .upsert(progressRecord, {
                onConflict: "user_id,lesson_id"
            })
            .select(`
                progress_id,
                user_id,
                lesson_id,
                status,
                started_at,
                completed_at,
                updated_at
            `)
            .single();

        if (saveError) throw saveError;

        let xpAwarded = 0;
        let overallXp = null;
        let pathXp = null;

        if (finalStatus === "completed") {
            /*
             * The reward key is unique per user and lesson.
             * Repeated requests cannot award the same lesson XP twice.
             */
            const { data: xpResult, error: xpError } = await supabase.rpc(
                "award_xp",
                {
                    p_user_id: user.id,
                    p_amount: 10,
                    p_reward_key: `lesson:${lessonId}`,
                    p_reason: `Completed lesson ${lessonId}`,
                    p_lesson_id: lessonId,
                    p_quiz_attempt_id: null,
                    p_question_attempt_id: null,
                    p_path_id: module.path_id
                }
            );

            if (xpError) {
                console.error("Award lesson XP error:", xpError);

                // Progress is saved; the reward can be retried safely.
                return res.status(500).json({
                    success: false,
                    message:
                        "Your lesson progress was saved, but the XP reward could not be processed. Please try again.",
                    progress
                });
            }

            const reward = Array.isArray(xpResult)
                ? xpResult[0]
                : xpResult;

            
            if (reward) {
                xpAwarded = reward.awarded ? Number(reward.amount) : 0;
                overallXp = reward.overall_xp ?? null;
                pathXp = reward.path_xp ?? null;
            }

            // Process the learner's daily activity, streaks, badges and rewards.
            const { data: completionResult, error: completionError } =
                await supabase.rpc("process_lesson_completion", {
                    p_user_id: user.id,
                    p_lesson_id: lessonId
                });

            if (completionError) {
                console.error(
                    "Process lesson completion error:",
                    completionError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Your lesson and XP were saved, but your streak and achievements could not be updated. Please try again.",
                    progress
                });
            }

            // Refresh XP totals because a streak reward may have added bonus XP.
            if (completionResult) {
                overallXp = completionResult.overall_xp ?? overallXp;
                pathXp = completionResult.path_xp ?? pathXp;
            }

        }

        return res.status(200).json({
            success: true,
            message: finalStatus === "completed"
                ? xpAwarded > 0
                    ? `Lesson completed! You earned ${xpAwarded} XP.`
                    : "Lesson completed. The XP for this lesson has already been awarded."
                : "Lesson progress saved.",
            progress,
            xp: {
                awarded: xpAwarded,
                overallXp,
                pathXp
            }
        });
    } catch (error) {
        console.error("Save lesson progress error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to save lesson progress."
        });
    }
});


/*
 * GET /api/paths/:pathId/navigation
 * Return all modules, lessons, and progress in one request.
 */
router.get("/:pathId/navigation", async (req, res) => {
    try {
        const pathId = getValidId(req.params.pathId);

        if (!pathId) {
            return res.status(400).json({
                success: false,
                message: "Invalid learning path ID."
            });
        }

        const { user, message } = await getAuthenticatedUser(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message
            });
        }

        const enrollment = await getActiveEnrollment(user.id, pathId);

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "Enroll in this learning path first."
            });
        }

        const { data: modules, error: moduleError } = await supabase
            .from("module")
            .select("module_id, path_id, module_number, module_name, description")
            .eq("path_id", pathId)
            .order("module_number", { ascending: true });

        if (moduleError) throw moduleError;

        const moduleIds = (modules || []).map(module => module.module_id);

        if (moduleIds.length === 0) {
            return res.json({
                success: true,
                modules: []
            });
        }

        const { data: lessons, error: lessonError } = await supabase
            .from("lesson")
            .select(`
                lesson_id,
                module_id,
                lesson_number,
                title,
                estimated_minutes,
                status
            `)
            .in("module_id", moduleIds)
            .order("lesson_number", { ascending: true });

        if (lessonError) throw lessonError;

        const lessonIds = (lessons || []).map(lesson => lesson.lesson_id);

        let progressRecords = [];

        if (lessonIds.length > 0) {
            const { data, error } = await supabase
                .from("lesson_progress")
                .select("lesson_id, status, completed_at")
                .eq("user_id", user.id)
                .in("lesson_id", lessonIds);

            if (error) throw error;

            progressRecords = data || [];
        }

        const progressByLesson = new Map(
            progressRecords.map(progress => [
                Number(progress.lesson_id),
                progress
            ])
        );

        const lessonsByModule = new Map();

        for (const lesson of lessons || []) {
            const progress = progressByLesson.get(
                Number(lesson.lesson_id)
            );

            const item = {
                ...lesson,
                progress_status: progress?.status || "not_started",
                completed: progress?.status === "completed",
                published:
                    String(lesson.status || "").toLowerCase() === "published",
                can_access: false
            };

            if (!lessonsByModule.has(Number(lesson.module_id))) {
                lessonsByModule.set(Number(lesson.module_id), []);
            }

            lessonsByModule.get(Number(lesson.module_id)).push(item);
        }

        let previousModuleCompleted = true;

        const navigationModules = (modules || []).map(module => {
            const moduleLessons =
                lessonsByModule.get(Number(module.module_id)) || [];

            let previousLessonCompleted = true;

            for (const lesson of moduleLessons) {
                lesson.can_access =
                    lesson.published &&
                    (
                        previousLessonCompleted ||
                        lesson.completed
                    );

                if (lesson.published) {
                    previousLessonCompleted = lesson.completed;
                }
            }

            const publishedLessons = moduleLessons.filter(
                lesson => lesson.published
            );

            const moduleUnlocked = previousModuleCompleted;

            for (const lesson of moduleLessons) {
                lesson.module_unlocked = moduleUnlocked;
                lesson.can_access =
                    moduleUnlocked && lesson.can_access;
            }

            const allCompleted =
                publishedLessons.length > 0 &&
                publishedLessons.every(lesson => lesson.completed);

            previousModuleCompleted =
                moduleUnlocked && allCompleted;

            return {
                ...module,
                module_unlocked: moduleUnlocked,
                lessons: moduleLessons
            };
        });

        return res.json({
            success: true,
            modules: navigationModules
        });
    } catch (error) {
        console.error("Load combined navigation error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load lesson navigation."
        });
    }
});



// GET /api/paths/dashboard/stats
// Load the learner's XP, streak, badges, rewards and weekly activity.
router.get("/dashboard/stats", async (req, res) => {
    try {
        const { user, message } = await getAuthenticatedUser(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: message || "Please log in to continue."
            });
        }

        const userId = user.id;

        // Get the learner's profile and timezone.
        const { data: profile, error: profileError } = await supabase
            .from("user_profile")
           .select("overall_xp, timezone, username, profile_picture_url")
            .eq("user_id", userId)
            .maybeSingle();

        if (profileError) throw profileError;

        const timezone = profile?.timezone || "Africa/Johannesburg";

        // Get today's date using the learner's timezone.
        const dateParts = new Intl.DateTimeFormat("en-CA", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).formatToParts(new Date());

        const dateValues = {};

        dateParts.forEach(part => {
            dateValues[part.type] = part.value;
        });

        const today = `${dateValues.year}-${dateValues.month}-${dateValues.day}`;

       // Calculate the Monday of the current week.
const todayDate = new Date();
const weekStartDate = new Date(todayDate);

const dayOfWeek = weekStartDate.getUTCDay();
        const daysSinceMonday = (dayOfWeek + 6) % 7;

        weekStartDate.setUTCDate(weekStartDate.getUTCDate() - daysSinceMonday);

        const weekStart = weekStartDate.toISOString().slice(0, 10);

        // Load dashboard information in parallel.
        const [
            streakResult,
            activityResult,
            badgeResult,
            rewardResult,
            lessonsResult
        ] = await Promise.all([
            // Current and longest streak.
            supabase
                .from("streak")
                .select("current_streak, longest_streak, last_activity_date")
                .eq("user_id", userId)
                .maybeSingle(),

            // Activity for the last seven days.
            supabase
                .from("daily_activity")
                .select("activity_date, lessons_completed")
                .eq("user_id", userId)
                .gte("activity_date", weekStart)
                .lte("activity_date", today)
                .order("activity_date", { ascending: true }),

            // Badges earned by the learner.
            supabase
                .from("user_badge")
                .select(`
                    user_badge_id,
                    earned_at,
                    badge:badge_id (
                        badge_id,
                        badge_name,
                        description,
                        badge_category,
                        requirement_value,
                        image_url
                    )
                `)
                .eq("user_id", userId)
                .order("earned_at", { ascending: false }),

            // Rewards earned by the learner.
            supabase
                .from("user_reward")
                .select(`
                    user_reward_id,
                    earned_at,
                    claimed_at,
                    reward_status,
                    reward:reward_id (
                        reward_id,
                        reward_code,
                        reward_name,
                        description,
                        reward_type,
                        requirement_category,
                        requirement_value,
                        reward_value,
                        image_url
                    )
                `)
                .eq("user_id", userId)
                .order("earned_at", { ascending: false }),

            // Total completed lessons.
            supabase
                .from("lesson_progress")
                .select("progress_id", {
                    count: "exact",
                    head: true
                })
                .eq("user_id", userId)
                .eq("status", "completed")
        ]);

        // Check for database errors.
        if (streakResult.error) throw streakResult.error;
        if (activityResult.error) throw activityResult.error;
        if (badgeResult.error) throw badgeResult.error;
        if (rewardResult.error) throw rewardResult.error;
        if (lessonsResult.error) throw lessonsResult.error;

        // Create all seven days, including days with no activity.
        const activityByDate = new Map(
            (activityResult.data || []).map(activity => [
                activity.activity_date,
                Number(activity.lessons_completed || 0)
            ])
        );

        // const weeklyActivity = [];

        // for (let i = 0; i < 7; i++) {
        //     const activityDate = new Date(weekStartDate);

        //     activityDate.setUTCDate(activityDate.getUTCDate() + i);

        //     const date = activityDate.toISOString().slice(0, 10);

        //     weeklyActivity.push({
        //         date,
        //         day: new Intl.DateTimeFormat("en", {
        //             weekday: "short",
        //             timeZone: "UTC"
        //         }).format(activityDate),
        //         lessonsCompleted: activityByDate.get(date) || 0
        //     });
        // }

        
const weeklyActivity = [];

for (let i = 0; i < 7; i++) {
    const activityDate = new Date(weekStartDate);
    activityDate.setUTCDate(activityDate.getUTCDate() + i);

    const date = activityDate.toISOString().slice(0, 10);

    weeklyActivity.push({
        activity_date: date,
        lessons_completed: activityByDate.get(date) || 0
    });
}


        const streak = streakResult.data || {
            current_streak: 0,
            longest_streak: 0,
            last_activity_date: null
        };

               
return res.status(200).json({
    success: true,
    
profile: {
    username: profile?.username || null,
    profilePicture: profile?.profile_picture_url || null
},

    today,
    weekStart,
    xp: {
        overallXp: Number(profile?.overall_xp || 0)
    },
    streak: {
        currentStreak: Number(streak.current_streak || 0),
        longestStreak: Number(streak.longest_streak || 0),
        lastActivityDate: streak.last_activity_date
    },
    lessonsCompleted: lessonsResult.count || 0,
    weeklyActivity,
    badges: (badgeResult.data || []).map(item => ({
        userBadgeId: item.user_badge_id,
        earnedAt: item.earned_at,
        badge: item.badge
    })),
    rewards: (rewardResult.data || []).map(item => ({
        userRewardId: item.user_reward_id,
        earnedAt: item.earned_at,
        claimedAt: item.claimed_at,
        status: item.reward_status,
        reward: item.reward
    }))
});

    } catch (error) {
        console.error("Dashboard statistics error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load your dashboard statistics."
        });
    }
});


// GET /api/paths/dashboard/lessons-completed
// Count all lessons completed by the logged-in user.
router.get("/dashboard/lessons-completed", async (req, res) => {
    try {
        const authResult = await getAuthenticatedUser(req);

        if (!authResult.user) {
            return res.status(401).json({
                success: false,
                message: authResult.message || "Please log in to continue."
            });
        }

        const userId = authResult.user.id;

        const { count, error } = await supabase
            .from("lesson_progress")
            .select("progress_id", {
                count: "exact",
                head: true
            })
            .eq("user_id", userId)
            .eq("status", "completed");

        if (error) {
            throw error;
        }

        return res.json({
            success: true,
            lessonsCompleted: count || 0
        });

    } catch (error) {
        console.error("Completed lessons count error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load completed lessons."
        });
    }
});


/*
 * GET /api/paths/dashboard/leaderboard
 * Rank all registered users by their overall XP.
 * Return the top 10 and the logged-in user's actual position.
 */
router.get("/dashboard/leaderboard", async (req, res) => {
    try {
        const { user, message } = await getAuthenticatedUser(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: message || "Please log in to continue."
            });
        }

        const pageSize = 1000;
        let allUsers = [];
        let start = 0;

        // Retrieve every profile in batches so the ranking is not
        // restricted to the first page of database results.
        while (true) {
            const { data, error } = await supabase
                .from("user_profile")
                .select("user_id, username, overall_xp, profile_picture_url")
                .order("overall_xp", {
                    ascending: false,
                    nullsFirst: false
                })
                .order("user_id", {
                    ascending: true
                })
                .range(start, start + pageSize - 1);

            if (error) {
                throw error;
            }

            const batch = data || [];
            allUsers = allUsers.concat(batch);

            if (batch.length < pageSize) {
                break;
            }

            start += pageSize;
        }

        const rankedUsers = allUsers.map((profile, index) => ({
    user_id: profile.user_id,
    username: profile.username || "Learner",
    rank: index + 1,
    overall_xp: Number(profile.overall_xp || 0),
    profile_picture_url: profile.profile_picture_url || null
}));

        const currentUser = rankedUsers.find(
            profile => profile.user_id === user.id
        );

        return res.status(200).json({
            success: true,
            topUsers: rankedUsers.slice(0, 10),
            currentUser: currentUser || null,
            totalUsers: rankedUsers.length
        });

    } catch (error) {
        console.error("Dashboard leaderboard error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load the leaderboard."
        });
    }
});


module.exports = router;