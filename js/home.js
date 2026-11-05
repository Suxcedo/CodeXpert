
const API_BASE = "http://localhost:5000/api";

const elements = {
    menuButton: document.getElementById("menuButton"),
    mainNav: document.getElementById("mainNav"),
    toast: document.getElementById("toast"),
    pageMessage: document.getElementById("pageMessage"),

    welcomeName: document.getElementById("welcomeName"),
    welcomeMessage: document.getElementById("welcomeMessage"),
    profileInitial: document.getElementById("profileInitial"),

    topStreak: document.getElementById("topStreak"),
    topXp: document.getElementById("topXp"),

    streakValue: document.getElementById("streakValue"),
    streakMessage: document.getElementById("streakMessage"),
    xpValue: document.getElementById("xpValue"),
    pathXpText: document.getElementById("pathXpText"),

    levelValue: document.getElementById("levelValue"),
    levelOutOf: document.getElementById("levelOutOf"),
    levelHeading: document.getElementById("levelHeading"),
    levelXpText: document.getElementById("levelXpText"),
    levelPercentage: document.getElementById("levelPercentage"),
    levelProgress: document.getElementById("levelProgress"),
    levelMessage: document.getElementById("levelMessage"),

    lessonsValue: document.getElementById("lessonsValue"),
    weekMessage: document.getElementById("weekMessage"),

    rewardProgress: document.getElementById("rewardProgress"),
    rewardText: document.getElementById("rewardText"),

    lessonButton: document.getElementById("lessonButton"),
    lessonMessage: document.getElementById("lessonMessage"),

    pathHeading: document.getElementById("pathHeading"),
    pathDescription: document.getElementById("pathDescription"),
    pathProgress: document.getElementById("pathProgress"),

    learningContent: document.getElementById("learningContent"),
    choosePathButton: document.getElementById("choosePathButton"),

    activityContent: document.getElementById("activityContent")
};

let activeEnrollment = null;
let activePath = null;
let activeModule = null;
let nextLesson = null;
let dashboardStats = null;
let completedLessonsCount = null;
let toastTimer = null;

function getAccessToken() {
    return sessionStorage.getItem("supabaseAccessToken");
}

function getStoredUser() {
    const storedUser = sessionStorage.getItem("loggedInUser");

    if (!storedUser) return null;

    try {
        return JSON.parse(storedUser);
    } catch {
        return null;
    }
}

function redirectToLogin() {
    window.location.href = "login.html";
}


async function apiRequest(endpoint, options = {}) {
    const token = getAccessToken();
    const startTime = performance.now();

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.error ||
                `Request failed with status ${response.status}.`
            );
        }

        return data;

    } finally {
        const duration = ((performance.now() - startTime) / 1000).toFixed(2);

        console.log(`[API] ${endpoint} took ${duration} seconds`);
    }
}


function showToast(message, type = "success") {
    if (!elements.toast) return;

    elements.toast.textContent = message;
    elements.toast.className = `toast show ${type}`;

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        elements.toast.classList.remove("show");
    }, 3500);
}

function showPageMessage(message, type = "error") {
    if (!elements.pageMessage) return;

    elements.pageMessage.textContent = message;
    elements.pageMessage.className = `page-message ${type}`;
    elements.pageMessage.hidden = false;
}

function hidePageMessage() {
    if (!elements.pageMessage) return;

    elements.pageMessage.hidden = true;
    elements.pageMessage.textContent = "";
}

function setText(element, value) {
    if (element) {
        element.textContent = value;
    }
}

function displayUser() {
    const storedUser = getStoredUser();
    const user = storedUser?.user || storedUser || {};

    const name =
        user.first_name ||
        user.firstName ||
        user.username ||
        "Learner";

    setText(elements.welcomeName, name);

    setText(
        elements.profileInitial,
        name.charAt(0).toUpperCase()
    );

    if (elements.welcomeMessage) {
        elements.welcomeMessage.textContent =
            "Keep learning and build your programming skills one day at a time.";
    }
}

function setupNavigation() {
    elements.menuButton?.addEventListener("click", () => {
        const isOpen = elements.mainNav.classList.toggle("open");

        elements.menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });

    elements.mainNav?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            elements.mainNav.classList.remove("open");
            elements.menuButton?.setAttribute("aria-expanded", "false");
        });
    });
}

function setupTabs() {
    const tabs = document.querySelectorAll("[data-tab]");
    const panels = document.querySelectorAll("[data-panel]");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const selectedTab = tab.dataset.tab;

            tabs.forEach(item => {
                item.classList.toggle("active", item === tab);
            });

            panels.forEach(panel => {
                panel.hidden = panel.dataset.panel !== selectedTab;
            });
        });
    });
}

async function loadDashboardStats() {
    try {
        dashboardStats = await apiRequest("/paths/dashboard/stats");
        displayInitialStats();
    } catch (error) {
        console.error("Could not load dashboard statistics:", error);
    }
}

async function loadCompletedLessons() {
    try {
        const data = await apiRequest(
            "/paths/dashboard/lessons-completed"
        );

        completedLessonsCount = Number(data.lessonsCompleted || 0);

        setText(
            elements.lessonsValue,
            completedLessonsCount
        );

    } catch (error) {
        console.error("Could not load completed lessons:", error);
    }
}

async function loadAvailablePaths() {
    const data = await apiRequest("/paths");
    return data.paths || [];
}


async function findUserEnrollment(paths) {
    console.log("Available paths:", paths);

    for (const path of paths) {
        try {
            const data = await apiRequest(
                `/paths/${path.path_id}/enrollment`
            );

            console.log(`Enrollment response for ${path.path_name}:`, data);

            const enrollment = data.enrollment;

            if (
                data.enrolled &&
                enrollment &&
                enrollment.status === "active"
            ) {
                console.log("Active enrollment found:", enrollment);

                return {
                    path,
                    enrollment
                };
            }
        } catch (error) {
            console.error(
                `Could not check enrollment for ${path.path_name}:`,
                error
            );

            throw error;
        }
    }

    console.log("No active enrollment found.");
    return null;
}


async function loadFirstModule(pathId) {
    const data = await apiRequest(`/paths/${pathId}/modules`);
    const modules = data.modules || [];

    return modules.length ? modules[0] : null;
}

async function loadModuleLessons(moduleId) {
    const data = await apiRequest(
        `/paths/modules/${moduleId}/lessons`
    );

    return data.lessons || [];
}


async function findNextLesson(lessons) {
    if (!lessons.length) return null;

    return lessons.find(lesson =>
        lesson.published === true &&
        lesson.can_access === true &&
        lesson.progress_status !== "completed"
    ) || null;
}


function displayNoLessonAvailable() {
    nextLesson = null;

    if (elements.lessonButton) {
        elements.lessonButton.disabled = true;
        elements.lessonButton.textContent = "No Lessons Available";
    }

    if (elements.lessonMessage) {
        elements.lessonMessage.textContent =
            "You have completed all the lessons currently available in this module.";
    }
}

function setupLessonButton() {
    elements.lessonButton?.addEventListener("click", () => {
        if (!nextLesson) {
            showToast("There is no lesson available yet.", "error");
            return;
        }

        window.location.href =
            `lesson.html?lessonId=${encodeURIComponent(nextLesson.lesson_id)}`;
    });
}

function renderNoEnrollment() {
    activeEnrollment = null;
    activePath = null;
    activeModule = null;
    nextLesson = null;

    setText(elements.pathHeading, "Choose your learning path");
    setText(
        elements.pathDescription,
        "Select a programming language to begin your learning journey."
    );
    setText(elements.pathProgress, "Not enrolled");

    if (elements.learningContent) {
        elements.learningContent.innerHTML = `
            <div class="empty-state">
                <strong>Start your learning journey</strong>
                <p>Choose a programming language and begin learning.</p>
            </div>
        `;
    }

    if (elements.choosePathButton) {
        elements.choosePathButton.hidden = false;
    }

    if (elements.lessonButton) {
        elements.lessonButton.disabled = true;
        elements.lessonButton.textContent = "Choose a Learning Path";
    }

    if (elements.lessonMessage) {
        elements.lessonMessage.textContent =
            "Enroll in a learning path to access your lessons.";
    }

    displayInitialStats();
}

function renderEnrolledPath() {
    if (!activePath || !activeEnrollment) return;

    const pathName = activePath.path_name || "Your Learning Path";

    setText(elements.pathHeading, pathName);
    setText(
        elements.pathDescription,
        activePath.description || "Continue learning and improving your skills."
    );
    setText(
        elements.pathProgress,
        `Level ${activeEnrollment.current_level || 1}`
    );

    if (elements.choosePathButton) {
        elements.choosePathButton.hidden = true;
    }

    if (elements.learningContent) {
        elements.learningContent.innerHTML = `
            <h4 class="learning-path-name"></h4>
            <p class="learning-path-description"></p>
            <span class="module-label"></span>
        `;

        elements.learningContent.querySelector(
            ".learning-path-name"
        ).textContent = pathName;

        elements.learningContent.querySelector(
            ".learning-path-description"
        ).textContent =
            activePath.description || "Continue with your learning journey.";

        elements.learningContent.querySelector(
            ".module-label"
        ).textContent =
            activeModule?.module_name || "Learning module";
    }

    if (nextLesson) {
        if (elements.lessonButton) {
            elements.lessonButton.disabled = false;
            elements.lessonButton.textContent = "Continue Learning";
        }

        if (elements.lessonMessage) {
            elements.lessonMessage.textContent =
                `Next lesson: ${nextLesson.lesson_title || "Continue your lesson"}`;
        }
    } else {
        displayNoLessonAvailable();
    }

    displayInitialStats();
}



function displayWeeklyActivity() {
    const weeklyActivity = dashboardStats?.weeklyActivity || [];
    const weekStart = dashboardStats?.weekStart;

    const dayElements = document.querySelectorAll(".day[data-day]");

    dayElements.forEach(dayElement => {
        dayElement.classList.remove("completed", "today");

        const countElement = dayElement.querySelector("span");

        if (countElement) {
            countElement.textContent = "";
        }
    });

    if (!weekStart) {
        setText(
            elements.weekMessage,
            "Complete a lesson to start tracking your weekly activity."
        );
        return;
    }

    const activityMap = {};

    weeklyActivity.forEach(activity => {
        const date = String(activity.activity_date).slice(0, 10);
        activityMap[date] = Number(activity.lessons_completed || 0);
    });

    const startDate = new Date(`${weekStart}T00:00:00Z`);
    const today = dashboardStats?.today;

    let totalLessons = 0;
    let activeDays = 0;

    dayElements.forEach(dayElement => {
        const dayNumber = Number(dayElement.dataset.day);

        const activityDate = new Date(startDate);
        activityDate.setUTCDate(startDate.getUTCDate() + dayNumber);

        const year = activityDate.getUTCFullYear();
        const month = String(activityDate.getUTCMonth() + 1).padStart(2, "0");
        const day = String(activityDate.getUTCDate()).padStart(2, "0");

        const dateKey = `${year}-${month}-${day}`;
        const completedLessons = activityMap[dateKey] || 0;

        const countElement = dayElement.querySelector("span");

        dayElement.classList.toggle(
            "completed",
            completedLessons > 0
        );

        // dayElement.classList.toggle(
        //     "today",
        //     dateKey === today
        // );

        if (countElement && completedLessons > 0) {
            countElement.textContent = completedLessons;
        }

        if (completedLessons > 0) {
            totalLessons += completedLessons;
            activeDays++;
        }
    });

    if (elements.weekMessage) {
        elements.weekMessage.textContent = totalLessons > 0
            ? `You completed ${totalLessons} lesson${totalLessons === 1 ? "" : "s"} across ${activeDays} active day${activeDays === 1 ? "" : "s"} this week.`
            : "No completed lessons this week yet. Complete a lesson to get started.";
    }
}





function displayBadges() {
    const badges = dashboardStats?.badges || [];

    // Store earned streak badges using their milestone value.
    const earnedBadges = new Map();

    badges.forEach(item => {
        const badgeInfo = item.badge;

        if (
            badgeInfo &&
            badgeInfo.badge_category === "STREAK"
        ) {
            const milestone = Number(badgeInfo.requirement_value);

            earnedBadges.set(milestone, badgeInfo);
        }
    });

    document.querySelectorAll(".badge[data-streak]").forEach(badge => {
        const milestone = Number(badge.dataset.streak);
        const earnedBadge = earnedBadges.get(milestone);
        const unlocked = Boolean(earnedBadge);

        const milestoneLabel = badge.querySelector("span");
        const status = badge.querySelector(".badge-status");

        // Update the badge's locked/unlocked appearance.
        badge.classList.toggle("unlocked", unlocked);
        badge.classList.toggle("locked", !unlocked);

        // Remove an old image before updating the badge.
        const existingImage = badge.querySelector(".badge-image");

        if (existingImage) {
            existingImage.remove();
        }

        if (unlocked) {
            const imageUrl = earnedBadge.image_url;

            if (imageUrl) {
                const badgeImage = document.createElement("img");

                badgeImage.className = "badge-image";
                badgeImage.src = imageUrl;
                badgeImage.alt = earnedBadge.badge_name || `${milestone}-day streak badge`;
                badgeImage.loading = "lazy";

                // Hide the original milestone text when the image is available.
                if (milestoneLabel) {
                    milestoneLabel.hidden = true;
                }

                // Display the earned badge image.
                badge.insertBefore(badgeImage, badge.firstChild);

                // If the image fails to load, show the milestone text instead.
                badgeImage.addEventListener("error", () => {
                    badgeImage.remove();

                    if (milestoneLabel) {
                        milestoneLabel.hidden = false;
                    }
                });
            } else if (milestoneLabel) {
                milestoneLabel.hidden = false;
            }

        } else {
            // Locked badges always display their original milestone text.
            if (milestoneLabel) {
                milestoneLabel.hidden = false;
                milestoneLabel.textContent = `${milestone}D`;
            }
        }

        if (status) {
            status.textContent = unlocked ? "Unlocked" : "Locked";
        }
    });
}




function displayInitialStats() {
    const storedUser = getStoredUser();
    const user = storedUser?.user || storedUser || {};

    const overallXp = Number(
        dashboardStats?.xp?.overallXp ??
        user.overall_xp ??
        0
    );

    const streak = dashboardStats?.streak || {};

    const currentStreak = Number(streak.currentStreak || 0);
    const longestStreak = Number(streak.longestStreak || 0);

    const lessonsCompleted = Number(
        completedLessonsCount ??
        dashboardStats?.lessonsCompleted ??
        0
    );

    const pathXp = Number(activeEnrollment?.path_xp || 0);
    const currentLevel = Number(activeEnrollment?.current_level || 1);

    const xpPerLevel = 100;
    const xpInCurrentLevel = pathXp % xpPerLevel;

    const progressPercentage = Math.min(
        (xpInCurrentLevel / xpPerLevel) * 100,
        100
    );

    setText(elements.topStreak, currentStreak);
    setText(elements.topXp, overallXp.toLocaleString());
    setText(elements.streakValue, currentStreak);
    setText(elements.xpValue, overallXp.toLocaleString());
    setText(elements.pathXpText, `Path XP: ${pathXp.toLocaleString()}`);
    setText(elements.levelValue, currentLevel);
    setText(elements.levelOutOf, "/ 10");
    setText(elements.lessonsValue, lessonsCompleted);
    setText(elements.levelHeading, `Level ${currentLevel}`);

    setText(
        elements.levelXpText,
        `${xpInCurrentLevel} / ${xpPerLevel} XP`
    );

    setText(
        elements.levelPercentage,
        `${Math.round(progressPercentage)}%`
    );

    if (elements.levelProgress) {
        elements.levelProgress.style.width =
            `${progressPercentage}%`;
    }

    setText(
        elements.levelMessage,
        `${xpPerLevel - xpInCurrentLevel} XP until your next level.`
    );

    setText(
        elements.streakMessage,
        currentStreak > 0
            ? `Your longest streak is ${longestStreak} days. Keep it going!`
            : "Complete a lesson to start your streak."
    );

    const milestones = [3, 7, 14, 30, 50, 75, 100];

    const nextMilestone = milestones.find(
        milestone => milestone > currentStreak
    );

    const rewardTarget = nextMilestone || 100;

    const rewardPercentage = Math.min(
        (currentStreak / rewardTarget) * 100,
        100
    );

    if (elements.rewardProgress) {
        elements.rewardProgress.style.width =
            `${rewardPercentage}%`;
    }

    setText(
        elements.rewardText,
        nextMilestone
            ? `${currentStreak} / ${nextMilestone} days`
            : "All streak milestones reached!"
    );

    displayWeeklyActivity();
    displayBadges();
}


function renderActivity() {
    if (!elements.activityContent) return;

    elements.activityContent.innerHTML = `
        <div class="empty-state">
            <strong>Your activity will appear here</strong>
            <p>Complete lessons to build your learning history.</p>
        </div>
    `;
}

async function init() {
    setupNavigation();
    setupTabs();
    setupLessonButton();
    displayUser();

    if (!getAccessToken()) {
        redirectToLogin();
        return;
    }

    hidePageMessage();

    // Start both dashboard requests immediately without waiting for either.
    loadDashboardStats();
    loadCompletedLessons();

    try {
        const paths = await loadAvailablePaths();
        const enrollmentData = await findUserEnrollment(paths);

        if (!enrollmentData) {
            renderNoEnrollment();
            renderActivity();
            return;
        }

        activePath = enrollmentData.path;
        activeEnrollment = enrollmentData.enrollment;

        activeModule = await loadFirstModule(activePath.path_id);

        if (activeModule) {
            const lessons = await loadModuleLessons(activeModule.module_id);
            nextLesson = await findNextLesson(lessons);
        }

        renderEnrolledPath();
        renderActivity();

    } catch (error) {
        console.error("Dashboard loading error:", error);

        showPageMessage(
            "We could not load your learning path. Please refresh the page.",
            "error"
        );

        if (elements.lessonButton) {
            elements.lessonButton.disabled = true;
            elements.lessonButton.textContent = "Try Again Later";
        }
    }
}

document.addEventListener("DOMContentLoaded", init);
