
document.addEventListener("DOMContentLoaded", async function () {
    const API_BASE = "http://localhost:5000/api";

    const pathTitle = document.getElementById("pathTitle");
    const pathDescription = document.getElementById("pathDescription");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const moduleCount = document.getElementById("moduleCount");
    const modulesList = document.getElementById("modulesList");
    const pageMessage = document.getElementById("pageMessage");
    const continueButton = document.getElementById("continueButton");
    const bottomContinueButton = document.getElementById("bottomContinueButton");

    const params = new URLSearchParams(window.location.search);
    const pathId = Number(params.get("path_id"));

    let modules = [];

    // Curriculum details for each module.
    // Module names themselves are loaded from the database.
    const curriculum = {
        1: {
            lessons: [
                "Introduction to websites and web development",
                "Websites versus web applications",
                "Frontend, backend and full-stack development",
                "How browsers and web servers communicate",
                "HTTP and HTTPS",
                "Domains, URLs, web hosting and DNS basics",
                "The roles of HTML, CSS and JavaScript",
                "Text editors, browser developer tools and debugging tools",
                "How frontend and backend systems work together",
                "A practical activity demonstrating how a website works"
            ],
            project: "Explore how a browser requests and displays a webpage, and identify the role of the frontend, backend and web server."
        },

        2: {
            lessons: [
                "Introduction to HTML",
                "HTML document structure",
                "Headings and paragraphs",
                "Links and navigation",
                "Images and media",
                "Ordered and unordered lists",
                "HTML tables",
                "Semantic HTML",
                "Forms and user input",
                "HTML tags, attributes, element nesting and file paths",
                "Accessibility, labels, form controls and common HTML errors"
            ],
            project: "Build a personal-profile webpage using headings, paragraphs, links, images, lists and accessible HTML structure."
        },

        3: {
            lessons: [
                "Introduction to CSS",
                "Inline, internal and external CSS",
                "CSS syntax and selectors",
                "Colours and backgrounds",
                "Typography and fonts",
                "The CSS box model",
                "Width, height, margin and padding",
                "Display, positioning and layout",
                "Flexbox",
                "CSS Grid",
                "Borders, shadows, transitions and hover effects"
            ],
            project: "Style your personal-profile webpage with colours, typography, spacing, Flexbox or Grid, and interactive hover effects."
        },

        4: {
            lessons: [
                "Responsive design principles",
                "Mobile-first design",
                "The viewport meta tag",
                "Relative units and fluid sizing",
                "Media queries and breakpoints",
                "Responsive Flexbox and Grid layouts",
                "Responsive images",
                "Mobile-friendly navigation",
                "Touch-friendly interface design",
                "Testing layouts with browser developer tools"
            ],
            project: "Turn a webpage into a responsive design that adapts to mobile phones, tablets and desktop screens."
        },

        5: {
            lessons: [
                "Introduction to JavaScript",
                "Connecting JavaScript to HTML",
                "Variables using let and const",
                "Data types",
                "Operators and expressions",
                "Strings, numbers and template literals",
                "Conditional statements",
                "Loops",
                "Functions",
                "Arrays",
                "Objects",
                "Basic debugging"
            ],
            project: "Build a simple calculator or interactive application using variables, conditions, functions and user input."
        },

        6: {
            lessons: [
                "What the Document Object Model (DOM) is",
                "Selecting HTML elements",
                "Changing text and HTML",
                "Changing CSS classes and styles",
                "Events and event listeners",
                "Event objects",
                "Creating and removing elements",
                "Reading user input",
                "Event bubbling",
                "Event delegation"
            ],
            project: "Build a to-do list that lets users add, complete and remove tasks using JavaScript and the DOM."
        },

        7: {
            lessons: [
                "HTML forms and input types",
                "Labels and accessible forms",
                "Required fields and built-in validation",
                "Handling form submission",
                "Email and password validation",
                "Displaying field-specific errors",
                "Preventing invalid submissions",
                "Providing clear feedback",
                "Safe handling and validation of user input",
                "Frontend versus backend validation",
                "Why client-side validation alone is insufficient"
            ],
            project: "Build a registration form with validation, clear error messages, accessible fields and appropriate submission handling."
        },

        8: {
            lessons: [
                "What APIs are",
                "JSON and data structures",
                "HTTP methods: GET, POST, PATCH and DELETE",
                "Fetching data with JavaScript",
                "Promises",
                "async and await",
                "Loading states and error handling",
                "HTTP status codes",
                "Sending JSON to a backend",
                "How frontend, backend and databases communicate",
                "Authentication fundamentals",
                "Environment variables and protecting backend secrets"
            ],
            project: "Build an application that retrieves data from an API and handles loading states, errors and responses."
        },

        9: {
            lessons: [
                "Planning a complete website",
                "Defining users, requirements and features",
                "Organising project folders",
                "Designing page layouts and navigation",
                "Reusable components and shared layouts",
                "Connecting HTML, CSS and JavaScript",
                "Responsive navigation",
                "Forms and interactions",
                "Backend API integration",
                "Dynamic data",
                "Accessibility and usability",
                "Testing and debugging",
                "Git and version control fundamentals",
                "Deployment fundamentals"
            ],
            project: "Plan and build an integrated website that combines a responsive interface, interactive features and backend data where appropriate."
        },

        10: {
            lessons: [
                "Choose or receive a project brief",
                "Identify the target users and project objectives",
                "Define functional and non-functional requirements",
                "Plan the pages and navigation",
                "Build the HTML structure",
                "Apply CSS styling",
                "Implement responsive layouts",
                "Add JavaScript interactions",
                "Implement form validation",
                "Connect to a backend or API where appropriate",
                "Test functionality and correct errors",
                "Review accessibility and usability",
                "Prepare the final project for presentation",
                "Explain how the project works"
            ],
            project: "Complete and present a full website project, explaining its requirements, design, code, functionality, testing and technical decisions."
        }
    };

    // Show the username, not the first name.
    try {
        const user = JSON.parse(
            sessionStorage.getItem("loggedInUser") || "null"
        );

        if (user && user.username) {
            usernameDisplay.textContent = user.username;
        } else {
            usernameDisplay.textContent = "My Learning";
        }
    } catch (error) {
        usernameDisplay.textContent = "My Learning";
    }

    function showError(message) {
        pageMessage.textContent = message;
        pageMessage.classList.add("error");
        pageMessage.hidden = false;
    }

    function escapeText(value) {
        return String(value ?? "");
    }

    // Create each expandable module using the database title and description.
    function renderModules() {
        modulesList.replaceChildren();

        modules.forEach(function (module) {
            const number = Number(module.module_number);
            const details = curriculum[number];

            const item = document.createElement("details");
            item.className = "module-item";

            // Keep the first module open to preview its content.
            if (number === 1) {
                item.open = true;
            }

            const summary = document.createElement("summary");
            summary.className = "module-toggle";

            const moduleNumber = document.createElement("span");
            moduleNumber.className = "module-number";
            moduleNumber.textContent = String(number).padStart(2, "0");

            const heading = document.createElement("div");
            heading.className = "module-heading";

            const title = document.createElement("h3");
            title.textContent = escapeText(module.module_name);

            const description = document.createElement("p");
            description.textContent = escapeText(module.description);

            heading.append(title, description);

            const arrow = document.createElement("span");
            arrow.className = "dropdown-arrow";
            arrow.setAttribute("aria-hidden", "true");
            arrow.textContent = "⌄";

            summary.append(moduleNumber, heading, arrow);

            const content = document.createElement("div");
            content.className = "module-content";

            const lessonList = document.createElement("ol");
            lessonList.className = "lesson-list";

            const topics = details ? details.lessons : [];

            topics.forEach(function (lesson) {
                const listItem = document.createElement("li");
                listItem.textContent = lesson;
                lessonList.appendChild(listItem);
            });

            content.appendChild(lessonList);

            if (details && details.project) {
                const project = document.createElement("div");
                project.className = "module-project";

                const projectTitle = document.createElement("strong");
                projectTitle.textContent = "PRACTICAL ACTIVITY / PROJECT";

                const projectDescription = document.createElement("p");
                projectDescription.textContent = details.project;

                project.append(projectTitle, projectDescription);
                content.appendChild(project);
            }

            item.append(summary, content);
            modulesList.appendChild(item);
        });

        moduleCount.textContent =
            `${modules.length} ${modules.length === 1 ? "module" : "modules"}`;

        pageMessage.hidden = true;
    }

    // Both Continue buttons proceed to the first lesson.
    function continueToLesson() {
        if (!Number.isSafeInteger(pathId) || pathId < 1) {
            showError("The selected learning path is invalid.");
            return;
        }

        const firstModule = modules.find(
            module => Number(module.module_number) === 1
        );

        if (!firstModule) {
            showError("The first module is not available yet. Please try again.");
            return;
        }

        // Enrollment will be handled on lesson.html, not this page.
        window.location.href =
            `lesson.html?path_id=${encodeURIComponent(pathId)}` +
            `&module_id=${encodeURIComponent(firstModule.module_id)}`;
    }

    continueButton.addEventListener("click", continueToLesson);
    bottomContinueButton.addEventListener("click", continueToLesson);

    // Fetch the selected course and its modules.
    async function loadCurriculum() {
        if (!Number.isSafeInteger(pathId) || pathId < 1) {
            showError("No valid learning path was selected. Please return to course selection.");
            pathTitle.textContent = "Learning path unavailable";
            moduleCount.textContent = "0 modules";
            continueButton.disabled = true;
            bottomContinueButton.disabled = true;
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE}/paths/${pathId}/modules`
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to load the curriculum."
                );
            }

            if (!result.path) {
                throw new Error("The selected learning path was not found.");
            }

            if (String(result.path.status).toLowerCase() !== "available") {
                throw new Error("This learning path is not available yet.");
            }

            modules = Array.isArray(result.modules)
                ? result.modules
                : [];

            pathTitle.textContent = result.path.path_name;
            pathDescription.textContent = result.path.description || "";

            if (modules.length === 0) {
                showError("There are no modules available for this course yet.");
                moduleCount.textContent = "0 modules";
                continueButton.disabled = true;
                bottomContinueButton.disabled = true;
                return;
            }

            renderModules();
        } catch (error) {
            console.error("Curriculum loading error:", error);
            showError(
                error.message ||
                "Unable to load the curriculum. Check that your backend is running."
            );

            pathTitle.textContent = "Unable to load learning path";
            moduleCount.textContent = "Unavailable";
            continueButton.disabled = true;
            bottomContinueButton.disabled = true;
        }
    }

    await loadCurriculum();
});