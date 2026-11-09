
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const multer = require("multer");

const supabase = require("../config/supabase");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// ==========================================
// SUPABASE AUTHENTICATION CLIENT
// ==========================================

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
// VIDEO UPLOAD CONFIGURATION
// ==========================================

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            "video/mp4",
            "video/quicktime",
            "video/webm"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return callback(
                new Error("Please upload an MP4, MOV or WebM video.")
            );
        }

        callback(null, true);
    }
});


// ==========================================
// PROFILE PICTURE UPLOAD CONFIGURATION
// ==========================================

const profileImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return callback(
                new Error("Please upload a JPG, PNG or WebP image.")
            );
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
                message: "Please log in to access Reels."
            });
        }

        const accessToken = authorization.split(" ")[1];

        const { data, error } =
            await supabaseAuth.auth.getUser(accessToken);

        if (error || !data.user) {
            return res.status(401).json({
                success: false,
                message: "Your session has expired. Please log in again."
            });
        }

        req.user = data.user;

        next();

    } catch (error) {
        console.error("Reels authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to authenticate your account."
        });
    }
}

router.use(authenticateUser);

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getValidId(value) {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

function getPagination(req) {
    const limit = Math.min(
        Math.max(Number(req.query.limit) || 10, 1),
        20
    );

    const offset = Math.max(
        Number(req.query.offset) || 0,
        0
    );

    return {
        limit,
        offset
    };
}



router.get("/search", async (req, res) => {
    try {
        const query = String(req.query.q || "").trim();

        if (!query) {
            return res.status(200).json({
                success: true,
                videos: []
            });
        }

        if (query.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Search term is too long."
            });
        }

        const { limit, offset } = getPagination(req);

        // Split the search into individual words.
        const terms = query
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

        const videoMap = new Map();

        for (const term of terms) {
            const pattern = `%${term}%`;

            // Search captions using partial word matching.
            const { data: captionVideos, error: captionError } =
                await supabase
                    .from("video")
                    .select("*")
                    .eq("status", "published")
                    .ilike("caption", pattern)
                    .order("created_at", { ascending: false })
                    .limit(500);

            if (captionError) throw captionError;

            (captionVideos || []).forEach(video => {
                videoMap.set(video.video_id, video);
            });

            // Search usernames.
            const { data: usernameProfiles, error: usernameError } =
                await supabase
                    .from("user_profile")
                    .select("user_id")
                    .ilike("username", pattern)
                    .limit(500);

            if (usernameError) throw usernameError;

            // Search first names.
            const { data: firstNameProfiles, error: firstNameError } =
                await supabase
                    .from("user_profile")
                    .select("user_id")
                    .ilike("first_name", pattern)
                    .limit(500);

            if (firstNameError) throw firstNameError;

            // Search last names.
            const { data: lastNameProfiles, error: lastNameError } =
                await supabase
                    .from("user_profile")
                    .select("user_id")
                    .ilike("last_name", pattern)
                    .limit(500);

            if (lastNameError) throw lastNameError;

            const creatorIds = [
                ...(usernameProfiles || []),
                ...(firstNameProfiles || []),
                ...(lastNameProfiles || [])
            ]
                .map(profile => profile.user_id)
                .filter(Boolean);

            const uniqueCreatorIds = [...new Set(creatorIds)];

            if (uniqueCreatorIds.length > 0) {
                const { data: creatorVideos, error: creatorError } =
                    await supabase
                        .from("video")
                        .select("*")
                        .eq("status", "published")
                        .in("user_id", uniqueCreatorIds)
                        .order("created_at", { ascending: false })
                        .limit(500);

                if (creatorError) throw creatorError;

                (creatorVideos || []).forEach(video => {
                    videoMap.set(video.video_id, video);
                });
            }
        }

        const allVideos = Array.from(videoMap.values());

        allVideos.sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

        const paginatedVideos = allVideos.slice(
            offset,
            offset + limit
        );

        const enrichedVideos = await enrichVideos(
            paginatedVideos,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            videos: enrichedVideos,
            total: allVideos.length
        });

    } catch (error) {
        console.error("Search Reels error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to search Reels right now."
        });
    }
});

// ==========================================
// GET USER PROFILE INFORMATION
// ==========================================

async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from("user_profile")
        .select(
            "user_id, first_name, last_name, username, bio, profile_picture_url, overall_xp, date_joined"
        )
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

// ==========================================
// GET VIDEO
// ==========================================

async function getVideo(videoId) {
    const { data, error } = await supabase
        .from("video")
        .select("*")
        .eq("video_id", videoId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

// ==========================================
// GET USER'S EARNED BADGES
// ==========================================

async function getUserBadges(userId) {
    const { data: earnedBadges, error } = await supabase
        .from("user_badge")
        .select("user_badge_id, badge_id, earned_at")
        .eq("user_id", userId)
        .order("earned_at", {
            ascending: false
        });

    if (error) {
        throw error;
    }

    if (!earnedBadges || earnedBadges.length === 0) {
        return [];
    }

    const badgeIds = earnedBadges.map(item => item.badge_id);

    const { data: badges, error: badgeError } = await supabase
        .from("badge")
        .select(
            "badge_id, badge_name, description, badge_category, requirement_value, image_url"
        )
        .in("badge_id", badgeIds)
        .eq("is_active", true);

    if (badgeError) {
        throw badgeError;
    }

    const badgeMap = new Map(
        (badges || []).map(badge => [
            badge.badge_id,
            badge
        ])
    );

    return earnedBadges
        .map(item => ({
            ...badgeMap.get(item.badge_id),
            user_badge_id: item.user_badge_id,
            earned_at: item.earned_at
        }))
        .filter(item => item.badge_id);
}

// ==========================================
// GET USER'S ACTIVE LEARNING PATHS
// ==========================================

async function getUserLearningPaths(userId) {
    const { data: enrollments, error } = await supabase
        .from("enrollment")
        .select(
            "enrollment_id, path_id, path_xp, current_level, status"
        )
        .eq("user_id", userId)
        .eq("status", "active");

    if (error) {
        throw error;
    }

    if (!enrollments || enrollments.length === 0) {
        return [];
    }

    const pathIds = enrollments.map(item => item.path_id);

    const { data: paths, error: pathError } = await supabase
        .from("learning_path")
        .select("path_id, path_name")
        .in("path_id", pathIds);

    if (pathError) {
        throw pathError;
    }

    const pathMap = new Map(
        (paths || []).map(path => [
            path.path_id,
            path.path_name
        ])
    );

    return enrollments.map(item => ({
        ...item,
        path_name: pathMap.get(item.path_id) || "Learning Path"
    }));
}

// ==========================================
// CREATE NOTIFICATION
// ==========================================

async function createNotification({
    recipientId,
    actorId,
    type,
    title,
    message,
    referenceType,
    referenceId
}) {
    if (!recipientId || recipientId === actorId) {
        return;
    }

    try {
        const { error } = await supabase
            .from("notification")
            .insert({
                user_id: recipientId,
                actor_user_id: actorId,
                notification_type: type,
                title,
                message,
                reference_type: referenceType,
                reference_id: referenceId,
                is_read: false
            });

        if (error) {
            console.error("Reels notification error:", error);
        }

    } catch (error) {
        console.error("Create Reels notification error:", error);
    }
}

// ==========================================
// UPLOAD VIDEO TO CLOUDINARY
// ==========================================

function uploadToCloudinary(fileBuffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: "video",
                folder: "codexperts/reels"
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        stream.end(fileBuffer);
    });
}

// ==========================================
// UPLOAD PROFILE IMAGE TO CLOUDINARY
// ==========================================

function uploadProfileImageToCloudinary(fileBuffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: "image",
                folder: "codexperts/profile-pictures",
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

        stream.end(fileBuffer);
    });
}

// ==========================================
// ENRICH REELS WITH CREATOR AND ENGAGEMENT
// ==========================================

async function enrichVideos(videos, currentUserId) {
    if (!videos || videos.length === 0) {
        return [];
    }

    const videoIds = videos.map(video => video.video_id);

    const userIds = [
        ...new Set(videos.map(video => video.user_id))
    ];

    const [
        { data: profiles, error: profileError },
        { data: likes, error: likesError },
        { data: comments, error: commentsError },
        { data: following, error: followingError }
    ] = await Promise.all([
        supabase
            .from("user_profile")
            .select(
                "user_id, first_name, last_name, username, profile_picture_url"
            )
            .in("user_id", userIds),

        supabase
            .from("video_like")
            .select("video_id, user_id")
            .in("video_id", videoIds),

        supabase
            .from("video_comment")
            .select("video_id")
            .in("video_id", videoIds),

        supabase
            .from("user_follow")
            .select("following_id")
            .eq("follower_id", currentUserId)
            .in("following_id", userIds)
    ]);

    if (profileError) throw profileError;
    if (likesError) throw likesError;
    if (commentsError) throw commentsError;
    if (followingError) throw followingError;

    const profileMap = new Map(
        (profiles || []).map(profile => [
            profile.user_id,
            profile
        ])
    );

    const followingSet = new Set(
        (following || []).map(item => item.following_id)
    );

    const likeCounts = new Map();
    const commentCounts = new Map();
    const likedVideos = new Set();

    for (const like of likes || []) {
        likeCounts.set(
            like.video_id,
            (likeCounts.get(like.video_id) || 0) + 1
        );

        if (like.user_id === currentUserId) {
            likedVideos.add(like.video_id);
        }
    }

    for (const comment of comments || []) {
        commentCounts.set(
            comment.video_id,
            (commentCounts.get(comment.video_id) || 0) + 1
        );
    }

    return videos.map(video => ({
        ...video,
        creator: profileMap.get(video.user_id) || null,
        like_count: likeCounts.get(video.video_id) || 0,
        comment_count: commentCounts.get(video.video_id) || 0,
        is_liked: likedVideos.has(video.video_id),
        is_following_creator: followingSet.has(video.user_id)
    }));
}

// ==========================================
// GET FOR YOU FEED
// ==========================================

router.get("/feed", async (req, res) => {
    try {
        const { limit, offset } = getPagination(req);

        const { data: videos, error } = await supabase
            .from("video")
            .select("*")
            .eq("status", "published")
            .order("created_at", {
                ascending: false
            })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        const enrichedVideos = await enrichVideos(
            videos || [],
            req.user.id
        );

        return res.status(200).json({
            success: true,
            videos: enrichedVideos
        });

    } catch (error) {
        console.error("For You feed error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load Reels."
        });
    }
});

// ==========================================
// GET FOLLOWING FEED
// ==========================================

router.get("/following", async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit, offset } = getPagination(req);

        const { data: follows, error: followError } =
            await supabase
                .from("user_follow")
                .select("following_id")
                .eq("follower_id", userId);

        if (followError) {
            throw followError;
        }

        const followingIds = (follows || []).map(
            item => item.following_id
        );

        if (followingIds.length === 0) {
            return res.status(200).json({
                success: true,
                videos: []
            });
        }

        const { data: videos, error: videoError } =
            await supabase
                .from("video")
                .select("*")
                .eq("status", "published")
                .in("user_id", followingIds)
                .order("created_at", {
                    ascending: false
                })
                .range(offset, offset + limit - 1);

        if (videoError) {
            throw videoError;
        }

        const enrichedVideos = await enrichVideos(
            videos || [],
            userId
        );

        return res.status(200).json({
            success: true,
            videos: enrichedVideos
        });

    } catch (error) {
        console.error("Following feed error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load the Following feed."
        });
    }
});

// ==========================================
// UPLOAD A REEL
// ==========================================

router.post("/upload", (req, res, next) => {
    upload.single("video")(req, res, error => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message || "Unable to receive your video."
            });
        }

        next();
    });
}, async (req, res) => {
    let uploadedPublicId = null;

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a video to upload."
            });
        }

        const caption = typeof req.body.caption === "string"
            ? req.body.caption.trim()
            : "";

        if (caption.length > 2200) {
            return res.status(400).json({
                success: false,
                message: "Your caption cannot exceed 2200 characters."
            });
        }

        const cloudinaryResult = await uploadToCloudinary(
            req.file.buffer
        );

        uploadedPublicId = cloudinaryResult.public_id;

        const { data: video, error } = await supabase
            .from("video")
            .insert({
                user_id: req.user.id,
                video_url: cloudinaryResult.secure_url,
                cloudinary_public_id: cloudinaryResult.public_id,
                thumbnail_url: null,
                caption: caption || null,
                duration_seconds: cloudinaryResult.duration
                    ? Math.round(cloudinaryResult.duration)
                    : null,
                status: "published"
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        const creator = await getUserProfile(req.user.id);

        return res.status(201).json({
            success: true,
            message: "Your Reel has been uploaded.",
            video: {
                ...video,
                creator,
                like_count: 0,
                comment_count: 0,
                is_liked: false,
                is_following_creator: false
            }
        });

    } catch (error) {
        console.error("Reel upload error:", error);

        if (uploadedPublicId) {
            try {
                await cloudinary.uploader.destroy(
                    uploadedPublicId,
                    {
                        resource_type: "video"
                    }
                );
            } catch (cloudinaryError) {
                console.error(
                    "Cloudinary cleanup error:",
                    cloudinaryError
                );
            }
        }

        return res.status(500).json({
            success: false,
            message: "Unable to upload your Reel. Please try again."
        });
    }
});


// ==========================================
// UPLOAD OR UPDATE PROFILE PICTURE
// ==========================================

router.post("/profile-picture", (req, res, next) => {
    profileImageUpload.single("profile_picture")(
        req,
        res,
        error => {
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message ||
                        "Unable to receive your profile picture."
                });
            }

            next();
        }
    );
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a profile picture."
            });
        }

        const cloudinaryResult =
            await uploadProfileImageToCloudinary(req.file.buffer);

        const { data: profile, error } = await supabase
            .from("user_profile")
            .update({
                profile_picture_url: cloudinaryResult.secure_url
            })
            .eq("user_id", req.user.id)
            .select(
                "user_id, username, profile_picture_url"
            )
            .single();

        if (error) {
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: "Your profile picture has been updated.",
            profile_picture_url: profile.profile_picture_url,
            profile
        });

    } catch (error) {
        console.error("Profile picture upload error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update your profile picture. Please try again."
        });
    }
});

// ==========================================
// DELETE OWN REEL
// ==========================================

router.delete("/:videoId", async (req, res) => {
    try {
        const videoId = getValidId(req.params.videoId);

        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Reel ID."
            });
        }

        const { data: video, error: findError } =
            await supabase
                .from("video")
                .select("video_id, user_id, cloudinary_public_id")
                .eq("video_id", videoId)
                .eq("user_id", req.user.id)
                .maybeSingle();

        if (findError) throw findError;

        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Reel not found or you cannot delete it."
            });
        }

        const { error: deleteError } = await supabase
            .from("video")
            .delete()
            .eq("video_id", videoId)
            .eq("user_id", req.user.id);

        if (deleteError) throw deleteError;

        try {
            await cloudinary.uploader.destroy(
                video.cloudinary_public_id,
                {
                    resource_type: "video"
                }
            );
        } catch (cloudinaryError) {
            console.error(
                "Cloudinary video deletion error:",
                cloudinaryError
            );
        }

        return res.status(200).json({
            success: true,
            message: "Your Reel has been deleted."
        });

    } catch (error) {
        console.error("Delete Reel error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete this Reel."
        });
    }
});

// ==========================================
// LIKE OR UNLIKE A REEL
// ==========================================

router.post("/:videoId/like", async (req, res) => {
    try {
        const videoId = getValidId(req.params.videoId);
        const userId = req.user.id;

        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Reel ID."
            });
        }

        const video = await getVideo(videoId);

        if (!video || video.status !== "published") {
            return res.status(404).json({
                success: false,
                message: "Reel not found."
            });
        }

        const { data: existingLike, error: findError } =
            await supabase
                .from("video_like")
                .select("video_id")
                .eq("video_id", videoId)
                .eq("user_id", userId)
                .maybeSingle();

        if (findError) throw findError;

        let liked;

        if (existingLike) {
            const { error: deleteError } = await supabase
                .from("video_like")
                .delete()
                .eq("video_id", videoId)
                .eq("user_id", userId);

            if (deleteError) throw deleteError;

            liked = false;

        } else {
            const { error: insertError } = await supabase
                .from("video_like")
                .insert({
                    video_id: videoId,
                    user_id: userId
                });

            if (insertError) throw insertError;

            liked = true;

            const actor = await getUserProfile(userId);

            await createNotification({
                recipientId: video.user_id,
                actorId: userId,
                type: "video_like",
                title: "New Reel like",
                message: `${actor?.username || "Someone"} liked your Reel.`,
                referenceType: "video",
                referenceId: videoId
            });
        }

        const { count, error: countError } = await supabase
            .from("video_like")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("video_id", videoId);

        if (countError) throw countError;

        return res.status(200).json({
            success: true,
            liked,
            like_count: count || 0,
            message: liked
                ? "You liked this Reel."
                : "You unliked this Reel."
        });

    } catch (error) {
        console.error("Reel like error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update your like."
        });
    }
});

// ==========================================
// GET REEL COMMENTS
// ==========================================

router.get("/:videoId/comments", async (req, res) => {
    try {
        const videoId = getValidId(req.params.videoId);

        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Reel ID."
            });
        }

        const video = await getVideo(videoId);

        if (!video || video.status !== "published") {
            return res.status(404).json({
                success: false,
                message: "Reel not found."
            });
        }

        const { data: comments, error } = await supabase
            .from("video_comment")
            .select("*")
            .eq("video_id", videoId)
            .order("created_at", {
                ascending: true
            });

        if (error) throw error;

        const userIds = [
            ...new Set(
                (comments || []).map(comment => comment.user_id)
            )
        ];

        let profiles = [];

        if (userIds.length > 0) {
            const { data, error: profileError } =
                await supabase
                    .from("user_profile")
                    .select("user_id, username, profile_picture_url")
                    .in("user_id", userIds);

            if (profileError) throw profileError;

            profiles = data || [];
        }

        const profileMap = new Map(
            profiles.map(profile => [
                profile.user_id,
                profile
            ])
        );

        const enrichedComments = (comments || []).map(comment => ({
            ...comment,
            creator: profileMap.get(comment.user_id) || null,
            is_own_comment: comment.user_id === req.user.id
        }));

        return res.status(200).json({
            success: true,
            comments: enrichedComments
        });

    } catch (error) {
        console.error("Get Reel comments error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load comments."
        });
    }
});

// ==========================================
// ADD A COMMENT
// ==========================================

router.post("/:videoId/comments", async (req, res) => {
    try {
        const videoId = getValidId(req.params.videoId);
        const commentText = req.body.comment_text;

        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Reel ID."
            });
        }

        if (
            typeof commentText !== "string" ||
            !commentText.trim() ||
            commentText.trim().length > 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "Your comment must contain between 1 and 1000 characters."
            });
        }

        const video = await getVideo(videoId);

        if (!video || video.status !== "published") {
            return res.status(404).json({
                success: false,
                message: "Reel not found."
            });
        }

        const { data: comment, error } = await supabase
            .from("video_comment")
            .insert({
                video_id: videoId,
                user_id: req.user.id,
                comment_text: commentText.trim()
            })
            .select()
            .single();

        if (error) throw error;

        const creator = await getUserProfile(req.user.id);

        await createNotification({
            recipientId: video.user_id,
            actorId: req.user.id,
            type: "video_comment",
            title: "New Reel comment",
            message: `${creator?.username || "Someone"} commented on your Reel.`,
            referenceType: "video",
            referenceId: videoId
        });

        return res.status(201).json({
            success: true,
            message: "Your comment has been added.",
            comment: {
                ...comment,
                creator: creator
                    ? {
                        user_id: creator.user_id,
                        username: creator.username,
                        profile_picture_url: creator.profile_picture_url
                    }
                    : null,
                is_own_comment: true
            }
        });

    } catch (error) {
        console.error("Add Reel comment error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to add your comment."
        });
    }
});

// ==========================================
// DELETE OWN COMMENT
// ==========================================

router.delete("/comments/:commentId", async (req, res) => {
    try {
        const commentId = getValidId(req.params.commentId);

        if (!commentId) {
            return res.status(400).json({
                success: false,
                message: "Invalid comment ID."
            });
        }

        const { data: comment, error: findError } =
            await supabase
                .from("video_comment")
                .select("comment_id, user_id")
                .eq("comment_id", commentId)
                .eq("user_id", req.user.id)
                .maybeSingle();

        if (findError) throw findError;

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found or you cannot delete it."
            });
        }

        const { error: deleteError } = await supabase
            .from("video_comment")
            .delete()
            .eq("comment_id", commentId)
            .eq("user_id", req.user.id);

        if (deleteError) throw deleteError;

        return res.status(200).json({
            success: true,
            message: "Your comment has been deleted."
        });

    } catch (error) {
        console.error("Delete Reel comment error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete this comment."
        });
    }
});

// ==========================================
// FOLLOW OR UNFOLLOW A USER
// ==========================================

router.post("/follow/:userId", async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user.id;

        if (
            !targetUserId ||
            targetUserId === currentUserId
        ) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow your own account."
            });
        }

        const targetProfile = await getUserProfile(targetUserId);

        if (!targetProfile) {
            return res.status(404).json({
                success: false,
                message: "User profile not found."
            });
        }

        const { data: existingFollow, error: findError } =
            await supabase
                .from("user_follow")
                .select("follow_id")
                .eq("follower_id", currentUserId)
                .eq("following_id", targetUserId)
                .maybeSingle();

        if (findError) throw findError;

        let following;

        if (existingFollow) {
            const { error: deleteError } = await supabase
                .from("user_follow")
                .delete()
                .eq("follow_id", existingFollow.follow_id)
                .eq("follower_id", currentUserId);

            if (deleteError) throw deleteError;

            following = false;

        } else {
            const { data: newFollow, error: insertError } =
                await supabase
                    .from("user_follow")
                    .insert({
                        follower_id: currentUserId,
                        following_id: targetUserId
                    })
                    .select("follow_id")
                    .single();

            if (insertError) throw insertError;

            following = true;

            const actor = await getUserProfile(currentUserId);

            await createNotification({
                recipientId: targetUserId,
                actorId: currentUserId,
                type: "new_follower",
                title: "New follower",
                message: `${actor?.username || "Someone"} started following you.`,
                referenceType: "user_follow",
                referenceId: newFollow.follow_id
            });
        }

        const [
            { count: followerCount, error: followerError },
            { count: followingCount, error: followingError }
        ] = await Promise.all([
            supabase
                .from("user_follow")
                .select("*", {
                    count: "exact",
                    head: true
                })
                .eq("following_id", targetUserId),

            supabase
                .from("user_follow")
                .select("*", {
                    count: "exact",
                    head: true
                })
                .eq("follower_id", targetUserId)
        ]);

        if (followerError) throw followerError;
        if (followingError) throw followingError;

        return res.status(200).json({
            success: true,
            following,
            follower_count: followerCount || 0,
            following_count: followingCount || 0,
            message: following
                ? "You are now following this user."
                : "You have unfollowed this user."
        });

    } catch (error) {
        console.error("Follow user error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update your follow status."
        });
    }
});

// ==========================================
// GET PUBLIC USER PROFILE
// ==========================================

router.get("/profile/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        const profile = await getUserProfile(userId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "User profile not found."
            });
        }

        const [
            { count: followerCount, error: followerError },
            { count: followingCount, error: followingError },
            { data: followRecord, error: followError },
            learningPaths,
            badges,
            { data: videos, error: videoError }
        ] = await Promise.all([
            supabase
                .from("user_follow")
                .select("*", {
                    count: "exact",
                    head: true
                })
                .eq("following_id", userId),

            supabase
                .from("user_follow")
                .select("*", {
                    count: "exact",
                    head: true
                })
                .eq("follower_id", userId),

            supabase
                .from("user_follow")
                .select("follow_id")
                .eq("follower_id", req.user.id)
                .eq("following_id", userId)
                .maybeSingle(),

            getUserLearningPaths(userId),

            getUserBadges(userId),

            supabase
                .from("video")
                .select("*")
                .eq("user_id", userId)
                .eq("status", "published")
                .order("created_at", {
                    ascending: false
                })
                .limit(30)
        ]);

        if (followerError) throw followerError;
        if (followingError) throw followingError;
        if (followError) throw followError;
        if (videoError) throw videoError;

        const enrichedVideos = await enrichVideos(
            videos || [],
            req.user.id
        );

        return res.status(200).json({
            success: true,
            profile: {
                ...profile,
                follower_count: followerCount || 0,
                following_count: followingCount || 0,
                is_following: Boolean(followRecord),
                learning_paths: learningPaths,
                badges,
                reels: enrichedVideos
            }
        });

    } catch (error) {
        console.error("Get public profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load this profile."
        });
    }
});

// ==========================================
// GET USER'S OWN PROFILE
// ==========================================

router.get("/my-profile", async (req, res) => {
    try {
        const profile = await getUserProfile(req.user.id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Your profile could not be found."
            });
        }

        const [
            { count: followerCount, error: followerError },
            { count: followingCount, error: followingError },
            learningPaths,
            badges,
            { data: videos, error: videoError }
        ] = await Promise.all([
            supabase
                .from("user_follow")
                .select("*", {
                    count: "exact",
                    head: true
                })
                .eq("following_id", req.user.id),

            supabase
                .from("user_follow")
                .select("*", {
                    count: "exact",
                    head: true
                })
                .eq("follower_id", req.user.id),

            getUserLearningPaths(req.user.id),

            getUserBadges(req.user.id),

            supabase
                .from("video")
                .select("*")
                .eq("user_id", req.user.id)
                .eq("status", "published")
                .order("created_at", {
                    ascending: false
                })
                .limit(30)
        ]);

        if (followerError) throw followerError;
        if (followingError) throw followingError;
        if (videoError) throw videoError;

        const enrichedVideos = await enrichVideos(
            videos || [],
            req.user.id
        );

        return res.status(200).json({
            success: true,
            profile: {
                ...profile,
                follower_count: followerCount || 0,
                following_count: followingCount || 0,
                learning_paths: learningPaths,
                badges,
                reels: enrichedVideos
            }
        });

    } catch (error) {
        console.error("Get own profile error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load your profile."
        });
    }
});

// ==========================================
// GET FOLLOWERS
// ==========================================

router.get("/profile/:userId/followers", async (req, res) => {
    try {
        const userId = req.params.userId;

        const { data: follows, error } = await supabase
            .from("user_follow")
            .select("follower_id, created_at")
            .eq("following_id", userId)
            .order("created_at", {
                ascending: false
            });

        if (error) throw error;

        const followerIds = (follows || []).map(
            item => item.follower_id
        );

        let profiles = [];

        if (followerIds.length > 0) {
            const { data, error: profileError } =
                await supabase
                    .from("user_profile")
                    .select(
                        "user_id, username, profile_picture_url, overall_xp"
                    )
                    .in("user_id", followerIds);

            if (profileError) throw profileError;

            profiles = data || [];
        }

        const profileMap = new Map(
            profiles.map(profile => [
                profile.user_id,
                profile
            ])
        );

        const followers = (follows || []).map(item => ({
            ...profileMap.get(item.follower_id),
            followed_at: item.created_at,
            is_following: false
        })).filter(item => item.user_id);

        return res.status(200).json({
            success: true,
            followers
        });

    } catch (error) {
        console.error("Get followers error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load followers."
        });
    }
});

// ==========================================
// GET FOLLOWING
// ==========================================

router.get("/profile/:userId/following", async (req, res) => {
    try {
        const userId = req.params.userId;

        const { data: follows, error } = await supabase
            .from("user_follow")
            .select("following_id, created_at")
            .eq("follower_id", userId)
            .order("created_at", {
                ascending: false
            });

        if (error) throw error;

        const followingIds = (follows || []).map(
            item => item.following_id
        );

        let profiles = [];

        if (followingIds.length > 0) {
            const { data, error: profileError } =
                await supabase
                    .from("user_profile")
                    .select(
                        "user_id, username, profile_picture_url, overall_xp"
                    )
                    .in("user_id", followingIds);

            if (profileError) throw profileError;

            profiles = data || [];
        }

        const profileMap = new Map(
            profiles.map(profile => [
                profile.user_id,
                profile
            ])
        );

        const following = (follows || []).map(item => ({
            ...profileMap.get(item.following_id),
            followed_at: item.created_at
        })).filter(item => item.user_id);

        return res.status(200).json({
            success: true,
            following
        });

    } catch (error) {
        console.error("Get following error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load following list."
        });
    }
});

module.exports = router;
