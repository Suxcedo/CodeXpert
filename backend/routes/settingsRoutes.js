
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const multer = require("multer");

const supabase = require("../config/supabase");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

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

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return callback(new Error(
                "Please upload a JPG, PNG, GIF or WebP image."
            ));
        }

        callback(null, true);
    }
});

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

async function authenticateUser(req, res, next) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Please log in to access your settings."
            });
        }

        const token = authorization.split(" ")[1];

        const { data, error } = await supabaseAuth.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                success: false,
                message: "Your session has expired. Please log in again."
            });
        }

        req.user = data.user;
        req.accessToken = token;

        next();
    } catch (error) {
        console.error("Settings authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "We could not verify your account. Please try again."
        });
    }
}

router.use(authenticateUser);

// ==========================================
// GET CURRENT USER SETTINGS
// ==========================================

router.get("/me", async (req, res) => {
    try {
        const { data: profile, error } = await supabase
            .from("user_profile")
            .select(`
                user_id,
                first_name,
                last_name,
                username,
                profile_picture_url,
                bio,
                overall_xp,
                date_joined,
                account_status
            `)
            .eq("user_id", req.user.id)
            .maybeSingle();

        if (error) {
            console.error("Settings profile fetch error:", error);

            return res.status(500).json({
                success: false,
                message: "We could not load your profile."
            });
        }

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Your account profile could not be found."
            });
        }

        return res.json({
            success: true,
            profile,
            email: req.user.email
        });
    } catch (error) {
        console.error("Get settings error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while loading your settings."
        });
    }
});

// ==========================================
// CHECK USERNAME AVAILABILITY
// ==========================================

router.get("/username-availability", async (req, res) => {
    try {
        const username = String(req.query.username || "").trim();

        if (!/^[a-zA-Z0-9_.]{3,50}$/.test(username)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid username."
            });
        }

        const { data: existingUser, error } = await supabase
            .from("user_profile")
            .select("user_id")
            .eq("username", username)
            .neq("user_id", req.user.id)
            .maybeSingle();

        if (error) {
            console.error("Username availability error:", error);

            return res.status(500).json({
                success: false,
                message: "We could not check that username right now."
            });
        }

        return res.json({
            success: true,
            available: !existingUser
        });
    } catch (error) {
        console.error("Username check error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while checking the username."
        });
    }
});

// ==========================================
// UPDATE PROFILE INFORMATION
// ==========================================

router.patch("/profile", async (req, res) => {
    try {
        const { firstName, lastName, username, bio } = req.body;

        if (
            typeof firstName !== "string" ||
            typeof lastName !== "string" ||
            typeof username !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Please complete your required profile information."
            });
        }

        const cleanFirstName = firstName.trim();
        const cleanLastName = lastName.trim();
        const cleanUsername = username.trim();
        const cleanBio = typeof bio === "string" ? bio.trim() : "";

        if (!cleanFirstName || cleanFirstName.length > 50) {
            return res.status(400).json({
                success: false,
                message: "First name is required and cannot exceed 50 characters."
            });
        }

        if (!cleanLastName || cleanLastName.length > 50) {
            return res.status(400).json({
                success: false,
                message: "Last name is required and cannot exceed 50 characters."
            });
        }

        if (!/^[a-zA-Z0-9_.]{3,50}$/.test(cleanUsername)) {
            return res.status(400).json({
                success: false,
                message: "Username must contain 3–50 letters, numbers, underscores or full stops."
            });
        }

        if (cleanBio.length > 300) {
            return res.status(400).json({
                success: false,
                message: "Your bio cannot exceed 300 characters."
            });
        }

        const { data: existingUser, error: usernameError } = await supabase
            .from("user_profile")
            .select("user_id")
            .eq("username", cleanUsername)
            .neq("user_id", req.user.id)
            .maybeSingle();

        if (usernameError) {
            console.error("Username validation error:", usernameError);

            return res.status(500).json({
                success: false,
                message: "We could not validate your username."
            });
        }

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "That username is already taken. Please choose another one."
            });
        }

        const { data: updatedProfile, error } = await supabase
            .from("user_profile")
            .update({
                first_name: cleanFirstName,
                last_name: cleanLastName,
                username: cleanUsername,
                bio: cleanBio || null
            })
            .eq("user_id", req.user.id)
            .select(`
                user_id,
                first_name,
                last_name,
                username,
                profile_picture_url,
                bio,
                overall_xp,
                date_joined,
                account_status
            `)
            .single();

        if (error) {
            if (error.code === "23505") {
                return res.status(409).json({
                    success: false,
                    message: "That username is already taken."
                });
            }

            console.error("Profile update error:", error);

            return res.status(500).json({
                success: false,
                message: "We could not save your profile changes."
            });
        }

        return res.json({
            success: true,
            message: "Your profile has been updated.",
            profile: updatedProfile
        });
    } catch (error) {
        console.error("Profile update error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating your profile."
        });
    }
});

// ==========================================
// UPLOAD PROFILE PICTURE
// ==========================================

router.post(
    "/profile-picture",
    upload.single("profilePicture"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Please select a profile picture to upload."
                });
            }

            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "codexperts/profile-pictures",
                        resource_type: "image",
                        transformation: [
                            {
                                width: 500,
                                height: 500,
                                crop: "fill",
                                gravity: "face"
                            }
                        ]
                    },
                    (error, result) => {
                        if (error) {
                            return reject(error);
                        }

                        resolve(result);
                    }
                );

                stream.end(req.file.buffer);
            });

            const { data: updatedProfile, error } = await supabase
                .from("user_profile")
                .update({
                    profile_picture_url: uploadResult.secure_url
                })
                .eq("user_id", req.user.id)
                .select("profile_picture_url")
                .single();

            if (error) {
                console.error("Profile picture database update error:", error);

                return res.status(500).json({
                    success: false,
                    message: "Your picture uploaded, but we could not update your profile."
                });
            }

            return res.json({
                success: true,
                message: "Your profile picture has been updated.",
                profilePictureUrl: updatedProfile.profile_picture_url
            });
        } catch (error) {
            console.error("Profile picture upload error:", error);

            return res.status(500).json({
                success: false,
                message: "We could not upload your profile picture. Please try again."
            });
        }
    }
);

// ==========================================
// REMOVE PROFILE PICTURE
// ==========================================

router.delete("/profile-picture", async (req, res) => {
    try {
        const { error } = await supabase
            .from("user_profile")
            .update({
                profile_picture_url: null
            })
            .eq("user_id", req.user.id);

        if (error) {
            console.error("Profile picture removal error:", error);

            return res.status(500).json({
                success: false,
                message: "We could not remove your profile picture."
            });
        }

        return res.json({
            success: true,
            message: "Your profile picture has been removed."
        });
    } catch (error) {
        console.error("Remove profile picture error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while removing your picture."
        });
    }
});

// ==========================================
// CHANGE PASSWORD
// ==========================================

router.post("/change-password", async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please complete all password fields."
            });
        }

        if (typeof newPassword !== "string" || newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Your new password must contain at least 8 characters."
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "Your new password must be different from your current password."
            });
        }

        if (!req.user.email) {
            return res.status(400).json({
                success: false,
                message: "We could not verify the email linked to your account."
            });
        }

        // Verify the current password before allowing the change.
        const passwordClient = createClient(
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

        const { data: signInData, error: signInError } =
            await passwordClient.auth.signInWithPassword({
                email: req.user.email,
                password: currentPassword
            });

        if (signInError || !signInData.user || signInData.user.id !== req.user.id) {
            return res.status(400).json({
                success: false,
                message: "Your current password is incorrect."
            });
        }

        const { error: updateError } =
            await supabase.auth.admin.updateUserById(req.user.id, {
                password: newPassword
            });

        if (updateError) {
            console.error("Password update error:", updateError);

            return res.status(400).json({
                success: false,
                message: "We could not update your password. Please try again."
            });
        }

        return res.json({
            success: true,
            message: "Your password has been changed successfully."
        });
    } catch (error) {
        console.error("Change password error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while changing your password."
        });
    }
});

// ==========================================
// MULTER ERROR HANDLING
// ==========================================

router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "Your profile picture must be 3 MB or smaller."
            });
        }

        return res.status(400).json({
            success: false,
            message: "We could not process that image. Please try another one."
        });
    }

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "We could not process your request."
        });
    }

    next();
});

module.exports = router;
