
const API_BASE = "http://localhost:5000/api";

const elements = {
    menuButton: document.getElementById("menuButton"),
    mainNav: document.getElementById("mainNav"),
    toast: document.getElementById("toast"),
    pageMessage: document.getElementById("pageMessage"),

    welcomeName: document.getElementById("welcomeName"),
    welcomeMessage: document.getElementById("welcomeMessage"),

    profileInitial: document.getElementById("profileInitial"),
    profileImage: document.getElementById("profileImage"),
    profileLetter: document.getElementById("profileLetter"),

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

    activityContent: document.getElementById("activityContent"),
    ranksContent: document.getElementById("ranksContent")
};

let activeEnrollment = null;
let activePath = null;
let activeModule = null;
let nextLesson = null;
let dashboardStats = null;
let completedLessonsCount = null;

let activeModuleNumber = 0;
let totalModules = 0;
let activeModuleLessons = [];
let currentLessonNumber = 0;

let toastTimer = null;


/* Authentication */

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


/* API */

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


/* Messages */

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


/* User profile */

function getCurrentProfile() {
    const storedUser = getStoredUser();
    const user = storedUser?.user || storedUser || {};
    const profile = dashboardStats?.profile || {};

    return {
        username:
            profile.username ||
            user.username ||
            user.user_metadata?.username ||
            user.email?.split("@")[0] ||
            "learner",

        profilePicture:
            profile.profile_picture_url ||
            profile.profilePicture ||
            user.profile_picture_url ||
            user.profilePictureUrl ||
            user.user_metadata?.profile_picture_url ||
            user.user_metadata?.avatar_url ||
            null
    };
}

function displayUser() {
    const profile = getCurrentProfile();
    const username = String(profile.username).replace(/^@/, "");

    setText(elements.welcomeName, `@${username}`);

    if (elements.welcomeMessage) {
        elements.welcomeMessage.textContent =
            "Keep learning and build your programming skills one day at a time.";
    }

    const firstLetter = username.charAt(0).toUpperCase() || "U";

    if (elements.profileLetter) {
        elements.profileLetter.textContent = firstLetter;
        elements.profileLetter.hidden = false;
    }

    if (!elements.profileImage) return;

    if (profile.profilePicture) {
        elements.profileImage.src = profile.profilePicture;
        elements.profileImage.hidden = false;

        if (elements.profileLetter) {
            elements.profileLetter.hidden = true;
        }

        elements.profileImage.onerror = () => {
            elements.profileImage.hidden = true;

            if (elements.profileLetter) {
                elements.profileLetter.hidden = false;
            }
        };

    } else {
        elements.profileImage.removeAttribute("src");
        elements.profileImage.hidden = true;

        if (elements.profileLetter) {
            elements.profileLetter.hidden = false;
        }
    }
}


/* Navigation */

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

            elements.menuButton?.setAttribute(
                "aria-expanded",
                "false"
            );
        });
    });
}



/* Dashboard section navigation */

function setupSectionNavigation() {
    const dashboardLink = document.querySelector(
        '.main-nav a[href="home.html"]'
    );

    const learningLink = document.querySelector(
        '.main-nav a[href="#learning"]'
    );

    const learningSection = document.getElementById("learning");

    if (!dashboardLink || !learningLink || !learningSection) {
        return;
    }

    function setActiveSection(section) {
        dashboardLink.classList.toggle(
            "active",
            section === "dashboard"
        );

        dashboardLink.classList.toggle(
            "section-active",
            section === "dashboard"
        );

        learningLink.classList.toggle(
            "active",
            section === "learning"
        );

        learningLink.classList.toggle(
            "section-active",
            section === "learning"
        );
    }

    // Highlight Learning Path when clicked.
    learningLink.addEventListener("click", () => {
        setActiveSection("learning");
    });

    // Highlight the correct section when scrolling.
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection("learning");
                }
            });
        },
        {
            rootMargin: "-100px 0px -65% 0px"
        }
    );

    observer.observe(learningSection);

    // Return to Dashboard when its navigation link is clicked.
    dashboardLink.addEventListener("click", event => {
        event.preventDefault();

        setActiveSection("dashboard");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        history.replaceState(null, "", "home.html");
    });

    // Initial navigation state.
    if (window.location.hash === "#learning") {
        setActiveSection("learning");
    } else {
        setActiveSection("dashboard");
    }
}


/* Tabs */

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

            if (selectedTab === "ranks") {
                loadLeaderboard();
            }
        });
    });
}


/* Dashboard statistics */

async function loadDashboardStats() {
    try {
        dashboardStats = await apiRequest("/paths/dashboard/stats");

        displayUser();
        displayInitialStats();
        renderActivity();

    } catch (error) {
        console.error("Could not load dashboard statistics:", error);
    }
}

async function loadCompletedLessons() {
    try {
        const data = await apiRequest("/paths/dashboard/lessons-completed");

        completedLessonsCount = Number(data.lessonsCompleted || 0);

        setText(elements.lessonsValue, completedLessonsCount);

    } catch (error) {
        console.error("Could not load completed lessons:", error);
    }
}


/* Learning paths */

async function loadAvailablePaths() {
    const data = await apiRequest("/paths");
    return data.paths || [];
}

async function findUserEnrollment(paths) {
    for (const path of paths) {
        const data = await apiRequest(
            `/paths/${path.path_id}/enrollment`
        );

        const enrollment = data.enrollment;

        if (
            data.enrolled &&
            enrollment &&
            enrollment.status === "active"
        ) {
            return {
                path,
                enrollment
            };
        }
    }

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


async function findNextAvailableLesson(pathId) {
    const data = await apiRequest(`/paths/${pathId}/modules`);
    const modules = data.modules || [];

    totalModules = modules.length;
    activeModule = null;
    nextLesson = null;
    activeModuleNumber = 0;
    activeModuleLessons = [];
    currentLessonNumber = 0;

    let lastModule = null;
    let lastModuleLessons = [];

    for (let i = 0; i < modules.length; i++) {
        const module = modules[i];

        const lessons = await loadModuleLessons(module.module_id);

        const publishedLessons = lessons.filter(
            lesson => lesson.published === true
        );

        if (!publishedLessons.length) {
            continue;
        }

        lastModule = module;
        lastModuleLessons = publishedLessons;

        const availableLesson = findNextLesson(publishedLessons);

        if (availableLesson) {
            activeModule = module;
            activeModuleNumber = i + 1;
            activeModuleLessons = publishedLessons;
            nextLesson = availableLesson;

            const lessonIndex = publishedLessons.findIndex(
                lesson =>
                    Number(lesson.lesson_id) ===
                    Number(availableLesson.lesson_id)
            );

            currentLessonNumber = lessonIndex >= 0
                ? lessonIndex + 1
                : 1;

            return nextLesson;
        }
    }

    // No unfinished accessible lesson was found.
    // Keep the final module selected and show its completed progress.

    if (lastModule) {
        activeModule = lastModule;
        activeModuleLessons = lastModuleLessons;

        activeModuleNumber = modules.findIndex(
            module => module.module_id === lastModule.module_id
        ) + 1;

        currentLessonNumber = lastModuleLessons.length;
    }

    return null;
}



function findNextLesson(lessons) {
    if (!lessons.length) return null;

    return lessons.find(lesson =>
        lesson.published === true &&
        lesson.can_access === true &&
        lesson.progress_status !== "completed"
    ) || null;
}


/* Lesson button */


function displayNoLessonAvailable() {
    nextLesson = null;

    if (elements.lessonButton) {
        elements.lessonButton.disabled = true;
        elements.lessonButton.textContent = "No Lessons Available";
    }

    if (elements.lessonMessage) {
        elements.lessonMessage.textContent =
            "You have completed all currently available lessons across your learning path. Check back for new lessons.";
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


/* No enrollment */

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


/* Enrolled path */


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
        `Module ${activeModuleNumber} of ${totalModules}`
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
            activePath.description ||
            "Continue with your learning journey.";

        elements.learningContent.querySelector(
            ".module-label"
        ).textContent = activeModule
            ? `Module ${activeModuleNumber}: ${activeModule.module_name}`
            : "No active module";
    }

    if (nextLesson) {
        if (elements.lessonButton) {
            elements.lessonButton.disabled = false;
            elements.lessonButton.textContent = "Continue Learning";
        }

        if (elements.lessonMessage) {
            elements.lessonMessage.textContent =
                `Next lesson: ${nextLesson.title || nextLesson.lesson_title || "Continue your lesson"}`;
        }
    } else {
        displayNoLessonAvailable();
    }

    displayInitialStats();
}



/* Weekly activity */

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

        dayElement.classList.toggle(
            "today",
            dateKey === today
        );

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


/* Badges */

function displayBadges() {
    const badges = dashboardStats?.badges || [];
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

        badge.classList.toggle("unlocked", unlocked);
        badge.classList.toggle("locked", !unlocked);

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
                badgeImage.alt =
                    earnedBadge.badge_name || `${milestone}-day streak badge`;
                badgeImage.loading = "lazy";

                if (milestoneLabel) {
                    milestoneLabel.hidden = true;
                }

                badge.insertBefore(badgeImage, badge.firstChild);

                badgeImage.addEventListener("error", () => {
                    badgeImage.remove();

                    if (milestoneLabel) {
                        milestoneLabel.hidden = false;
                    }
                });

            } else if (milestoneLabel) {
                milestoneLabel.hidden = false;
            }

        } else if (milestoneLabel) {
            milestoneLabel.hidden = false;
            milestoneLabel.textContent = `${milestone}D`;
        }

        if (status) {
            status.textContent = unlocked ? "Unlocked" : "Locked";
        }
    });
}


/* Statistics display */


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

    // Module progress replaces the old XP-based level.
    const currentModule = Number(activeModuleNumber || 0);
    const moduleCount = Number(totalModules || 0);

    const totalLessons = activeModuleLessons.length;

    const completedLessonsInModule = activeModuleLessons.filter(
        lesson => lesson.progress_status === "completed"
    ).length;

    const currentLesson = nextLesson
        ? currentLessonNumber
        : totalLessons;

    const progressPercentage = totalLessons > 0
        ? Math.min(
            (currentLesson / totalLessons) * 100,
            100
        )
        : 0;

    setText(elements.topStreak, currentStreak);
    setText(elements.topXp, overallXp.toLocaleString());

    setText(elements.streakValue, currentStreak);
    setText(elements.xpValue, overallXp.toLocaleString());

    setText(
        elements.pathXpText,
        `Path XP: ${pathXp.toLocaleString()}`
    );

    // Display the current module instead of the XP level.
    setText(elements.levelValue, currentModule);
    setText(elements.levelOutOf, `/ ${moduleCount}`);
    setText(elements.levelHeading, `Module ${currentModule}`);

    // Display lesson progress instead of XP progress.
    setText(
        elements.levelXpText,
        totalLessons > 0
            ? `Lesson ${currentLesson} / ${totalLessons}`
            : "No lessons available"
    );

    setText(
        elements.levelPercentage,
        `${Math.round(progressPercentage)}%`
    );

    if (elements.levelProgress) {
        elements.levelProgress.style.width =
            `${progressPercentage}%`;
    }

    if (elements.levelMessage) {
        if (totalLessons > 0) {
            elements.levelMessage.textContent = nextLesson
                ? `${completedLessonsInModule} of ${totalLessons} lessons completed in this module.`
                : "You have completed all lessons in this module.";

        } else {
            elements.levelMessage.textContent =
                "No published lessons are currently available in this module.";
        }
    }

    setText(elements.lessonsValue, lessonsCompleted);

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

    const rewardPercentage = nextMilestone
        ? Math.min((currentStreak / nextMilestone) * 100, 100)
        : 100;

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



/* Activity history */

function formatActivityDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-ZA", {
        weekday: "short",
        day: "numeric",
        month: "short"
    });
}

function renderActivity() {
    if (!elements.activityContent) return;

    const activities = (dashboardStats?.weeklyActivity || [])
        .filter(item => Number(item.lessons_completed || 0) > 0)
        .sort((a, b) =>
            String(b.activity_date).localeCompare(String(a.activity_date))
        );

    if (!activities.length) {
        elements.activityContent.innerHTML = `
            <div class="empty-state">
                <strong>No recent activity</strong>
                <p>Complete a lesson and your learning activity will appear here.</p>
            </div>
        `;
        return;
    }

    elements.activityContent.innerHTML = `
        <div class="activity-list"></div>
    `;

    const list = elements.activityContent.querySelector(".activity-list");

    activities.forEach(activity => {
        const count = Number(activity.lessons_completed || 0);

        const item = document.createElement("div");
        item.className = "activity-item";

        const icon = document.createElement("div");
        icon.className = "activity-icon";
        icon.textContent = "✓";

        const details = document.createElement("div");
        details.className = "activity-details";

        const title = document.createElement("strong");
        title.textContent =
            `Completed ${count} lesson${count === 1 ? "" : "s"}`;

        const date = document.createElement("small");
        date.textContent = formatActivityDate(activity.activity_date);

        const countLabel = document.createElement("span");
        countLabel.className = "activity-xp";
        countLabel.textContent = `${count} lesson${count === 1 ? "" : "s"}`;

        details.append(title, date);
        item.append(icon, details, countLabel);
        list.appendChild(item);
    });
}


/* Leaderboard */

async function loadLeaderboard() {
    if (!elements.ranksContent) return;

    try {
        const data = await apiRequest("/paths/dashboard/leaderboard");

        renderLeaderboard(data);

    } catch (error) {
        console.error("Could not load leaderboard:", error);

        elements.ranksContent.innerHTML = `
            <div class="empty-state">
                <strong>Leaderboard unavailable</strong>
                <p>We could not retrieve the rankings. Please try again later.</p>
            </div>
        `;
    }
}

function createLeaderboardAvatar(profilePicture, username, rank) {
    const avatar = document.createElement("div");
    avatar.className = "leaderboard-avatar";

    const firstLetter = String(username || "L")
        .replace(/^@/, "")
        .charAt(0)
        .toUpperCase();

    if (profilePicture) {
        const image = document.createElement("img");

        image.src = profilePicture;
        image.alt = `${username || "Learner"} profile picture`;
        image.loading = "lazy";

        image.onerror = () => {
            avatar.textContent = firstLetter || String(rank);
        };

        avatar.appendChild(image);

    } else {
        avatar.textContent = firstLetter || String(rank);
    }

    return avatar;
}

function createLeaderboardRow(user, currentUserId = null) {
    const row = document.createElement("div");
    row.className = "leaderboard-item";

    const isCurrentUser =
        currentUserId &&
        user.user_id === currentUserId;

    if (isCurrentUser) {
        row.classList.add("current-user-rank");
    }

    const username = String(user.username || "Learner").replace(/^@/, "");

    const rank = document.createElement("span");
    rank.className = "leaderboard-position";
    rank.textContent = `#${user.rank}`;

    const avatar = createLeaderboardAvatar(
        user.profile_picture_url,
        username,
        user.rank
    );

    const userDetails = document.createElement("div");
    userDetails.className = "leaderboard-user";

    const name = document.createElement("strong");
    name.className = "leaderboard-username";
    name.textContent = `@${username}`;

    const subtitle = document.createElement("span");
    subtitle.className = "leaderboard-subtitle";
    subtitle.textContent = isCurrentUser ? "Your account" : "CodeXperts learner";

    userDetails.append(name, subtitle);

    const xp = document.createElement("strong");
    xp.className = "leaderboard-xp";
    xp.textContent =
        `${Number(user.overall_xp || 0).toLocaleString()} XP`;

    row.append(rank, avatar, userDetails, xp);

    if (isCurrentUser) {
        const you = document.createElement("span");
        you.className = "leaderboard-you";
        you.textContent = "YOU";
        row.appendChild(you);
    }

    return row;
}

function renderLeaderboard(data) {
    if (!elements.ranksContent) return;

    const users = data.topUsers || [];
    const currentUser = data.currentUser;

    elements.ranksContent.innerHTML = `
        <div class="leaderboard-heading">
            <strong>Top learners</strong>
            <span>${Number(data.totalUsers || users.length)} learners</span>
        </div>
        <div class="leaderboard-list"></div>
        <div class="my-rank"></div>
    `;

    const list = elements.ranksContent.querySelector(".leaderboard-list");
    const myRank = elements.ranksContent.querySelector(".my-rank");

    if (!users.length) {
        list.innerHTML = `
            <div class="empty-state">
                <strong>No rankings yet</strong>
                <p>Earn XP by completing lessons to appear here.</p>
            </div>
        `;
        return;
    }

    users.forEach(user => {
        list.appendChild(
            createLeaderboardRow(
                user,
                currentUser?.user_id || null
            )
        );
    });

    if (currentUser && currentUser.rank) {
        const isInTopTen = users.some(
            user => user.user_id === currentUser.user_id
        );

        if (!isInTopTen) {
            const label = document.createElement("span");
            label.className = "my-rank-label";
            label.textContent = "YOUR RANK";

            myRank.appendChild(label);

            myRank.appendChild(
                createLeaderboardRow(currentUser, currentUser.user_id)
            );
        }

    } else {
        myRank.textContent = "Your ranking is not available yet.";
    }
}


/* Dashboard initialization */


async function init() {
    setupNavigation();
    setupSectionNavigation();
    setupTabs();
    setupLessonButton();

    displayUser();

    if (!getAccessToken()) {
        redirectToLogin();
        return;
    }

    hidePageMessage();

    loadDashboardStats();
    loadCompletedLessons();

    try {
        const paths = await loadAvailablePaths();
        const enrollmentData = await findUserEnrollment(paths);

        if (!enrollmentData) {
            renderNoEnrollment();
            return;
        }

        activePath = enrollmentData.path;
        activeEnrollment = enrollmentData.enrollment;

        // Search all modules for the next available lesson.
        await findNextAvailableLesson(activePath.path_id);

        renderEnrolledPath();

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