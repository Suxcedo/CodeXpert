const questionForm = document.getElementById("questionForm");
const questionInput = document.getElementById("questionInput");
const questions = document.getElementById("questions");
const categoryName = document.getElementById("categoryName");

questionForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = questionInput.value.trim();

    if (!text) {
        return;
    }

    const questionRow = document.createElement("div");
    questionRow.className = "message-row";

    questionRow.innerHTML = `
        <div class="avatar">T</div>
        <div>
            <div class="message-meta">
                <strong>you</strong>
                <span>now</span>
            </div>
            <div class="message-bubble">${escapeHtml(text)}</div>
        </div>
    `;

    questions.appendChild(questionRow);

    questionInput.value = "";
    questions.scrollTop = questions.scrollHeight;
});

document.querySelectorAll(".group-card").forEach(function (card) {
    card.addEventListener("click", function () {

        document.querySelectorAll(".group-card").forEach(function (item) {
            item.classList.remove("selected");
        });

        card.classList.add("selected");

        categoryName.textContent = card.dataset.category + " Questions";
    });
});

document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {

        document.querySelectorAll(".tab").forEach(function (item) {
            item.classList.remove("active");
        });

        tab.classList.add("active");
    });
});

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}