
const API_BASE_URL = "http://localhost:5000/api/help";
const NOTIFICATION_API_URL = "http://localhost:5000/api/community";
const DASHBOARD_API_URL = "http://localhost:5000/api";

const accessToken = sessionStorage.getItem("supabaseAccessToken");

const questionContainer = document.getElementById("questionContainer");
const repliesSection = document.getElementById("repliesSection");
const repliesContainer = document.getElementById("repliesContainer");
const replyForm = document.getElementById("replyForm");
const replyText = document.getElementById("replyText");
const submitReplyButton = document.getElementById("submitReplyButton");
const replyCount = document.getElementById("replyCount");
const replyCharCount = document.getElementById("replyCharCount");
const replyFormSection = document.getElementById("replyFormSection");
const solvedMessage = document.getElementById("solvedMessage");
const pageMessage = document.getElementById("pageMessage");

const replyImages = document.getElementById("replyImages");
const replyImagePreview = document.getElementById("replyImagePreview");

const menuButton = document.getElementById("menuButton");
const mainNav = document.getElementById("mainNav");

const notificationButton = document.getElementById("notificationButton");
const notificationPanel = document.getElementById("notificationPanel");
const notificationList = document.getElementById("notificationList");
const notificationCount = document.getElementById("notificationCount");
const closeNotifications = document.getElementById("closeNotifications");

const profileInitial = document.getElementById("profileInitial");
const topStreak = document.getElementById("topStreak");
const topXp = document.getElementById("topXp");

const imageLightbox = document.getElementById("imageLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const closeImageLightbox = document.getElementById("closeImageLightbox");

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

let currentPost = null;
let currentUserId = null;
let currentReplies = [];

let selectedReplyImages = [];
let notifications = [];

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];


// ==========================================
// AUTHENTICATION
// ==========================================

if (!accessToken) {
    window.location.href = "login.html";
}


// ==========================================
// API REQUEST HELPERS
// ==========================================

async function apiRequest(endpoint, options = {}, baseURL = API_BASE_URL) {

    const isFormData = options.body instanceof FormData;

    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        ...(options.headers || {})
    };

    if (!isFormData && options.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${baseURL}${endpoint}`, {
        ...options,
        headers
    });

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Something went wrong. Please try again."
        );
    }

    return data;
}


// ==========================================
// GENERAL HELPERS
// ==========================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}


function normalizeRelation(value) {

    if (Array.isArray(value)) {
        return value[0] || {};
    }

    return value || {};
}


function formatDate(dateValue) {

    if (!dateValue) return "Recently";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Recently";
    }

    return date.toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short"
    });
}


function getInitial(username) {

    return escapeHTML(
        (username || "U").trim().charAt(0).toUpperCase()
    );
}


function getAvatar(profile) {

    const picture = profile.profile_picture_url;

    if (picture) {

        return `
            <img
                class="author-avatar"
                src="${escapeHTML(picture)}"
                alt="Profile picture"
                onerror="this.style.display='none';this.nextElementSibling.style.display='grid';"
            >

            <span class="author-avatar initial-avatar" style="display:none">
                ${getInitial(profile.username)}
            </span>
        `;
    }

    return `
        <span class="author-avatar initial-avatar">
            ${getInitial(profile.username)}
        </span>
    `;
}


function showMessage(message, type = "error") {

    pageMessage.textContent = message;
    pageMessage.className = `page-message ${type}`;

    pageMessage.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}


function hideMessage() {

    pageMessage.textContent = "";
    pageMessage.className = "page-message hidden";
}


function getStatusLabel(status) {

    const labels = {
        unanswered: "Unanswered",
        answered: "Answered",
        solved: "Solved"
    };

    return labels[status] || status || "Unanswered";
}


function getImageHTML(images, className) {

    if (!Array.isArray(images) || images.length === 0) {
        return "";
    }

    return `
        <div class="${className}">
            ${images.map(image => {

                if (!image.image_url) return "";

                return `
                    <img
                        src="${escapeHTML(image.image_url)}"
                        alt="Attached image"
                        loading="lazy"
                    >
                `;

            }).join("")}
        </div>
    `;
}


// ==========================================
// DASHBOARD NAVIGATION
// ==========================================

function setupNavigation() {

    menuButton?.addEventListener("click", () => {

        const isOpen = mainNav.classList.toggle("open");

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });


    mainNav?.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            mainNav.classList.remove("open");

            menuButton?.setAttribute(
                "aria-expanded",
                "false"
            );
        });
    });
}


// ==========================================
// PROFILE DISPLAY
// ==========================================

function displayUser() {

    const storedUser = sessionStorage.getItem("loggedInUser");

    if (!storedUser || !profileInitial) return;

    try {

        const parsedUser = JSON.parse(storedUser);
        const user = parsedUser?.user || parsedUser || {};

        const name =
            user.first_name ||
            user.firstName ||
            user.username ||
            "Learner";

        profileInitial.textContent =
            name.trim().charAt(0).toUpperCase();

    } catch (error) {

        console.error("Could not load profile information:", error);
    }
}


// ==========================================
// DASHBOARD STREAK AND XP
// ==========================================

async function loadTopStats() {

    try {

        const data = await apiRequest(
            "/paths/dashboard/stats",
            {},
            DASHBOARD_API_URL
        );

        const streak = data.streak || {};

        const currentStreak = Number(
            streak.currentStreak || 0
        );

        const overallXp = Number(
            data.xp?.overallXp || 0
        );

        if (topStreak) {
            topStreak.textContent = currentStreak;
        }

        if (topXp) {
            topXp.textContent = overallXp.toLocaleString();
        }

    } catch (error) {

        console.error("Could not load dashboard statistics:", error);
    }
}


// ==========================================
// NOTIFICATIONS
// ==========================================

async function loadNotifications() {

    if (!notificationList) return;

    notificationList.innerHTML = `
        <div class="notification-loading">
            Loading notifications...
        </div>
    `;

    try {

        const data = await apiRequest(
            "/notifications",
            {},
            NOTIFICATION_API_URL
        );

        notifications = Array.isArray(data.notifications)
            ? data.notifications
            : [];

        renderNotifications();

    } catch (error) {

        console.error("Could not load notifications:", error);

        notificationList.innerHTML = `
            <div class="notification-empty">
                Notifications could not be loaded.
                Please try again.
            </div>
        `;
    }
}


function renderNotifications() {

    if (!notificationList) return;

    const unreadNotifications = notifications.filter(
        notification => !notification.is_read
    );

    if (notificationCount) {

        if (unreadNotifications.length > 0) {

            notificationCount.textContent =
                unreadNotifications.length > 99
                    ? "99+"
                    : unreadNotifications.length;

            notificationCount.classList.remove("hidden");

        } else {

            notificationCount.classList.add("hidden");
        }
    }


    if (notifications.length === 0) {

        notificationList.innerHTML = `
            <div class="notification-empty">
                You're all caught up.
                <br>
                No notifications yet.
            </div>
        `;

        return;
    }


    notificationList.innerHTML = notifications.map(notification => {

        const isUnread = !notification.is_read;

        return `
            <button
                type="button"
                class="notification-item ${isUnread ? "unread" : ""}"
                data-notification-id="${escapeHTML(notification.notification_id)}"
            >

                <strong>
                    ${escapeHTML(notification.title || "Notification")}
                </strong>

                <p>
                    ${escapeHTML(notification.message || "")}
                </p>

                <small>
                    ${formatDate(notification.created_at)}
                </small>

            </button>
        `;

    }).join("");


    notificationList
        .querySelectorAll(".notification-item")
        .forEach(item => {

            item.addEventListener("click", () => {

                markNotificationAsRead(
                    item.dataset.notificationId
                );

            });
        });
}


async function markNotificationAsRead(notificationId) {

    if (!notificationId) return;

    const notification = notifications.find(item =>
        String(item.notification_id) === String(notificationId)
    );

    if (!notification || notification.is_read) return;

    try {

        await apiRequest(
            `/notifications/${encodeURIComponent(notificationId)}/read`,
            {
                method: "PATCH"
            },
            NOTIFICATION_API_URL
        );

        await loadNotifications();

    } catch (error) {

        console.error("Could not mark notification as read:", error);
    }
}


function setupNotifications() {

    notificationButton?.addEventListener("click", async event => {

        event.stopPropagation();

        const isOpening =
            notificationPanel.classList.contains("hidden");

        notificationPanel.classList.toggle("hidden", !isOpening);

        notificationButton.setAttribute(
            "aria-expanded",
            String(isOpening)
        );

        if (isOpening) {
            await loadNotifications();
        }
    });


    closeNotifications?.addEventListener("click", () => {

        notificationPanel.classList.add("hidden");

        notificationButton?.setAttribute(
            "aria-expanded",
            "false"
        );
    });


    document.addEventListener("click", event => {

        if (
            notificationPanel &&
            notificationButton &&
            !notificationPanel.contains(event.target) &&
            !notificationButton.contains(event.target)
        ) {

            notificationPanel.classList.add("hidden");

            notificationButton.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    });
}


// ==========================================
// IMAGE LIGHTBOX
// ==========================================

function openImageLightbox(imageURL) {

    if (!imageURL || !imageLightbox || !lightboxImage) return;

    lightboxImage.src = imageURL;

    imageLightbox.classList.remove("hidden");

    document.body.style.overflow = "hidden";
}


function closeLightbox() {

    if (!imageLightbox || !lightboxImage) return;

    imageLightbox.classList.add("hidden");

    lightboxImage.src = "";

    document.body.style.overflow = "";
}


document.addEventListener("click", event => {

    const image = event.target.closest(
        ".question-images img, .reply-images img"
    );

    if (!image) return;

    openImageLightbox(image.src);
});


closeImageLightbox?.addEventListener("click", closeLightbox);


imageLightbox?.addEventListener("click", event => {

    if (event.target === imageLightbox) {
        closeLightbox();
    }
});


document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        closeLightbox();

        notificationPanel?.classList.add("hidden");

        notificationButton?.setAttribute(
            "aria-expanded",
            "false"
        );
    }
});


// ==========================================
// REPLY IMAGE SELECTION AND PREVIEWS
// ==========================================

replyImages.addEventListener("change", function () {

    hideMessage();

    const newFiles = Array.from(this.files || []);

    for (const file of newFiles) {

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {

            showMessage(
                "Only JPG, PNG and WebP images are allowed."
            );

            continue;
        }

        if (file.size > MAX_IMAGE_SIZE) {

            showMessage(
                `${file.name} is larger than 5 MB. Please choose a smaller image.`
            );

            continue;
        }

        const alreadySelected = selectedReplyImages.some(existingFile =>

            existingFile.name === file.name &&
            existingFile.size === file.size &&
            existingFile.lastModified === file.lastModified
        );

        if (alreadySelected) {
            continue;
        }

        if (selectedReplyImages.length >= MAX_IMAGES) {

            showMessage("You can attach a maximum of 3 images.");

            break;
        }

        selectedReplyImages.push(file);
    }

    syncReplyImageInput();

    renderReplyImagePreviews();
});


function syncReplyImageInput() {

    const dataTransfer = new DataTransfer();

    selectedReplyImages.forEach(file => {
        dataTransfer.items.add(file);
    });

    replyImages.files = dataTransfer.files;
}


function renderReplyImagePreviews() {

    replyImagePreview.innerHTML = "";

    selectedReplyImages.forEach((file, index) => {

        const previewURL = URL.createObjectURL(file);

        const previewItem = document.createElement("div");
        previewItem.className = "image-preview-item";

        const image = document.createElement("img");

        image.src = previewURL;
        image.alt = "Selected reply image";

        image.onload = () => {
            URL.revokeObjectURL(previewURL);
        };

        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.className = "remove-preview-image";
        removeButton.textContent = "×";
        removeButton.setAttribute("aria-label", "Remove image");

        removeButton.addEventListener("click", () => {
            removeReplyImage(index);
        });

        previewItem.appendChild(image);
        previewItem.appendChild(removeButton);

        replyImagePreview.appendChild(previewItem);
    });
}


function removeReplyImage(index) {

    selectedReplyImages.splice(index, 1);

    syncReplyImageInput();

    renderReplyImagePreviews();
}


function clearReplyImages() {

    selectedReplyImages = [];

    replyImages.value = "";

    replyImagePreview.innerHTML = "";
}


// ==========================================
// LOAD QUESTION
// ==========================================

async function loadQuestion() {

    if (!postId || !/^\d+$/.test(postId)) {

        questionContainer.innerHTML = `
            <div class="loading-state">
                Invalid question link. Please return to the Help Board.
            </div>
        `;

        return;
    }

    try {

        const data = await apiRequest(
            `/posts/${encodeURIComponent(postId)}`
        );

        currentPost = data.post;

        currentReplies = Array.isArray(data.replies)
            ? data.replies
            : [];

        currentUserId = data.currentUserId;

        if (!currentPost) {
            throw new Error("This question could not be found.");
        }

        renderQuestion();

        renderReplies();

        repliesSection.classList.remove("hidden");

    } catch (error) {

        questionContainer.innerHTML = `
            <div class="loading-state">
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}


// ==========================================
// DISPLAY QUESTION
// ==========================================

function renderQuestion() {

    const profile = normalizeRelation(currentPost.user_profile);

    const status = currentPost.status || "unanswered";

    const isOwner = currentUserId &&
        currentUserId === currentPost.user_id;

    const images = currentPost.help_post_image || [];

    const ownerActions = isOwner
        ? `
            <div class="question-owner-actions">

                ${
                    status === "solved"
                        ? `
                            <button
                                class="action-button reopen-button"
                                id="reopenQuestionButton"
                                type="button"
                            >
                                Reopen Question
                            </button>
                        `
                        : ""
                }

            </div>
        `
        : "";

    questionContainer.innerHTML = `

        <div class="question-meta">

            <span class="question-tag">
                ${escapeHTML(currentPost.programming_language)}
            </span>

            <span class="question-tag">
                ${escapeHTML(currentPost.difficulty_level)}
            </span>

            <span class="status-tag ${escapeHTML(status)}">
                ${escapeHTML(getStatusLabel(status))}
            </span>

        </div>


        <h1 class="question-title">
            ${escapeHTML(currentPost.title)}
        </h1>


        <div class="question-author">

            ${getAvatar(profile)}

            <div class="author-details">

                <span class="author-name">
                    ${escapeHTML(profile.username || "CodeXperts Member")}
                </span>

                <span class="author-date">
                    Asked ${formatDate(currentPost.created_at)}
                </span>

            </div>

        </div>


        <div class="question-description">
            ${escapeHTML(currentPost.description)}
        </div>


        ${getImageHTML(images, "question-images")}


        <div class="question-footer">

            <div class="question-stats">

                <span>
                    ${currentReplies.length}
                    ${currentReplies.length === 1 ? "Reply" : "Replies"}
                </span>

                <span>
                    ${Number(currentPost.view_count || 0)} Views
                </span>

            </div>

            ${ownerActions}

        </div>
    `;


    const reopenButton = document.getElementById(
        "reopenQuestionButton"
    );

    if (reopenButton) {

        reopenButton.addEventListener(
            "click",
            reopenQuestion
        );
    }
}


// ==========================================
// DISPLAY REPLIES
// ==========================================

function renderReplies() {

    const isOwner = currentUserId &&
        currentUserId === currentPost.user_id;

    const isSolved = currentPost.status === "solved";

    replyCount.textContent =
        `${currentReplies.length} ${
            currentReplies.length === 1 ? "reply" : "replies"
        }`;


    if (currentReplies.length === 0) {

        repliesContainer.innerHTML = `
            <div class="empty-replies">
                No answers yet. Be the first to help solve this question.
            </div>
        `;

    } else {

        repliesContainer.innerHTML = currentReplies.map(reply => {

            const profile = normalizeRelation(reply.user_profile);

            const isAccepted =
                Number(currentPost.accepted_reply_id) ===
                Number(reply.reply_id);

            const canAccept =
                isOwner &&
                !isSolved &&
                !currentPost.accepted_reply_id;

            const images = reply.help_reply_image || [];

            return `

                <article class="reply-card ${
                    isAccepted ? "accepted-reply" : ""
                }">

                    <div class="reply-card-header">

                        <div class="reply-author">

                            ${getAvatar(profile)}

                            <div class="author-details">

                                <span class="author-name">
                                    ${escapeHTML(
                                        profile.username || "CodeXperts Member"
                                    )}
                                </span>

                                <span class="author-date">
                                    ${formatDate(reply.created_at)}
                                </span>

                            </div>

                        </div>

                        ${
                            isAccepted
                                ? `
                                    <span class="accepted-label">
                                        ✓ Accepted Answer
                                    </span>
                                `
                                : ""
                        }

                    </div>


                    <div class="reply-text">
                        ${escapeHTML(reply.reply_text)}
                    </div>


                    ${getImageHTML(images, "reply-images")}


                    ${
                        canAccept
                            ? `
                                <div class="reply-actions">

                                    <button
                                        type="button"
                                        class="accept-reply-button"
                                        data-reply-id="${escapeHTML(reply.reply_id)}"
                                    >
                                        Accept Answer
                                    </button>

                                </div>
                            `
                            : ""
                    }

                </article>

            `;

        }).join("");
    }


    const canReply = !isSolved;

    replyFormSection.classList.toggle(
        "hidden",
        !canReply
    );

    solvedMessage.classList.toggle(
        "hidden",
        !isSolved
    );


    repliesContainer
        .querySelectorAll(".accept-reply-button")
        .forEach(button => {

            button.addEventListener("click", () => {

                acceptReply(button.dataset.replyId);

            });
        });
}


// ==========================================
// POST A REPLY WITH OPTIONAL IMAGES
// ==========================================

replyForm.addEventListener("submit", async event => {

    event.preventDefault();

    hideMessage();

    const text = replyText.value.trim();

    if (!text) {

        showMessage(
            "Please write an answer before submitting."
        );

        return;
    }

    if (currentPost.status === "solved") {

        showMessage(
            "This question has already been solved."
        );

        return;
    }

    if (selectedReplyImages.length > MAX_IMAGES) {

        showMessage(
            "You can attach a maximum of 3 images."
        );

        return;
    }


    submitReplyButton.disabled = true;

    submitReplyButton.textContent = "Posting...";


    try {

        const formData = new FormData();

        formData.append("reply_text", text);

        selectedReplyImages.forEach(file => {
            formData.append("images", file);
        });


        const result = await apiRequest(
            `/posts/${encodeURIComponent(postId)}/replies`,
            {
                method: "POST",
                body: formData
            }
        );


        replyText.value = "";

        updateCharacterCount();

        clearReplyImages();


        if (result.warning) {

            showMessage(
                typeof result.warning === "string"
                    ? result.warning
                    : "Your answer was posted, but there was a problem processing one of its attachments.",
                "error"
            );

        } else {

            showMessage(
                "Your answer has been posted successfully.",
                "success"
            );
        }


        await loadQuestion();

        loadNotifications();

    } catch (error) {

        showMessage(error.message);

    } finally {

        submitReplyButton.disabled = false;

        submitReplyButton.textContent = "Post Answer";
    }
});


// ==========================================
// ACCEPT AN ANSWER
// ==========================================

async function acceptReply(replyId) {

    hideMessage();

    if (!confirm("Are you sure you want to accept this answer?")) {
        return;
    }

    try {

        await apiRequest(
            `/posts/${encodeURIComponent(postId)}/accept/${encodeURIComponent(replyId)}`,
            {
                method: "POST"
            }
        );

        showMessage(
            "Answer accepted! The question has been marked as solved.",
            "success"
        );

        await loadQuestion();

        loadNotifications();

        loadTopStats();

    } catch (error) {

        showMessage(error.message);
    }
}


// ==========================================
// REOPEN QUESTION
// ==========================================

async function reopenQuestion() {

    hideMessage();

    if (!confirm("Would you like to reopen this question?")) {
        return;
    }

    const button = document.getElementById(
        "reopenQuestionButton"
    );

    if (button) {

        button.disabled = true;

        button.textContent = "Reopening...";
    }


    try {

        await apiRequest(
            `/posts/${encodeURIComponent(postId)}/reopen`,
            {
                method: "POST"
            }
        );

        showMessage(
            "Your question has been reopened.",
            "success"
        );

        await loadQuestion();

    } catch (error) {

        showMessage(error.message);

        if (button) {

            button.disabled = false;

            button.textContent = "Reopen Question";
        }
    }
}


// ==========================================
// CHARACTER COUNTER
// ==========================================

function updateCharacterCount() {

    replyCharCount.textContent =
        `${replyText.value.length} / 10000`;
}


replyText.addEventListener(
    "input",
    updateCharacterCount
);


// ==========================================
// INITIALIZE PAGE
// ==========================================

async function init() {

    if (!accessToken) {
        return;
    }

    setupNavigation();

    setupNotifications();

    displayUser();

    updateCharacterCount();

    loadTopStats();

    loadNotifications();

    await loadQuestion();
}


document.addEventListener("DOMContentLoaded", init);
