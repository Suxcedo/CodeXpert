
document.addEventListener("DOMContentLoaded", () => {
    const API_BASE = "http://localhost:5000/api";

    const params = new URLSearchParams(window.location.search);
    const pathId = params.get("path_id") || "1";
    let moduleId = params.get("module_id") || "1";
    let lessonId = params.get("lesson_id") || "1";

    const $ = id => document.getElementById(id);

    const enrollmentOverlay = $("enrollmentOverlay");
    const enrollNowButton = $("enrollNowButton");
    const enrollmentError = $("enrollmentError");
    const modalFootnote = $("modalFootnote");

    const lessonContent = $("lessonContent");
    const lessonSections = $("lessonSections");
    const lessonPlaceholder = $("lessonPlaceholder");
    const placeholderTitle = $("placeholderTitle");
    const placeholderMessage = $("placeholderMessage");
    const retryButton = $("retryButton");
    const pageMessage = $("pageMessage");

    const usernameDisplay = $("usernameDisplay");
    const userAvatar = $("userAvatar");

    const logoutButton = $("logoutButton");
    const progressBar = $("progressBar");
    const progressText = $("progressText");

    const overallXpDisplay = $("overallXp");
    const pathXpDisplay = $("pathXp");
    const xpToast = $("xpToast");
    const xpToastAmount = $("xpToastAmount");
    const xpToastMessage = $("xpToastMessage");
    const xpDisplay = document.querySelector(".xp-display");

    const lessonTitle = $("lessonTitle");
    const lessonSummary = $("lessonSummary");
    const lessonDuration = $("lessonDuration");
    const lessonLabel = $("lessonLabel");
    const moduleLabel = $("moduleLabel");
    const sidebarModuleTitle = $("sidebarModuleTitle");
    const lessonNavigation = $("lessonNavigation");
    const modalPathTitle = $("modalPathTitle");

    const lessonFinish = $("lessonFinish");
    const completeLessonButton = $("completeLessonButton");
    const continueLessonButton = $("continueLessonButton");
    const lessonFinishMessage = $("lessonFinishMessage");

    const backLink = document.querySelector(".back-link");

    let accessToken = null;
    let currentLesson = null;
    let progressRequestInProgress = false;
    let currentProgress = null;
    let lessonIsCompleted = false;
    let isCompletingLesson = false;

    let xpToastTimer = null;
    let xpToastHideTimer = null;

    // Sidebar data is fetched once and reused during normal navigation.
    let navigationCache = [];
    let navigationLoaded = false;
    let navigationRequest = null;
    let navigationVersion = 0;
    let lessonRequestVersion = 0;

    let nextLessonTarget = null;
    let lessonPreviousButton = null;
    let lessonNextButton = null;

    if (backLink) {
        backLink.href =
            `learning-path.html?path_id=${encodeURIComponent(pathId)}`;
    }

    function findAccessToken() {
        const directToken = sessionStorage.getItem("supabaseAccessToken");

        if (directToken) return directToken;

        const keys = [
            "session",
            "authSession",
            "supabaseSession",
            "supabase_session",
            "loggedInSession",
            "auth",
            "loggedInUser"
        ];

        const storages = [sessionStorage, localStorage];

        for (const storage of storages) {
            for (const key of keys) {
                try {
                    const raw = storage.getItem(key);
                    if (!raw) continue;

                    const value = JSON.parse(raw);

                    if (value?.access_token) return value.access_token;

                    if (value?.session?.access_token) {
                        return value.session.access_token;
                    }

                    if (value?.data?.session?.access_token) {
                        return value.data.session.access_token;
                    }
                } catch {
                    // Continue checking stored session values.
                }
            }
        }

        for (const storage of storages) {
            for (const key of ["access_token", "accessToken"]) {
                const token = storage.getItem(key);
                if (token) return token;
            }
        }

        return null;
    }

    function readStoredUser() {
        for (const storage of [sessionStorage, localStorage]) {
            for (const key of ["loggedInUser", "user", "currentUser"]) {
                try {
                    const raw = storage.getItem(key);
                    if (!raw) continue;

                    const value = JSON.parse(raw);

                    if (value && typeof value === "object") {
                        return value.user || value;
                    }
                } catch {
                    // Continue checking storage.
                }
            }
        }

        return {};
    }

    function displayUser() {
        const user = readStoredUser();

        const username =
            user.username ||
            user.user_name ||
            user.full_name ||
            user.email ||
            "Learner";

        usernameDisplay.textContent = username;
        userAvatar.textContent = username.charAt(0).toUpperCase() || "L";
    }

    function showPlaceholder(title, message, showRetry = false) {
        lessonContent.hidden = true;
        lessonPlaceholder.hidden = false;
        placeholderTitle.textContent = title;
        placeholderMessage.textContent = message;
        retryButton.hidden = !showRetry;
    }

    function showPageMessage(message, isError = false) {
        pageMessage.textContent = message;
        pageMessage.classList.toggle("error", isError);
        pageMessage.hidden = false;
    }

    function clearPageMessage() {
        pageMessage.textContent = "";
        pageMessage.classList.remove("error");
        pageMessage.hidden = true;
    }

    function updateProgress(value) {
        const progress = Math.max(0, Math.min(100, Number(value) || 0));

        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
        progressBar.setAttribute("aria-valuenow", String(progress));
    }

    function updateXpTotals(overallXp, pathXp) {
        const overall = Number(overallXp);
        const path = Number(pathXp);

        if (Number.isFinite(overall) && overall >= 0) {
            overallXpDisplay.textContent = overall.toLocaleString();
        }

        if (Number.isFinite(path) && path >= 0) {
            pathXpDisplay.textContent = path.toLocaleString();
        }

        if (xpDisplay) {
            xpDisplay.classList.remove("xp-updated");
            void xpDisplay.offsetWidth;
            xpDisplay.classList.add("xp-updated");
        }
    }

    function showXpReward(amount, message, overallXp, pathXp) {
        const earned = Number(amount) || 0;

        updateXpTotals(overallXp, pathXp);

        if (earned <= 0 || !xpToast) return;

        clearTimeout(xpToastTimer);
        clearTimeout(xpToastHideTimer);

        xpToast.classList.remove("is-hiding");
        xpToastAmount.textContent = `+${earned} XP`;
        xpToastMessage.textContent = message || "Experience earned!";
        xpToast.hidden = false;

        void xpToast.offsetWidth;
        xpToast.style.animation = "none";
        void xpToast.offsetWidth;
        xpToast.style.animation = "";

        xpToastTimer = setTimeout(() => {
            xpToast.classList.add("is-hiding");

            xpToastHideTimer = setTimeout(() => {
                xpToast.hidden = true;
                xpToast.classList.remove("is-hiding");
            }, 250);
        }, 3000);
    }

    function showEnrollmentModal() {
        enrollmentOverlay.hidden = false;
        document.body.classList.add("modal-open");
        enrollmentError.hidden = true;
        enrollNowButton.disabled = false;
        enrollNowButton.textContent = "Enroll Now →";
    }

    function hideEnrollmentModal() {
        enrollmentOverlay.hidden = true;
        document.body.classList.remove("modal-open");
    }

    function showEnrollmentError(message) {
        enrollmentError.textContent = message;
        enrollmentError.hidden = false;
    }

    async function apiRequest(url, options = {}) {
        const headers = { ...(options.headers || {}) };

        if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
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
        } catch {
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

    function isPublished(lesson) {
        return (
            String(lesson.status || "").toLowerCase() === "published" ||
            lesson.published === true
        );
    }

    function isCompleted(lesson) {
        return (
            lesson.completed === true ||
            lesson.progress_status === "completed"
        );
    }

    function sortLessons(lessons) {
        return [...lessons].sort(
            (a, b) =>
                Number(a.lesson_number || 0) -
                Number(b.lesson_number || 0)
        );
    }

    function sortModules(modules) {
        return [...modules].sort(
            (a, b) =>
                Number(a.module_number || 0) -
                Number(b.module_number || 0)
        );
    }

    /*
     * Fetch sidebar data once. The module lesson requests run in parallel,
     * instead of waiting for each module before requesting the next one.
     */
    async function fetchNavigationData() {
        const moduleData = await apiRequest(
            `/paths/${encodeURIComponent(pathId)}/modules`
        );

        const modules = sortModules(
            Array.isArray(moduleData.modules) ? moduleData.modules : []
        );

        const results = await Promise.all(
            modules.map(async module => {
                const data = await apiRequest(
                    `/paths/modules/${encodeURIComponent(module.module_id)}/lessons`
                );

                return {
                    module,
                    lessons: sortLessons(
                        Array.isArray(data.lessons) ? data.lessons : []
                    )
                };
            })
        );

        let previousModuleCompleted = true;

        navigationCache = results.map(result => {
            const publishedLessons = result.lessons.filter(isPublished);

            const moduleUnlocked = previousModuleCompleted;

            const allLessonsCompleted =
                publishedLessons.length > 0 &&
                publishedLessons.every(isCompleted);

            previousModuleCompleted =
                moduleUnlocked && allLessonsCompleted;

            return {
                ...result,
                moduleUnlocked
            };
        });

        navigationLoaded = true;
        return navigationCache;
    }

    /*
     * Do not clear the sidebar while requests are running.
     * Normal lesson navigation uses the cached data.
     */
    async function loadLessonNavigation(forceRefresh = false) {
        if (!lessonNavigation) return;

        if (navigationLoaded && !forceRefresh) {
            updateSidebarForCurrentLesson();
            updateNavigationTargets();
            return;
        }

        if (navigationRequest) {
            await navigationRequest;

            if (!forceRefresh && navigationLoaded) {
                updateSidebarForCurrentLesson();
                updateNavigationTargets();
                return;
            }
        }

        const requestVersion = ++navigationVersion;

        navigationRequest = (async () => {
            try {
                await fetchNavigationData();

                if (requestVersion !== navigationVersion) return;

                renderSidebar();
                updateNavigationTargets();
            } catch (error) {
                console.error("Could not load lesson navigation:", error);

                if (!navigationLoaded) {
                    lessonNavigation.replaceChildren();

                    const message = document.createElement("p");
                    message.className = "sidebar-muted";
                    message.textContent =
                        "Could not load modules and lessons. Please try again.";

                    lessonNavigation.appendChild(message);
                }
            } finally {
                if (requestVersion === navigationVersion) {
                    navigationRequest = null;
                }
            }
        })();

        await navigationRequest;
    }

    function renderSidebar() {
        if (!lessonNavigation) return;

        const previousScrollTop = lessonNavigation.scrollTop;
        const openModules = new Set(
            Array.from(
                lessonNavigation.querySelectorAll("details[open]")
            ).map(details => details.dataset.moduleId)
        );

        lessonNavigation.replaceChildren();

        if (navigationCache.length === 0) {
            const message = document.createElement("p");
            message.className = "sidebar-muted";
            message.textContent = "No modules are available yet.";
            lessonNavigation.appendChild(message);
            return;
        }

        navigationCache.forEach(result => {
            const { module, lessons, moduleUnlocked } = result;

            const moduleNumber = module.module_number || "";
            const moduleName =
                module.module_name || `Module ${moduleNumber}`;

            const isCurrentModule =
                String(module.module_id) === String(moduleId);

            const dropdown = document.createElement("details");
            dropdown.className = "module-dropdown";
            dropdown.dataset.moduleId = String(module.module_id);

            dropdown.open =
                isCurrentModule ||
                openModules.has(String(module.module_id)) ||
                (!openModules.size && Number(moduleNumber) === 1);

            const summary = document.createElement("summary");
            summary.className = "module-dropdown-title";

            const moduleNameElement = document.createElement("span");
            moduleNameElement.textContent =
                `${moduleNumber ? `Module ${moduleNumber}: ` : ""}${moduleName}`;

            const moduleStatus = document.createElement("small");
            moduleStatus.textContent = moduleUnlocked
                ? "Available"
                : "Complete the previous module first";

            summary.append(moduleNameElement, moduleStatus);
            dropdown.appendChild(summary);

            const lessonList = document.createElement("div");
            lessonList.className = "module-lesson-list";

            lessons.forEach(lesson => {
                const isCurrent =
                    String(lesson.lesson_id) === String(lessonId);

                const completed = isCompleted(lesson);
                const published = isPublished(lesson);

                /*
                 * Preserve the backend's lesson access rule, while also
                 * applying the module lock calculated above.
                 */

if (Number(lesson.lesson_number) === 7) {
    console.log("Lesson 5 sidebar access check:", {
        moduleId: module.module_id,
        lessonId: lesson.lesson_id,
        status: lesson.status,
        published,
        completed,
        can_access: lesson.can_access,
        moduleUnlocked,
        isCurrent
    });
}


               const canAccess =
    moduleUnlocked &&
    published &&
    (
        lesson.can_access === true ||
        completed ||
        isCurrent
    );

                const button = document.createElement("button");
                button.type = "button";
                button.className = "lesson-nav-item";
                button.dataset.moduleId = String(module.module_id);
                button.dataset.lessonId = String(lesson.lesson_id);

                if (isCurrent) {
                    button.classList.add("active");
                    button.setAttribute("aria-current", "page");
                }

                if (completed) button.classList.add("completed");

                if (!canAccess) {
                    button.classList.add("locked");
                    button.disabled = true;
                }

                const number = document.createElement("span");
                number.className = "nav-number";
                number.textContent =
                    `${moduleNumber || module.module_id}.${lesson.lesson_number}`;

                const details = document.createElement("span");
                details.className = "lesson-nav-details";

                const title = document.createElement("strong");
                title.textContent = lesson.title || "Untitled lesson";

                const status = document.createElement("small");

                if (!published) {
                    status.textContent = "Not available yet";
                } else if (!canAccess) {
                    status.textContent = "Locked";
                } else if (completed) {
                    status.textContent = "✓ Completed";
                } else if (isCurrent) {
                    status.textContent = "Current lesson";
                } else {
                    status.textContent = "Available";
                }

                details.append(title, status);
                button.append(number, details);

                if (canAccess && !isCurrent) {
                    button.addEventListener("click", () => {
                        openLessonInPlace(
                            module.module_id,
                            lesson.lesson_id
                        );
                    });
                }

                lessonList.appendChild(button);
            });

            dropdown.appendChild(lessonList);
            lessonNavigation.appendChild(dropdown);
        });

        lessonNavigation.scrollTop = previousScrollTop;
    }

    /*
     * Change the active lesson without rebuilding the sidebar.
     */
    function updateSidebarForCurrentLesson() {
        if (!lessonNavigation) return;

        lessonNavigation
            .querySelectorAll(".lesson-nav-item")
            .forEach(button => {
                const active =
                    button.dataset.lessonId === String(lessonId);

                button.classList.toggle("active", active);

                if (active) {
                    button.setAttribute("aria-current", "page");
                } else {
                    button.removeAttribute("aria-current");
                }
            });

        const currentDropdown = lessonNavigation.querySelector(
            `details[data-module-id="${CSS.escape(String(moduleId))}"]`
        );

        if (currentDropdown) currentDropdown.open = true;
    }

    function findNavigationTargets() {
        const allLessons = [];

        navigationCache.forEach(result => {
            result.lessons.forEach(lesson => {
                allLessons.push({
                    module_id: result.module.module_id,
                    lesson,
                    moduleUnlocked: result.moduleUnlocked
                });
            });
        });

        const currentIndex = allLessons.findIndex(item =>
            String(item.module_id) === String(moduleId) &&
            String(item.lesson.lesson_id) === String(lessonId)
        );

        if (currentIndex < 0) {
            return { previousTarget: null, nextTarget: null };
        }

        let previousTarget = null;
        let nextTarget = null;

        for (let i = currentIndex - 1; i >= 0; i--) {
            const item = allLessons[i];

            if (
                item.moduleUnlocked &&
                isPublished(item.lesson) &&
                (
                    item.lesson.can_access === true ||
                    isCompleted(item.lesson)
                )
            ) {
                previousTarget = {
                    module_id: item.module_id,
                    lesson_id: item.lesson.lesson_id
                };
                break;
            }
        }

        /*
         * Next lesson is available only when the current lesson is complete.
         * Lesson 10 checkpoint behavior remains controlled by the existing
         * quiz completion requirements in the backend.
         */
        if (lessonIsCompleted) {
            for (let i = currentIndex + 1; i < allLessons.length; i++) {
                const item = allLessons[i];

                if (
                    item.moduleUnlocked &&
                    isPublished(item.lesson) &&
                    (
                        item.lesson.can_access === true ||
                        isCompleted(item.lesson)
                    )
                ) {
                    nextTarget = {
                        module_id: item.module_id,
                        lesson_id: item.lesson.lesson_id
                    };
                    break;
                }

                // Do not skip over a locked lesson.
                break;
            }
        }

        return { previousTarget, nextTarget };
    }

    function updateNavigationTargets() {
        const { previousTarget, nextTarget } = findNavigationTargets();

        nextLessonTarget = nextTarget;

        updateLessonNavigationButtons(previousTarget, nextTarget);

        if (continueLessonButton) {
            continueLessonButton.hidden =
                !lessonIsCompleted || !nextTarget;

            continueLessonButton.textContent = "Move to Next Lesson →";
        }
    }

    async function openLessonInPlace(targetModuleId, targetLessonId) {
        const newModuleId = String(targetModuleId);
        const newLessonId = String(targetLessonId);

        if (!newModuleId || !newLessonId) return;

        const requestVersion = ++lessonRequestVersion;

        const previousModuleId = moduleId;
        const previousLessonId = lessonId;

        moduleId = newModuleId;
        lessonId = newLessonId;

        progressRequestInProgress = false;
        currentProgress = null;
        lessonIsCompleted = false;
        isCompletingLesson = false;
        currentLesson = null;

        clearPageMessage();

        const query = new URLSearchParams({
            path_id: pathId,
            module_id: moduleId,
            lesson_id: lessonId
        });

        window.history.pushState(
            { pathId, moduleId, lessonId },
            "",
            `${window.location.pathname}?${query.toString()}`
        );

        if (continueLessonButton) {
            continueLessonButton.hidden = true;
        }

        if (completeLessonButton) {
            completeLessonButton.hidden = false;
            completeLessonButton.disabled = false;
            completeLessonButton.textContent = "Complete Lesson";
        }

        updateSidebarForCurrentLesson();
        updateNavigationTargets();

        try {
            showPageMessage("Loading lesson...");

            const data = await apiRequest(
                `/paths/lessons/${encodeURIComponent(newLessonId)}`
            );

            // Ignore an older request if the learner clicked another lesson.
            if (requestVersion !== lessonRequestVersion) return;

            renderLesson(data);
            clearPageMessage();

            await loadXpTotals();
        } catch (error) {
            if (requestVersion !== lessonRequestVersion) return;

            moduleId = previousModuleId;
            lessonId = previousLessonId;

            const previousQuery = new URLSearchParams({
                path_id: pathId,
                module_id: moduleId,
                lesson_id: lessonId
            });

            window.history.replaceState(
                { pathId, moduleId, lessonId },
                "",
                `${window.location.pathname}?${previousQuery.toString()}`
            );

            updateSidebarForCurrentLesson();
            updateNavigationTargets();

            showPageMessage(
                error.message || "Could not open that lesson.",
                true
            );
        }
    }

    function updateLessonNavigationButtons(previousTarget, nextTarget) {
        if (!lessonContent || !lessonSections) return;

        let controls = document.getElementById("lessonNavigationControls");

        if (!controls) {
            controls = document.createElement("div");
            controls.id = "lessonNavigationControls";
            controls.className = "lesson-navigation-controls";

            lessonPreviousButton = document.createElement("button");
            lessonPreviousButton.type = "button";
            lessonPreviousButton.textContent = "← Previous Lesson";
            lessonPreviousButton.className = "lesson-previous-button";

            lessonNextButton = document.createElement("button");
            lessonNextButton.type = "button";
            lessonNextButton.textContent = "Next Lesson →";
            lessonNextButton.className = "lesson-next-button";

            lessonPreviousButton.addEventListener("click", () => {
                const target = lessonPreviousButton.dataset;

                if (target.moduleId && target.lessonId) {
                    openLessonInPlace(target.moduleId, target.lessonId);
                }
            });

            lessonNextButton.addEventListener("click", () => {
                const target = lessonNextButton.dataset;

                if (target.moduleId && target.lessonId) {
                    openLessonInPlace(target.moduleId, target.lessonId);
                }
            });

            controls.append(lessonPreviousButton, lessonNextButton);
            lessonContent.insertBefore(controls, lessonSections);
        }

        lessonPreviousButton.hidden = !previousTarget;
        lessonNextButton.hidden = !nextTarget;

        if (previousTarget) {
            lessonPreviousButton.dataset.moduleId =
                String(previousTarget.module_id);
            lessonPreviousButton.dataset.lessonId =
                String(previousTarget.lesson_id);
        }

        if (nextTarget) {
            lessonNextButton.dataset.moduleId =
                String(nextTarget.module_id);
            lessonNextButton.dataset.lessonId =
                String(nextTarget.lesson_id);
        }
    }

    if (continueLessonButton) {
        continueLessonButton.addEventListener("click", () => {
            if (!nextLessonTarget) return;

            openLessonInPlace(
                nextLessonTarget.module_id,
                nextLessonTarget.lesson_id
            );
        });
    }

    window.addEventListener("popstate", event => {
        const state = event.state;

        if (state?.moduleId && state?.lessonId) {
            openLessonInPlace(state.moduleId, state.lessonId);
            return;
        }

        const currentParams = new URLSearchParams(window.location.search);
        const moduleFromUrl = currentParams.get("module_id");
        const lessonFromUrl = currentParams.get("lesson_id");

        if (moduleFromUrl && lessonFromUrl) {
            openLessonInPlace(moduleFromUrl, lessonFromUrl);
        }
    });

    function redirectToLogin() {
        const currentPage =
            window.location.pathname + window.location.search;

        window.location.href =
            `login.html?redirect=${encodeURIComponent(currentPage)}`;
    }

    function getProgressRecord(data) {
        return data.progress ||
            data.data?.progress ||
            data.data ||
            data;
    }

    function applySavedProgress(progress) {
        lessonFinish.hidden = false;
        currentProgress = progress;
        lessonIsCompleted = progress?.status === "completed";

        if (lessonIsCompleted) {
            updateProgress(100);
            completeLessonButton.hidden = true;

            lessonFinishMessage.textContent =
                "Lesson completed! Your progress is saved. You can choose your next lesson from the sidebar.";
        } else if (progress?.status === "in_progress") {
            updateProgress(50);
            completeLessonButton.hidden = false;

            lessonFinishMessage.textContent =
                "You've reached the end of this lesson. Complete it when you're ready.";
        } else {
            updateProgress(0);
            completeLessonButton.hidden = false;

            lessonFinishMessage.textContent =
                "Review the material above before completing this lesson.";
        }

        updateNavigationTargets();
    }

    async function loadAndStartLessonProgress() {
        if (progressRequestInProgress) return;

        progressRequestInProgress = true;
        const requestedLessonId = String(lessonId);
        const requestedVersion = lessonRequestVersion;

        try {
            const data = await apiRequest(
                `/paths/lessons/${encodeURIComponent(requestedLessonId)}/progress`
            );

            if (
                requestedVersion !== lessonRequestVersion ||
                requestedLessonId !== String(lessonId)
            ) return;

            let progress = getProgressRecord(data);

            if (!progress || typeof progress.status !== "string") {
                throw new Error("The server returned invalid lesson progress.");
            }

            if (progress.status !== "completed") {
                const saved = await apiRequest(
                    `/paths/lessons/${encodeURIComponent(requestedLessonId)}/progress`,
                    {
                        method: "POST",
                        body: JSON.stringify({ status: "in_progress" })
                    }
                );

                if (
                    requestedVersion !== lessonRequestVersion ||
                    requestedLessonId !== String(lessonId)
                ) return;

                progress = getProgressRecord(saved);
            }

            applySavedProgress(progress);

            // Only fetch sidebar data if it has not already been loaded.
            await loadLessonNavigation(false);
        } catch (error) {
            if (
                requestedVersion !== lessonRequestVersion ||
                requestedLessonId !== String(lessonId)
            ) return;

            console.error("Could not load lesson progress:", error);

            showPageMessage(
                "The lesson loaded, but your saved progress could not be retrieved.",
                true
            );
        } finally {
            if (requestedVersion === lessonRequestVersion) {
                progressRequestInProgress = false;
            }
        }
    }

    async function loadXpTotals() {
        try {
            const data = await apiRequest(
                `/paths/${encodeURIComponent(pathId)}/enrollment`
            );

            if (!data.success || !data.xp) return;

            updateXpTotals(
                data.xp.overallXp,
                data.xp.pathXp
            );
        } catch (error) {
            console.error("Unable to load XP totals:", error);
        }
    }
function showModuleComingSoonModal() {
    let modal = document.getElementById("moduleComingSoonModal");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "moduleComingSoonModal";
        modal.className = "module-coming-soon-overlay";
        modal.innerHTML = `
            <div class="module-coming-soon-modal" role="dialog"
                 aria-modal="true" aria-labelledby="moduleComingSoonTitle">
                <div class="module-coming-soon-icon">🚀</div>
                <h2 id="moduleComingSoonTitle">Module 2 Coming Soon!</h2>
                <p>Congratulations on completing Module 1!</p>
                <p>We're preparing the next stage of your HTML learning journey.
                   Check back soon.</p>
                <button type="button" id="closeModuleComingSoon">
                    Got it
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector("#closeModuleComingSoon").addEventListener(
            "click",
            () => {
                modal.hidden = true;
                document.body.classList.remove("modal-open");
            }
        );

        modal.addEventListener("click", event => {
            if (event.target === modal) {
                modal.hidden = true;
                document.body.classList.remove("modal-open");
            }
        });
    }

    modal.hidden = false;
    document.body.classList.add("modal-open");
}
    async function completeCurrentLesson() {
        if (isCompletingLesson || lessonIsCompleted) return;

        clearPageMessage();
        isCompletingLesson = true;
        completeLessonButton.disabled = true;
        completeLessonButton.textContent = "Saving progress...";

        const requestedLessonId = String(lessonId);
        const requestedVersion = lessonRequestVersion;

        try {
            const data = await apiRequest(
                `/paths/lessons/${encodeURIComponent(requestedLessonId)}/progress`,
                {
                    method: "POST",
                    body: JSON.stringify({ status: "completed" })
                }
            );

            if (
                requestedVersion !== lessonRequestVersion ||
                requestedLessonId !== String(lessonId)
            ) return;

            const progress = getProgressRecord(data);

            if (progress?.status !== "completed") {
                throw new Error(
                    "The server did not confirm lesson completion."
                );
            }

            applySavedProgress(progress);

            const xpInfo = data.xp || {};
            const lessonXp = Number(xpInfo.awarded || 0);

            showXpReward(
                lessonXp,
                "Lesson completed! Keep up the good work.",
                xpInfo.overallXp,
                xpInfo.pathXp
            );

            showPageMessage(
                lessonXp > 0
                    ? `Lesson completed! You earned ${lessonXp} XP.`
                    : "Lesson completed! Your progress has been saved."
            );

            /*
             * Completion is the point where we refresh the sidebar cache.
             * This lets the next lesson/module unlock without refreshing
             * the browser or rebuilding the sidebar during ordinary clicks.
             */
            await loadLessonNavigation(true);

if (
    Number(requestedLessonId) === 10 &&
    Number(moduleId) === 1
) {
    showModuleComingSoonModal();
}
        } catch (error) {
            showPageMessage(
                error.message || "Unable to save lesson completion.",
                true
            );
        } finally {
            if (requestedVersion === lessonRequestVersion) {
                isCompletingLesson = false;
                completeLessonButton.disabled = false;
                completeLessonButton.textContent = "Complete Lesson";
            }
        }
    }

    function createTextElement(tagName, text, className = "") {
        const element = document.createElement(tagName);
        element.textContent = text ?? "";

        if (className) element.className = className;

        return element;
    }

    function appendInlineText(parent, value) {
        if (typeof value === "string" || typeof value === "number") {
            parent.appendChild(document.createTextNode(String(value)));
            return;
        }

        if (Array.isArray(value)) {
            value.forEach(item => appendInlineText(parent, item));
            return;
        }

        if (!value || typeof value !== "object") return;

        const text = value.text ?? value.content ?? value.value ?? "";

        if (value.type === "strong" || value.bold === true) {
            const element = document.createElement("strong");
            appendInlineText(element, text);
            parent.appendChild(element);
        } else if (value.type === "emphasis" || value.italic === true) {
            const element = document.createElement("em");
            appendInlineText(element, text);
            parent.appendChild(element);
        } else {
            appendInlineText(parent, text);
        }
    }

    function getBlockText(block) {
        if (typeof block === "string" || typeof block === "number") {
            return String(block);
        }

        if (!block || typeof block !== "object") return "";

        return block.text ??
            block.content ??
            block.value ??
            block.title ??
            "";
    }

    function renderList(block, ordered = false) {
        const list = document.createElement(ordered ? "ol" : "ul");
        let items = block.items ?? block.list ?? block.content ?? [];

        if (!Array.isArray(items)) items = [items];

        items.forEach(item => {
            const listItem = document.createElement("li");
            appendInlineText(listItem, getBlockText(item));
            list.appendChild(listItem);
        });

        return list;
    }

    function renderImage(block) {
        const figure = document.createElement("figure");
        figure.className = "image-card";

        const imageUrl = block.url || block.src || block.image_url;

        if (imageUrl) {
            const image = document.createElement("img");
            image.src = imageUrl;
            image.alt = block.alt || block.caption || "Lesson image";
            image.loading = "lazy";
            figure.appendChild(image);
        }

        if (block.caption) {
            figure.appendChild(
                createTextElement("figcaption", block.caption)
            );
        }

        return figure;
    }

    function renderBlock(block) {
        if (typeof block === "string" || typeof block === "number") {
            return createTextElement("p", String(block));
        }

        if (!block || typeof block !== "object") return null;

        const type = String(block.type || "paragraph").toLowerCase();
        const text = getBlockText(block);

        switch (type) {
            case "heading": {
                const level = Math.max(
                    2,
                    Math.min(4, Number(block.level) || 3)
                );

                const heading = document.createElement(`h${level}`);
                heading.className = "lesson-block-heading";
                appendInlineText(heading, text);
                return heading;
            }

            case "paragraph": {
                const paragraph = document.createElement("p");
                appendInlineText(paragraph, text);
                return paragraph;
            }

            case "list":
                return renderList(block, block.ordered === true);

            case "ordered_list":
                return renderList(block, true);

            case "unordered_list":
                return renderList(block, false);

            case "callout":
            case "example":
            case "remember":
            case "tip": {
                const callout = document.createElement("div");
                callout.className = "content-callout";

                const title = block.title ||
                    (type === "remember" ? "Remember this" : "");

                if (title) {
                    callout.appendChild(createTextElement("h3", title));
                }

                const paragraph = document.createElement("p");
                appendInlineText(paragraph, text);
                callout.appendChild(paragraph);

                if (Array.isArray(block.items)) {
                    callout.appendChild(renderList(block));
                }

                return callout;
            }

            case "image":
                return renderImage(block);

            case "divider": {
                const divider = document.createElement("div");
                divider.className = "lesson-divider";
                return divider;
            }

            default: {
                const paragraph = document.createElement("p");
                appendInlineText(paragraph, text);
                return paragraph;
            }
        }
    }

    function normalizeBlocks(content) {
        if (Array.isArray(content)) return content;

        if (typeof content === "string") {
            try {
                return normalizeBlocks(JSON.parse(content));
            } catch {
                return [content];
            }
        }

        if (content && typeof content === "object") {
            if (Array.isArray(content.blocks)) return content.blocks;
            if (Array.isArray(content.content)) return content.content;
            if (Array.isArray(content.items)) return content.items;

            return [content];
        }

        return [];
    }

    function getQuizOptions(options) {
        if (typeof options === "string") {
            try {
                options = JSON.parse(options);
            } catch {
                return [];
            }
        }

        if (Array.isArray(options)) {
            return options.map((option, index) => {
                if (typeof option === "string") {
                    return {
                        value: String(index),
                        label: option
                    };
                }

                const hasSeparateText =
                    option.text !== undefined ||
                    option.option_text !== undefined;

                const answerValue = hasSeparateText
                    ? option.label ?? option.value ?? option.id ?? String(index)
                    : option.value ?? option.id ?? String(index);

                const answerText = hasSeparateText
                    ? option.text ?? option.option_text
                    : option.label ?? option.text ?? option.option_text ?? option.value ?? "";

                const letter = String(answerValue);
                const displayText =
                    hasSeparateText && /^[A-D]$/i.test(letter)
                        ? `${letter}. ${answerText}`
                        : String(answerText);

                return {
                    value: letter,
                    label: displayText
                };
            }).filter(option => option.label);
        }

        if (options && typeof options === "object") {
            return Object.entries(options).map(([key, value]) => ({
                value: key,
                label: String(
                    typeof value === "object" && value !== null
                        ? value.text ?? value.option_text ?? value.label ?? ""
                        : value
                )
            })).filter(option => option.label);
        }

        return [];
    }

    function normalizeQuestionType(question) {
        return String(
            question.question_type || question.type || ""
        ).toLowerCase();
    }

    function answerIsEmpty(answer) {
        return answer === null ||
            answer === undefined ||
            String(answer).trim() === "";
    }

    function normalizeAnswerForComparison(value) {
        return String(value ?? "").trim().toLowerCase();
    }

    async function loadQuizInto(container, quizId) {
        container.replaceChildren();

        const savedCorrectAnswers = new Map();
        const savedCorrectResults = new Map();

        let retryQuestionIds = null;
        let submitted = false;
        let currentQuiz = null;
        let currentQuestions = [];
        let lastAttempt = null;

        function addMessage(message, className = "") {
            const element = createTextElement("p", message, className);
            container.appendChild(element);
            return element;
        }

        function createButton(label, className, onClick) {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = label;
            button.className = className;
            button.addEventListener("click", onClick);
            return button;
        }

        function getSelectedAnswer(question) {
            const questionId = Number(question.question_id);
            const fieldName = `question_${questionId}`;

            const selected = container.querySelector(
                `input[name="${fieldName}"]:checked`
            );

            if (selected) return selected.value;

            const textInput = container.querySelector(
                `input[data-question-id="${questionId}"]`
            );

            return textInput ? textInput.value.trim() : "";
        }

        function getAnswerValue(question, answer) {
            const type = normalizeQuestionType(question);

            if (type === "true_false") {
                const value = normalizeAnswerForComparison(answer);

                if (value === "true") return "True";
                if (value === "false") return "False";
            }

            const options = getQuizOptions(question.options);

            const match = options.find(option =>
                String(option.value) === String(answer)
            );

            return match ? match.label : String(answer ?? "");
        }

        function normalizeSavedAttempt(attempt) {
            return {
                score: Number(attempt.score ?? 0),
                total_questions: Number(
                    attempt.total_questions ?? currentQuestions.length
                ),
                correct_answers: Number(attempt.correct_answers ?? 0),
                passed: attempt.passed === true,
                is_perfect: attempt.is_perfect === true,
                xp_awarded: Number(attempt.xp_awarded ?? 0),
                answers: Array.isArray(attempt.answers)
                    ? attempt.answers
                    : []
            };
        }

        function renderResults(result) {
            container.replaceChildren();

            const answers = result.answers || [];
            const score = Number(result.score || 0);

            container.appendChild(
                createTextElement("h3", "Quiz Results", "quiz-results-title")
            );

            container.appendChild(
                createTextElement(
                    "p",
                    `${score}% — ${result.correct_answers} out of ${result.total_questions} correct`,
                    "quiz-score"
                )
            );

            container.appendChild(
                createTextElement(
                    "p",
                    result.passed
                        ? "You passed this quiz."
                        : "You have not reached the pass mark yet.",
                    result.passed ? "quiz-passed" : "quiz-failed"
                )
            );

            answers.forEach(answer => {
                const question = currentQuestions.find(item =>
                    Number(item.question_id) === Number(answer.question_id)
                );

                if (!question) return;

                const card = document.createElement("div");
                card.className = answer.is_correct
                    ? "quiz-feedback quiz-feedback-correct"
                    : "quiz-feedback quiz-feedback-incorrect";

                card.appendChild(
                    createTextElement("h4", question.prompt || "Question")
                );

                card.appendChild(
                    createTextElement(
                        "p",
                        answer.is_correct ? "Correct" : "Incorrect",
                        "quiz-feedback-status"
                    )
                );

                const submittedAnswer = answer.submitted_answer;

                card.appendChild(
                    createTextElement(
                        "p",
                        `Your answer: ${
                            answerIsEmpty(submittedAnswer)
                                ? "Not answered"
                                : getAnswerValue(question, submittedAnswer)
                        }`
                    )
                );

                if (answer.explanation) {
                    card.appendChild(
                        createTextElement(
                            "p",
                            answer.explanation,
                            "quiz-explanation"
                        )
                    );
                }

                container.appendChild(card);
            });

            answers.forEach(answer => {
                if (answer.is_correct) {
                    const id = Number(answer.question_id);
                    savedCorrectAnswers.set(id, answer.submitted_answer);
                    savedCorrectResults.set(id, answer);
                }
            });

            const incorrectAnswers = answers.filter(
                answer => !answer.is_correct
            );

            if (incorrectAnswers.length > 0) {
                container.appendChild(
                    createButton(
                        "Retry Incorrect Questions",
                        "quiz-retry",
                        () => {
                            retryQuestionIds = incorrectAnswers.map(
                                answer => Number(answer.question_id)
                            );

                            submitted = false;
                            renderQuestions();
                        }
                    )
                );
            } else {
                container.appendChild(
                    createTextElement(
                        "p",
                        "All questions in this attempt are correct.",
                        "quiz-complete"
                    )
                );
            }
        }

        function renderQuestions() {
            container.replaceChildren();

            container.appendChild(
                createTextElement(
                    "h3",
                    currentQuiz.title || "Knowledge Check"
                )
            );

            if (currentQuiz.instructions) {
                container.appendChild(
                    createTextElement("p", currentQuiz.instructions)
                );
            }

            const visibleQuestions = retryQuestionIds
                ? currentQuestions.filter(question =>
                    retryQuestionIds.includes(Number(question.question_id))
                )
                : currentQuestions.filter(question =>
                    !savedCorrectAnswers.has(Number(question.question_id))
                );

            if (visibleQuestions.length === 0) {
                addMessage(
                    "There are no unanswered or incorrect questions to complete.",
                    "quiz-complete"
                );
                return;
            }

            const form = document.createElement("form");
            form.className = "quiz-form";

            visibleQuestions.forEach((question, index) => {
                const card = document.createElement("fieldset");
                card.className = "quiz-question";

                const legend = document.createElement("legend");
                legend.textContent =
                    `${index + 1}. ${question.prompt || "Question"}`;

                card.appendChild(legend);

                const type = normalizeQuestionType(question);
                const questionId = Number(question.question_id);
                const required = true;

                if (type === "multiple_choice") {
                    const options = getQuizOptions(question.options);

                    options.forEach(option => {
                        const label = document.createElement("label");
                        label.className = "quiz-option";

                        const input = document.createElement("input");
                        input.type = "radio";
                        input.name = `question_${questionId}`;
                        input.value = option.value;
                        input.required = required;

                        const text = document.createElement("span");
                        text.textContent = option.label;

                        label.append(input, text);
                        card.appendChild(label);
                    });
                } else if (type === "true_false") {
                    ["true", "false"].forEach(value => {
                        const label = document.createElement("label");
                        label.className = "quiz-option";

                        const input = document.createElement("input");
                        input.type = "radio";
                        input.name = `question_${questionId}`;
                        input.value = value;
                        input.required = required;

                        const text = document.createElement("span");
                        text.textContent =
                            value === "true" ? "True" : "False";

                        label.append(input, text);
                        card.appendChild(label);
                    });
                } else if (type === "short_answer") {
                    const input = document.createElement("input");
                    input.type = "text";
                    input.className = "quiz-short-answer";
                    input.name = `question_${questionId}`;
                    input.dataset.questionId = String(questionId);
                    input.placeholder = "Enter your answer";
                    input.required = required;

                    card.appendChild(input);
                } else {
                    card.appendChild(
                        createTextElement(
                            "p",
                            "This question type is not supported yet."
                        )
                    );
                }

                form.appendChild(card);
            });

            const submitButton = document.createElement("button");
            submitButton.type = "submit";
            submitButton.className = "quiz-submit";
            submitButton.textContent = "Answer all questions first";
            submitButton.disabled = true;

            function updateSubmitButtonState() {
                const allAnswered = visibleQuestions.every(question => {
                    const answer = getSelectedAnswer(question);
                    return !answerIsEmpty(answer);
                });

                submitButton.disabled = !allAnswered;
                submitButton.textContent = allAnswered
                    ? "Submit Answers"
                    : "Answer all questions first";
            }

            form.addEventListener("change", updateSubmitButtonState);
            form.addEventListener("input", updateSubmitButtonState);

            form.appendChild(submitButton);

            form.addEventListener("submit", async event => {
                event.preventDefault();

                if (submitted) return;

                const answersById = new Map();

                savedCorrectAnswers.forEach((answer, questionId) => {
                    answersById.set(questionId, {
                        question_id: questionId,
                        answer
                    });
                });

                for (const question of visibleQuestions) {
                    const questionId = Number(question.question_id);
                    const answer = getSelectedAnswer(question);

                    if (answerIsEmpty(answer)) {
                        addMessage(
                            "Please answer every question before submitting.",
                            "quiz-error"
                        );

                        updateSubmitButtonState();
                        return;
                    }

                    answersById.set(questionId, {
                        question_id: questionId,
                        answer
                    });
                }

                submitted = true;
                submitButton.disabled = true;
                submitButton.textContent = "Submitting...";

                try {
                    const response = await apiRequest(
                        `/quizzes/${encodeURIComponent(quizId)}/submit`,
                        {
                            method: "POST",
                            body: JSON.stringify({
                                answers: Array.from(answersById.values())
                            })
                        }
                    );

                    if (!response.result) {
                        throw new Error(
                            "The server did not return quiz results."
                        );
                    }

                    lastAttempt = response.result;

                    showXpReward(
                        lastAttempt.xp_awarded,
                        lastAttempt.is_perfect
                            ? "Perfect quiz! Great work."
                            : "Keep learning and building your skills.",
                        lastAttempt.overall_xp,
                        lastAttempt.path_xp
                    );

                    renderResults(lastAttempt);
                } catch (error) {
                    submitted = false;
                    submitButton.disabled = false;
                    submitButton.textContent = "Submit Answers";

                    addMessage(
                        error.message ||
                            "Unable to submit your answers. Please try again.",
                        "quiz-error"
                    );
                }
            });

            container.appendChild(form);
        }

        try {
            if (!quizId) {
                throw new Error("This quiz does not have a quiz ID.");
            }

            addMessage("Loading quiz questions...", "quiz-loading");

            const data = await apiRequest(
                `/quizzes/${encodeURIComponent(quizId)}`
            );

            currentQuiz = data.quiz || data.data?.quiz;
            currentQuestions = data.questions || data.data?.questions;

            if (!currentQuiz || !Array.isArray(currentQuestions)) {
                throw new Error("The server returned incomplete quiz data.");
            }

            container.replaceChildren();

            if (currentQuestions.length === 0) {
                addMessage("No questions have been added yet.");
                return;
            }

            try {
                const saved = await apiRequest(
                    `/quizzes/${encodeURIComponent(quizId)}/attempts/latest`
                );

                const attempt = saved.attempt || saved.data?.attempt || null;

                if (attempt && Array.isArray(attempt.answers)) {
                    lastAttempt = normalizeSavedAttempt(attempt);

                    attempt.answers.forEach(answer => {
                        if (answer.is_correct) {
                            const id = Number(answer.question_id);
                            savedCorrectAnswers.set(
                                id,
                                answer.submitted_answer
                            );
                            savedCorrectResults.set(id, answer);
                        }
                    });

                    renderResults(lastAttempt);
                    return;
                }
            } catch (error) {
                console.warn("Could not restore saved quiz attempt:", error);
            }

            renderQuestions();
        } catch (error) {
            container.replaceChildren();

            addMessage(
                error.message || "Unable to load this quiz.",
                "quiz-error"
            );

            container.appendChild(
                createButton(
                    "Retry Loading Quiz",
                    "quiz-retry",
                    () => loadQuizInto(container, quizId)
                )
            );
        }
    }

    function renderSection(section, index) {
        const sectionElement = document.createElement("section");
        sectionElement.className = "content-section";

        const number = createTextElement(
            "div",
            String(index + 1).padStart(2, "0"),
            "section-number"
        );

        const body = document.createElement("div");
        body.className = "section-body";

        const title = section.title || section.section_title || "";
        body.appendChild(createTextElement("h2", title));

        const content = section.section_content ??
            section.content ??
            section.blocks ??
            [];

        normalizeBlocks(content).forEach(block => {
            const element = renderBlock(block);
            if (element) body.appendChild(element);
        });

        if (String(section.section_type || "").toLowerCase() === "quiz") {
            const quizContainer = document.createElement("div");
            quizContainer.className = "lesson-quiz";
            body.appendChild(quizContainer);

            loadQuizInto(quizContainer, section.quiz_id);
        }

        sectionElement.append(number, body);
        return sectionElement;
    }

    function renderLesson(data) {
        const lesson = data.lesson || data.data?.lesson || data;

        const sections = data.sections ||
            data.data?.sections ||
            lesson.sections ||
            [];

        currentLesson = lesson;

        lessonTitle.textContent = lesson.title || "Untitled lesson";
        lessonSummary.textContent = lesson.summary || "";

        lessonDuration.textContent =
            `◷ About ${lesson.estimated_minutes || 10} minutes`;

        lessonLabel.textContent =
            `LESSON ${lesson.lesson_number || lesson.lesson_id || lessonId}`;

        moduleLabel.textContent = `MODULE ${moduleId}`;
        sidebarModuleTitle.textContent =
            `Module ${lesson.module_number || moduleId}`;

        modalPathTitle.textContent =
            lesson.path_title || "Website Development";

        lessonSections.replaceChildren();

        if (!Array.isArray(sections) || sections.length === 0) {
            showPlaceholder(
                "Lesson content is not available yet",
                "This lesson has no published sections to display yet.",
                true
            );
            return;
        }

        sections.forEach((section, index) => {
            if (index > 0) {
                const divider = document.createElement("div");
                divider.className = "lesson-divider";
                lessonSections.appendChild(divider);
            }

            lessonSections.appendChild(renderSection(section, index));
        });

        lessonFinish.hidden = true;
        lessonContent.hidden = false;
        lessonPlaceholder.hidden = true;

        // Do not reload the sidebar here.
        updateSidebarForCurrentLesson();
        updateNavigationTargets();

        loadAndStartLessonProgress();
    }

    async function loadLesson() {
        clearPageMessage();
        retryButton.hidden = true;

        if (!accessToken) {
            showPlaceholder(
                "Sign in to continue",
                "Please sign in to your CodeXperts account to access your learning path."
            );

            redirectToLogin();
            return;
        }

        showPlaceholder(
            "Loading your lesson...",
            "Checking lesson availability and your enrollment."
        );

        try {
            const data = await apiRequest(
                `/paths/lessons/${encodeURIComponent(lessonId)}`
            );

            renderLesson(data);
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                showPlaceholder(
                    "Lesson access unavailable",
                    "Your session may have expired, or your account may not have access to this lesson."
                );

                if (error.status === 401) redirectToLogin();
                return;
            }

            if (
                error.message.toLowerCase().includes("not available yet") ||
                error.message.toLowerCase().includes("not published")
            ) {
                showPlaceholder(
                    "This lesson is not available yet",
                    "The lesson is still being prepared. Please return when it has been published."
                );
                return;
            }

            showPlaceholder(
                "We couldn't load this lesson",
                error.message || "Please check your connection and try again.",
                true
            );
        }
    }

    async function checkEnrollment() {
        clearPageMessage();
        retryButton.hidden = true;

        if (!accessToken) {
            showPlaceholder(
                "Sign in to continue",
                "Please sign in to your CodeXperts account first."
            );

            redirectToLogin();
            return;
        }

        showPlaceholder(
            "Checking your enrollment...",
            "Please wait while we check your learning path."
        );

        try {
            const data = await apiRequest(
                `/paths/${encodeURIComponent(pathId)}/enrollment`
            );

            const enrollment = data.enrollment || data.data?.enrollment;

            if (
                data.hasEnrollment === true ||
                data.enrolled === true ||
                enrollment?.status === "active"
            ) {
                hideEnrollmentModal();
                await loadLesson();
                return;
            }

            showPlaceholder(
                "Your lesson is locked",
                "Enroll in this learning path to unlock its lessons."
            );

            showEnrollmentModal();
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                redirectToLogin();
                return;
            }

            if (error.status === 404) {
                showEnrollmentModal();
                return;
            }

            showPlaceholder(
                "We couldn't check your enrollment",
                error.message || "Please try again.",
                true
            );
        }
    }

    async function enrollNow() {
        if (!accessToken) {
            redirectToLogin();
            return;
        }

        enrollmentError.hidden = true;
        enrollNowButton.disabled = true;
        enrollNowButton.textContent = "Saving enrollment...";

        modalFootnote.textContent =
            "Please wait while we save your enrollment.";

        try {
            await apiRequest("/paths/enroll", {
                method: "POST",
                body: JSON.stringify({ path_id: Number(pathId) })
            });

            modalFootnote.textContent = "Enrollment saved successfully.";

            hideEnrollmentModal();
            await loadLesson();
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                showEnrollmentError(
                    "Your session has expired. Please sign in again."
                );

                enrollNowButton.disabled = false;
                enrollNowButton.textContent = "Enroll Now →";

                redirectToLogin();
                return;
            }

            showEnrollmentError(
                error.message ||
                    "We couldn't save your enrollment. Please try again."
            );

            enrollNowButton.disabled = false;
            enrollNowButton.textContent = "Try again →";

            modalFootnote.textContent =
                "Your enrollment has not been confirmed yet.";
        }
    }

    enrollNowButton.addEventListener("click", enrollNow);
    retryButton.addEventListener("click", checkEnrollment);
    completeLessonButton.addEventListener("click", completeCurrentLesson);
if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        const confirmed = window.confirm(
            "Are you sure you want to log out?"
        );

        if (!confirmed) return;

        sessionStorage.removeItem("loggedInUser");
        sessionStorage.removeItem("supabaseAccessToken");

        // Remove any alternative session keys this page can read.
        const sessionKeys = [
            "session",
            "authSession",
            "supabaseSession",
            "supabase_session",
            "loggedInSession",
            "auth",
            "access_token",
            "accessToken",
            "user",
            "currentUser"
        ];

        [sessionStorage, localStorage].forEach(storage => {
            sessionKeys.forEach(key => storage.removeItem(key));

            // Remove persisted Supabase authentication tokens, if present.
            Object.keys(storage).forEach(key => {
                if (
                    key.startsWith("sb-") &&
                    key.includes("auth-token")
                ) {
                    storage.removeItem(key);
                }
            });
        });

        window.location.replace("login.html");
    });
}
    displayUser();
    accessToken = findAccessToken();

    loadXpTotals();
    checkEnrollment();

    console.log("CodeXperts lesson page initialized:", {
        pathId,
        moduleId,
        lessonId
    });
});
