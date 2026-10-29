const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const groupName = document.getElementById("groupName");

messageForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = messageInput.value.trim();

    if (!text) {
        return;
    }

    const messageRow = document.createElement("div");
    messageRow.className = "message-row";

    messageRow.innerHTML = `
        <div class="avatar">T</div>
        <div>
            <div class="message-meta">
                <strong>you</strong>
                <span>now</span>
            </div>
            <div class="message-bubble">${escapeHtml(text)}</div>
        </div>
    `;

    messages.appendChild(messageRow);
    messageInput.value = "";
    messages.scrollTop = messages.scrollHeight;
});

document.querySelectorAll(".group-card").forEach(function (card) {
    card.addEventListener("click", function () {
        document.querySelectorAll(".group-card").forEach(function (item) {
            item.classList.remove("selected");
        });

        card.classList.add("selected");
        groupName.textContent = card.dataset.group;
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