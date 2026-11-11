
// ==========================================
// CODEXPERTS HELP BOARD
// ==========================================

const API_BASE_URL = "http://localhost:5000/api/help";
const COMMUNITY_API_URL = "http://localhost:5000/api/community";
const API_BASE = "http://localhost:5000/api";


// ==========================================
// AUTHENTICATION
// ==========================================

const accessToken = sessionStorage.getItem("supabaseAccessToken");

if (!accessToken) {
    window.location.href = "login.html";
}


// ==========================================
// DOM ELEMENTS
// ==========================================

const questionsContainer = document.getElementById("questions");

const searchInput = document.getElementById("searchInput");
const languageFilter = document.getElementById("languageFilter");

const categoryName = document.getElementById("categoryName");
const questionSubtitle = document.getElementById("questionSubtitle");

const allQuestionCount = document.getElementById("allQuestionCount");
const totalQuestions = document.getElementById("totalQuestions");
const solvedQuestions = document.getElementById("solvedQuestions");
const showingQuestions = document.getElementById("showingQuestions");

const pagination = document.getElementById("pagination");

const questionModal = document.getElementById("questionModal");
const openQuestionModal = document.getElementById("openQuestionModal");
const closeQuestionModal = document.getElementById("closeQuestionModal");
const cancelQuestion = document.getElementById("cancelQuestion");

const questionForm = document.getElementById("questionForm");
const questionTitle = document.getElementById("questionTitle");
const questionDescription = document.getElementById("questionDescription");
const questionLanguage = document.getElementById("questionLanguage");
const questionDifficulty = document.getElementById("questionDifficulty");

const questionFormMessage = document.getElementById("questionFormMessage");
const submitQuestion = document.getElementById("submitQuestion");

const similarQuestions = document.getElementById("similarQuestions");
const similarQuestionResults = document.getElementById("similarQuestionResults");

const questionImages = document.getElementById("questionImages");
const questionImagePreview = document.getElementById("questionImagePreview");


// Header elements
const topStreak = document.getElementById("topStreak");
const topXp = document.getElementById("topXp");
const profileInitial = document.getElementById("profileInitial");

const menuButton = document.getElementById("menuButton");
const mainNav = document.getElementById("mainNav");


// Notification elements
const notificationButton = document.getElementById("notificationButton");
const notificationPanel = document.getElementById("notificationPanel");
const notificationList = document.getElementById("notificationList");
const notificationCount = document.getElementById("notificationCount");
const closeNotifications = document.getElementById("closeNotifications");


let selectedQuestionImages = [];


// ==========================================
// PAGE STATE
// ==========================================

let currentPage = 1;
let currentStatus = "";
let currentLanguage = "";
let currentSearch = "";
let currentSort = "latest";

let totalPages = 1;
let totalQuestionCount = 0;

let searchTimer = null;
let suggestionTimer = null;

let requestNumber = 0;
let suggestionRequestNumber = 0;

let notificationData = [];
let notificationsLoaded = false;


// ==========================================
// GENERAL API REQUEST HELPER
// ==========================================

async function apiRequest(endpoint, options = {}) {

    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(options.headers || {}),
        ...(accessToken ? {
            Authorization: `Bearer ${accessToken}`
        } : {})
    };

    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    let result;

    try {
        result = await response.json();
    } catch {
        throw new Error("The server returned an invalid response.");
    }

    if (response.status === 401) {

        sessionStorage.removeItem("supabaseAccessToken");

        alert("Your session has expired. Please log in again.");

        window.location.href = "login.html";

        throw new Error("Session expired.");
    }

    if (!response.ok || result.success === false) {

        throw new Error(
            result.message || "Something went wrong. Please try again."
        );
    }

    return result;
}


// ==========================================
// HELP BOARD API REQUEST
// ==========================================

async function helpApiRequest(endpoint, options = {}) {

    const isFormData = options.body instanceof FormData;

    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        ...(options.headers || {})
    };

    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    let result;

    try {
        result = await response.json();
    } catch {
        throw new Error("The server returned an invalid response.");
    }

    if (response.status === 401) {

        sessionStorage.removeItem("supabaseAccessToken");

        alert("Your session has expired. Please log in again.");

        window.location.href = "login.html";

        throw new Error("Session expired.");
    }

    if (!response.ok || result.success === false) {

        throw new Error(
            result.message || "Something went wrong. Please try again."
        );
    }

    return result;
}


// ==========================================
// HTML ESCAPING
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


// ==========================================
// TIME FORMAT
// ==========================================

function timeAgo(dateValue) {

    if (!dateValue) {
        return "Recently";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Recently";
    }

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) {
        return "Just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
        return `${days}d ago`;
    }

    const months = Math.floor(days / 30);

    if (months < 12) {
        return `${months}mo ago`;
    }

    return `${Math.floor(months / 12)}y ago`;
}


// ==========================================
// GET LOGGED-IN USER
// ==========================================

function getStoredUser() {

    try {

        const storedUser = sessionStorage.getItem("loggedInUser");

        if (!storedUser) {
            return {};
        }

        const parsedUser = JSON.parse(storedUser);

        return parsedUser?.user || parsedUser || {};

    } catch (error) {

        console.error("Unable to read logged-in user:", error);

        return {};
    }
}


// ==========================================
// DISPLAY PROFILE INITIAL
// ==========================================

// ==========================================
// DISPLAY USER PROFILE PICTURE
// ==========================================

function displayUserProfile() {

    const user = getStoredUser();

    const name =
        user.first_name ||
        user.firstName ||
        user.username ||
        "Learner";

    const initial = name.charAt(0).toUpperCase();

    if (!profileInitial) {
        return;
    }

    const profilePicture =
        user.profile_picture_url ||
        user.profilePictureUrl ||
        user.avatar_url ||
        user.avatarUrl;

    // Show the initial when no profile picture is available.
    profileInitial.textContent = initial;

    if (!profilePicture) {
        return;
    }

    const image = document.createElement("img");

    image.src = profilePicture;
    image.alt = "Profile picture";
    image.loading = "eager";

    image.onerror = function () {
        image.remove();
        profileInitial.textContent = initial;
    };

    profileInitial.textContent = "";
    profileInitial.appendChild(image);
}


// ==========================================
// LOAD STREAK AND XP
// ==========================================

async function loadHeaderStats() {

    try {

        const result = await apiRequest("/paths/dashboard/stats");

        const stats = result.stats || result;

        const overallXp = Number(
            stats?.xp?.overallXp ??
            stats?.xp?.overall_xp ??
            stats?.overallXp ??
            0
        );

        const currentStreak = Number(
            stats?.streak?.currentStreak ??
            stats?.streak?.current_streak ??
            stats?.currentStreak ??
            0
        );

        if (topStreak) {
            topStreak.textContent = currentStreak;
        }

        if (topXp) {
            topXp.textContent = overallXp.toLocaleString();
        }

    } catch (error) {

        console.error("Unable to load header statistics:", error);

        if (topStreak) {
            topStreak.textContent = "0";
        }

        if (topXp) {
            topXp.textContent = "0";
        }
    }
}


// ==========================================
// MOBILE NAVIGATION
// ==========================================

function setupNavigation() {

    if (!menuButton || !mainNav) {
        return;
    }

    menuButton.addEventListener("click", () => {

        const isOpen = mainNav.classList.toggle("open");

        menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            mainNav.classList.remove("open");

            menuButton.setAttribute("aria-expanded", "false");
        });
    });

    document.addEventListener("click", event => {

        if (
            mainNav.classList.contains("open") &&
            !mainNav.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {

            mainNav.classList.remove("open");

            menuButton.setAttribute("aria-expanded", "false");
        }
    });
}


// ==========================================
// NOTIFICATION TIME
// ==========================================

function notificationTime(notification) {

    return timeAgo(
        notification.created_at ||
        notification.createdAt ||
        notification.timestamp
    );
}


// ==========================================
// NOTIFICATION MESSAGE
// ==========================================

function getNotificationMessage(notification) {

    return (
        notification.message ||
        notification.content ||
        notification.title ||
        "You have a new CodeXperts notification."
    );
}


// ==========================================
// UPDATE NOTIFICATION COUNT
// ==========================================

function updateNotificationCount() {

    const unreadCount = notificationData.filter(notification => {
        return notification.is_read === false;
    }).length;

    if (!notificationCount) {
        return;
    }

    notificationCount.textContent =
        unreadCount > 99 ? "99+" : unreadCount;

    notificationCount.classList.toggle(
        "hidden",
        unreadCount === 0
    );
}


// ==========================================
// RENDER NOTIFICATIONS
// ==========================================

function renderNotifications() {

    if (!notificationList) {
        return;
    }

    if (notificationData.length === 0) {

        notificationList.innerHTML = `
            <div class="notification-empty">
                You're all caught up. No notifications yet.
            </div>
        `;

        updateNotificationCount();

        return;
    }

    notificationList.innerHTML = notificationData.map(notification => {

        const notificationId =
            notification.notification_id ??
            notification.id;

        const unread = notification.is_read === false;

        return `
            <button
                type="button"
                class="notification-item ${unread ? "unread" : ""}"
                data-notification-id="${escapeHTML(notificationId)}"
                data-post-id="${Number(
                    notification.related_post_id ||
                    notification.post_id ||
                    notification.help_post_id ||
                    0
                )}"
            >

                <div class="notification-item-content">

                    <p>${escapeHTML(getNotificationMessage(notification))}</p>

                    <small>${escapeHTML(notificationTime(notification))}</small>

                </div>

            </button>
        `;

    }).join("");

    updateNotificationCount();
}


// ==========================================
// LOAD NOTIFICATIONS
// ==========================================

async function loadNotifications() {

    if (!notificationList) {
        return;
    }

    notificationList.innerHTML = `
        <div class="notification-loading">
            Loading notifications...
        </div>
    `;

    try {

        const result = await apiRequest("/community/notifications");

        notificationData =
            result.notifications ||
            result.data ||
            [];

        notificationsLoaded = true;

        renderNotifications();

    } catch (error) {

        console.error("Notification loading error:", error);

        notificationList.innerHTML = `
            <div class="notification-empty">
                Unable to load notifications.

                <button
                    type="button"
                    class="notification-retry"
                    id="retryNotifications"
                >
                    Try Again
                </button>
            </div>
        `;

        document
            .getElementById("retryNotifications")
            ?.addEventListener("click", loadNotifications);
    }
}


// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================

async function markNotificationAsRead(notificationId) {

    try {

        await apiRequest(
            `/community/notifications/${encodeURIComponent(notificationId)}/read`,
            {
                method: "PATCH"
            }
        );

        notificationData = notificationData.map(notification => {

            const id =
                notification.notification_id ??
                notification.id;

            if (String(id) === String(notificationId)) {
                return {
                    ...notification,
                    is_read: true
                };
            }

            return notification;
        });

        renderNotifications();

    } catch (error) {

        console.error("Unable to mark notification as read:", error);
    }
}


// ==========================================
// NOTIFICATION CLICK
// ==========================================

if (notificationList) {

    notificationList.addEventListener("click", async event => {

        const notificationItem = event.target.closest(
            ".notification-item"
        );

        if (!notificationItem) {
            return;
        }

        const notificationId = notificationItem.dataset.notificationId;
        const postId = Number(notificationItem.dataset.postId || 0);

        if (notificationId) {
            await markNotificationAsRead(notificationId);
        }

        if (postId > 0) {

            window.location.href = `help-question.html?id=${postId}`;

            return;
        }

        await loadNotifications();
    });
}


// ==========================================
// OPEN AND CLOSE NOTIFICATION PANEL
// ==========================================

function closeNotificationPanel() {

    if (!notificationPanel || !notificationButton) {
        return;
    }

    notificationPanel.classList.add("hidden");

    notificationButton.setAttribute("aria-expanded", "false");
}


if (notificationButton && notificationPanel) {

    notificationButton.addEventListener("click", async event => {

        event.stopPropagation();

        const isOpen = !notificationPanel.classList.contains("hidden");

        if (isOpen) {

            closeNotificationPanel();

            return;
        }

        notificationPanel.classList.remove("hidden");

        notificationButton.setAttribute("aria-expanded", "true");

        await loadNotifications();
    });
}


if (closeNotifications) {

    closeNotifications.addEventListener("click", closeNotificationPanel);
}


document.addEventListener("click", event => {

    if (
        notificationPanel &&
        notificationButton &&
        !notificationPanel.classList.contains("hidden") &&
        !notificationPanel.contains(event.target) &&
        !notificationButton.contains(event.target)
    ) {

        closeNotificationPanel();
    }
});


document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeNotificationPanel();
    }
});


// ==========================================
// HTML ESCAPING AND USER INFORMATION
// ==========================================

function getPostUsername(post) {

    const profile = Array.isArray(post.user_profile)
        ? post.user_profile[0]
        : post.user_profile;

    return profile?.username || "CodeXpert";
}


function getPostAvatar(post) {

    const profile = Array.isArray(post.user_profile)
        ? post.user_profile[0]
        : post.user_profile;

    const picture = profile?.profile_picture_url;

    if (picture) {

        return `
            <img
                src="${escapeHTML(picture)}"
                alt="Profile picture"
                class="help-avatar-image"
            >
        `;
    }

    const username = getPostUsername(post);

    return escapeHTML(username.charAt(0).toUpperCase());
}


// ==========================================
// QUESTION STATUS
// ==========================================

function getStatusLabel(status) {

    const labels = {
        unanswered: "Unanswered",
        answered: "Answered",
        solved: "Solved"
    };

    return labels[status] || "Unanswered";
}


// ==========================================
// QUESTION CARD
// ==========================================

function createQuestionCard(post) {

    const username = getPostUsername(post);

    const replyCount = Array.isArray(post.help_reply)
        ? Number(post.help_reply[0]?.count || 0)
        : Number(post.reply_count || 0);

    const status = post.status || "unanswered";

    const title = escapeHTML(post.title);
    const description = escapeHTML(post.description);

    const language = escapeHTML(post.programming_language);

    const difficulty = post.difficulty_level
        ? escapeHTML(post.difficulty_level)
        : "";

    const avatar = getPostAvatar(post);

    const viewCount = Number(post.view_count || 0);

    return `
        <article
            class="help-question-card"
            data-post-id="${Number(post.post_id)}"
            tabindex="0"
            role="link"
            aria-label="Open question: ${title}"
        >

            <div class="help-question-avatar">
                ${avatar}
            </div>

            <div class="help-question-content">

                <div class="help-question-top">
                    <strong>${escapeHTML(username)}</strong>

                    <span class="help-question-time">
                        ${timeAgo(post.created_at)}
                    </span>
                </div>

                <h3 class="help-question-title">
                    ${title}
                </h3>

                <p class="help-question-description">
                    ${description.length > 180
                        ? description.substring(0, 180) + "..."
                        : description}
                </p>

                <div class="help-question-meta">

                    <span class="help-tag">
                        ${language}
                    </span>

                    ${difficulty ? `
                        <span class="help-tag">
                            ${difficulty}
                        </span>
                    ` : ""}

                    <span class="help-status ${escapeHTML(status)}">
                        ${getStatusLabel(status)}
                    </span>

                </div>

            </div>

            <div class="help-question-stats">

                <span>
                    <span aria-hidden="true">↩</span>
                    ${replyCount} replies
                </span>

              

            </div>

        </article>
    `;
}


// ==========================================
// LOADING STATE
// ==========================================

function showLoading() {

    questionsContainer.innerHTML = `
        <div class="help-loading">
            <div class="loading-spinner"></div>
            <p>Loading questions...</p>
        </div>
    `;
}


// ==========================================
// EMPTY STATE
// ==========================================

function showEmptyState() {

    questionsContainer.innerHTML = `
        <div class="help-empty">

            <div style="font-size: 35px; margin-bottom: 10px;">
                ?
            </div>

            <strong>No questions found</strong>

            <p>
                We couldn't find any questions matching your search.
                Try changing your filters or ask the first question.
            </p>

        </div>
    `;
}


// ==========================================
// ERROR STATE
// ==========================================

function showError(message) {

    questionsContainer.innerHTML = `
        <div class="help-error">

            <strong>Unable to load questions</strong>

            <p>${escapeHTML(message)}</p>

            <button
                type="button"
                class="cancel-button"
                id="retryHelpBoard"
            >
                Try Again
            </button>

        </div>
    `;

    document
        .getElementById("retryHelpBoard")
        ?.addEventListener("click", loadQuestions);
}


// ==========================================
// LOAD QUESTIONS
// ==========================================

async function loadQuestions() {

    const thisRequest = ++requestNumber;

    showLoading();

    pagination.innerHTML = "";

    try {

        const params = new URLSearchParams();

        params.set("page", currentPage);
        params.set("limit", 10);

        if (currentSearch) {
            params.set("search", currentSearch);
        }

        if (currentLanguage) {
            params.set("language", currentLanguage);
        }

        if (currentStatus) {
            params.set("status", currentStatus);
        }

        const result = await helpApiRequest(
            `/posts?${params.toString()}`
        );

        if (thisRequest !== requestNumber) {
            return;
        }

        const posts = result.posts || [];

        totalQuestionCount = result.pagination?.totalPosts || 0;
        totalPages = result.pagination?.totalPages || 1;

        if (currentSort === "popular") {

            posts.sort((a, b) => {

                return Number(b.view_count || 0) -
                    Number(a.view_count || 0);
            });
        }

        updateStatistics(posts);

        if (posts.length === 0) {

            showEmptyState();

            renderPagination();

            return;
        }

        questionsContainer.innerHTML = posts
            .map(createQuestionCard)
            .join("");

        renderPagination();

    } catch (error) {

        if (thisRequest !== requestNumber) {
            return;
        }

        console.error("Help Board loading error:", error);

        showError(error.message);
    }
}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics(posts) {

    const solvedCount = posts.filter(
        post => post.status === "solved"
    ).length;

    allQuestionCount.textContent = `${totalQuestionCount} questions`;

    totalQuestions.textContent = totalQuestionCount;

    solvedQuestions.textContent = solvedCount;

    showingQuestions.textContent = posts.length;

    const pageStart = totalQuestionCount === 0
        ? 0
        : ((currentPage - 1) * 10) + 1;

    const pageEnd = Math.min(currentPage * 10, totalQuestionCount);

    questionSubtitle.textContent = totalQuestionCount === 0
        ? "No questions available yet."
        : `Showing ${pageStart}-${pageEnd} of ${totalQuestionCount} questions`;
}


// ==========================================
// PAGINATION
// ==========================================

function renderPagination() {

    pagination.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }

    const previousButton = document.createElement("button");

    previousButton.textContent = "‹";
    previousButton.disabled = currentPage === 1;
    previousButton.setAttribute("aria-label", "Previous page");

    previousButton.addEventListener("click", () => {

        if (currentPage > 1) {

            currentPage--;

            loadQuestions();
        }
    });

    pagination.appendChild(previousButton);


    for (let page = 1; page <= totalPages; page++) {

        const pageButton = document.createElement("button");

        pageButton.textContent = page;

        if (page === currentPage) {
            pageButton.classList.add("active");
        }

        pageButton.addEventListener("click", () => {

            currentPage = page;

            loadQuestions();
        });

        pagination.appendChild(pageButton);
    }


    const nextButton = document.createElement("button");

    nextButton.textContent = "›";
    nextButton.disabled = currentPage === totalPages;
    nextButton.setAttribute("aria-label", "Next page");

    nextButton.addEventListener("click", () => {

        if (currentPage < totalPages) {

            currentPage++;

            loadQuestions();
        }
    });

    pagination.appendChild(nextButton);
}


// ==========================================
// SEARCH QUESTIONS
// ==========================================

searchInput.addEventListener("input", () => {

    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {

        currentSearch = searchInput.value.trim();

        currentPage = 1;

        loadQuestions();

    }, 400);
});


// ==========================================
// LANGUAGE FILTER
// ==========================================

languageFilter.addEventListener("change", () => {

    currentLanguage = languageFilter.value;

    currentPage = 1;

    updateSelectedCategory();

    loadQuestions();
});


// ==========================================
// SIDEBAR CATEGORY FILTERS
// ==========================================

document.querySelectorAll(".sidebar .group-card[data-language]")
    .forEach(button => {

        button.addEventListener("click", () => {

            currentLanguage = button.dataset.language || "";

            languageFilter.value = currentLanguage;

            currentPage = 1;

            updateSelectedCategory();

            loadQuestions();
        });
    });


function updateSelectedCategory() {

    document.querySelectorAll(".sidebar .group-card")
        .forEach(button => {

            button.classList.toggle(
                "selected",
                (button.dataset.language || "") === currentLanguage
            );
        });

    const selectedButton = document.querySelector(
        `.sidebar .group-card[data-language="${CSS.escape(currentLanguage)}"]`
    );

    categoryName.textContent = selectedButton
        ? selectedButton.querySelector("strong").textContent
        : "All Questions";
}


// ==========================================
// STATUS AND POPULAR TABS
// ==========================================

document.querySelectorAll(".help-tabs .tab")
    .forEach(button => {

        button.addEventListener("click", () => {

            document.querySelectorAll(".help-tabs .tab")
                .forEach(tab => tab.classList.remove("active"));

            button.classList.add("active");

            if (button.dataset.sort === "popular") {

                currentSort = "popular";
                currentStatus = "";

            } else {

                currentSort = "latest";
                currentStatus = button.dataset.status || "";
            }

            currentPage = 1;

            loadQuestions();
        });
    });


// ==========================================
// OPEN QUESTION DETAILS
// ==========================================

function openQuestionDetails(card) {

    const postId = card.dataset.postId;

    if (!postId) {
        return;
    }

    window.location.href = `help-question.html?id=${postId}`;
}


questionsContainer.addEventListener("click", event => {

    const card = event.target.closest(".help-question-card");

    if (!card) {
        return;
    }

    openQuestionDetails(card);
});


questionsContainer.addEventListener("keydown", event => {

    if (
        event.key !== "Enter" &&
        event.key !== " "
    ) {
        return;
    }

    const card = event.target.closest(".help-question-card");

    if (!card) {
        return;
    }

    event.preventDefault();

    openQuestionDetails(card);
});


// ==========================================
// OPEN AND CLOSE QUESTION MODAL
// ==========================================

function openModal() {

    questionModal.classList.remove("hidden");

    document.body.style.overflow = "hidden";

    questionTitle.focus();
}


function closeModal() {

    questionModal.classList.add("hidden");

    document.body.style.overflow = "";

    questionForm.reset();

    clearQuestionImages();

    questionFormMessage.textContent = "";
    questionFormMessage.className = "modal-message";

    similarQuestions.classList.add("hidden");
    similarQuestionResults.innerHTML = "";
}


openQuestionModal.addEventListener("click", openModal);

closeQuestionModal.addEventListener("click", closeModal);

cancelQuestion.addEventListener("click", closeModal);


questionModal.addEventListener("click", event => {

    if (event.target === questionModal) {
        closeModal();
    }
});


document.addEventListener("keydown", event => {

    if (
        event.key === "Escape" &&
        !questionModal.classList.contains("hidden")
    ) {
        closeModal();
    }
});


// ==========================================
// SIMILAR QUESTION SUGGESTIONS
// ==========================================

questionTitle.addEventListener("input", () => {

    clearTimeout(suggestionTimer);

    const title = questionTitle.value.trim();

    if (title.length < 4) {

        similarQuestions.classList.add("hidden");

        similarQuestionResults.innerHTML = "";

        return;
    }

    suggestionTimer = setTimeout(() => {

        findSimilarQuestions(title);

    }, 500);
});


async function findSimilarQuestions(title) {

    const thisRequest = ++suggestionRequestNumber;

    try {

        const params = new URLSearchParams();

        params.set("search", title);
        params.set("limit", 5);

        if (questionLanguage.value) {
            params.set("language", questionLanguage.value);
        }

        const result = await helpApiRequest(
            `/posts?${params.toString()}`
        );

        if (thisRequest !== suggestionRequestNumber) {
            return;
        }

        const posts = result.posts || [];

        if (posts.length === 0) {

            similarQuestions.classList.add("hidden");

            similarQuestionResults.innerHTML = "";

            return;
        }

        similarQuestions.classList.remove("hidden");

        similarQuestionResults.innerHTML = posts.map(post => {

            return `
                <a
                    href="help-question.html?id=${Number(post.post_id)}"
                    class="similar-question-link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${escapeHTML(post.title)}
                </a>
            `;

        }).join("");

    } catch (error) {

        console.error("Similar question search error:", error);

        similarQuestions.classList.add("hidden");
    }
}


// Recheck suggestions if the language changes.
questionLanguage.addEventListener("change", () => {

    const title = questionTitle.value.trim();

    if (title.length >= 4) {
        findSimilarQuestions(title);
    }
});


// ==========================================
// QUESTION IMAGE SELECTION AND PREVIEW
// ==========================================

const MAX_QUESTION_IMAGES = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];


questionImages.addEventListener("change", () => {

    const newFiles = Array.from(questionImages.files);

    let validationMessage = "";

    for (const file of newFiles) {

        if (!allowedImageTypes.includes(file.type)) {

            validationMessage =
                "Only JPG, PNG and WebP images are allowed.";

            continue;
        }

        if (file.size > MAX_IMAGE_SIZE) {

            validationMessage =
                `${file.name} exceeds the 5 MB image limit.`;

            continue;
        }

        if (selectedQuestionImages.length >= MAX_QUESTION_IMAGES) {

            validationMessage =
                "You can attach a maximum of 3 images.";

            break;
        }

        const alreadySelected = selectedQuestionImages.some(
            selected =>
                selected.name === file.name &&
                selected.size === file.size &&
                selected.lastModified === file.lastModified
        );

        if (!alreadySelected) {
            selectedQuestionImages.push(file);
        }
    }

    questionFormMessage.textContent = validationMessage;
    questionFormMessage.className = validationMessage
        ? "modal-message error"
        : "modal-message";

    syncQuestionImageInput();

    renderQuestionImagePreview();
});


function syncQuestionImageInput() {

    const dataTransfer = new DataTransfer();

    selectedQuestionImages.forEach(file => {
        dataTransfer.items.add(file);
    });

    questionImages.files = dataTransfer.files;
}


function renderQuestionImagePreview() {

    questionImagePreview.innerHTML = "";

    selectedQuestionImages.forEach((file, index) => {

        const imageURL = URL.createObjectURL(file);

        const preview = document.createElement("div");

        preview.className = "image-preview-item";

        const image = document.createElement("img");

        image.src = imageURL;
        image.alt = "Selected question attachment";

        image.onload = () => URL.revokeObjectURL(imageURL);

        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.className = "remove-preview-image";
        removeButton.textContent = "×";
        removeButton.setAttribute("aria-label", "Remove image");

        removeButton.addEventListener("click", () => {

            selectedQuestionImages.splice(index, 1);

            syncQuestionImageInput();

            renderQuestionImagePreview();
        });

        preview.appendChild(image);
        preview.appendChild(removeButton);

        questionImagePreview.appendChild(preview);
    });
}


function clearQuestionImages() {

    selectedQuestionImages = [];

    questionImages.value = "";

    questionImagePreview.innerHTML = "";
}


// ==========================================
// CREATE A QUESTION WITH IMAGE ATTACHMENTS
// ==========================================

questionForm.addEventListener("submit", async event => {

    event.preventDefault();

    const title = questionTitle.value.trim();
    const description = questionDescription.value.trim();
    const language = questionLanguage.value;
    const difficulty = questionDifficulty.value;

    questionFormMessage.textContent = "";
    questionFormMessage.className = "modal-message";

    if (!title || !description || !language) {

        questionFormMessage.textContent =
            "Please complete the title, description and programming language.";

        return;
    }

    if (selectedQuestionImages.length > MAX_QUESTION_IMAGES) {

        questionFormMessage.textContent =
            "You can attach a maximum of 3 images.";

        return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("programming_language", language);
    formData.append("difficulty_level", difficulty || "");

    selectedQuestionImages.forEach(file => {
        formData.append("images", file);
    });

    submitQuestion.disabled = true;
    submitQuestion.textContent = "Uploading and posting...";

    try {

        const result = await helpApiRequest("/posts", {
            method: "POST",
            body: formData
        });

        const createdPost = result.post;

        currentSearch = "";
        currentStatus = "";
        currentSort = "latest";
        currentLanguage = "";
        currentPage = 1;

        searchInput.value = "";
        languageFilter.value = "";

        updateSelectedCategory();

        document.querySelectorAll(".help-tabs .tab")
            .forEach(tab => tab.classList.remove("active"));

        document.querySelector(
            '.help-tabs .tab[data-status=""]'
        )?.classList.add("active");

        closeModal();

        await loadQuestions();

        if (createdPost?.post_id) {

            window.location.href =
                `help-question.html?id=${createdPost.post_id}`;
        }

    } catch (error) {

        console.error("Question creation error:", error);

        questionFormMessage.textContent = error.message;

        questionFormMessage.className = "modal-message error";

    } finally {

        submitQuestion.disabled = false;

        submitQuestion.textContent = "Post Question";
    }
});


// ==========================================
// INITIALISE HELP BOARD
// ==========================================


async function initialiseHelpBoard() {

    displayUserProfile();

    setupNavigation();

    updateSelectedCategory();

    await Promise.all([
        loadHeaderStats(),
        loadQuestions(),
        loadNotifications()
    ]);
}

initialiseHelpBoard();



