
const API_BASE = "http://localhost:5000/api";
const REELS_API = `${API_BASE}/reels`;

let currentFeed = "feed";
let currentOffset = 0;
const PAGE_SIZE = 10;

let currentUserId = null;
let currentUserProfile = null;
let currentCommentVideoId = null;

let isLoadingFeed = false;
let hasMoreVideos = true;
let currentSearch = "";

let selectedVideoObjectUrl = null;
let toastTimeout = null;

let soundEnabled = false;
let activeVideo = null;
let videoObserver = null;

let feedRequestController = null;
let feedRequestNumber = 0;
let searchTimeout = null;
let searchController = null;

const reelsFeed = document.getElementById("reelsFeed");
const forYouTab = document.getElementById("forYouTab");
const followingTab = document.getElementById("followingTab");

const loadMoreContainer = document.getElementById("loadMoreContainer");
const loadMoreButton = document.getElementById("loadMoreButton");

const uploadModal = document.getElementById("uploadModal");
const commentsModal = document.getElementById("commentsModal");

const uploadForm = document.getElementById("uploadForm");
const reelVideoInput = document.getElementById("reelVideo");
const reelCaption = document.getElementById("reelCaption");

const uploadVideoPreview = document.getElementById("uploadVideoPreview");
const uploadPlaceholder = document.getElementById("uploadPlaceholder");

const uploadMessage = document.getElementById("uploadMessage");
const commentMessage = document.getElementById("commentMessage");

const commentsList = document.getElementById("commentsList");
const commentForm = document.getElementById("commentForm");
const commentInput = document.getElementById("commentInput");

const submitUploadButton = document.getElementById("submitUploadButton");
const submitCommentButton = document.getElementById("submitCommentButton");

const searchForm = document.getElementById("reelSearchForm");
const searchInput = document.getElementById("reelSearchInput");
const clearSearchButton = document.getElementById("clearSearchButton");
const suggestionsBox = document.getElementById("reelSearchSuggestions");

const menuButton = document.getElementById("menuButton");
const mainNav = document.getElementById("mainNav");


// ==========================================
// AUTHENTICATION
// ==========================================

function getAccessToken() {
    return sessionStorage.getItem("supabaseAccessToken");
}

function getStoredUser() {
    try {
        const storedUser = sessionStorage.getItem("loggedInUser");
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Unable to read stored user:", error);
        return null;
    }
}

function redirectToLogin() {
    sessionStorage.removeItem("supabaseAccessToken");
    window.location.href = "login.html";
}

async function apiRequest(endpoint, options = {}) {
    const token = getAccessToken();

    if (!token) {
        redirectToLogin();
        throw new Error("Please log in to continue.");
    }

    const headers = {
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
    };

    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${REELS_API}${endpoint}`, {
        ...options,
        headers
    });

    let result;

    try {
        result = await response.json();
    } catch (error) {
        throw new Error("The server returned an invalid response.");
    }

    if (response.status === 401) {
        redirectToLogin();
        throw new Error("Your session has expired. Please log in again.");
    }

    if (!response.ok || result.success === false) {
        throw new Error(result.message || "Something went wrong.");
    }

    return result;
}


// ==========================================
// GENERAL HELPERS
// ==========================================

function showToast(message) {
    const toast = document.getElementById("toastMessage");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove("hidden");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.add("hidden");
    }, 3500);
}

function formatDate(dateValue) {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function getUsername(profile) {
    if (!profile) return "CodeXperts User";

    return profile.username ||
        `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
        "CodeXperts User";
}

function getInitial(profile) {
    return getUsername(profile).charAt(0).toUpperCase();
}

function createAvatar(profile, className) {
    if (profile && profile.profile_picture_url) {
        const image = document.createElement("img");

        image.src = profile.profile_picture_url;
        image.alt = `${getUsername(profile)} profile picture`;
        image.className = className;

        image.onerror = () => {
            const placeholder = document.createElement("div");
            placeholder.className = `${className}-placeholder`;
            placeholder.textContent = getInitial(profile);
            image.replaceWith(placeholder);
        };

        return image;
    }

    const placeholder = document.createElement("div");
    placeholder.className = `${className}-placeholder`;
    placeholder.textContent = getInitial(profile || {});

    return placeholder;
}

function getCurrentUserIdFromStorage() {
    const storedUser = getStoredUser();

    return storedUser?.user?.id ||
        storedUser?.user?.user_id ||
        storedUser?.id ||
        storedUser?.user_id ||
        null;
}

function showFeedMessage(title, description) {
    pauseAllVideos();

    if (videoObserver) {
        videoObserver.disconnect();
    }

    reelsFeed.innerHTML = "";

    const messageContainer = document.createElement("div");
    messageContainer.className = "feed-message";

    const heading = document.createElement("h3");
    heading.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.textContent = description;

    messageContainer.append(heading, paragraph);
    reelsFeed.appendChild(messageContainer);
}

function setFeedLoading() {
    pauseAllVideos();

    reelsFeed.innerHTML = "";

    const messageContainer = document.createElement("div");
    messageContainer.className = "feed-message";

    const spinner = document.createElement("div");
    spinner.className = "loading-spinner";

    const paragraph = document.createElement("p");
    paragraph.textContent = "Loading Reels...";

    messageContainer.append(spinner, paragraph);
    reelsFeed.appendChild(messageContainer);
}


// ==========================================
// PROFILE PICTURE
// ==========================================

function setProfilePicture(profile) {
    const profileLink = document.getElementById("profileInitial");

    if (!profileLink) return;

    profileLink.innerHTML = "";

    if (profile?.profile_picture_url) {
        const image = document.createElement("img");

        image.src = profile.profile_picture_url;
        image.alt = "Your profile";
        image.className = "nav-profile-image";

        image.onerror = () => {
            profileLink.textContent = getInitial(profile);
        };

        profileLink.appendChild(image);
    } else {
        profileLink.textContent = getInitial(profile || {});
    }

    if (currentUserId) {
        profileLink.href =
            `profile.html?userId=${encodeURIComponent(currentUserId)}`;
    }
}

async function loadCurrentUser() {
    currentUserId = getCurrentUserIdFromStorage();

    const storedUser = getStoredUser();
    currentUserProfile = storedUser?.user || storedUser || {};

    setProfilePicture(currentUserProfile);

    try {
        const result = await apiRequest("/my-profile");

        if (result.profile) {
            currentUserProfile = result.profile;

            if (result.profile.user_id) {
                currentUserId = result.profile.user_id;
            }

            setProfilePicture(currentUserProfile);
        }
    } catch (error) {
        console.error("Unable to load current profile:", error);
    }
}


// ==========================================
// VIDEO PLAYBACK
// ==========================================

function pauseAllVideos(exceptVideo = null) {
    document.querySelectorAll(".reel-video").forEach(video => {
        if (video !== exceptVideo) {
            video.pause();
        }
    });
}

function updateSoundButton(button, isMuted) {
    if (!button) return;

    button.textContent = isMuted ? "🔇" : "🔊";
    button.setAttribute(
        "aria-label",
        isMuted ? "Enable sound" : "Mute video"
    );
    button.title = isMuted ? "Enable sound" : "Mute video";
}

function activateVideo(video) {
    if (!video || video === activeVideo && !video.paused) return;

    pauseAllVideos(video);

    activeVideo = video;
    video.muted = !soundEnabled;

    const card = video.closest(".reel-card");
    const soundButton = card?.querySelector(".reel-sound-button");

    updateSoundButton(soundButton, video.muted);

    const playPromise = video.play();

    if (playPromise?.catch) {
        playPromise.catch(() => {
            // Browser autoplay restrictions may require user interaction.
        });
    }
}

function initialiseVideoObserver() {
    if (videoObserver) {
        videoObserver.disconnect();
    }

    if (!("IntersectionObserver" in window)) {
        return;
    }

    videoObserver = new IntersectionObserver(entries => {
        const visibleCards = Array.from(
            document.querySelectorAll(".reel-card")
        )
            .map(card => ({
                card,
                rect: card.getBoundingClientRect()
            }))
            .filter(item =>
                item.rect.top < window.innerHeight &&
                item.rect.bottom > 0
            )
            .sort((a, b) => {
                const aCenter = Math.abs(
                    (a.rect.top + a.rect.bottom) / 2 -
                    window.innerHeight / 2
                );

                const bCenter = Math.abs(
                    (b.rect.top + b.rect.bottom) / 2 -
                    window.innerHeight / 2
                );

                return aCenter - bCenter;
            });

        const bestCard = visibleCards[0]?.card;

        if (!bestCard) {
            if (activeVideo) {
                activeVideo.pause();
                activeVideo = null;
            }
            return;
        }

        const video = bestCard.querySelector(".reel-video");

        if (video) {
            activateVideo(video);
        }

    }, {
        threshold: [0, 0.25, 0.5, 0.65, 0.8, 1]
    });

    document.querySelectorAll(".reel-card").forEach(card => {
        videoObserver.observe(card);
    });
}

function toggleVideoSound(video, button) {
    if (!video) return;

    soundEnabled = video.muted;
    video.muted = !soundEnabled;

    if (soundEnabled) {
        activeVideo = video;

        const playPromise = video.play();

        if (playPromise?.catch) {
            playPromise.catch(() => {});
        }
    }

    document.querySelectorAll(".reel-video").forEach(otherVideo => {
        otherVideo.muted = !soundEnabled;

        const otherButton = otherVideo
            .closest(".reel-card")
            ?.querySelector(".reel-sound-button");

        updateSoundButton(otherButton, otherVideo.muted);
    });
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        pauseAllVideos();
    } else {
        initialiseVideoObserver();
    }
});


// ==========================================
// FEED TABS
// ==========================================

function switchFeed(feedType) {
    currentFeed = feedType;
    currentSearch = "";

    searchInput.value = "";
    clearSearchButton.classList.add("hidden");

    closeSuggestions();

    forYouTab.classList.toggle("active", feedType === "feed");
    followingTab.classList.toggle("active", feedType === "following");

    document.getElementById("feedDescription").textContent =
        feedType === "feed"
            ? "Discover the latest coding content."
            : "Watch Reels from developers you follow.";

    loadFeed(true);
}

forYouTab.addEventListener("click", () => {
    if (currentFeed !== "feed" || currentSearch) {
        switchFeed("feed");
    }
});

followingTab.addEventListener("click", () => {
    if (currentFeed !== "following" || currentSearch) {
        switchFeed("following");
    }
});


// ==========================================
// SEARCH SUGGESTIONS
// ==========================================

function closeSuggestions() {
    suggestionsBox.classList.add("hidden");
    suggestionsBox.innerHTML = "";
}

function showSuggestionStatus(message) {
    suggestionsBox.innerHTML = "";

    const status = document.createElement("div");
    status.className = "reel-search-status";
    status.textContent = message;

    suggestionsBox.appendChild(status);
    suggestionsBox.classList.remove("hidden");
}

function createSearchSuggestion(video) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "reel-search-suggestion";

    const creator = video.creator || {};
    const username = getUsername(creator);

    button.appendChild(createAvatar(creator, "reel-search-avatar"));

    const details = document.createElement("div");
    details.className = "reel-search-details";

    const name = document.createElement("strong");
    name.textContent = creator.username
        ? `@${creator.username}`
        : username;

    const caption = document.createElement("span");
    caption.textContent = video.caption || "Reel by this creator";

    details.append(name, caption);
    button.appendChild(details);

    button.addEventListener("click", () => {
        searchInput.value = searchInput.value.trim();
        closeSuggestions();
        submitSearch();
    });

    return button;
}

async function searchSuggestions(query) {
    if (searchController) {
        searchController.abort();
    }

    const controller = new AbortController();
    searchController = controller;

    try {
        showSuggestionStatus("Searching...");

        const result = await apiRequest(
            `/search?q=${encodeURIComponent(query)}&limit=6&offset=0`,
            { signal: controller.signal }
        );

        if (searchController !== controller) return;

        const videos = result.videos || [];

        suggestionsBox.innerHTML = "";

        if (videos.length === 0) {
            showSuggestionStatus("No matching Reels or creators found.");
            return;
        }

        videos.forEach(video => {
            suggestionsBox.appendChild(createSearchSuggestion(video));
        });

        suggestionsBox.classList.remove("hidden");

    } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Search suggestions error:", error);
        showSuggestionStatus("Unable to load suggestions.");
    }
}

searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();

    clearSearchButton.classList.toggle("hidden", !query);

    clearTimeout(searchTimeout);

    if (searchController) {
        searchController.abort();
    }

    if (!query) {
        closeSuggestions();
        return;
    }

    searchTimeout = setTimeout(() => {
        searchSuggestions(query);
    }, 350);
});

function submitSearch() {
    const query = searchInput.value.trim();

    if (!query) {
        showToast("Enter a creator name or search term.");
        return;
    }

    currentSearch = query;

    forYouTab.classList.remove("active");
    followingTab.classList.remove("active");

    document.getElementById("feedDescription").textContent =
        `Search results for "${query}"`;

    closeSuggestions();
    loadFeed(true);
}

searchForm.addEventListener("submit", event => {
    event.preventDefault();
    submitSearch();
});

clearSearchButton.addEventListener("click", () => {
    searchInput.value = "";
    currentSearch = "";

    clearSearchButton.classList.add("hidden");
    closeSuggestions();

    switchFeed("feed");
});

document.addEventListener("click", event => {
    if (
        !searchForm.contains(event.target) &&
        !suggestionsBox.contains(event.target)
    ) {
        closeSuggestions();
    }
});

searchInput.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeSuggestions();
    }
});


// ==========================================
// LOAD FEED
// ==========================================

async function loadFeed(reset = false) {
    if (!reset && isLoadingFeed) return;
    if (!reset && !hasMoreVideos) return;

    if (reset && feedRequestController) {
        feedRequestController.abort();
    }

    if (reset) {
        currentOffset = 0;
        hasMoreVideos = true;

        setFeedLoading();
        loadMoreContainer.classList.add("hidden");
    }

    const requestNumber = ++feedRequestNumber;
    const controller = new AbortController();

    feedRequestController = controller;

    isLoadingFeed = true;
    loadMoreButton.disabled = true;
    loadMoreButton.textContent = "Loading...";

    try {
        let endpoint;

        if (currentSearch) {
            endpoint =
                `/search?q=${encodeURIComponent(currentSearch)}` +
                `&limit=${PAGE_SIZE}&offset=${currentOffset}`;
        } else {
            endpoint = currentFeed === "following"
                ? "/following"
                : "/feed";

            endpoint += `?limit=${PAGE_SIZE}&offset=${currentOffset}`;
        }

        const result = await apiRequest(endpoint, {
            signal: controller.signal
        });

        if (requestNumber !== feedRequestNumber) return;

        const videos = result.videos || [];

        if (reset) {
            reelsFeed.innerHTML = "";
        }

        if (videos.length === 0 && currentOffset === 0) {
            if (currentSearch) {
                showFeedMessage(
                    "No matching Reels found",
                    "Try searching for another creator or keyword."
                );
            } else if (currentFeed === "following") {
                showFeedMessage(
                    "Your Following feed is empty",
                    "Follow other developers to see their Reels here."
                );
            } else {
                showFeedMessage(
                    "No Reels yet",
                    "Be the first to share something with the CodeXperts community."
                );
            }

            hasMoreVideos = false;
            loadMoreContainer.classList.add("hidden");
            return;
        }

        videos.forEach(video => {
            reelsFeed.appendChild(createReelCard(video));
        });

        currentOffset += videos.length;
        hasMoreVideos = videos.length === PAGE_SIZE;

        loadMoreContainer.classList.toggle(
            "hidden",
            !hasMoreVideos
        );

        initialiseVideoObserver();

    } catch (error) {
        if (error.name === "AbortError") return;
        if (requestNumber !== feedRequestNumber) return;

        console.error("Load Reels error:", error);

        if (reset) {
            showFeedMessage(
                "Unable to load Reels",
                error.message || "Please refresh the page and try again."
            );
        } else {
            showToast(error.message);
        }

    } finally {
        if (requestNumber === feedRequestNumber) {
            isLoadingFeed = false;
            feedRequestController = null;

            loadMoreButton.disabled = false;
            loadMoreButton.textContent = "Load more Reels";
        }
    }
}

loadMoreButton.addEventListener("click", () => {
    loadFeed(false);
});


// ==========================================
// CREATE REEL CARD
// ==========================================

function createReelCard(video) {
    const card = document.createElement("article");

    card.className = "reel-card";
    card.dataset.videoId = video.video_id;
    card.dataset.creatorId = video.user_id;

    const creator = video.creator || {};
    const isOwnVideo = video.user_id === currentUserId;

    const mediaContainer = document.createElement("div");
    mediaContainer.className = "reel-media-container";

    const videoElement = document.createElement("video");

    videoElement.className = "reel-video";
    videoElement.src = video.video_url;
    videoElement.controls = true;
    videoElement.playsInline = true;
    videoElement.preload = "metadata";
    videoElement.muted = !soundEnabled;

    videoElement.addEventListener("error", () => {
        showToast("This video could not be played.");
    });

    mediaContainer.appendChild(videoElement);

    const soundButton = document.createElement("button");

    soundButton.type = "button";
    soundButton.className = "reel-sound-button";

    updateSoundButton(soundButton, videoElement.muted);

    soundButton.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        toggleVideoSound(videoElement, soundButton);
    });

    mediaContainer.appendChild(soundButton);

    if (video.caption) {
        const caption = document.createElement("p");

        caption.className = "reel-caption";
        caption.textContent = video.caption;

        mediaContainer.appendChild(caption);
    }

    const creatorInfo = document.createElement("div");
    creatorInfo.className = "reel-creator-info";

    const creatorLink = document.createElement("a");

    creatorLink.className = "reel-creator-avatar-link";
    creatorLink.href =
        `profile.html?userId=${encodeURIComponent(video.user_id)}`;

    creatorLink.setAttribute(
        "aria-label",
        `View ${getUsername(creator)}'s profile`
    );

    creatorLink.appendChild(createAvatar(creator, "reel-avatar"));
    creatorInfo.appendChild(creatorLink);

    if (!isOwnVideo) {
        const followButton = document.createElement("button");

        followButton.type = "button";
        followButton.className = "reel-follow-button";

        updateFollowButton(followButton, video.is_following_creator);

        followButton.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            toggleFollow(video.user_id, followButton);
        });

        creatorInfo.appendChild(followButton);
    }

    mediaContainer.appendChild(creatorInfo);

    const actions = document.createElement("div");
    actions.className = "reel-actions";

    const likeButton = document.createElement("button");

    likeButton.type = "button";
    likeButton.className = "reel-action";

    if (video.is_liked) {
        likeButton.classList.add("liked");
    }

    const likeIcon = document.createElement("span");
    likeIcon.className = "action-icon";
    likeIcon.textContent = "♥";

    const likeCount = document.createElement("span");
    likeCount.className = "action-count";
    likeCount.textContent = video.like_count || 0;

    likeButton.append(likeIcon, likeCount);

    likeButton.addEventListener("click", () => {
        toggleLike(video.video_id, likeButton);
    });

    actions.appendChild(likeButton);

    const commentButton = document.createElement("button");

    commentButton.type = "button";
    commentButton.className = "reel-action";

    const commentIcon = document.createElement("span");
    commentIcon.className = "action-icon";
    commentIcon.textContent = "▤";

    const commentCount = document.createElement("span");
    commentCount.className = "action-count";
    commentCount.textContent = video.comment_count || 0;

    commentButton.append(commentIcon, commentCount);

    commentButton.addEventListener("click", () => {
        openComments(video.video_id, commentCount);
    });

    actions.appendChild(commentButton);

    if (isOwnVideo) {
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "reel-action delete-action";

        const deleteIcon = document.createElement("span");
        deleteIcon.className = "action-icon";
        deleteIcon.textContent = "×";

        const deleteLabel = document.createElement("span");
        deleteLabel.textContent = "Delete";

        deleteButton.append(deleteIcon, deleteLabel);

        deleteButton.addEventListener("click", () => {
            deleteReel(video.video_id, card);
        });

        actions.appendChild(deleteButton);
    }

    const date = document.createElement("p");
    date.className = "reel-date";
    date.textContent = formatDate(video.created_at);

    actions.appendChild(date);

    card.append(mediaContainer, actions);

    return card;
}


// ==========================================
// LIKE REEL
// ==========================================

async function toggleLike(videoId, button) {
    if (button.disabled) return;

    button.disabled = true;

    try {
        const result = await apiRequest(`/${videoId}/like`, {
            method: "POST"
        });

        button.classList.toggle("liked", result.liked);

        const countElement = button.querySelector(".action-count");

        if (countElement) {
            countElement.textContent = result.like_count;
        }

    } catch (error) {
        console.error("Like error:", error);
        showToast(error.message);

    } finally {
        button.disabled = false;
    }
}


// ==========================================
// FOLLOW CREATOR
// ==========================================

function updateFollowButton(button, isFollowing) {
    button.textContent = isFollowing ? "✓" : "+";

    button.classList.toggle("following", Boolean(isFollowing));

    button.setAttribute(
        "aria-label",
        isFollowing ? "Unfollow creator" : "Follow creator"
    );

    button.title = isFollowing ? "Unfollow creator" : "Follow creator";
}

async function toggleFollow(userId, button) {
    if (button.disabled) return;

    button.disabled = true;

    try {
        const result = await apiRequest(
            `/follow/${encodeURIComponent(userId)}`,
            { method: "POST" }
        );

        const isFollowing = Boolean(result.following);

        reelsFeed.querySelectorAll(".reel-card").forEach(card => {
            if (card.dataset.creatorId === userId) {
                const followButton =
                    card.querySelector(".reel-follow-button");

                if (followButton) {
                    updateFollowButton(followButton, isFollowing);
                }
            }
        });

        showToast(
            result.message ||
            (isFollowing
                ? "You are now following this creator."
                : "You unfollowed this creator.")
        );

    } catch (error) {
        console.error("Follow error:", error);
        showToast(error.message);

    } finally {
        button.disabled = false;
    }
}


// ==========================================
// DELETE REEL
// ==========================================

async function deleteReel(videoId, card) {
    const confirmed = window.confirm(
        "Are you sure you want to delete this Reel? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
        const result = await apiRequest(`/${videoId}`, {
            method: "DELETE"
        });

        const video = card.querySelector(".reel-video");

        if (video) {
            video.pause();
            video.removeAttribute("src");
            video.load();
        }

        card.remove();

        showToast(result.message || "Your Reel has been deleted.");

        if (reelsFeed.querySelectorAll(".reel-card").length === 0) {
            showFeedMessage(
                "No Reels yet",
                "Share your first Reel with the CodeXperts community."
            );
        }

    } catch (error) {
        console.error("Delete Reel error:", error);
        showToast(error.message);
    }
}


// ==========================================
// COMMENTS
// ==========================================

async function openComments(videoId, commentCountElement) {
    pauseAllVideos();

    currentCommentVideoId = videoId;

    commentsModal.classList.remove("hidden");
    commentsList.innerHTML = "";

    const loading = document.createElement("p");
    loading.className = "comments-placeholder";
    loading.textContent = "Loading comments...";

    commentsList.appendChild(loading);

    commentMessage.textContent = "";
    commentInput.value = "";

    await loadComments(videoId, commentCountElement);
}

async function loadComments(videoId, commentCountElement = null) {
    try {
        const result = await apiRequest(`/${videoId}/comments`);

        commentsList.innerHTML = "";

        const comments = result.comments || [];

        if (commentCountElement) {
            commentCountElement.textContent = comments.length;
        }

        if (comments.length === 0) {
            const emptyMessage = document.createElement("p");

            emptyMessage.className = "comments-placeholder";
            emptyMessage.textContent =
                "No comments yet. Be the first to comment.";

            commentsList.appendChild(emptyMessage);
            return;
        }

        comments.forEach(comment => {
            commentsList.appendChild(createCommentElement(comment));
        });

    } catch (error) {
        console.error("Load comments error:", error);

        commentsList.innerHTML = "";

        const errorMessage = document.createElement("p");
        errorMessage.className = "comments-placeholder";
        errorMessage.textContent =
            error.message || "Unable to load comments.";

        commentsList.appendChild(errorMessage);
    }
}

function createCommentElement(comment) {
    const item = document.createElement("div");
    item.className = "comment-item";

    const creator = comment.creator || {};

    item.appendChild(createAvatar(creator, "comment-avatar"));

    const content = document.createElement("div");
    content.className = "comment-content";

    const username = document.createElement("strong");
    username.textContent = getUsername(creator);

    const text = document.createElement("p");
    text.textContent = comment.comment_text;

    content.append(username, text);

    if (comment.is_own_comment) {
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "comment-delete-button";
        deleteButton.textContent = "Delete comment";

        deleteButton.addEventListener("click", () => {
            deleteComment(comment.comment_id, item);
        });

        content.appendChild(deleteButton);
    }

    item.appendChild(content);

    return item;
}

commentForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!currentCommentVideoId) return;

    const commentText = commentInput.value.trim();

    if (!commentText) {
        commentMessage.textContent = "Please enter a comment.";
        return;
    }

    if (commentText.length > 1000) {
        commentMessage.textContent =
            "Your comment cannot exceed 1000 characters.";
        return;
    }

    submitCommentButton.disabled = true;
    submitCommentButton.textContent = "Sending...";
    commentMessage.textContent = "";

    try {
        const result = await apiRequest(
            `/${currentCommentVideoId}/comments`,
            {
                method: "POST",
                body: JSON.stringify({
                    comment_text: commentText
                })
            }
        );

        commentInput.value = "";

        if (commentsList.querySelector(".comments-placeholder")) {
            commentsList.innerHTML = "";
        }

        commentsList.appendChild(createCommentElement(result.comment));
        commentsList.scrollTop = commentsList.scrollHeight;

        updateCommentCount(currentCommentVideoId, 1);

        showToast(result.message || "Comment added.");

    } catch (error) {
        console.error("Add comment error:", error);
        commentMessage.textContent = error.message;

    } finally {
        submitCommentButton.disabled = false;
        submitCommentButton.textContent = "Send";
    }
});

async function deleteComment(commentId, commentElement) {
    const confirmed = window.confirm(
        "Are you sure you want to delete this comment?"
    );

    if (!confirmed) return;

    try {
        const result = await apiRequest(`/comments/${commentId}`, {
            method: "DELETE"
        });

        commentElement.remove();

        updateCommentCount(currentCommentVideoId, -1);

        if (commentsList.children.length === 0) {
            const emptyMessage = document.createElement("p");

            emptyMessage.className = "comments-placeholder";
            emptyMessage.textContent =
                "No comments yet. Be the first to comment.";

            commentsList.appendChild(emptyMessage);
        }

        showToast(result.message || "Comment deleted.");

    } catch (error) {
        console.error("Delete comment error:", error);
        showToast(error.message);
    }
}

function updateCommentCount(videoId, change) {
    const card = reelsFeed.querySelector(
        `.reel-card[data-video-id="${videoId}"]`
    );

    if (!card) return;

    const commentButton = card.querySelectorAll(".reel-action")[1];

    if (!commentButton) return;

    const countElement = commentButton.querySelector(".action-count");

    if (!countElement) return;

    const currentCount = Number(countElement.textContent) || 0;

    countElement.textContent = Math.max(0, currentCount + change);
}

function closeCommentsModal() {
    commentsModal.classList.add("hidden");
    currentCommentVideoId = null;

    initialiseVideoObserver();
}

document.getElementById("closeCommentsButton")
    .addEventListener("click", closeCommentsModal);

commentsModal.addEventListener("click", event => {
    if (event.target === commentsModal) {
        closeCommentsModal();
    }
});


// ==========================================
// UPLOAD MODAL
// ==========================================

function openUploadModal() {
    pauseAllVideos();

    uploadModal.classList.remove("hidden");
    uploadMessage.textContent = "";
}

function closeUploadModal() {
    uploadModal.classList.add("hidden");

    uploadForm.reset();

    uploadMessage.textContent = "";
    document.getElementById("captionCount").textContent = "0";

    uploadVideoPreview.pause();
    uploadVideoPreview.removeAttribute("src");
    uploadVideoPreview.load();

    uploadVideoPreview.classList.add("hidden");
    uploadPlaceholder.classList.remove("hidden");

    if (selectedVideoObjectUrl) {
        URL.revokeObjectURL(selectedVideoObjectUrl);
        selectedVideoObjectUrl = null;
    }

    initialiseVideoObserver();
}

document.getElementById("openUploadButton")
    .addEventListener("click", openUploadModal);

document.getElementById("closeUploadButton")
    .addEventListener("click", closeUploadModal);

uploadModal.addEventListener("click", event => {
    if (event.target === uploadModal) {
        closeUploadModal();
    }
});


// ==========================================
// VIDEO PREVIEW
// ==========================================

reelVideoInput.addEventListener("change", () => {
    const file = reelVideoInput.files[0];

    uploadMessage.textContent = "";

    if (!file) return;

    const allowedTypes = [
        "video/mp4",
        "video/quicktime",
        "video/webm"
    ];

    if (!allowedTypes.includes(file.type)) {
        uploadMessage.textContent =
            "Please choose an MP4, MOV or WebM video.";

        reelVideoInput.value = "";
        return;
    }

    if (file.size > 100 * 1024 * 1024) {
        uploadMessage.textContent =
            "Your video cannot be larger than 100 MB.";

        reelVideoInput.value = "";
        return;
    }

    if (selectedVideoObjectUrl) {
        URL.revokeObjectURL(selectedVideoObjectUrl);
    }

    selectedVideoObjectUrl = URL.createObjectURL(file);

    uploadVideoPreview.src = selectedVideoObjectUrl;

    uploadVideoPreview.classList.remove("hidden");
    uploadPlaceholder.classList.add("hidden");
});

reelCaption.addEventListener("input", () => {
    document.getElementById("captionCount").textContent =
        reelCaption.value.length;
});


// ==========================================
// UPLOAD REEL
// ==========================================

uploadForm.addEventListener("submit", async event => {
    event.preventDefault();

    const file = reelVideoInput.files[0];
    const caption = reelCaption.value.trim();

    uploadMessage.textContent = "";

    if (!file) {
        uploadMessage.textContent = "Please select a video.";
        return;
    }

    if (caption.length > 2200) {
        uploadMessage.textContent =
            "Your caption cannot exceed 2200 characters.";
        return;
    }

    const formData = new FormData();

    formData.append("video", file);
    formData.append("caption", caption);

    submitUploadButton.disabled = true;
    submitUploadButton.textContent = "Uploading...";

    try {
        const result = await apiRequest("/upload", {
            method: "POST",
            body: formData
        });

        closeUploadModal();

        showToast(result.message || "Your Reel has been uploaded.");

        currentSearch = "";
        searchInput.value = "";
        clearSearchButton.classList.add("hidden");

        switchFeed("feed");

    } catch (error) {
        console.error("Upload Reel error:", error);
        uploadMessage.textContent = error.message;

    } finally {
        submitUploadButton.disabled = false;
        submitUploadButton.textContent = "Upload Reel";
    }
});


// ==========================================
// MOBILE NAVIGATION
// ==========================================

menuButton.addEventListener("click", () => {
    mainNav.classList.toggle("open");
});


// ==========================================
// INITIALISE PAGE
// ==========================================

async function initialiseReelsPage() {
    if (!getAccessToken()) {
        redirectToLogin();
        return;
    }

    await loadCurrentUser();
    await loadFeed(true);
}

initialiseReelsPage();
