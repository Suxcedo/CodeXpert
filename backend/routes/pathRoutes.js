
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const supabase = require("../config/supabase");

const router = express.Router();
router.get("/test-route", (req, res) => {
    res.json({ message: "The PATH routes file is loaded!" });
});
// Used to validate a user's Supabase access token.
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

// Verify the logged-in user using their Supabase access token.
async function getAuthenticatedUser(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { user: null, message: "Please log in to continue." };
    }

    const accessToken = authHeader.slice(7).trim();

    if (!accessToken) {
        return { user: null, message: "Your login session is missing." };
    }

    const { data, error } = await supabaseAuth.auth.getUser(accessToken);

    if (error || !data.user) {
        return {
            user: null,
            message: "Your login session is invalid or expired. Please log in again."
        };
    }

    return { user: data.user, message: null };
}

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
// Fetch modules for the selected learning path.
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
            modules
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
// Check whether the logged-in user has enrolled in this path.
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

        const { data: enrollment, error } = await supabase
            .from("enrollment")
            .select("enrollment_id, user_id, path_id, enrolled_at, status, path_xp, current_level")
            .eq("user_id", user.id)
            .eq("path_id", pathId)
            .maybeSingle();

        if (error) {
            console.error("Check enrollment error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to check your enrollment."
            });
        }

        return res.status(200).json({
            success: true,
            enrolled: Boolean(enrollment),
            enrollment: enrollment || null
        });
    } catch (error) {
        console.error("Enrollment check error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while checking enrollment."
        });
    }
});

// POST /api/paths/enroll
// Create enrollment ONLY when the lesson page calls this endpoint
// after the user clicks Enroll Now.
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

        // Avoid creating a duplicate enrollment.
        const { data: existingEnrollment, error: lookupError } =
            await supabase
                .from("enrollment")
                .select("enrollment_id, user_id, path_id, enrolled_at, status, path_xp, current_level")
                .eq("user_id", user.id)
                .eq("path_id", pathId)
                .maybeSingle();

        if (lookupError) {
            console.error("Find enrollment error:", lookupError);

            return res.status(500).json({
                success: false,
                message: "Unable to check your existing enrollment."
            });
        }

        if (existingEnrollment) {
            return res.status(200).json({
                success: true,
                alreadyEnrolled: true,
                message: "You are already enrolled in this learning path.",
                enrollment: existingEnrollment
            });
        }

        const { data: enrollment, error: enrollmentError } =
            await supabase
                .from("enrollment")
                .insert({
                    user_id: user.id,
                    path_id: pathId,
                    status: "active",
                    path_xp: 0,
                    current_level: 1
                })
                .select("enrollment_id, user_id, path_id, enrolled_at, status, path_xp, current_level")
                .single();

        if (enrollmentError) {
            console.error("Save enrollment error:", enrollmentError);

            // Handle a duplicate insert if two requests arrive together.
            if (enrollmentError.code === "23505") {
                return res.status(409).json({
                    success: false,
                    message: "Your enrollment already exists. Please refresh the page."
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

module.exports = router;