
document.addEventListener("DOMContentLoaded", () => {
    const pathsGrid = document.getElementById("pathsGrid");
    const pathCount = document.getElementById("pathCount");
    const continueDock = document.getElementById("continueDock");
    const continueButton = document.getElementById("continueButton");
    const selectedPathName = document.getElementById("selectedPathName");
    const selectionMessage = document.getElementById("selectionMessage");

    let selectedPath = null;
    let isNavigating = false;

    const pathDetails = {
        "website development": {
            icon: "🌐",
            tags: ["HTML", "CSS", "JavaScript"]
        },
        "python": {
            icon: "🐍",
            tags: ["Python", "Programming", "Problem Solving"]
        },
        "java": {
            icon: "☕",
            tags: ["Java", "OOP", "Applications"]
        },
        "c#": {
            icon: "💻",
            tags: ["C#", ".NET", "Applications"]
        },
        "c++": {
            icon: "⚙️",
            tags: ["C++", "Algorithms", "Programming"]
        }
    };

    function getPathDetails(pathName) {
        const key = String(pathName || "").trim().toLowerCase();

        return pathDetails[key] || {
            icon: "💻",
            tags: ["Programming", "Learning"]
        };
    }

    function showLoadingMessage(message, isError = false) {
        pathsGrid.replaceChildren();

        const paragraph = document.createElement("p");
        paragraph.className = isError
            ? "paths-message error"
            : "paths-message";

        paragraph.textContent = message;
        pathsGrid.appendChild(paragraph);
    }

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    function selectPath(path, card) {
        if (isNavigating) {
            return;
        }

        selectedPath = path;

        pathsGrid.querySelectorAll(".path-card").forEach((pathCard) => {
            const isSelected = pathCard === card;

            pathCard.classList.toggle("selected", isSelected);
            pathCard.setAttribute("aria-pressed", String(isSelected));

            const action = pathCard.querySelector(".path-action");

            if (action) {
                action.textContent = isSelected
                    ? "Selected ✓"
                    : "Select path →";
            }
        });

        selectedPathName.textContent = path.path_name;
        selectionMessage.textContent =
            "Continue to explore this learning path.";

        continueDock.hidden = false;
        continueButton.disabled = false;
        continueButton.innerHTML =
            'Continue <span aria-hidden="true">→</span>';
    }

    function createPathCard(path) {
        const details = getPathDetails(path.path_name);
        const isAvailable =
            String(path.status || "").trim().toLowerCase() === "available";

        const card = document.createElement("button");
        card.type = "button";
        card.className = "path-card";
        card.disabled = !isAvailable;
        card.setAttribute("aria-pressed", "false");

        const top = createElement("div", "path-card-top");

        const icon = createElement("span", "path-icon", details.icon);
        icon.setAttribute("aria-hidden", "true");

        const status = createElement(
            "span",
            `path-status ${isAvailable ? "available" : "coming-soon"}`,
            isAvailable ? "AVAILABLE" : "COMING SOON"
        );

        top.append(icon, status);

        const name = createElement("h3", "path-name", path.path_name);

        const description = createElement(
            "p",
            "path-description",
            path.description ||
                "Explore this programming path and build your skills."
        );

        const tags = createElement("div", "path-tags");

        details.tags.forEach((tagText) => {
            tags.appendChild(createElement("span", "path-tag", tagText));
        });

        const bottom = createElement("div", "path-card-bottom");

        const availabilityText = createElement(
            "span",
            "path-availability",
            isAvailable ? "Start your journey" : "Not available yet"
        );

        const action = createElement(
            "span",
            "path-action",
            isAvailable ? "Select path →" : "Coming soon"
        );

        bottom.append(availabilityText, action);

        card.append(top, name, description, tags, bottom);

        if (isAvailable) {
            card.addEventListener("click", () => {
                selectPath(path, card);
            });
        }

        return card;
    }

    async function loadPaths() {
        showLoadingMessage("Loading learning paths...");

        try {
            const response = await fetch("http://localhost:5000/api/paths");
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to load learning paths."
                );
            }

            if (!Array.isArray(result.paths)) {
                throw new Error("The server returned an invalid paths list.");
            }

            pathsGrid.replaceChildren();

            if (result.paths.length === 0) {
                showLoadingMessage("No learning paths are available yet.");
                pathCount.textContent = "0 PATHS";
                return;
            }

            result.paths.forEach((path) => {
                pathsGrid.appendChild(createPathCard(path));
            });

            pathCount.textContent = `${result.paths.length} PATHS`;

        } catch (error) {
            console.error("Error loading learning paths:", error);

            showLoadingMessage(
                "We couldn't load the learning paths. Please check that the backend is running and try refreshing the page.",
                true
            );
        }
    }

    continueButton.addEventListener("click", () => {
        if (!selectedPath || isNavigating) {
            return;
        }

        isNavigating = true;
        continueButton.disabled = true;
        continueButton.textContent = "Opening path...";

        /*
         * No enrollment is saved on this page.
         * Pass the selected path ID to the learning path page.
         * Enrollment will happen later when the user clicks
         * Enroll Now on the lesson page.
         */
        const destination =
            `learning-path.html?path_id=${encodeURIComponent(selectedPath.path_id)}`;

        window.location.href = destination;
    });

    loadPaths();
});