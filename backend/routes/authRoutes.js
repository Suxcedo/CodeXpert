
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const supabase = require("../config/supabase");

const router = express.Router();
router.get("/test-route", (req, res) => {
    res.json({ message: "Updated pathRoutes.js is loaded!" });
});

// Separate client for authentication
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

// ==========================================
// SIGNUP ROUTE
// ==========================================

router.post("/signup", async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            username,
            email,
            password
        } = req.body;

        // Validate required fields
        if (
            !firstName?.trim() ||
            !lastName?.trim() ||
            !username?.trim() ||
            !email?.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        // Create the authentication account
        const { data: authData, error: authError } =
            await supabase.auth.admin.createUser({
                email: email.trim(),
                password: password,
                email_confirm: true
            });

        if (authError) {
            console.error("Signup authentication error:", authError);

            return res.status(400).json({
                success: false,
                message: authError.message
            });
        }

        if (!authData.user) {
            return res.status(500).json({
                success: false,
                message: "Unable to create your authentication account."
            });
        }

        // Create the user profile
        const { data: profileData, error: profileError } =
            await supabase
                .from("user_profile")
                .insert({
                    user_id: authData.user.id,
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    username: username.trim()
                })
                .select()
                .single();

        if (profileError) {
            console.error("Profile creation error:", profileError);

            // Remove Auth account if profile creation fails
            const { error: deleteError } =
                await supabase.auth.admin.deleteUser(authData.user.id);

            if (deleteError) {
                console.error("Auth account cleanup error:", deleteError);
            }

            if (profileError.code === "23505") {
                return res.status(409).json({
                    success: false,
                    message: "That username is already taken."
                });
            }

            return res.status(400).json({
                success: false,
                message: "Unable to create your profile."
            });
        }

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user: profileData
        });

    } catch (error) {
        console.error("Signup error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating the account."
        });
    }
});

// ==========================================
// LOGIN ROUTE
// ==========================================

router.post("/login", async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: "Username/email and password are required."
            });
        }

        const loginValue = identifier.trim();
        let email = loginValue;

        // If the user entered a username, find their profile
        if (!loginValue.includes("@")) {
            const { data: profile, error: usernameError } =
                await supabase
                    .from("user_profile")
                    .select("user_id")
                    .ilike("username", loginValue)
                    .maybeSingle();

            if (usernameError) {
                console.error("Username lookup error:", usernameError);

                return res.status(500).json({
                    success: false,
                    message: "Unable to look up your username."
                });
            }

            if (!profile) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid username/email or password."
                });
            }

            // Find the Auth account linked to the profile
            const { data: userData, error: userError } =
                await supabase.auth.admin.getUserById(profile.user_id);

            if (userError || !userData?.user?.email) {
                console.error("Auth user lookup error:", userError);

                return res.status(401).json({
                    success: false,
                    message: "Unable to find the account for that username."
                });
            }

            email = userData.user.email;
        }

        // Authenticate using the separate Auth client
        const { data: authData, error: authError } =
            await supabaseAuth.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (authError) {
            console.error("Authentication error:", authError.message);

            return res.status(401).json({
                success: false,
                message: "Invalid username/email or password."
            });
        }

        if (!authData.user) {
            return res.status(401).json({
                success: false,
                message: "Unable to authenticate this account."
            });
        }

        // Retrieve the user's profile
        const { data: userProfile, error: profileError } =
            await supabase
                .from("user_profile")
                .select("*")
                .eq("user_id", authData.user.id)
                .maybeSingle();

        if (profileError) {
            console.error("Profile lookup error:", profileError);

            return res.status(500).json({
                success: false,
                message: "A database error occurred while loading your profile."
            });
        }

        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: "Login succeeded, but no matching user profile was found."
            });
        }

        // Check whether the user has enrolled in a programming path
        const { data: enrollments, error: enrollmentError } =
            await supabase
                .from("enrollment")
                .select("enrollment_id")
                .eq("user_id", authData.user.id)
                .limit(1);

        if (enrollmentError) {
            console.error("Enrollment lookup error:", enrollmentError);

            return res.status(500).json({
                success: false,
                message: "Unable to check your learning path."
            });
        }

        const hasEnrollment =
            Array.isArray(enrollments) && enrollments.length > 0;

        // Return login result and enrollment status
        return res.status(200).json({
            success: true,
            message: "Login successful.",
            user: userProfile,
            hasEnrollment: hasEnrollment,
            session: authData.session
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while logging in."
        });
    }
});

module.exports = router;