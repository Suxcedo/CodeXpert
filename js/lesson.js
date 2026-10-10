
document.addEventListener("DOMContentLoaded", () => {
    const enrollmentOverlay = document.getElementById("enrollmentOverlay");
    const enrollNowButton = document.getElementById("enrollNowButton");
    const lessonContent = document.getElementById("lessonContent");
    const lessonPlaceholder = document.getElementById("lessonPlaceholder");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const userAvatar = document.getElementById("userAvatar");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const comparisonResult = document.getElementById("comparisonResult");
    const quizQuestion = document.getElementById("quizQuestion");
    const quizOptions = document.getElementById("quizOptions");
    const quizFeedback = document.getElementById("quizFeedback");
    const nextQuestionButton = document.getElementById("nextQuestionButton");
    const quizProgress = document.querySelector(".quiz-progress");
    const lessonFinish = document.getElementById("lessonFinish");
    const finishButton = document.getElementById("finishButton");
    const finishNote = document.getElementById("finishNote");

    const params = new URLSearchParams(window.location.search);
    const pathId = params.get("path_id") || "1";
    const moduleId = params.get("module_id") || "1";

    // Preserve the selected learning path when returning.
    const backLink = document.querySelector(".back-link");
    if (backLink) {
        backLink.href = `learning-path.html?path_id=${encodeURIComponent(pathId)}`;
    }

    // Display the logged-in user's username.
    try {
        const storedUser = JSON.parse(
            sessionStorage.getItem("loggedInUser") || "{}"
        );

        const username =
            storedUser.username ||
            storedUser.user_name ||
            "Learner";

        usernameDisplay.textContent = username;
        userAvatar.textContent = username.charAt(0).toUpperCase();
    } catch (error) {
        usernameDisplay.textContent = "Learner";
        userAvatar.textContent = "L";
    }

    // Keep the enrollment popup open until Enroll Now is clicked.
    document.body.style.overflow = "hidden";

    enrollNowButton.addEventListener("click", () => {
        enrollmentOverlay.hidden = true;
        lessonPlaceholder.hidden = true;
        lessonContent.hidden = false;

        document.body.style.overflow = "";
        updateProgress(10);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    // Interactive website-versus-webpage examples.
    const exampleTiles = document.querySelectorAll(".example-tile");

    exampleTiles.forEach((tile) => {
        tile.addEventListener("click", () => {
            exampleTiles.forEach((item) => {
                item.classList.remove("selected");
            });

            tile.classList.add("selected");

            const website = tile.dataset.website;
            const webpage = tile.dataset.webpage;

            comparisonResult.replaceChildren();

            const icon = document.createElement("span");
            icon.className = "result-icon";
            icon.textContent = "💡";

            const text = document.createElement("p");

            const websiteLabel = document.createElement("strong");
            websiteLabel.textContent = website;

            const webpageLabel = document.createElement("strong");
            webpageLabel.textContent = webpage;

            text.append(
                "The complete website is ",
                websiteLabel,
                ". One example of a page inside it is the ",
                webpageLabel,
                "."
            );

            comparisonResult.append(icon, text);
        });
    });

    // Two-question knowledge check.
    const questions = [
        {
            question:
                "A university has a home page, an admissions page and a courses page. Together, these pages are part of a...",
            options: [
                "A single webpage",
                "A website",
                "A web browser"
            ],
            correctIndex: 1,
            explanation:
                "Correct! A website groups related webpages together."
        },
        {
            question:
                "You open the product details page of an online store. What is that product details page?",
            options: [
                "A webpage within the online store",
                "The entire internet",
                "A web browser"
            ],
            correctIndex: 0,
            explanation:
                "Exactly! The product details page is one webpage within the online store."
        }
    ];

    let currentQuestionIndex = 0;
    let answeredQuestions = new Set();

    function renderQuestion() {
        const question = questions[currentQuestionIndex];

        quizQuestion.textContent = question.question;
        quizProgress.textContent =
            `QUESTION ${currentQuestionIndex + 1} OF ${questions.length}`;

        quizOptions.replaceChildren();
        quizFeedback.textContent = "";
        quizFeedback.className = "quiz-feedback";
        nextQuestionButton.hidden = true;

        question.options.forEach((option, index) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "quiz-option";
            button.textContent = option;

            button.addEventListener("click", () => {
                checkAnswer(button, index, question);
            });

            quizOptions.appendChild(button);
        });
    }

    function checkAnswer(selectedButton, selectedIndex, question) {
        // Once answered correctly, the question cannot be answered again.
        if (answeredQuestions.has(currentQuestionIndex)) {
            return;
        }

        if (selectedIndex === question.correctIndex) {
            answeredQuestions.add(currentQuestionIndex);

            selectedButton.classList.add("correct");

            quizOptions.querySelectorAll(".quiz-option").forEach((button) => {
                button.disabled = true;

                if (
                    button.textContent ===
                    question.options[question.correctIndex]
                ) {
                    button.classList.add("correct");
                }
            });

            quizFeedback.textContent = `✓ ${question.explanation}`;
            quizFeedback.className = "quiz-feedback success";

            updateProgress(
                60 + Math.round(
                    (answeredQuestions.size / questions.length) * 30
                )
            );

            nextQuestionButton.textContent =
                currentQuestionIndex === questions.length - 1
                    ? "See lesson completion →"
                    : "Next question →";

            nextQuestionButton.hidden = false;
        } else {
            selectedButton.classList.add("incorrect");

            quizFeedback.textContent =
                "Not quite! Give it another try. Think about the difference between a whole website and one page.";

            quizFeedback.className = "quiz-feedback error";

            // Let the learner try another answer.
            selectedButton.disabled = true;
        }
    }

    nextQuestionButton.addEventListener("click", () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        } else {
            document.getElementById("quizCard").hidden = true;
            lessonFinish.hidden = false;
            updateProgress(100);

            lessonFinish.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    });

    finishButton.addEventListener("click", () => {
        finishNote.textContent =
            "Nice work! You've completed this lesson preview. Saving lesson progress will be connected later.";

        finishButton.textContent = "Lesson preview completed ✓";
        finishButton.disabled = true;
        finishButton.style.opacity = "0.7";
        finishButton.style.cursor = "default";
    });

    function updateProgress(value) {
        progressBar.style.width = `${value}%`;
        progressText.textContent = `${value}%`;
        progressBar.setAttribute("aria-valuenow", String(value));
    }

    // Initialize the first question.
    renderQuestion();

    // Keep these available for later lesson/database integration.
    console.log("CodeXperts lesson loaded:", {
        pathId,
        moduleId
    });
});