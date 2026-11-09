
// ==========================================
// CODEXPERTS PROFILE PAGE
// ==========================================

const API_BASE = "http://localhost:5000/api";

const elements = {
    menuButton: document.getElementById("menuButton"),
    mainNav: document.getElementById("mainNav"),

    loadingState: document.getElementById("loadingState"),
    errorState: document.getElementById("errorState"),
    errorMessage: document.getElementById("errorMessage"),
    retryButton: document.getElementById("retryButton"),
    profileContent: document.getElementById("profileContent"),

    profileInitial: document.getElementById("profileInitial"),
    profileAvatar: document.getElementById("profileAvatar"),
    editAvatarButton: document.getElementById("editAvatarButton"),
    profilePictureInput: document.getElementById("profilePictureInput"),

    profileName: document.getElementById("profileName"),
    profileUsername: document.getElementById("profileUsername"),
    profileBio: document.getElementById("profileBio"),
    joinedDate: document.getElementById("joinedDate"),

    followButton: document.getElementById("followButton"),
    createReelButton: document.getElementById("createReelButton"),

    overallXP: document.getElementById("overallXP"),
    followerCount: document.getElementById("followerCount"),
    followingCount: document.getElementById("followingCount"),
    reelCount: document.getElementById("reelCount"),
    badgeCount: document.getElementById("badgeCount"),

    learningGrid: document.getElementById("learningGrid"),
    learningEmpty: document.getElementById("learningEmpty"),

    badgesGrid: document.getElementById("badgesGrid"),
    badgesEmpty: document.getElementById("badgesEmpty"),

    reelsGrid: document.getElementById("reelsGrid"),
    reelsEmpty: document.getElementById("reelsEmpty"),
    reelTotal: document.getElementById("reelTotal"),

    followersButton: document.getElementById("followersButton"),
    followingButton: document.getElementById("followingButton"),

    usersModal: document.getElementById("usersModal"),
    usersModalTitle: document.getElementById("usersModalTitle"),
    modalUsersList: document.getElementById("modalUsersList"),
    modalEmpty: document.getElementById("modalEmpty"),
    closeUsersModal: document.getElementById("closeUsersModal"),

    reelModal: document.getElementById("reelModal"),
    reelPreviewVideo: document.getElementById("reelPreviewVideo"),
    reelPreviewCaption: document.getElementById("reelPreviewCaption"),
    reelPreviewDate: document.getElementById("reelPreviewDate"),
    closeReelModal: document.getElementById("closeReelModal"),

    reelLikeButton: document.getElementById("reelLikeButton"),
    reelLikeIcon: document.getElementById("reelLikeIcon"),
    reelLikeCount: document.getElementById("reelLikeCount"),
    reelCommentCount: document.getElementById("reelCommentCount"),

    reelCommentsList: document.getElementById("reelCommentsList"),
    reelCommentForm: document.getElementById("reelCommentForm"),
    reelCommentInput: document.getElementById("reelCommentInput"),
    submitCommentButton: document.getElementById("submitCommentButton"),

    toast: document.getElementById("toast")
};


// ==========================================
// PAGE STATE
// ==========================================

let currentProfile = null;
let isOwnProfile = false;
let currentUserId = null;
let currentReel = null;
let toastTimeout = null;


// ==========================================
// AUTHENTICATION
// ==========================================

function getAccessToken() {
    return sessionStorage.getItem("supabaseAccessToken");
}

function getStoredUser() {
    try {
        const storedUser = sessionStorage.getItem("loggedInUser");

        if (!storedUser) {
            return null;
        }

        return JSON.parse(storedUser);

    } catch (error) {
        console.error("Unable to read logged-in user:", error);
        return null;
    }
}

function getCurrentUserId() {
    const storedUser = getStoredUser();

    if (!storedUser) {
        return null;
    }

    const user = storedUser.user || storedUser;

    return user.user_id || user.id || null;
}

function redirectToLogin() {
    window.location.href = "login.html";
}


// ==========================================
// API REQUEST
// ==========================================

async function apiRequest(endpoint, options = {}) {
    const token = getAccessToken();

    if (!token) {
        redirectToLogin();
        throw new Error("Please log in to continue.");
    }

    const headers = {
        Authorization: `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("The server returned an invalid response.");
    }

    if (response.status === 401) {
        sessionStorage.removeItem("supabaseAccessToken");
        redirectToLogin();

        throw new Error("Your session has expired.");
    }

    if (!response.ok || data.success === false) {
        throw new Error(
            data.message || "Something went wrong. Please try again."
        );
    }

    return data;
}


// ==========================================
// GENERAL HELPERS
// ==========================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];
    });
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString();
}

function formatDate(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function getInitials(profile) {
    const firstName = profile?.first_name || "";
    const lastName = profile?.last_name || "";
    const username = profile?.username || "U";

    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

    return initials.trim() || username.charAt(0).toUpperCase();
}

function getAvatarFallback(profile) {
    const initials = getInitials(profile);

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
            <rect width="100%" height="100%" fill="#123a28"/>
            <text x="50%" y="54%" dominant-baseline="middle"
                text-anchor="middle" font-size="75"
                font-family="Arial" font-weight="bold"
                fill="#00ff66">${initials}</text>
        </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        elements.toast.classList.remove("show");
    }, 3000);
}

function getFullName(profile) {
    const fullName = [
        profile.first_name,
        profile.last_name
    ].filter(Boolean).join(" ").trim();

    return fullName || profile.username || "Developer";
}

function getProfileAvatar(profile) {
    return profile?.profile_picture_url ||
        getAvatarFallback(profile);
}


// ==========================================
// NAVIGATION
// ==========================================

function setupNavigation() {
    elements.menuButton.addEventListener("click", () => {
        elements.mainNav.classList.toggle("open");
    });

    elements.profileInitial.textContent = "U";

    const storedUser = getStoredUser();
    const user = storedUser?.user || storedUser || {};

    const username = user.username || user.first_name || "U";

    elements.profileInitial.textContent =
        username.charAt(0).toUpperCase();
}


// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile() {
    elements.loadingState.classList.remove("hidden");
    elements.errorState.classList.add("hidden");
    elements.profileContent.classList.add("hidden");

    try {
        const requestedUserId = new URLSearchParams(
            window.location.search
        ).get("userId");

        currentUserId = getCurrentUserId();

        isOwnProfile = !requestedUserId ||
            (
                currentUserId &&
                requestedUserId === currentUserId
            );

        let response;

        if (isOwnProfile) {
            response = await apiRequest("/reels/my-profile");
        } else {
            response = await apiRequest(
                `/reels/profile/${encodeURIComponent(requestedUserId)}`
            );
        }

        currentProfile = response.profile;

        if (!currentProfile) {
            throw new Error("The requested profile could not be found.");
        }

        if (
            currentUserId &&
            currentProfile.user_id === currentUserId
        ) {
            isOwnProfile = true;
        }

        displayProfile(currentProfile);

        elements.loadingState.classList.add("hidden");
        elements.profileContent.classList.remove("hidden");

    } catch (error) {
        console.error("Load profile error:", error);

        elements.loadingState.classList.add("hidden");
        elements.errorState.classList.remove("hidden");

        elements.errorMessage.textContent =
            error.message || "Unable to load this profile.";
    }
}


// ==========================================
// DISPLAY PROFILE INFORMATION
// ==========================================

function displayProfile(profile) {
    const fullName = getFullName(profile);
    const username = profile.username || "developer";

    elements.profileName.textContent = fullName;
    elements.profileUsername.textContent = `@${username}`;

    elements.profileBio.textContent =
        profile.bio?.trim() || "No biography added yet.";

    elements.overallXP.textContent =
        formatNumber(profile.overall_xp);

    elements.followerCount.textContent =
        formatNumber(profile.follower_count);

    elements.followingCount.textContent =
        formatNumber(profile.following_count);

    const reels = profile.reels || [];
    const badges = profile.badges || [];

    elements.reelCount.textContent = formatNumber(reels.length);
    elements.badgeCount.textContent = formatNumber(badges.length);

    elements.reelTotal.textContent =
        `${reels.length} ${reels.length === 1 ? "video" : "videos"}`;

    elements.joinedDate.textContent = profile.date_joined
        ? `Joined ${formatDate(profile.date_joined)}`
        : "";

    elements.profileAvatar.src = getProfileAvatar(profile);

    elements.profileAvatar.onerror = () => {
        elements.profileAvatar.src = getAvatarFallback(profile);
    };

    elements.profileInitial.textContent =
        getInitials(profile);

    setupProfileActions(profile);

    displayLearningPaths(profile.learning_paths || []);
    displayBadges(badges);
    displayReels(reels);
}


// ==========================================
// PROFILE ACTIONS
// ==========================================

function setupProfileActions(profile) {
    if (isOwnProfile) {
        elements.followButton.classList.add("hidden");
        elements.createReelButton.classList.remove("hidden");
        elements.editAvatarButton.classList.remove("hidden");

    } else {
        elements.createReelButton.classList.add("hidden");
        elements.followButton.classList.remove("hidden");
        elements.editAvatarButton.classList.add("hidden");

        updateFollowButton(Boolean(profile.is_following));
    }
}

function updateFollowButton(isFollowing) {
    elements.followButton.textContent =
        isFollowing ? "Following" : "Follow";

    elements.followButton.classList.toggle(
        "following",
        isFollowing
    );

    elements.followButton.dataset.following =
        String(isFollowing);
}

async function toggleFollow() {
    if (!currentProfile || isOwnProfile) {
        return;
    }

    const button = elements.followButton;

    const previousState =
        button.dataset.following === "true";

    button.disabled = true;

    try {
        const response = await apiRequest(
            `/reels/follow/${encodeURIComponent(currentProfile.user_id)}`,
            {
                method: "POST"
            }
        );

        currentProfile.is_following = response.following;
        currentProfile.follower_count = response.follower_count;
        currentProfile.following_count = response.following_count;

        elements.followerCount.textContent =
            formatNumber(response.follower_count);

        updateFollowButton(response.following);

        showToast(response.message);

    } catch (error) {
        console.error("Follow action error:", error);

        updateFollowButton(previousState);
        showToast(error.message);

    } finally {
        button.disabled = false;
    }
}


// ==========================================
// PROFILE PICTURE UPLOAD
// ==========================================

async function uploadProfilePicture(file) {
    if (!file || !isOwnProfile) {
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        showToast("Please select a JPG, PNG or WebP image.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showToast("Your image must be smaller than 5 MB.");
        return;
    }

    const button = elements.editAvatarButton;
    const previousImage = elements.profileAvatar.src;

    button.disabled = true;
    button.textContent = "...";

    // Display a temporary preview while the image uploads.
    const temporaryImage = URL.createObjectURL(file);

    elements.profileAvatar.src = temporaryImage;

    try {
        const formData = new FormData();

        formData.append("profile_picture", file);

        const response = await apiRequest(
            "/reels/profile-picture",
            {
                method: "POST",
                body: formData
            }
        );

        const imageUrl = response.profile_picture_url;

        if (!imageUrl) {
            throw new Error("The server did not return the new profile picture.");
        }

        currentProfile.profile_picture_url = imageUrl;

        elements.profileAvatar.src = imageUrl;

        elements.profileAvatar.onerror = () => {
            elements.profileAvatar.src =
                getAvatarFallback(currentProfile);
        };

        URL.revokeObjectURL(temporaryImage);

        showToast(response.message || "Profile picture updated.");

    } catch (error) {
        console.error("Profile picture upload error:", error);

        elements.profileAvatar.src = previousImage;

        URL.revokeObjectURL(temporaryImage);

        showToast(error.message || "Unable to upload your profile picture.");

    } finally {
        button.disabled = false;
        button.textContent = "✎";
        elements.profilePictureInput.value = "";
    }
}


// ==========================================
// LEARNING PATHS
// ==========================================

function displayLearningPaths(paths) {
    elements.learningGrid.replaceChildren();

    if (!paths.length) {
        elements.learningEmpty.classList.remove("hidden");
        return;
    }

    elements.learningEmpty.classList.add("hidden");

    const fragment = document.createDocumentFragment();

    paths.forEach(path => {
        const card = document.createElement("article");
        card.className = "learning-card";

        const pathName = path.path_name || "Learning Path";
        const initial = pathName.charAt(0).toUpperCase();

        card.innerHTML = `
            <div class="learning-card-top">
                <div class="learning-icon">${escapeHTML(initial)}</div>
                <span class="level-tag">
                    Level ${escapeHTML(path.current_level ?? 1)}
                </span>
            </div>

            <h3>${escapeHTML(pathName)}</h3>

            <p>Active learning path</p>

            <div class="learning-xp">
                ${formatNumber(path.path_xp)} XP earned
            </div>
        `;

        fragment.appendChild(card);
    });

    elements.learningGrid.appendChild(fragment);
}


// ==========================================
// BADGES
// ==========================================

function displayBadges(badges) {
    elements.badgesGrid.replaceChildren();

    if (!badges.length) {
        elements.badgesEmpty.classList.remove("hidden");
        return;
    }

    elements.badgesEmpty.classList.add("hidden");

    const fragment = document.createDocumentFragment();

    badges.forEach(badge => {
        const card = document.createElement("article");
        card.className = "badge-card";

        const imageHTML = badge.image_url
            ? `
                <img
                    src="${escapeHTML(badge.image_url)}"
                    alt="${escapeHTML(badge.badge_name)}"
                    class="badge-image"
                >
            `
            : `
                <span class="badge-placeholder">
                    ${escapeHTML((badge.badge_name || "B").charAt(0))}
                </span>
            `;

        card.innerHTML = `
            <div class="badge-image-wrapper">
                ${imageHTML}
            </div>

            <h3>${escapeHTML(badge.badge_name)}</h3>

            <p>${escapeHTML(badge.description)}</p>

            <span class="badge-category">
                ${escapeHTML(badge.badge_category)}
            </span>

            <span class="badge-earned-date">
                Earned ${escapeHTML(formatDate(badge.earned_at))}
            </span>
        `;

        const badgeImage = card.querySelector(".badge-image");

        if (badgeImage) {
            badgeImage.onerror = () => {
                const placeholder = document.createElement("span");

                placeholder.className = "badge-placeholder";
                placeholder.textContent =
                    (badge.badge_name || "B").charAt(0);

                badgeImage.replaceWith(placeholder);
            };
        }

        fragment.appendChild(card);
    });

    elements.badgesGrid.appendChild(fragment);
}


// ==========================================
// REELS GRID
// ==========================================

function displayReels(reels) {
    elements.reelsGrid.replaceChildren();

    if (!reels.length) {
        elements.reelsEmpty.classList.remove("hidden");
        return;
    }

    elements.reelsEmpty.classList.add("hidden");

    const fragment = document.createDocumentFragment();

    reels.forEach(reel => {
        const card = document.createElement("article");
        card.className = "reel-card";
        card.dataset.videoId = reel.video_id;

        const video = document.createElement("video");

        video.src = reel.video_url;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = "metadata";

        if (reel.thumbnail_url) {
            video.poster = reel.thumbnail_url;
        }

        const overlay = document.createElement("div");
        overlay.className = "reel-overlay";

        const playIcon = document.createElement("span");
        playIcon.className = "reel-play-icon";
        playIcon.textContent = "▶";

        const caption = document.createElement("p");
        caption.className = "reel-caption";
        caption.textContent = reel.caption || "Coding Reel";

        const engagement = document.createElement("div");
        engagement.className = "reel-engagement";

        const likes = document.createElement("span");
        likes.className = "reel-card-likes";
        likes.textContent = `♥ ${formatNumber(reel.like_count)}`;

        const comments = document.createElement("span");
        comments.className = "reel-card-comments";
        comments.textContent = `● ${formatNumber(reel.comment_count)}`;

        engagement.append(likes, comments);
        overlay.append(playIcon, caption, engagement);
        card.append(video, overlay);

        card.addEventListener("click", () => {
            openReelPreview(reel);
        });

        fragment.appendChild(card);
    });

    elements.reelsGrid.appendChild(fragment);
}


// ==========================================
// UPDATE REEL COUNTS ON PROFILE GRID
// ==========================================

function updateReelCardCounts(reel) {
    if (!reel) {
        return;
    }

    const card = elements.reelsGrid.querySelector(
        `[data-video-id="${reel.video_id}"]`
    );

    if (!card) {
        return;
    }

    const likes = card.querySelector(".reel-card-likes");
    const comments = card.querySelector(".reel-card-comments");

    if (likes) {
        likes.textContent = `♥ ${formatNumber(reel.like_count)}`;
    }

    if (comments) {
        comments.textContent = `● ${formatNumber(reel.comment_count)}`;
    }
}


// ==========================================
// REEL PREVIEW
// ==========================================

function openReelPreview(reel) {
    currentReel = reel;

    elements.reelPreviewVideo.pause();

    elements.reelPreviewVideo.src = reel.video_url;

    if (reel.thumbnail_url) {
        elements.reelPreviewVideo.poster = reel.thumbnail_url;
    } else {
        elements.reelPreviewVideo.removeAttribute("poster");
    }

    elements.reelPreviewCaption.textContent =
        reel.caption || "No caption provided.";

    elements.reelPreviewDate.textContent =
        formatDate(reel.created_at);

    updateReelEngagementDisplay();

    elements.reelCommentsList.innerHTML =
        '<p class="comments-loading">Loading comments...</p>';

    elements.reelCommentInput.value = "";

    elements.reelModal.classList.remove("hidden");

    elements.reelPreviewVideo.load();

    elements.reelPreviewVideo.play().catch(() => {
        // Playback may require the user to press Play.
    });

    loadReelComments(reel.video_id);
}

function closeReelPreview() {
    elements.reelPreviewVideo.pause();
    elements.reelPreviewVideo.removeAttribute("src");
    elements.reelPreviewVideo.load();

    elements.reelModal.classList.add("hidden");

    currentReel = null;
}

function updateReelEngagementDisplay() {
    if (!currentReel) {
        return;
    }

    elements.reelLikeCount.textContent =
        formatNumber(currentReel.like_count);

    elements.reelCommentCount.textContent =
        formatNumber(currentReel.comment_count);

    const liked = Boolean(currentReel.is_liked);

    elements.reelLikeIcon.textContent = liked ? "♥" : "♡";

    elements.reelLikeButton.classList.toggle(
        "liked",
        liked
    );
}


// ==========================================
// LIKE OR UNLIKE REEL
// ==========================================

async function toggleReelLike() {
    if (!currentReel) {
        return;
    }

    const button = elements.reelLikeButton;

    button.disabled = true;

    try {
        const response = await apiRequest(
            `/reels/${currentReel.video_id}/like`,
            {
                method: "POST"
            }
        );

        currentReel.is_liked = response.liked;
        currentReel.like_count = response.like_count;

        updateReelEngagementDisplay();
        updateReelCardCounts(currentReel);

    } catch (error) {
        console.error("Reel like error:", error);
        showToast(error.message || "Unable to update your like.");

    } finally {
        button.disabled = false;
    }
}


// ==========================================
// LOAD REEL COMMENTS
// ==========================================

async function loadReelComments(videoId) {
    elements.reelCommentsList.innerHTML =
        '<p class="comments-loading">Loading comments...</p>';

    try {
        const response = await apiRequest(
            `/reels/${videoId}/comments`
        );

        if (!currentReel || Number(currentReel.video_id) !== Number(videoId)) {
            return;
        }

        const comments = response.comments || [];

        currentReel.comment_count = comments.length;

        updateReelEngagementDisplay();
        updateReelCardCounts(currentReel);

        displayReelComments(comments);

    } catch (error) {
        console.error("Load Reel comments error:", error);

        elements.reelCommentsList.innerHTML = "";

        const message = document.createElement("p");
        message.className = "comments-error";
        message.textContent =
            error.message || "Unable to load comments.";

        elements.reelCommentsList.appendChild(message);
    }
}


// ==========================================
// DISPLAY REEL COMMENTS
// ==========================================

function displayReelComments(comments) {
    elements.reelCommentsList.replaceChildren();

    if (!comments.length) {
        const empty = document.createElement("p");
        empty.className = "comments-empty";
        empty.textContent = "No comments yet. Be the first to comment.";

        elements.reelCommentsList.appendChild(empty);
        return;
    }

    const fragment = document.createDocumentFragment();

    comments.forEach(comment => {
        const item = document.createElement("article");
        item.className = "comment-item";

        const creator = comment.creator || {};
        const username = creator.username || "Developer";

        const avatarLink = document.createElement("a");
        avatarLink.className = "comment-avatar-link";
        avatarLink.href =
            `profile.html?userId=${encodeURIComponent(comment.user_id)}`;

        const avatar = document.createElement("img");
        avatar.className = "comment-avatar";
        avatar.alt = `${username} profile picture`;
        avatar.src = getProfileAvatar(creator);

        avatar.onerror = () => {
            avatar.src = getAvatarFallback(creator);
        };

        avatarLink.appendChild(avatar);

        const content = document.createElement("div");
        content.className = "comment-content";

        const topLine = document.createElement("div");
        topLine.className = "comment-topline";

        const nameLink = document.createElement("a");
        nameLink.className = "comment-username";
        nameLink.href =
            `profile.html?userId=${encodeURIComponent(comment.user_id)}`;
        nameLink.textContent = `@${username}`;

        topLine.appendChild(nameLink);

        if (comment.is_own_comment) {
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-comment-button";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                deleteReelComment(comment.comment_id, deleteButton);
            });

            topLine.appendChild(deleteButton);
        }

        const text = document.createElement("p");
        text.className = "comment-text";
        text.textContent = comment.comment_text || "";

        const date = document.createElement("span");
        date.className = "comment-date";
        date.textContent = formatDate(comment.created_at);

        content.append(topLine, text, date);
        item.append(avatarLink, content);

        fragment.appendChild(item);
    });

    elements.reelCommentsList.appendChild(fragment);
}


// ==========================================
// ADD REEL COMMENT
// ==========================================

async function addReelComment(event) {
    event.preventDefault();

    if (!currentReel) {
        return;
    }

    const commentText = elements.reelCommentInput.value.trim();

    if (!commentText) {
        showToast("Please enter a comment.");
        return;
    }

    if (commentText.length > 1000) {
        showToast("Your comment cannot exceed 1000 characters.");
        return;
    }

    const button = elements.submitCommentButton;

    button.disabled = true;
    button.textContent = "Posting...";

    try {
        const response = await apiRequest(
            `/reels/${currentReel.video_id}/comments`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    comment_text: commentText
                })
            }
        );

        elements.reelCommentInput.value = "";

        // Add the new comment to the existing list.
        const existingComments = Array.from(
            elements.reelCommentsList.querySelectorAll(".comment-item")
        );

        const newComments = existingComments.map(item => item);

        const comment = response.comment;

        if (comment) {
            const creator = comment.creator || {};
            const username = creator.username || "Developer";

            const item = document.createElement("article");
            item.className = "comment-item";

            const avatarLink = document.createElement("a");
            avatarLink.className = "comment-avatar-link";
            avatarLink.href =
                `profile.html?userId=${encodeURIComponent(comment.user_id)}`;

            const avatar = document.createElement("img");
            avatar.className = "comment-avatar";
            avatar.alt = `${username} profile picture`;
            avatar.src = getProfileAvatar(creator);

            avatar.onerror = () => {
                avatar.src = getAvatarFallback(creator);
            };

            avatarLink.appendChild(avatar);

            const content = document.createElement("div");
            content.className = "comment-content";

            const topLine = document.createElement("div");
            topLine.className = "comment-topline";

            const nameLink = document.createElement("a");
            nameLink.className = "comment-username";
            nameLink.href =
                `profile.html?userId=${encodeURIComponent(comment.user_id)}`;
            nameLink.textContent = `@${username}`;

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-comment-button";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", () => {
                deleteReelComment(comment.comment_id, deleteButton);
            });

            topLine.append(nameLink, deleteButton);

            const text = document.createElement("p");
            text.className = "comment-text";
            text.textContent = comment.comment_text || "";

            const date = document.createElement("span");
            date.className = "comment-date";
            date.textContent = formatDate(comment.created_at);

            content.append(topLine, text, date);
            item.append(avatarLink, content);

            // Remove the empty message if it is currently displayed.
            elements.reelCommentsList.replaceChildren();

            newComments.forEach(existingComment => {
                elements.reelCommentsList.appendChild(existingComment);
            });

            elements.reelCommentsList.appendChild(item);
        }

        currentReel.comment_count =
            Number(currentReel.comment_count || 0) + 1;

        updateReelEngagementDisplay();
        updateReelCardCounts(currentReel);

        showToast(response.message || "Comment added.");

    } catch (error) {
        console.error("Add Reel comment error:", error);
        showToast(error.message || "Unable to add your comment.");

    } finally {
        button.disabled = false;
        button.textContent = "Post";
    }
}


// ==========================================
// DELETE OWN REEL COMMENT
// ==========================================

async function deleteReelComment(commentId, button) {
    if (!currentReel || !commentId) {
        return;
    }

    const confirmed = window.confirm(
        "Are you sure you want to delete this comment?"
    );

    if (!confirmed) {
        return;
    }

    button.disabled = true;
    button.textContent = "Deleting...";

    try {
        const response = await apiRequest(
            `/reels/comments/${commentId}`,
            {
                method: "DELETE"
            }
        );

        currentReel.comment_count = Math.max(
            0,
            Number(currentReel.comment_count || 0) - 1
        );

        updateReelEngagementDisplay();
        updateReelCardCounts(currentReel);

        await loadReelComments(currentReel.video_id);

        showToast(response.message || "Comment deleted.");

    } catch (error) {
        console.error("Delete comment error:", error);

        button.disabled = false;
        button.textContent = "Delete";

        showToast(error.message || "Unable to delete this comment.");
    }
}


// ==========================================
// FOLLOWERS AND FOLLOWING
// ==========================================

async function openUsersList(type) {
    if (!currentProfile) {
        return;
    }

    const userId = currentProfile.user_id;

    const isFollowers = type === "followers";

    elements.usersModalTitle.textContent =
        isFollowers ? "Followers" : "Following";

    elements.modalUsersList.replaceChildren();
    elements.modalEmpty.classList.add("hidden");
    elements.usersModal.classList.remove("hidden");

    const loading = document.createElement("p");
    loading.textContent = "Loading users...";
    loading.style.cssText =
        "padding:25px;text-align:center;color:#a1a1aa;";

    elements.modalUsersList.appendChild(loading);

    try {
        const response = await apiRequest(
            `/reels/profile/${encodeURIComponent(userId)}/${type}`
        );

        const users = response[type] || [];

        elements.modalUsersList.replaceChildren();

        if (!users.length) {
            elements.modalEmpty.classList.remove("hidden");
            return;
        }

        const fragment = document.createDocumentFragment();

        users.forEach(user => {
            const item = document.createElement("div");
            item.className = "user-list-item";

            const avatar = document.createElement("img");
            avatar.className = "user-list-avatar";
            avatar.alt = "User profile picture";
            avatar.src = user.profile_picture_url ||
                getAvatarFallback(user);

            avatar.onerror = () => {
                avatar.src = getAvatarFallback(user);
            };

            const info = document.createElement("div");
            info.className = "user-list-info";

            const name = document.createElement("h3");
            name.textContent = user.username || "Developer";

            const xp = document.createElement("p");
            xp.textContent =
                `${formatNumber(user.overall_xp)} overall XP`;

            const link = document.createElement("a");
            link.href =
                `profile.html?userId=${encodeURIComponent(user.user_id)}`;
            link.textContent = "View profile";

            info.append(name, xp);
            item.append(avatar, info, link);

            fragment.appendChild(item);
        });

        elements.modalUsersList.appendChild(fragment);

    } catch (error) {
        console.error("Load users list error:", error);

        elements.modalUsersList.replaceChildren();

        const errorMessage = document.createElement("p");
        errorMessage.textContent =
            error.message || "Unable to load users.";

        errorMessage.style.color = "#ff7777";
        errorMessage.style.padding = "20px";

        elements.modalUsersList.appendChild(errorMessage);
    }
}


// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    elements.followButton.addEventListener("click", toggleFollow);

    elements.followersButton.addEventListener("click", () => {
        openUsersList("followers");
    });

    elements.followingButton.addEventListener("click", () => {
        openUsersList("following");
    });

    elements.editAvatarButton.addEventListener("click", () => {
        if (isOwnProfile) {
            elements.profilePictureInput.click();
        }
    });

    elements.profilePictureInput.addEventListener("change", event => {
        const file = event.target.files[0];

        if (file) {
            uploadProfilePicture(file);
        }
    });

    elements.reelLikeButton.addEventListener(
        "click",
        toggleReelLike
    );

    elements.reelCommentForm.addEventListener(
        "submit",
        addReelComment
    );

    elements.closeUsersModal.addEventListener("click", () => {
        elements.usersModal.classList.add("hidden");
    });

    elements.closeReelModal.addEventListener(
        "click",
        closeReelPreview
    );

    elements.retryButton.addEventListener("click", loadProfile);

    elements.usersModal.addEventListener("click", event => {
        if (event.target === elements.usersModal) {
            elements.usersModal.classList.add("hidden");
        }
    });

    elements.reelModal.addEventListener("click", event => {
        if (event.target === elements.reelModal) {
            closeReelPreview();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            elements.usersModal.classList.add("hidden");
            closeReelPreview();
        }
    });
}


// ==========================================
// INITIALISE PROFILE PAGE
// ==========================================

async function initialiseProfilePage() {
    if (!getAccessToken()) {
        redirectToLogin();
        return;
    }

    setupNavigation();
    setupEventListeners();

    await loadProfile();
}

document.addEventListener(
    "DOMContentLoaded",
    initialiseProfilePage
);
