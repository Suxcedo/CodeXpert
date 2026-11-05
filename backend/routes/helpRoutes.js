
const express = require("express");
const router = express.Router();

const multer = require("multer");
const supabase = require("../config/supabase");
const cloudinary = require("../config/cloudinary");

// ==========================================
// IMAGE UPLOAD CONFIGURATION
// ==========================================

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 3;

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_IMAGE_SIZE,
        files: MAX_IMAGES
    },
    fileFilter: (req, file, callback) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(
                new Error("Only JPG, PNG and WebP images are allowed.")
            );
        }

        callback(null, true);
    }
});

// ==========================================
// MULTER ERROR HANDLING
// ==========================================

function handleImageUpload(req, res, next) {
    upload.array("images", MAX_IMAGES)(req, res, error => {
        if (!error) {
            return next();
        }

        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    success: false,
                    message: "Each image must be smaller than 5 MB."
                });
            }

            if (error.code === "LIMIT_FILE_COUNT") {
                return res.status(400).json({
                    success: false,
                    message: "You can upload a maximum of 3 images."
                });
            }

            return res.status(400).json({
                success: false,
                message: "There was a problem with your image upload."
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message || "Invalid image file."
        });
    });
}

// ==========================================
// CLOUDINARY CONFIGURATION CHECK
// ==========================================

function checkCloudinaryConfiguration() {
    const config = cloudinary.config();

    const missingSettings = [];

    if (!config.cloud_name) {
        missingSettings.push("CLOUDINARY_CLOUD_NAME");
    }

    if (!config.api_key) {
        missingSettings.push("CLOUDINARY_API_KEY");
    }

    if (!config.api_secret) {
        missingSettings.push("CLOUDINARY_API_SECRET");
    }

    if (missingSettings.length > 0) {
        throw new Error(
            `Missing Cloudinary configuration: ${missingSettings.join(", ")}. ` +
            "Check your backend .env file and make sure environment variables " +
            "are loaded before importing the Cloudinary configuration."
        );
    }
}

// ==========================================
// CLOUDINARY ERROR DETAILS
// ==========================================

function getCloudinaryErrorDetails(error) {
    if (!error) {
        return "Unknown Cloudinary error.";
    }

    return {
        message: error.message || "No error message provided.",
        http_code: error.http_code || error.statusCode || null,
        name: error.name || null
    };
}

// ==========================================
// UPLOAD ONE IMAGE TO CLOUDINARY
// ==========================================

function uploadToCloudinary(file, folder) {
    return new Promise((resolve, reject) => {
        try {
            checkCloudinaryConfiguration();

            const stream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: "image"
                },
                (error, result) => {
                    if (error) {
                        console.error(
                            "Cloudinary rejected an image:",
                            getCloudinaryErrorDetails(error)
                        );

                        return reject(error);
                    }

                    if (!result || !result.secure_url || !result.public_id) {
                        const uploadError = new Error(
                            "Cloudinary returned an incomplete upload result."
                        );

                        console.error(uploadError.message);

                        return reject(uploadError);
                    }

                    resolve({
                        image_url: result.secure_url,
                        cloudinary_public_id: result.public_id
                    });
                }
            );

            stream.on("error", error => {
                console.error(
                    "Cloudinary upload stream error:",
                    getCloudinaryErrorDetails(error)
                );

                reject(error);
            });

            stream.end(file.buffer);

        } catch (error) {
            console.error(
                "Cloudinary configuration or upload error:",
                error.message
            );

            reject(error);
        }
    });
}

// ==========================================
// UPLOAD MULTIPLE IMAGES TO CLOUDINARY
// ==========================================

async function uploadImagesToCloudinary(files, folder) {
    if (!files || files.length === 0) {
        return [];
    }

    checkCloudinaryConfiguration();

    const results = await Promise.allSettled(
        files.map(file => uploadToCloudinary(file, folder))
    );

    const successfulUploads = results
        .filter(result => result.status === "fulfilled")
        .map(result => result.value);

    const failedUploads = results
        .filter(result => result.status === "rejected");

    if (failedUploads.length > 0) {
        console.error("==========================================");
        console.error("CLOUDINARY IMAGE UPLOAD FAILURE");
        console.error("==========================================");

        failedUploads.forEach((result, index) => {
            console.error(`Failed upload ${index + 1}:`);

            console.error(
                getCloudinaryErrorDetails(result.reason)
            );
        });

        console.error("==========================================");

        await deleteCloudinaryImages(successfulUploads);

        throw new Error(
            "One or more images could not be uploaded to Cloudinary. " +
            "Check the backend terminal for the detailed error."
        );
    }

    return successfulUploads;
}

// ==========================================
// DELETE CLOUDINARY IMAGES
// ==========================================

async function deleteCloudinaryImages(images) {
    if (!images || images.length === 0) {
        return;
    }

    const results = await Promise.allSettled(
        images.map(image =>
            cloudinary.uploader.destroy(
                image.cloudinary_public_id,
                {
                    resource_type: "image"
                }
            )
        )
    );

    results.forEach((result, index) => {
        if (result.status === "rejected") {
            console.error(
                "Could not delete Cloudinary image:",
                images[index].cloudinary_public_id,
                result.reason?.message || result.reason
            );
        }
    });
}

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

async function authenticateUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Please log in to access the Help Board."
            });
        }

        const token = authHeader.split(" ")[1];

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                success: false,
                message: "Your session has expired. Please log in again."
            });
        }

        req.user = data.user;

        next();

    } catch (error) {
        console.error("Help Board authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify your session."
        });
    }
}

// All Help Board endpoints require authentication.
router.use(authenticateUser);

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function isValidId(id) {
    return /^\d+$/.test(String(id)) && Number(id) > 0;
}

function getErrorMessage(error) {
    console.error("Help Board database error:", error);

    return "Something went wrong while processing your request.";
}

// ==========================================
// GET ALL QUESTIONS
// GET /api/help/posts
// ==========================================

router.get("/posts", async (req, res) => {
    try {
        const {
            search,
            language,
            status,
            page = 1,
            limit = 10
        } = req.query;

        const currentPage = Math.max(parseInt(page, 10) || 1, 1);

        const pageLimit = Math.min(
            Math.max(parseInt(limit, 10) || 10, 1),
            50
        );

        const from = (currentPage - 1) * pageLimit;
        const to = from + pageLimit - 1;

        let query = supabase
            .from("help_post")
            .select(`
                *,
                user_profile (
                    username,
                    profile_picture_url
                ),
                help_reply!help_reply_post_id_fkey (
                    count
                )
            `, { count: "exact" });

        if (language) {
            query = query.eq("programming_language", language);
        }

        if (status) {
            const allowedStatuses = [
                "unanswered",
                "answered",
                "solved"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid question status."
                });
            }

            query = query.eq("status", status);
        }

        if (search && search.trim()) {
            const safeSearch = search
                .trim()
                .slice(0, 100)
                .replace(/[,%()\\]/g, " ");

            if (safeSearch.trim()) {
                query = query.or(
                    `title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`
                );
            }
        }

        const { data, error, count } = await query
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            return res.status(500).json({
                success: false,
                message: getErrorMessage(error)
            });
        }

        return res.status(200).json({
            success: true,
            posts: data,
            pagination: {
                currentPage,
                limit: pageLimit,
                totalPosts: count || 0,
                totalPages: Math.ceil((count || 0) / pageLimit)
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: getErrorMessage(error)
        });
    }
});

// ==========================================
// CREATE A QUESTION WITH IMAGES
// POST /api/help/posts
// ==========================================

router.post("/posts", handleImageUpload, async (req, res) => {
    let uploadedImages = [];

    try {
        const {
            title,
            description,
            programming_language,
            difficulty_level
        } = req.body;

        if (!title || !description || !programming_language) {
            return res.status(400).json({
                success: false,
                message: "Please provide a title, description and programming language."
            });
        }

        const cleanTitle = title.trim();
        const cleanDescription = description.trim();
        const cleanLanguage = programming_language.trim();

        if (!cleanTitle || !cleanDescription || !cleanLanguage) {
            return res.status(400).json({
                success: false,
                message: "Question details cannot be empty."
            });
        }

        if (cleanTitle.length > 200) {
            return res.status(400).json({
                success: false,
                message: "Your question title cannot exceed 200 characters."
            });
        }

        if (cleanLanguage.length > 50) {
            return res.status(400).json({
                success: false,
                message: "The programming language name is too long."
            });
        }

        const allowedDifficulty = [
            "beginner",
            "intermediate",
            "advanced"
        ];

        if (
            difficulty_level &&
            !allowedDifficulty.includes(difficulty_level)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid difficulty level."
            });
        }

        uploadedImages = await uploadImagesToCloudinary(
            req.files,
            "CodeXperts/HelpBoard/Questions"
        );

        const { data, error } = await supabase
            .from("help_post")
            .insert({
                user_id: req.user.id,
                title: cleanTitle,
                description: cleanDescription,
                programming_language: cleanLanguage,
                difficulty_level: difficulty_level || null
            })
            .select()
            .single();

        if (error) {
            await deleteCloudinaryImages(uploadedImages);

            return res.status(500).json({
                success: false,
                message: getErrorMessage(error)
            });
        }

        if (uploadedImages.length > 0) {
            const imageRecords = uploadedImages.map(image => ({
                post_id: data.post_id,
                image_url: image.image_url,
                cloudinary_public_id: image.cloudinary_public_id
            }));

            const { error: imageError } = await supabase
                .from("help_post_image")
                .insert(imageRecords);

            if (imageError) {
                console.error("Question image database error:", imageError);

                await deleteCloudinaryImages(uploadedImages);

                return res.status(201).json({
                    success: true,
                    message: "Your question was posted, but its images could not be saved.",
                    post: data,
                    warning: true
                });
            }
        }

        return res.status(201).json({
            success: true,
            message: "Your question has been posted successfully.",
            post: data
        });

    } catch (error) {
        await deleteCloudinaryImages(uploadedImages);

        console.error("Create question error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create your question. Please check the backend terminal for details."
        });
    }
});

// ==========================================
// GET A SINGLE QUESTION AND ITS REPLIES
// GET /api/help/posts/:id
// ==========================================

router.get("/posts/:id", async (req, res) => {
    try {
        const postId = req.params.id;

        if (!isValidId(postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid question ID."
            });
        }

        const { data: post, error: postError } = await supabase
            .from("help_post")
            .select(`
                *,
                user_profile (
                    username,
                    profile_picture_url
                ),
                help_post_image (*)
            `)
            .eq("post_id", postId)
            .maybeSingle();

        if (postError) {
            return res.status(500).json({
                success: false,
                message: getErrorMessage(postError)
            });
        }

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "This question could not be found."
            });
        }

        const { data: replies, error: replyError } = await supabase
            .from("help_reply")
            .select(`
                *,
                user_profile (
                    username,
                    profile_picture_url
                ),
                help_reply_image (*)
            `)
            .eq("post_id", postId)
            .order("created_at", { ascending: true });

        if (replyError) {
            return res.status(500).json({
                success: false,
                message: getErrorMessage(replyError)
            });
        }

        return res.status(200).json({
            success: true,
            post,
            replies: replies || [],
            currentUserId: req.user.id
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: getErrorMessage(error)
        });
    }
});

// ==========================================
// POST A REPLY WITH IMAGES
// POST /api/help/posts/:id/replies
// ==========================================

router.post(
    "/posts/:id/replies",
    handleImageUpload,
    async (req, res) => {
        let uploadedImages = [];

        try {
            const postId = req.params.id;
            const { reply_text } = req.body;

            if (!isValidId(postId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid question ID."
                });
            }

            if (
                !reply_text ||
                typeof reply_text !== "string" ||
                !reply_text.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter your reply before submitting."
                });
            }

            const { data: post, error: postError } = await supabase
                .from("help_post")
                .select("post_id, status, user_id")
                .eq("post_id", postId)
                .maybeSingle();

            if (postError) {
                return res.status(500).json({
                    success: false,
                    message: getErrorMessage(postError)
                });
            }

            if (!post) {
                return res.status(404).json({
                    success: false,
                    message: "This question could not be found."
                });
            }

            if (post.status === "solved") {
                return res.status(400).json({
                    success: false,
                    message: "This question has been marked as solved. The owner must reopen it before new replies can be submitted."
                });
            }

            // Upload reply images to Cloudinary.
            uploadedImages = await uploadImagesToCloudinary(
                req.files,
                "CodeXperts/HelpBoard/Replies"
            );

            const { data, error } = await supabase
                .from("help_reply")
                .insert({
                    post_id: Number(postId),
                    user_id: req.user.id,
                    reply_text: reply_text.trim()
                })
                .select()
                .single();

            if (error) {
                await deleteCloudinaryImages(uploadedImages);

                return res.status(500).json({
                    success: false,
                    message: getErrorMessage(error)
                });
            }

            // Save reply image records in Supabase.
            if (uploadedImages.length > 0) {
                const imageRecords = uploadedImages.map(image => ({
                    reply_id: data.reply_id,
                    image_url: image.image_url,
                    cloudinary_public_id: image.cloudinary_public_id
                }));

                const { error: imageError } = await supabase
                    .from("help_reply_image")
                    .insert(imageRecords);

                if (imageError) {
                    console.error("Reply image database error:", imageError);

                    await deleteCloudinaryImages(uploadedImages);

                    return res.status(201).json({
                        success: true,
                        message: "Your reply was posted, but its images could not be saved.",
                        reply: data,
                        warning: true
                    });
                }
            }

            return res.status(201).json({
                success: true,
                message: "Your reply has been posted successfully.",
                reply: data
            });

        } catch (error) {
            await deleteCloudinaryImages(uploadedImages);

            console.error("Create reply error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to post your reply. Please check the backend terminal for details."
            });
        }
    }
);

// ==========================================
// ACCEPT A REPLY AS THE SOLUTION
// POST /api/help/posts/:id/accept/:replyId
// ==========================================

router.post("/posts/:id/accept/:replyId", async (req, res) => {
    try {
        const postId = req.params.id;
        const replyId = req.params.replyId;

        if (!isValidId(postId) || !isValidId(replyId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid question or reply ID."
            });
        }

        const { error } = await supabase.rpc("help_accept_reply", {
            p_post_id: Number(postId),
            p_reply_id: Number(replyId),
            p_actor_user_id: req.user.id
        });

        if (error) {
            console.error("Accept solution error:", error);

            return res.status(400).json({
                success: false,
                message: "Unable to accept this reply. Make sure you own the question and that this reply belongs to it."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Reply accepted successfully. The author has been awarded 10 XP."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: getErrorMessage(error)
        });
    }
});

// ==========================================
// REOPEN A SOLVED QUESTION
// POST /api/help/posts/:id/reopen
// ==========================================

router.post("/posts/:id/reopen", async (req, res) => {
    try {
        const postId = req.params.id;

        if (!isValidId(postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid question ID."
            });
        }

        const { error } = await supabase.rpc("help_reopen_post", {
            p_post_id: Number(postId),
            p_actor_user_id: req.user.id
        });

        if (error) {
            console.error("Reopen question error:", error);

            return res.status(400).json({
                success: false,
                message: "Unable to reopen this question. Only the question owner can reopen it."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Your question has been reopened successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: getErrorMessage(error)
        });
    }
});

// ==========================================
// GET HELP BOARD TAGS
// GET /api/help/tags
// ==========================================

router.get("/tags", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("help_tag")
            .select("tag_id, tag_name")
            .order("tag_name", { ascending: true });

        if (error) {
            return res.status(500).json({
                success: false,
                message: getErrorMessage(error)
            });
        }

        return res.status(200).json({
            success: true,
            tags: data || []
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: getErrorMessage(error)
        });
    }
});

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
