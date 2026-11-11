
// ==========================================
// CODEXPERTS COMMUNITY
// ==========================================

const API_BASE_URL = "http://localhost:5000/api/community";

const SUPABASE_URL = "https://erpkqazrmeinhbwviypi.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_Y_0Ims5tbAhZ6plGkDDv3Q_yGsf5I4E";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLIC_KEY
);

const accessToken = sessionStorage.getItem("supabaseAccessToken");

let currentUser = null;
let currentGroup = null;
let communityGroups = [];
let currentTab = "chat";

let messageChannel = null;
let activeSubscriptionGroupId = null;

let realtimeSubscribed = false;
let lastTypingBroadcast = 0;
let incomingTypingTimeout = null;

// Online presence
let onlineUserIds = new Set();
let currentGroupMembers = [];


// ==========================================
// HTML ELEMENTS
// ==========================================

const groupList = document.getElementById("groupList");
const messagesContainer = document.getElementById("messages");
const groupName = document.getElementById("groupName");
const groupDetails = document.getElementById("groupDetails");
const chatIcon = document.getElementById("chatIcon");

const typingIndicator = document.getElementById("typingIndicator");

const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const userXP = document.getElementById("userXP");
const userStreak = document.getElementById("userStreak");
const userProfile = document.getElementById("userProfile");

const statMembers = document.getElementById("statMembers");
const statLevel = document.getElementById("statLevel");
const statXP = document.getElementById("statXP");


const notificationButton = document.getElementById("notificationButton");
const notificationPanel = document.getElementById("notificationPanel");
const notificationList = document.getElementById("notificationList");
const notificationCount = document.getElementById("notificationCount");
const closeNotifications = document.getElementById("closeNotifications");


// ==========================================
// HELPER FUNCTIONS
// ==========================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return replacements[character];
    });
}

function formatXP(value) {
    return Number(value || 0).toLocaleString("en-ZA");
}

function getInitial(value) {
    return String(value || "?").trim().charAt(0).toUpperCase() || "?";
}

function formatTime(dateValue) {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("en-ZA", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatRelativeTime(dateValue) {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    const difference = Date.now() - date.getTime();

    if (Number.isNaN(difference)) return "";

    const minutes = Math.floor(difference / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);

    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString("en-ZA");
}

function getProfileName(profile) {
    return profile?.username ||
        profile?.first_name ||
        "Community member";
}

function getAvatarHTML(profile) {
    if (profile?.profile_picture_url) {
        return `
            <div class="avatar">
                <img
                    src="${escapeHTML(profile.profile_picture_url)}"
                    alt="${escapeHTML(getProfileName(profile))}"
                >
            </div>
        `;
    }

    return `
        <div class="avatar">
            ${escapeHTML(getInitial(getProfileName(profile)))}
        </div>
    `;
}


// ==========================================
// API REQUEST FUNCTION
// ==========================================

async function apiRequest(endpoint, options = {}) {
    if (!accessToken) {
        throw new Error("Your login session has expired. Please log in again.");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}


// ==========================================
// UPDATE A DELETED MESSAGE IN THE CHAT
// ==========================================

function markMessageDeleted(messageId) {

    const messageRows = messagesContainer.querySelectorAll(
        ".message-row"
    );

    const messageRow = Array.from(messageRows).find(row =>
        String(row.dataset.messageId) === String(messageId)
    );

    if (!messageRow) return;

    const messageBubble = messageRow.querySelector(".message-bubble");

    if (!messageBubble) return;

    // Change only the affected message
    messageBubble.textContent = "This message was deleted.";

    messageBubble.classList.add("deleted-message");

    // Remove the delete button
    const deleteButton = messageRow.querySelector(".message-delete");

    if (deleteButton) {
        deleteButton.remove();
    }
}


// ==========================================
// SUPABASE REALTIME
// LIVE MESSAGES, DELETIONS, TYPING AND PRESENCE
// ==========================================

async function connectToGroupRealtime(groupId) {

    if (
        messageChannel &&
        String(activeSubscriptionGroupId) === String(groupId)
    ) {
        return;
    }

    if (messageChannel) {

        realtimeSubscribed = false;

        await supabaseClient.removeChannel(messageChannel);

        messageChannel = null;
    }

    clearTimeout(incomingTypingTimeout);

    typingIndicator.classList.add("hidden");

    onlineUserIds = new Set();
    currentGroupMembers = [];

    activeSubscriptionGroupId = groupId;

    supabaseClient.realtime.setAuth(accessToken);

    const channel = supabaseClient.channel(
        `community-group-${groupId}`,
        {
            config: {
                broadcast: {
                    self: false
                },
                presence: {
                    key: String(currentUser.user_id)
                }
            }
        }
    );

    messageChannel = channel;


    // ======================================
    // RECEIVE TYPING EVENTS
    // ======================================

    channel.on(
        "broadcast",
        {
            event: "typing"
        },
        ({ payload }) => {

            console.log("Typing event received:", payload);

            if (!payload || !currentUser) return;

            if (payload.user_id === currentUser.user_id) return;

            if (currentTab !== "chat") return;

            if (
                !currentGroup ||
                String(currentGroup.group_id) !== String(groupId)
            ) {
                return;
            }

            typingIndicator.textContent =
                `${payload.username || "Someone"} is typing...`;

            typingIndicator.classList.remove("hidden");

            clearTimeout(incomingTypingTimeout);

            incomingTypingTimeout = setTimeout(() => {
                typingIndicator.classList.add("hidden");
            }, 2000);
        }
    );


    // ======================================
    // TRACK ONLINE COMMUNITY MEMBERS
    // ======================================

    channel.on(
        "presence",
        {
            event: "sync"
        },
        () => {

            if (
                String(activeSubscriptionGroupId) !== String(groupId)
            ) {
                return;
            }

            const presenceState = channel.presenceState();

            const updatedOnlineUsers = new Set();

            Object.values(presenceState).forEach(presences => {

                presences.forEach(presence => {

                    if (presence.user_id) {
                        updatedOnlineUsers.add(
                            String(presence.user_id)
                        );
                    }

                });

            });

            onlineUserIds = updatedOnlineUsers;

            console.log(
                "Online community members:",
                [...onlineUserIds]
            );

            if (
                currentGroup &&
                String(currentGroup.group_id) === String(groupId) &&
                currentTab === "members"
            ) {
                displayMembers(currentGroupMembers);
            }
        }
    );


    // ======================================
    // RECEIVE NEW DATABASE MESSAGES
    // ======================================

    channel.on(
        "postgres_changes",
        {
            event: "INSERT",
            schema: "public",
            table: "group_message",
            filter: `group_id=eq.${groupId}`
        },
        async (payload) => {

            if (
                !currentGroup ||
                String(currentGroup.group_id) !== String(groupId)
            ) {
                return;
            }

            if (currentTab === "chat") {

                try {

                    const data = await apiRequest(
                        `/groups/${groupId}/messages`
                    );

                    const newMessage = (data.messages || []).find(
                        message =>
                            String(message.message_id) ===
                            String(payload.new.message_id)
                    );

                    if (newMessage) {
                        appendNewMessage(newMessage);
                    }

                    await markGroupAsRead();

                } catch (error) {
                    console.error("Realtime message error:", error);
                }

            } else {

                await refreshGroupUnreadCounts();
            }
        }
    );


    // ======================================
    // RECEIVE MESSAGE DELETION UPDATES
    // ======================================

    channel.on(
        "postgres_changes",
        {
            event: "UPDATE",
            schema: "public",
            table: "group_message",
            filter: `group_id=eq.${groupId}`
        },
        (payload) => {

            console.log("Message update received:", payload);

            if (
                !currentGroup ||
                String(currentGroup.group_id) !== String(groupId)
            ) {
                return;
            }

            // Only update messages that have been deleted
            if (payload.new && payload.new.is_deleted === true) {

                markMessageDeleted(payload.new.message_id);

                console.log(
                    "Message deleted in real time:",
                    payload.new.message_id
                );
            }
        }
    );


    // ======================================
    // SUBSCRIBE TO THE GROUP CHANNEL
    // ======================================

    channel.subscribe(async (status, error) => {

        console.log("Realtime status:", status);

        realtimeSubscribed = status === "SUBSCRIBED";

        if (status === "SUBSCRIBED") {

            console.log(`Connected to group ${groupId}`);

            try {

                const result = await channel.track({
                    user_id: String(currentUser.user_id),
                    username:
                        currentUser.username ||
                        currentUser.first_name ||
                        "Community member",
                    online_at: new Date().toISOString()
                });

                console.log("Presence tracking result:", result);

            } catch (presenceError) {

                console.error(
                    "Presence tracking error:",
                    presenceError
                );
            }
        }

        if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT"
        ) {

            console.error(
                "Realtime connection problem:",
                error || status
            );
        }
    });
}


// ==========================================
// SEND TYPING EVENTS
// ==========================================

messageInput.addEventListener("input", async () => {

    if (
        !currentGroup ||
        !messageChannel ||
        !realtimeSubscribed ||
        !currentUser ||
        !messageInput.value.trim()
    ) {
        return;
    }

    const now = Date.now();

    if (now - lastTypingBroadcast < 1000) {
        return;
    }

    lastTypingBroadcast = now;

    console.log("Typing event triggered");

    try {

        const result = await messageChannel.send({
            type: "broadcast",
            event: "typing",
            payload: {
                user_id: currentUser.user_id,
                username: currentUser.username
            }
        });

        console.log("Typing broadcast result:", result);

        if (result !== "ok") {
            console.error(
                "Typing broadcast was not successful:",
                result
            );
        }

    } catch (error) {

        console.error("Typing broadcast error:", error);
    }
});


// ==========================================
// REFRESH UNREAD COUNTS
// ==========================================

async function refreshGroupUnreadCounts() {

    try {

        const data = await apiRequest("/groups");

        communityGroups = data.groups || [];

        currentGroup = communityGroups.find(
            group =>
                String(group.group_id) ===
                String(activeSubscriptionGroupId)
        ) || currentGroup;

        displayGroups();

    } catch (error) {

        console.error("Unread count refresh error:", error);
    }
}


// ==========================================
// DISCONNECT REALTIME
// ==========================================

async function disconnectGroupRealtime() {

    realtimeSubscribed = false;

    clearTimeout(incomingTypingTimeout);

    typingIndicator.classList.add("hidden");

    onlineUserIds = new Set();
    currentGroupMembers = [];

    if (messageChannel) {

        await supabaseClient.removeChannel(messageChannel);

        messageChannel = null;
    }

    activeSubscriptionGroupId = null;
}


// ==========================================
// CHECK LOGIN
// ==========================================

function checkLogin() {

    if (!accessToken) {

        alert("Please log in to access the community.");

        window.location.href = "login.html";

        return false;
    }

    return true;
}


// ==========================================
// LOAD USER PROFILE AND GROUPS
// ==========================================

async function loadCommunity() {

    try {

        groupList.innerHTML = `
            <p class="loading-text">Loading your groups...</p>
        `;

        const data = await apiRequest("/groups");

        currentUser = data.profile;
        communityGroups = data.groups || [];

        displayUserProfile();

displayGroups();

await Promise.all([
    loadNotifications(),
    loadCurrentStreak()
]);

        if (communityGroups.length > 0) {

            await selectGroup(communityGroups[0].group_id);

        } else {

            showNoGroups();
        }

    } catch (error) {

        console.error("Community loading error:", error);

        groupList.innerHTML = `
            <p class="error-text">
                ${escapeHTML(error.message)}
            </p>
        `;
    }
}


// ==========================================
// DISPLAY USER PROFILE
// ==========================================

function displayUserProfile() {

    if (!currentUser) return;

    userXP.textContent =
        `${formatXP(currentUser.overall_xp)} XP`;

    if (currentUser.profile_picture_url) {

        userProfile.innerHTML = `
            <img
                src="${escapeHTML(currentUser.profile_picture_url)}"
                alt="Profile picture"
            >
        `;

    } else {

        userProfile.textContent = getInitial(
            currentUser.first_name || currentUser.username
        );
    }
}

// ==========================================
// LOAD CURRENT STREAK
// ==========================================

async function loadCurrentStreak() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/paths/dashboard/stats",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok || data.success === false) {
            throw new Error(data.message || "Unable to load streak.");
        }

        const currentStreak = Number(
            data.streak?.currentStreak || 0
        );

        userStreak.textContent =
            `${currentStreak} day${currentStreak === 1 ? "" : "s"} streak`;

    } catch (error) {

        console.error("Current streak loading error:", error);

        userStreak.textContent = "0 day streak";
    }
}
// ==========================================
// DISPLAY ENROLLED GROUPS
// ==========================================

function displayGroups() {

    if (communityGroups.length === 0) {

        showNoGroups();

        return;
    }

    groupList.innerHTML = communityGroups.map(group => {

        const isSelected =
            currentGroup &&
            String(currentGroup.group_id) === String(group.group_id);

        const initials = escapeHTML(
            getInitial(group.group_name)
        );

        const unread = Number(group.unread_count || 0);

        return `
            <button
                class="group-card ${isSelected ? "selected" : ""}"
                data-group-id="${escapeHTML(group.group_id)}"
                type="button"
            >
                <div class="group-icon blue">${initials}</div>

                <div class="group-info">

                    <div class="group-title-row">
                        <strong>${escapeHTML(group.group_name)}</strong>
                        ${isSelected ? '<span class="your-tag">YOURS</span>' : ""}
                    </div>

                    <small>
                        Level ${escapeHTML(group.current_level)}
                        · ${formatXP(group.path_xp)} XP
                    </small>

                </div>

                ${
                    unread > 0
                        ? `<span class="unread-badge">${unread > 99 ? "99+" : unread}</span>`
                        : ""
                }

            </button>
        `;

    }).join("");

    groupList.querySelectorAll(".group-card").forEach(button => {

        button.addEventListener("click", () => {
            selectGroup(button.dataset.groupId);
        });

    });
}


// ==========================================
// NO GROUPS
// ==========================================

function showNoGroups() {

    currentGroup = null;

    groupList.innerHTML = `
        <p class="empty-state">
            You haven't joined any learning path communities yet.
        </p>
    `;

    groupName.textContent = "No communities yet";

    groupDetails.textContent =
        "Enroll in a learning path to join its community.";

    chatIcon.textContent = "C";

    messagesContainer.innerHTML = `
        <div class="empty-state">
            Your community conversations will appear here after enrollment.
        </div>
    `;

    messageInput.disabled = true;

    sendButton.disabled = true;

    statMembers.textContent = "--";
    statLevel.textContent = "--";
    statXP.textContent = "--";

    disconnectGroupRealtime();
}


// ==========================================
// SELECT COMMUNITY GROUP
// ==========================================

async function selectGroup(groupId) {

    const selectedGroup = communityGroups.find(
        group => String(group.group_id) === String(groupId)
    );

    if (!selectedGroup) return;

    currentGroup = selectedGroup;

    typingIndicator.classList.add("hidden");

    clearTimeout(incomingTypingTimeout);

    displayGroups();

    groupName.textContent = selectedGroup.group_name;

    groupDetails.textContent =
        `${selectedGroup.member_count} members`;

    chatIcon.textContent = getInitial(selectedGroup.group_name);

    statMembers.textContent = selectedGroup.member_count;

    statLevel.textContent =
        `Level ${selectedGroup.current_level}`;

    statXP.textContent =
        `${formatXP(selectedGroup.path_xp)} XP`;

    messageInput.disabled = false;

    sendButton.disabled = false;

    await connectToGroupRealtime(selectedGroup.group_id);

    if (currentTab === "chat") {

        await loadMessages();

        await markGroupAsRead();

    } else if (currentTab === "members") {

        await loadMembers();
    }
}


// ==========================================
// LOAD GROUP MESSAGES
// ==========================================

async function loadMessages() {

    if (!currentGroup) return;

    try {

        messagesContainer.innerHTML = `
            <p class="loading-text">Loading messages...</p>
        `;

        const data = await apiRequest(
            `/groups/${currentGroup.group_id}/messages`
        );

        displayMessages(data.messages || []);

    } catch (error) {

        console.error("Message loading error:", error);

        messagesContainer.innerHTML = `
            <p class="error-text">
                ${escapeHTML(error.message)}
            </p>
        `;
    }
}


// ==========================================
// DISPLAY MESSAGES
// ==========================================

function displayMessages(messages) {

    if (messages.length === 0) {

        messagesContainer.innerHTML = `
            <p class="empty-state">
                No messages yet. Start the conversation!
            </p>
        `;

        return;
    }

    messagesContainer.innerHTML = messages.map(message => {

        const isOwnMessage =
            message.user_id === currentUser.user_id;

        const sender = message.sender;

        const senderName = sender
            ? getProfileName(sender)
            : "Former member";

        const deleted = message.is_deleted;

        return `
            <div
                class="message-row ${isOwnMessage ? "own-message" : ""}"
                data-message-id="${escapeHTML(message.message_id)}"
            >

                ${getAvatarHTML(sender)}

                <div class="message-content">

                    <div class="message-meta">

                        <strong>${escapeHTML(senderName)}</strong>

                        <span>${formatTime(message.created_at)}</span>

                        ${
                            message.current_level !== null &&
                            message.current_level !== undefined
                                ? `<span class="sender-level">
                                    Level ${escapeHTML(message.current_level)}
                                    · ${formatXP(message.path_xp)} XP
                                </span>`
                                : ""
                        }

                    </div>

                    <div class="message-bubble ${deleted ? "deleted-message" : ""}">
                        ${deleted
                            ? "This message was deleted."
                            : escapeHTML(message.message_text)
                        }
                    </div>

                    ${
                        isOwnMessage && !deleted
                            ? `
                                <button
                                    type="button"
                                    class="message-delete"
                                    data-message-id="${escapeHTML(message.message_id)}"
                                >
                                    Delete message
                                </button>
                            `
                            : ""
                    }

                </div>

            </div>
        `;

    }).join("");

    messagesContainer.querySelectorAll(".message-delete").forEach(button => {

        button.addEventListener("click", () => {
            deleteMessage(button.dataset.messageId);
        });

    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}


// ==========================================
// APPEND NEW MESSAGE
// ==========================================

function appendNewMessage(message) {

    if (!message || !currentUser) return;

    const existingMessages = messagesContainer.querySelectorAll(
        ".message-row"
    );

    const alreadyExists = Array.from(existingMessages).some(row =>
        String(row.dataset.messageId) === String(message.message_id)
    );

    if (alreadyExists) return;

    const isOwnMessage =
        message.user_id === currentUser.user_id;

    const sender = message.sender;

    const senderName = sender
        ? getProfileName(sender)
        : "Community member";

    const deleted = message.is_deleted;

    const messageHTML = `
        <div
            class="message-row ${isOwnMessage ? "own-message" : ""}"
            data-message-id="${escapeHTML(message.message_id)}"
        >

            ${getAvatarHTML(sender)}

            <div class="message-content">

                <div class="message-meta">

                    <strong>${escapeHTML(senderName)}</strong>

                    <span>${formatTime(message.created_at)}</span>

                    ${
                        message.current_level !== null &&
                        message.current_level !== undefined
                            ? `<span class="sender-level">
                                Level ${escapeHTML(message.current_level)}
                                · ${formatXP(message.path_xp)} XP
                            </span>`
                            : ""
                    }

                </div>

                <div class="message-bubble ${deleted ? "deleted-message" : ""}">
                    ${deleted
                        ? "This message was deleted."
                        : escapeHTML(message.message_text)
                    }
                </div>

                ${
                    isOwnMessage && !deleted
                        ? `<button
                            type="button"
                            class="message-delete"
                            data-message-id="${escapeHTML(message.message_id)}"
                        >Delete message</button>`
                        : ""
                }

            </div>

        </div>
    `;

    const emptyState =
        messagesContainer.querySelector(".empty-state");

    if (emptyState) {
        messagesContainer.innerHTML = "";
    }

    messagesContainer.insertAdjacentHTML(
        "beforeend",
        messageHTML
    );

    const messageRows = messagesContainer.querySelectorAll(
        ".message-row"
    );

    const addedMessage = Array.from(messageRows).find(row =>
        String(row.dataset.messageId) === String(message.message_id)
    );

    const deleteButton = addedMessage?.querySelector(".message-delete");

    if (deleteButton) {

        deleteButton.addEventListener("click", () => {
            deleteMessage(deleteButton.dataset.messageId);
        });

    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}


// ==========================================
// SEND MESSAGE
// ==========================================

messageForm.addEventListener("submit", async event => {

    event.preventDefault();

    if (!currentGroup) return;

    const messageText = messageInput.value.trim();

    if (!messageText) return;

    if (messageText.length > 2000) {

        alert("Your message cannot exceed 2000 characters.");

        return;
    }

    try {

        sendButton.disabled = true;

        await apiRequest(
            `/groups/${currentGroup.group_id}/messages`,
            {
                method: "POST",
                body: JSON.stringify({
                    message_text: messageText
                })
            }
        );

        messageInput.value = "";

        await markGroupAsRead();

    } catch (error) {

        console.error("Send message error:", error);

        alert(error.message);

    } finally {

        sendButton.disabled = false;

        messageInput.focus();
    }
});


// ==========================================
// DELETE MESSAGE WITHOUT REFRESHING CHAT
// ==========================================

async function deleteMessage(messageId) {

    const confirmed = confirm(
        "Are you sure you want to delete this message?"
    );

    if (!confirmed) return;

    const deleteButton = Array.from(
        messagesContainer.querySelectorAll(".message-delete")
    ).find(button =>
        String(button.dataset.messageId) === String(messageId)
    );

    try {

        if (deleteButton) {
            deleteButton.disabled = true;
            deleteButton.textContent = "Deleting...";
        }

        await apiRequest(`/messages/${messageId}`, {
            method: "DELETE"
        });

        // Update the message immediately for the person deleting it.
        // Supabase Realtime will update the other participant's chat.
        markMessageDeleted(messageId);

        console.log("Message deleted successfully:", messageId);

    } catch (error) {

        console.error("Delete message error:", error);

        alert(error.message);

        if (deleteButton) {
            deleteButton.disabled = false;
            deleteButton.textContent = "Delete message";
        }
    }
}


// ==========================================
// MARK GROUP MESSAGES AS READ
// ==========================================

async function markGroupAsRead() {

    if (!currentGroup) return;

    try {

        await apiRequest(
            `/groups/${currentGroup.group_id}/read`,
            {
                method: "PATCH"
            }
        );

        currentGroup.unread_count = 0;

        displayGroups();

    } catch (error) {

        console.error("Mark messages as read error:", error);
    }
}


// ==========================================
// LOAD GROUP MEMBERS
// ==========================================

async function loadMembers() {

    if (!currentGroup) return;

    try {

        messagesContainer.innerHTML = `
            <p class="loading-text">Loading members...</p>
        `;

        const data = await apiRequest(
            `/groups/${currentGroup.group_id}/members`
        );

        currentGroupMembers = data.members || [];

        displayMembers(currentGroupMembers);

    } catch (error) {

        console.error("Members loading error:", error);

        messagesContainer.innerHTML = `
            <p class="error-text">
                ${escapeHTML(error.message)}
            </p>
        `;
    }
}


// ==========================================
// DISPLAY GROUP MEMBERS
// ==========================================

function displayMembers(members) {

    if (members.length === 0) {

        messagesContainer.innerHTML = `
            <p class="empty-state">No members found.</p>
        `;

        return;
    }

    messagesContainer.innerHTML = `
        <div class="member-list">

            ${members.map(member => {

                const isOnline = onlineUserIds.has(
                    String(member.user_id)
                );

                return `
                    <div class="member-card">

                        ${getAvatarHTML(member)}

                        <div class="member-details">

                            <strong>
                                ${escapeHTML(getProfileName(member))}
                            </strong>

                            <small>
                                Level ${escapeHTML(member.current_level)}
                                · ${formatXP(member.path_xp)} XP
                            </small>

                            <div class="member-presence ${isOnline ? "online" : "offline"}">

                                <span class="presence-dot"></span>

                                <span>
                                    ${isOnline ? "Online" : "Offline"}
                                </span>

                            </div>

                        </div>

                    </div>
                `;

            }).join("")}

        </div>
    `;
}


// ==========================================
// TAB SWITCHING
// ==========================================

document.querySelectorAll(".tab").forEach(tab => {

    tab.addEventListener("click", async () => {

        if (tab.disabled) return;

        currentTab = tab.dataset.tab;

        document.querySelectorAll(".tab").forEach(item => {
            item.classList.remove("active");
        });

        tab.classList.add("active");

        typingIndicator.classList.add("hidden");

        clearTimeout(incomingTypingTimeout);

        if (!currentGroup) return;

        if (currentTab === "chat") {

            await loadMessages();

            await markGroupAsRead();
        }

        if (currentTab === "members") {

            await loadMembers();
        }
    });
});


// ==========================================
// LOAD NOTIFICATIONS
// ==========================================

async function loadNotifications() {

    try {

        const data = await apiRequest("/notifications");

        displayNotifications(data.notifications || []);

    } catch (error) {

        console.error("Notification loading error:", error);
    }
}


// ==========================================
// DISPLAY NOTIFICATIONS
// ==========================================

function displayNotifications(notifications) {

    const unread = notifications.filter(
        notification => !notification.is_read
    ).length;

    notificationCount.textContent =
        unread > 99 ? "99+" : unread;

    notificationCount.classList.toggle(
        "hidden",
        unread === 0
    );

    if (notifications.length === 0) {

        notificationList.innerHTML = `
            <p class="empty-state">No notifications yet.</p>
        `;

        return;
    }

    notificationList.innerHTML = notifications.map(notification => `

        <div
            class="notification-item ${notification.is_read ? "" : "unread"}"
            data-notification-id="${escapeHTML(notification.notification_id)}"
        >

            <strong>${escapeHTML(notification.title)}</strong>

            <p>${escapeHTML(notification.message)}</p>

            <small>${formatRelativeTime(notification.created_at)}</small>

        </div>

    `).join("");

    notificationList.querySelectorAll(".notification-item").forEach(item => {

        item.addEventListener("click", async () => {

            await markNotificationAsRead(
                item.dataset.notificationId
            );

        });

    });
}


// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================

async function markNotificationAsRead(notificationId) {

    try {

        await apiRequest(
            `/notifications/${notificationId}/read`,
            {
                method: "PATCH"
            }
        );

        await loadNotifications();

    } catch (error) {

        console.error("Notification update error:", error);
    }
}


// ==========================================
// NOTIFICATION PANEL
// ==========================================

notificationButton.addEventListener("click", () => {

    notificationPanel.classList.toggle("hidden");

    if (!notificationPanel.classList.contains("hidden")) {
        loadNotifications();
    }
});

closeNotifications.addEventListener("click", () => {

    notificationPanel.classList.add("hidden");
});

document.addEventListener("click", event => {

    if (
        !event.target.closest(".notification-wrapper") &&
        !event.target.closest(".notification-panel")
    ) {
        notificationPanel.classList.add("hidden");
    }
});


// ==========================================
// START COMMUNITY
// ==========================================

if (checkLogin()) {
    loadCommunity();
}
