
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const supabase = require("../config/supabase");

const router = express.Router();

// Separate client used to verify Supabase access tokens.
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
// AUTHENTICATION MIDDLEWARE
// ==========================================

async function authenticateUser(req, res, next) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Please log in to access the community."
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
        console.error("Community authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to authenticate your account."
        });
    }
}

router.use(authenticateUser);

// ==========================================
// CHECK ACTIVE GROUP ACCESS
// ==========================================

async function getActiveGroup(userId, groupId) {
    const { data: group, error: groupError } =
        await supabase
            .from("community_group")
            .select("group_id, path_id, created_at")
            .eq("group_id", groupId)
            .maybeSingle();

    if (groupError) {
        throw groupError;
    }

    if (!group) {
        return null;
    }

    const { data: enrollment, error: enrollmentError } =
        await supabase
            .from("enrollment")
            .select("enrollment_id, path_xp, current_level")
            .eq("user_id", userId)
            .eq("path_id", group.path_id)
            .eq("status", "active")
            .maybeSingle();

    if (enrollmentError) {
        throw enrollmentError;
    }

    if (!enrollment) {
        return null;
    }

    return {
        ...group,
        enrollment
    };
}

// ==========================================
// GET USER PROFILE AND ENROLLED GROUPS
// ==========================================

router.get("/groups", async (req, res) => {
    try {
        const userId = req.user.id;

        // Retrieve the logged-in user's profile.
        const { data: profile, error: profileError } =
            await supabase
                .from("user_profile")
                .select(
                    "user_id, first_name, last_name, username, profile_picture_url, overall_xp"
                )
                .eq("user_id", userId)
                .single();

        if (profileError || !profile) {
            return res.status(404).json({
                success: false,
                message: "Your user profile could not be found."
            });
        }

        // Retrieve only active enrollments.
        const { data: enrollments, error: enrollmentError } =
            await supabase
                .from("enrollment")
                .select("enrollment_id, path_id, path_xp, current_level")
                .eq("user_id", userId)
                .eq("status", "active");

        if (enrollmentError) {
            throw enrollmentError;
        }

        if (!enrollments || enrollments.length === 0) {
            return res.status(200).json({
                success: true,
                profile,
                groups: []
            });
        }

        const pathIds = enrollments.map(item => item.path_id);

        // Retrieve the community groups for those learning paths.
        const { data: groups, error: groupError } =
            await supabase
                .from("community_group")
                .select("group_id, path_id, created_at")
                .in("path_id", pathIds);

        if (groupError) {
            throw groupError;
        }

        // Retrieve the learning path names.
        const { data: paths, error: pathError } =
            await supabase
                .from("learning_path")
                .select("path_id, path_name")
                .in("path_id", pathIds);

        if (pathError) {
            throw pathError;
        }

        const enrollmentMap = new Map(
            enrollments.map(item => [item.path_id, item])
        );

        const pathMap = new Map(
            paths.map(item => [item.path_id, item.path_name])
        );

        const groupResults = [];

        for (const group of groups || []) {
            const enrollment = enrollmentMap.get(group.path_id);

            if (!enrollment) continue;

            // Count members currently enrolled in this learning path.
            const { count: memberCount, error: memberError } =
                await supabase
                    .from("group_member")
                    .select("*", {
                        count: "exact",
                        head: true
                    })
                    .eq("group_id", group.group_id);

            if (memberError) {
                throw memberError;
            }

            // Retrieve this user's last-read timestamp.
            const { data: membership, error: membershipError } =
                await supabase
                    .from("group_member")
                    .select("last_read_at")
                    .eq("group_id", group.group_id)
                    .eq("user_id", userId)
                    .maybeSingle();

            if (membershipError) {
                throw membershipError;
            }

            // Count unread messages from other users.
            let unreadCount = 0;

            let unreadQuery = supabase
                .from("group_message")
                .select("*", {
                    count: "exact",
                    head: true
                })
                .eq("group_id", group.group_id)
                .neq("user_id", userId)
                .eq("is_deleted", false);

            if (membership?.last_read_at) {
                unreadQuery = unreadQuery.gt(
                    "created_at",
                    membership.last_read_at
                );
            }

            const { count, error: unreadError } =
                await unreadQuery;

            if (unreadError) {
                throw unreadError;
            }

            unreadCount = count || 0;

            groupResults.push({
                group_id: group.group_id,
                path_id: group.path_id,
                group_name: pathMap.get(group.path_id) || "Learning Community",
                path_xp: enrollment.path_xp,
                current_level: enrollment.current_level,
                member_count: memberCount || 0,
                unread_count: unreadCount
            });
        }

        return res.status(200).json({
            success: true,
            profile,
            groups: groupResults
        });

    } catch (error) {
        console.error("Community groups error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load your community groups."
        });
    }
});

// ==========================================
// GET GROUP MEMBERS
// ==========================================

router.get("/groups/:groupId/members", async (req, res) => {
    try {
        const userId = req.user.id;
        const groupId = req.params.groupId;

        const group = await getActiveGroup(userId, groupId);

        if (!group) {
            return res.status(403).json({
                success: false,
                message: "You are not enrolled in this community."
            });
        }

        const { data: memberships, error: memberError } =
            await supabase
                .from("group_member")
                .select("user_id, joined_at")
                .eq("group_id", groupId);

        if (memberError) {
            throw memberError;
        }

        const memberIds = (memberships || []).map(
            member => member.user_id
        );

        if (memberIds.length === 0) {
            return res.status(200).json({
                success: true,
                members: []
            });
        }

        // Only include members with active enrollment.
        const { data: activeEnrollments, error: enrollmentError } =
            await supabase
                .from("enrollment")
                .select("user_id, path_xp, current_level")
                .eq("path_id", group.path_id)
                .eq("status", "active")
                .in("user_id", memberIds);

        if (enrollmentError) {
            throw enrollmentError;
        }

        const activeIds = (activeEnrollments || []).map(
            item => item.user_id
        );

        if (activeIds.length === 0) {
            return res.status(200).json({
                success: true,
                members: []
            });
        }

        const { data: profiles, error: profileError } =
            await supabase
                .from("user_profile")
                .select(
                    "user_id, first_name, last_name, username, profile_picture_url"
                )
                .in("user_id", activeIds);

        if (profileError) {
            throw profileError;
        }

        const enrollmentMap = new Map(
            activeEnrollments.map(item => [
                item.user_id,
                item
            ])
        );

        const membershipMap = new Map(
            memberships.map(item => [
                item.user_id,
                item
            ])
        );

        const members = (profiles || []).map(profile => {
            const enrollment = enrollmentMap.get(profile.user_id);
            const membership = membershipMap.get(profile.user_id);

            return {
                ...profile,
                path_xp: enrollment.path_xp,
                current_level: enrollment.current_level,
                joined_at: membership.joined_at
            };
        });

        return res.status(200).json({
            success: true,
            members
        });

    } catch (error) {
        console.error("Community members error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load community members."
        });
    }
});

// ==========================================
// GET GROUP MESSAGES
// ==========================================

router.get("/groups/:groupId/messages", async (req, res) => {
    try {
        const userId = req.user.id;
        const groupId = req.params.groupId;

        const group = await getActiveGroup(userId, groupId);

        if (!group) {
            return res.status(403).json({
                success: false,
                message: "You are not enrolled in this community."
            });
        }

        const { data: messages, error: messageError } =
            await supabase
                .from("group_message")
                .select(
                    "message_id, group_id, user_id, message_text, created_at, is_deleted, deleted_at"
                )
                .eq("group_id", groupId)
                .order("created_at", {
                    ascending: false
                })
                .limit(50);

        if (messageError) {
            throw messageError;
        }

        const senderIds = [
            ...new Set(
                (messages || [])
                    .map(message => message.user_id)
                    .filter(Boolean)
            )
        ];

        let profiles = [];
        let enrollments = [];

        if (senderIds.length > 0) {
            const { data: profileData, error: profileError } =
                await supabase
                    .from("user_profile")
                    .select(
                        "user_id, first_name, last_name, username, profile_picture_url"
                    )
                    .in("user_id", senderIds);

            if (profileError) {
                throw profileError;
            }

            profiles = profileData || [];

            // Get each sender's XP and level for this learning path.
            const { data: enrollmentData, error: enrollmentError } =
                await supabase
                    .from("enrollment")
                    .select("user_id, path_xp, current_level")
                    .eq("path_id", group.path_id)
                    .in("user_id", senderIds);

            if (enrollmentError) {
                throw enrollmentError;
            }

            enrollments = enrollmentData || [];
        }

        const profileMap = new Map(
            profiles.map(profile => [
                profile.user_id,
                profile
            ])
        );

        const enrollmentMap = new Map(
            enrollments.map(enrollment => [
                enrollment.user_id,
                enrollment
            ])
        );

        const enrichedMessages = (messages || [])
            .reverse()
            .map(message => {
                const profile = profileMap.get(message.user_id);
                const enrollment = enrollmentMap.get(message.user_id);

                return {
                    ...message,
                    sender: profile || null,
                    path_xp: enrollment?.path_xp ?? null,
                    current_level: enrollment?.current_level ?? null
                };
            });

        return res.status(200).json({
            success: true,
            messages: enrichedMessages
        });

    } catch (error) {
        console.error("Community messages error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load messages."
        });
    }
});

// ==========================================
// SEND MESSAGE
// ==========================================

router.post("/groups/:groupId/messages", async (req, res) => {
    try {
        const userId = req.user.id;
        const groupId = req.params.groupId;
        const messageText = req.body.message_text;

        if (
            typeof messageText !== "string" ||
            !messageText.trim() ||
            messageText.trim().length > 2000
        ) {
            return res.status(400).json({
                success: false,
                message: "Your message must contain between 1 and 2000 characters."
            });
        }

        const group = await getActiveGroup(userId, groupId);

        if (!group) {
            return res.status(403).json({
                success: false,
                message: "You are not enrolled in this community."
            });
        }

        const { data: message, error: insertError } =
            await supabase
                .from("group_message")
                .insert({
                    group_id: groupId,
                    user_id: userId,
                    message_text: messageText.trim()
                })
                .select()
                .single();

        if (insertError) {
            throw insertError;
        }

        const { data: profile, error: profileError } =
            await supabase
                .from("user_profile")
                .select(
                    "user_id, first_name, last_name, username, profile_picture_url"
                )
                .eq("user_id", userId)
                .single();

        if (profileError) {
            throw profileError;
        }

        return res.status(201).json({
            success: true,
            message: {
                ...message,
                sender: profile,
                path_xp: group.enrollment.path_xp,
                current_level: group.enrollment.current_level
            }
        });

    } catch (error) {
        console.error("Send community message error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to send your message."
        });
    }
});

// ==========================================
// UPDATE LAST READ TIME
// ==========================================

router.patch("/groups/:groupId/read", async (req, res) => {
    try {
        const userId = req.user.id;
        const groupId = req.params.groupId;

        const group = await getActiveGroup(userId, groupId);

        if (!group) {
            return res.status(403).json({
                success: false,
                message: "You are not enrolled in this community."
            });
        }

        const { error } = await supabase
            .from("group_member")
            .update({
                last_read_at: new Date().toISOString()
            })
            .eq("group_id", groupId)
            .eq("user_id", userId);

        if (error) {
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: "Messages marked as read."
        });

    } catch (error) {
        console.error("Update last read error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update your read status."
        });
    }
});

// ==========================================
// SOFT DELETE OWN MESSAGE
// ==========================================

router.delete("/messages/:messageId", async (req, res) => {
    try {
        const userId = req.user.id;
        const messageId = req.params.messageId;

        const { data: message, error: messageError } =
            await supabase
                .from("group_message")
                .select("message_id, group_id, user_id")
                .eq("message_id", messageId)
                .eq("user_id", userId)
                .maybeSingle();

        if (messageError) {
            throw messageError;
        }

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found or you cannot delete it."
            });
        }

        const group = await getActiveGroup(userId, message.group_id);

        if (!group) {
            return res.status(403).json({
                success: false,
                message: "You are not enrolled in this community."
            });
        }

        const { error: deleteError } =
            await supabase
                .from("group_message")
                .update({
                    is_deleted: true,
                    deleted_at: new Date().toISOString(),
                    message_text: "This message was deleted."
                })
                .eq("message_id", messageId)
                .eq("user_id", userId);

        if (deleteError) {
            throw deleteError;
        }

        return res.status(200).json({
            success: true,
            message: "Your message was deleted."
        });

    } catch (error) {
        console.error("Delete community message error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete this message."
        });
    }
});

// ==========================================
// GET NOTIFICATIONS
// ==========================================

router.get("/notifications", async (req, res) => {
    try {
        const { data: notifications, error } =
            await supabase
                .from("notification")
                .select("*")
                .eq("user_id", req.user.id)
                .order("created_at", {
                    ascending: false
                })
                .limit(30);

        if (error) {
            throw error;
        }

        return res.status(200).json({
            success: true,
            notifications: notifications || []
        });

    } catch (error) {
        console.error("Get notifications error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load notifications."
        });
    }
});

// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================

router.patch("/notifications/:notificationId/read", async (req, res) => {
    try {
        const { data, error } =
            await supabase
                .from("notification")
                .update({
                    is_read: true
                })
                .eq("notification_id", req.params.notificationId)
                .eq("user_id", req.user.id)
                .select("notification_id")
                .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read."
        });

    } catch (error) {
        console.error("Mark notification read error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update this notification."
        });
    }
});

module.exports = router;
