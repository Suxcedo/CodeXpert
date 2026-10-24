
document.addEventListener("DOMContentLoaded", async function () {
    const API_BASE = "http://localhost:5000/api";

    const $ = (id) => document.getElementById(id);

    const elements = {
        menuButton: $("menuButton"),
        mainNav: $("mainNav"),
        toast: $("toast"),
        pageMessage: $("pageMessage"),
        welcomeName: $("welcomeName"),
        welcomeMessage: $("welcomeMessage"),
        profileInitial: $("profileInitial"),
        topStreak: $("topStreak"),
        topXp: $("topXp"),
        streakValue: $("streakValue"),
        xpValue: $("xpValue"),
        levelValue: $("levelValue"),
        levelOutOf: $("levelOutOf"),
        lessonsValue: $("lessonsValue"),
        levelHeading: $("levelHeading"),
        levelXpText: $("levelXpText"),
        levelPercentage: $("levelPercentage"),
        levelProgress: $("levelProgress"),
        levelMessage: $("levelMessage"),
        weekMessage: $("weekMessage"),
        rewardProgress: $("rewardProgress"),
        rewardText: $("rewardText"),
        lessonButton: $("lessonButton"),
        lessonMessage: $("lessonMessage"),
        pathHeading: $("pathHeading"),
        pathDescription: $("pathDescription"),
        pathProgress: $("pathProgress"),
        learningContent: $("learningContent"),
        choosePathButton: $("choosePathButton"),
        activityContent: $("activityContent")
    };

    let user = {};
    let activeEnrollment = null;
    let activePath = null;
    let firstModule = null;
    let toastTimer = null;
    let activeTab = "activity";

    function showToast(message) {
        elements.toast.textContent = message;
        elements.toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {
            elements.toast.classList.remove("show");
        }, 2500);
    }

    function showPageMessage(message, isError = false) {
        elements.pageMessage.textContent = message;
        elements.pageMessage.classList.toggle("error", isError);
        elements.pageMessage.hidden = false;
    }

    function clearPageMessage() {
        elements.pageMessage.textContent = "";
        elements.pageMessage.classList.remove("error");
        elements.pageMessage.hidden = true;
    }

    function getAccessToken() {
        return sessionStorage.getItem("supabaseAccessToken");
    }

    function getStoredUser() {
        try {
            const stored = sessionStorage.getItem("loggedInUser");
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            return null;
        }
    }

    function redirectToLogin() {
        const currentPage =
            window.location.pathname + window.location.search;

        window.location.href =
            `login.html?redirect=${encodeURIComponent(currentPage)}`;
    }

    function escapeText(value) {
        return String(value ?? "");
    }

    function formatNumber(value) {
        return (Number(value) || 0).toLocaleString();
    }

    function showEmptyState(title, description) {
        const container = document.createElement("div");
        container.className = "empty-state";

        const heading = document.createElement("strong");
        heading.textContent = title;

        const paragraph = document.createElement("p");
        paragraph.textContent = description;

        container.append(heading, paragraph);

        return container;
    }

    async function apiRequest(url, options = {}) {
        const token = getAccessToken();

        const headers = {
            ...(options.headers || {})
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        if (options.body && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }

        const response = await fetch(`${API_BASE}${url}`, {
            ...options,
            headers
        });

        let data;

        try {
            data = await response.json();
        } catch (error) {
            throw new Error("The server returned an invalid response.");
        }

        if (!response.ok || data.success === false) {
            const error = new Error(
                data.message || `Request failed (${response.status}).`
            );

            error.status = response.status;
            throw error;
        }

        return data;
    }

    function displayUser() {
        const storedUser = getStoredUser();

        if (!storedUser) {
            redirectToLogin();
            return false;
        }

        user = storedUser.user || storedUser;

        const username =
            user.username ||
            user.user_name ||
            user.email ||
            "Learner";

        elements.welcomeName.textContent = `${username}.`;
        elements.profileInitial.textContent =
            username.charAt(0).toUpperCase() || "L";

        return true;
    }

    function displayInitialStats() {
        const xp = Number(user.overall_xp) || 0;

        elements.topXp.textContent = formatNumber(xp);
        elements.xpValue.textContent = formatNumber(xp);

        elements.topStreak.textContent = "0";
        elements.streakValue.textContent = "0";

        elements.lessonsValue.textContent =
            formatNumber(user.lessons_completed);

        const level = Math.min(
            Math.max(Number(activeEnrollment?.current_level) || 1, 1),
            10
        );

        elements.levelValue.textContent = level;
        elements.levelOutOf.textContent = "/ 10";

        const pathXp = Number(activeEnrollment?.path_xp) || 0;
        const xpPerLevel = 1000;
        const xpIntoLevel = pathXp % xpPerLevel;
        const percentage = Math.round(
            (xpIntoLevel / xpPerLevel) * 100
        );

        elements.levelHeading.textContent =
            level >= 10 ? "Level 10" : `Level ${level} → Level ${level + 1}`;

        elements.levelXpText.textContent =
            `${formatNumber(pathXp)} path XP`;

        elements.levelPercentage.textContent = `${percentage}%`;
        elements.levelProgress.style.width = `${percentage}%`;

        elements.levelMessage.textContent =
            level >= 10
                ? "You have reached the highest current level."
                : `${formatNumber(xpPerLevel - xpIntoLevel)} XP until the next level.`;

        elements.weekMessage.textContent =
            "Weekly activity tracking will appear here when connected to your progress records.";

        const streak = Number(activeEnrollment?.streak) || 0;

        elements.rewardProgress.style.width =
            `${Math.min(streak, 100)}%`;

        elements.rewardText.textContent =
            `${streak}/100 days · ${Math.max(100 - streak, 0)} days to go`;

        document.querySelectorAll(".day").forEach(function (day) {
            day.classList.remove("completed");
            day.querySelector("span").textContent = "";
        });

        document.querySelectorAll("[data-streak]").forEach(function (badge) {
            const required = Number(badge.dataset.streak);

            badge.classList.toggle("unlocked", streak >= required);
            badge.classList.toggle("locked", streak < required);
        });
    }

    function getPathsFromResponse(result) {
        if (Array.isArray(result.paths)) {
            return result.paths;
        }

        if (Array.isArray(result.data?.paths)) {
            return result.data.paths;
        }

        if (Array.isArray(result.data)) {
            return result.data;
        }

        return [];
    }

    async function loadAvailablePaths() {
        const result = await apiRequest("/paths");
        return getPathsFromResponse(result);
    }

    async function findUserEnrollment(paths) {
        for (const path of paths) {
            const pathId = Number(path.path_id);

            if (!Number.isSafeInteger(pathId) || pathId < 1) {
                continue;
            }

            try {
                const result = await apiRequest(
                    `/paths/${encodeURIComponent(pathId)}/enrollment`
                );

                const enrollment =
                    result.enrollment ||
                    result.data?.enrollment;

                const isEnrolled =
                    result.hasEnrollment === true ||
                    result.enrolled === true ||
                    enrollment?.status === "active";

                if (isEnrolled) {
                    return {
                        path,
                        enrollment: enrollment || result
                    };
                }
            } catch (error) {
                if (error.status === 401) {
                    throw error;
                }

                if (error.status === 403 || error.status === 404) {
                    continue;
                }

                console.error(
                    `Could not check enrollment for path ${pathId}:`,
                    error
                );
            }
        }

        return null;
    }

    async function loadFirstModule(pathId) {
        const result = await apiRequest(
            `/paths/${encodeURIComponent(pathId)}/modules`
        );

        const modules = Array.isArray(result.modules)
            ? result.modules
            : Array.isArray(result.data?.modules)
                ? result.data.modules
                : [];

        modules.sort(function (a, b) {
            return Number(a.module_number) - Number(b.module_number);
        });

        return modules.find(
            (module) => Number(module.module_number) === 1
        ) || modules[0] || null;
    }

    function renderNoEnrollment() {
        activeEnrollment = null;
        activePath = null;
        firstModule = null;

        elements.pathHeading.textContent = "Choose Your Learning Path";

        elements.pathDescription.textContent =
            "Select a course to start learning programming with CodeXperts.";

        elements.pathProgress.textContent = "Not enrolled";

        elements.learningContent.replaceChildren(
            showEmptyState(
                "You haven't enrolled yet",
                "Choose a learning path to begin your programming journey."
            )
        );

        elements.lessonButton.disabled = true;
        elements.lessonButton.textContent = "Choose a Learning Path";
        elements.lessonMessage.textContent =
            "Select a course before continuing to a lesson.";

        elements.choosePathButton.hidden = false;
        elements.welcomeMessage.textContent =
            "Welcome! Choose a learning path to begin building your skills.";
    }

    function renderEnrolledPath() {
        elements.pathHeading.textContent =
            activePath.path_name || "Your Learning Path";

        elements.pathDescription.textContent =
            activePath.description || "Continue learning at your own pace.";

        elements.pathProgress.textContent = "Enrolled";

        elements.learningContent.replaceChildren();

        const pathCard = document.createElement("div");
        pathCard.className = "enrolled-path-card";

        const heading = document.createElement("h4");
        heading.textContent = activePath.path_name || "Your Learning Path";

        const description = document.createElement("p");
        description.textContent =
            activePath.description ||
            "Your enrolled course is ready to continue.";

        pathCard.append(heading, description);
        elements.learningContent.appendChild(pathCard);

        const moduleRow = document.createElement("div");
        moduleRow.className = "module-row current";

        const number = document.createElement("span");
        number.className = "module-number";
        number.textContent = String(
            firstModule.module_number || 1
        ).padStart(2, "0");

        const details = document.createElement("div");

        const moduleTitle = document.createElement("h4");
        moduleTitle.textContent =
            firstModule.module_name || "First Module";

        const moduleDescription = document.createElement("p");
        moduleDescription.textContent =
            "Open this module to continue to its first lesson.";

        details.append(moduleTitle, moduleDescription);
        moduleRow.append(number, details);
        elements.learningContent.appendChild(moduleRow);

        elements.lessonButton.disabled = false;
        elements.lessonButton.textContent = "Continue Learning →";
        elements.lessonMessage.textContent =
            "Your enrollment is active. Continue to your first module.";

        elements.choosePathButton.hidden = true;

        const username =
            user.username ||
            user.user_name ||
            user.email ||
            "Learner";

        elements.welcomeMessage.textContent =
            `Welcome back, ${username}. Your learning path is ready.`;
    }

    function openLesson() {
        if (!activePath || !firstModule) {
            showToast("No enrolled learning path was found.");
            return;
        }

        const pathId = Number(activePath.path_id);
        const moduleId = Number(firstModule.module_id);

        if (
            !Number.isSafeInteger(pathId) ||
            pathId < 1 ||
            !Number.isSafeInteger(moduleId) ||
            moduleId < 1
        ) {
            showPageMessage(
                "The learning path or module information is invalid.",
                true
            );
            return;
        }

        // The lesson page checks enrollment and publication status itself.
        window.location.href =
            `lesson.html?path_id=${encodeURIComponent(pathId)}` +
            `&module_id=${encodeURIComponent(moduleId)}` +
            `&lesson_id=1`;
    }

    function renderActivity() {
        elements.activityContent.replaceChildren();

        if (activeTab === "ranks") {
            elements.activityContent.appendChild(
                showEmptyState(
                    "Rankings are not connected yet",
                    "Leaderboard rankings will appear here when the ranking feature is connected."
                )
            );
            return;
        }

        elements.activityContent.appendChild(
            showEmptyState(
                "No activity loaded",
                "Completed lessons will appear here when lesson progress is connected to the backend."
            )
        );
    }

    function setupTabs() {
        document.querySelectorAll(".tab-button").forEach(function (button) {
            button.addEventListener("click", function () {
                activeTab = button.dataset.tab || "activity";

                document.querySelectorAll(".tab-button").forEach(
                    function (tab) {
                        tab.classList.toggle("active", tab === button);
                    }
                );

                renderActivity();
            });
        });
    }

    function setupNavigation() {
        elements.menuButton.addEventListener("click", function () {
            const isOpen = elements.mainNav.classList.toggle("open");

            elements.menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        elements.mainNav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                elements.mainNav.classList.remove("open");
                elements.menuButton.setAttribute("aria-expanded", "false");
            });
        });

        elements.lessonButton.addEventListener("click", openLesson);

        elements.choosePathButton.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = "selection.html";
        });

        ["reels", "help", "community"].forEach(function (id) {
            $(id).addEventListener("click", function (event) {
                event.preventDefault();

                showToast(
                    `${id === "reels" ? "Reels" : id === "help" ? "Help Board" : "Community"} will be connected here.`
                );
            });
        });
    }

    async function init() {
        setupNavigation();
        setupTabs();
        renderActivity();

        if (!displayUser()) {
            return;
        }

        const token = getAccessToken();

        if (!token) {
            showPageMessage(
                "Your login session could not be found. Please sign in again.",
                true
            );

            redirectToLogin();
            return;
        }

        try {
            clearPageMessage();

            elements.lessonButton.disabled = true;
            elements.lessonButton.textContent = "Loading your learning path...";

            const paths = await loadAvailablePaths();
            const result = await findUserEnrollment(paths);

            if (!result) {
                renderNoEnrollment();
                displayInitialStats();

                showPageMessage(
                    "No active enrollment was found for your account. You can choose a learning path to get started."
                );

                return;
            }

            activePath = result.path;
            activeEnrollment = result.enrollment;

            firstModule = await loadFirstModule(activePath.path_id);

            if (!firstModule) {
                renderEnrolledPath();

                elements.lessonButton.disabled = true;
                elements.lessonMessage.textContent =
                    "Your enrollment is active, but this course does not have a module available yet.";

                showPageMessage(
                    "Your learning path has no modules available yet.",
                    true
                );

                displayInitialStats();
                return;
            }

            renderEnrolledPath();
            displayInitialStats();
        } catch (error) {
            console.error("Dashboard loading error:", error);

            if (error.status === 401) {
                showPageMessage(
                    "Your login session has expired. Please sign in again.",
                    true
                );

                redirectToLogin();
                return;
            }

            renderNoEnrollment();

            showPageMessage(
                error.message ||
                "We couldn't load your dashboard. Check that your backend is running and try again.",
                true
            );
        }
    }

    await init();
});
