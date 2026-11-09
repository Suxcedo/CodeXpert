
const API_BASE = "http://localhost:5000/api/settings";

const elements = {
    profileForm: document.getElementById("profileForm"),
    passwordForm: document.getElementById("passwordForm"),

    firstName: document.getElementById("firstName"),
    lastName: document.getElementById("lastName"),
    username: document.getElementById("username"),
    email: document.getElementById("email"),
    bio: document.getElementById("bio"),
    bioCount: document.getElementById("bioCount"),

    profileAvatar: document.getElementById("profileAvatar"),
    headerAvatar: document.getElementById("headerAvatar"),
    headerUsername: document.getElementById("headerUsername"),
    sidebarUsername: document.getElementById("sidebarUsername"),

    profilePictureInput: document.getElementById("profilePictureInput"),
    removePictureButton: document.getElementById("removePictureButton"),
    pictureStatus: document.getElementById("pictureStatus"),

    usernameStatus: document.getElementById("usernameStatus"),
    pageMessage: document.getElementById("pageMessage"),

    saveProfileButton: document.getElementById("saveProfileButton"),
    cancelProfileButton: document.getElementById("cancelProfileButton"),
    changePasswordButton: document.getElementById("changePasswordButton"),
    signOutButton: document.getElementById("signOutButton"),

    deleteAccountButton: document.getElementById("deleteAccountButton"),
    deleteModal: document.getElementById("deleteModal"),
    closeDeleteModal: document.getElementById("closeDeleteModal")
};

let originalProfile = null;
let selectedPicture = null;
let removePicture = false;
let usernameCheckTimer = null;
let usernameCheckRequest = 0;

function getAccessToken() {
    return sessionStorage.getItem("supabaseAccessToken");
}

function getHeaders() {
    const token = getAccessToken();

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}


async function apiRequest(url, options = {}) {
    const token = getAccessToken();

    if (!token) {
        redirectToLogin();
        throw new Error("Your session has expired. Please log in again.");
    }

    const headers = {
        "Authorization": `Bearer ${token}`,
        ...(options.headers || {})
    };

    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    let result;

    try {
        result = await response.json();
    } catch {
        result = {
            success: false,
            message: "The server returned an unexpected response."
        };
    }

    if (response.status === 401) {
        redirectToLogin();
        throw new Error("Your session has expired. Please log in again.");
    }

    if (!response.ok || result.success === false) {
        throw new Error(result.message || "Something went wrong. Please try again.");
    }

    return result;
}


function redirectToLogin() {
    sessionStorage.removeItem("supabaseAccessToken");
    sessionStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

function showMessage(message, type = "success") {
    elements.pageMessage.textContent = message;
    elements.pageMessage.className = `page-message show ${type}`;

    elements.pageMessage.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}

function clearMessage() {
    elements.pageMessage.textContent = "";
    elements.pageMessage.className = "page-message";
}

function setButtonLoading(button, loading, loadingText) {
    const label = button.querySelector(".button-label");
    const loader = button.querySelector(".button-loader");

    if (loading) {
        button.disabled = true;

        if (label) {
            button.dataset.originalLabel = label.textContent;
            label.textContent = loadingText;
        }

        if (loader) {
            loader.hidden = false;
        }
    } else {
        button.disabled = false;

        if (label && button.dataset.originalLabel) {
            label.textContent = button.dataset.originalLabel;
        }

        if (loader) {
            loader.hidden = true;
        }
    }
}

function getInitials(firstName, lastName) {
    const first = (firstName || "").trim().charAt(0);
    const last = (lastName || "").trim().charAt(0);

    return (first + last).toUpperCase() || "CX";
}

function renderAvatar(profile) {
    const initials = getInitials(profile.first_name, profile.last_name);
    const pictureUrl = profile.profile_picture_url;

    const avatarElements = [
        elements.profileAvatar,
        elements.headerAvatar
    ];

    avatarElements.forEach(avatar => {
        if (pictureUrl) {
            avatar.innerHTML = "";

            const image = document.createElement("img");
            image.src = pictureUrl;
            image.alt = "Profile picture";
            image.onerror = () => {
                avatar.textContent = initials;
            };

            avatar.appendChild(image);
        } else {
            avatar.textContent = initials;
        }
    });
}

function updateUsernameLabels(username) {
    elements.headerUsername.textContent = username || "Account";
    elements.sidebarUsername.textContent = username ? `@${username}` : "@username";
}

function fillProfileForm(profile, email) {
    elements.firstName.value = profile.first_name || "";
    elements.lastName.value = profile.last_name || "";
    elements.username.value = profile.username || "";
    elements.email.value = email || "";
    elements.bio.value = profile.bio || "";

    elements.bioCount.textContent = (profile.bio || "").length;

    renderAvatar(profile);
    updateUsernameLabels(profile.username);
}

function saveOriginalProfile(profile, email) {
    originalProfile = {
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        username: profile.username || "",
        email: email || "",
        bio: profile.bio || "",
        profile_picture_url: profile.profile_picture_url || null
    };
}

async function loadSettings() {
    if (!getAccessToken()) {
        redirectToLogin();
        return;
    }

    try {
        const result = await apiRequest(`${API_BASE}/me`);

        if (!result.profile) {
            throw new Error("We could not find your account profile.");
        }

        fillProfileForm(result.profile, result.email);
        saveOriginalProfile(result.profile, result.email);

        selectedPicture = null;
        removePicture = false;

        elements.pictureStatus.textContent = "";
    } catch (error) {
        showMessage(error.message, "error");
    }
}

function clearFieldErrors() {
    document.querySelectorAll(".field-error").forEach(error => {
        error.textContent = "";
    });
}

function validateProfile() {
    clearFieldErrors();

    const firstName = elements.firstName.value.trim();
    const lastName = elements.lastName.value.trim();
    const username = elements.username.value.trim();
    const bio = elements.bio.value.trim();

    let valid = true;

    if (!firstName) {
        document.getElementById("firstNameError").textContent = "First name is required.";
        valid = false;
    } else if (firstName.length > 50) {
        document.getElementById("firstNameError").textContent = "First name cannot exceed 50 characters.";
        valid = false;
    }

    if (!lastName) {
        document.getElementById("lastNameError").textContent = "Last name is required.";
        valid = false;
    } else if (lastName.length > 50) {
        document.getElementById("lastNameError").textContent = "Last name cannot exceed 50 characters.";
        valid = false;
    }

    if (!/^[a-zA-Z0-9_.]{3,50}$/.test(username)) {
        document.getElementById("usernameError").textContent =
            "Username must contain 3–50 letters, numbers, underscores or full stops.";
        valid = false;
    }

    if (bio.length > 300) {
        document.getElementById("bioError").textContent = "Your bio cannot exceed 300 characters.";
        valid = false;
    }

    return valid;
}

async function checkUsernameAvailability() {
    const username = elements.username.value.trim();

    elements.usernameStatus.textContent = "";
    elements.usernameStatus.className = "username-status";

    if (!username || !/^[a-zA-Z0-9_.]{3,50}$/.test(username)) {
        return;
    }

    if (originalProfile && username === originalProfile.username) {
        elements.usernameStatus.textContent = "Current username";
        return;
    }

    const requestNumber = ++usernameCheckRequest;

    elements.usernameStatus.textContent = "Checking...";

    try {
        const result = await apiRequest(
            `${API_BASE}/username-availability?username=${encodeURIComponent(username)}`
        );

        if (requestNumber !== usernameCheckRequest) {
            return;
        }

        if (result.available) {
            elements.usernameStatus.textContent = "Available";
            elements.usernameStatus.classList.add("available");
        } else {
            elements.usernameStatus.textContent = "Unavailable";
            elements.usernameStatus.classList.add("taken");
        }
    } catch {
        if (requestNumber === usernameCheckRequest) {
            elements.usernameStatus.textContent = "Could not check";
        }
    }
}

function scheduleUsernameCheck() {
    clearTimeout(usernameCheckTimer);

    usernameCheckTimer = setTimeout(() => {
        checkUsernameAvailability();
    }, 450);
}

function resetProfileForm() {
    if (!originalProfile) {
        return;
    }

    elements.firstName.value = originalProfile.first_name;
    elements.lastName.value = originalProfile.last_name;
    elements.username.value = originalProfile.username;
    elements.email.value = originalProfile.email;
    elements.bio.value = originalProfile.bio;

    elements.bioCount.textContent = originalProfile.bio.length;

    const profileForAvatar = {
        first_name: originalProfile.first_name,
        last_name: originalProfile.last_name,
        profile_picture_url: originalProfile.profile_picture_url
    };

    renderAvatar(profileForAvatar);

    selectedPicture = null;
    removePicture = false;
    elements.profilePictureInput.value = "";
    elements.pictureStatus.textContent = "";

    elements.usernameStatus.textContent = "";
    elements.usernameStatus.className = "username-status";

    clearFieldErrors();
    clearMessage();
}

async function uploadProfilePicture() {
    const formData = new FormData();
    formData.append("profilePicture", selectedPicture);

    const result = await apiRequest(`${API_BASE}/profile-picture`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${getAccessToken()}`
        },
        body: formData
    });

    return result.profilePictureUrl;
}

async function removeProfilePictureFromServer() {
    await apiRequest(`${API_BASE}/profile-picture`, {
        method: "DELETE"
    });
}

async function saveProfile(event) {
    event.preventDefault();
    clearMessage();

    if (!validateProfile()) {
        return;
    }

    const username = elements.username.value.trim();

    if (username !== originalProfile.username) {
        try {
            const result = await apiRequest(
                `${API_BASE}/username-availability?username=${encodeURIComponent(username)}`
            );

            if (!result.available) {
                document.getElementById("usernameError").textContent =
                    "That username is already taken. Please choose another one.";
                return;
            }
        } catch (error) {
            showMessage(error.message, "error");
            return;
        }
    }

    setButtonLoading(elements.saveProfileButton, true, "Saving...");

    try {
        let updatedPictureUrl = originalProfile.profile_picture_url;

        if (selectedPicture) {
            updatedPictureUrl = await uploadProfilePicture();
        } else if (removePicture) {
            await removeProfilePictureFromServer();
            updatedPictureUrl = null;
        }

        const profileData = {
            firstName: elements.firstName.value.trim(),
            lastName: elements.lastName.value.trim(),
            username,
            bio: elements.bio.value.trim()
        };

        const result = await apiRequest(`${API_BASE}/profile`, {
            method: "PATCH",
            body: JSON.stringify(profileData)
        });

        const updatedProfile = {
            ...result.profile,
            profile_picture_url: updatedPictureUrl
        };

        fillProfileForm(updatedProfile, originalProfile.email);
        saveOriginalProfile(updatedProfile, originalProfile.email);

        selectedPicture = null;
        removePicture = false;
        elements.profilePictureInput.value = "";
        elements.pictureStatus.textContent = "";

        const storedUser = sessionStorage.getItem("loggedInUser");

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                Object.assign(user, updatedProfile);
                sessionStorage.setItem("loggedInUser", JSON.stringify(user));
            } catch {
                // The server remains the source of truth for profile information.
            }
        }

        showMessage("Your profile has been updated successfully.", "success");
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        setButtonLoading(elements.saveProfileButton, false);
    }
}

function handlePictureSelection(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        showMessage("Please select a JPG, PNG, GIF or WebP image.", "error");
        elements.profilePictureInput.value = "";
        return;
    }

    if (file.size > 3 * 1024 * 1024) {
        showMessage("Your profile picture must be 3 MB or smaller.", "error");
        elements.profilePictureInput.value = "";
        return;
    }

    selectedPicture = file;
    removePicture = false;

    const previewUrl = URL.createObjectURL(file);

    elements.profileAvatar.innerHTML = "";

    const image = document.createElement("img");
    image.src = previewUrl;
    image.alt = "Selected profile picture";

    image.onload = () => URL.revokeObjectURL(previewUrl);

    elements.profileAvatar.appendChild(image);

    elements.pictureStatus.textContent = "Picture selected. Save changes to upload it.";
    clearMessage();
}

function handleRemovePicture() {
    if (!originalProfile) {
        return;
    }

    selectedPicture = null;
    removePicture = true;
    elements.profilePictureInput.value = "";

    const initials = getInitials(
        elements.firstName.value,
        elements.lastName.value
    );

    elements.profileAvatar.textContent = initials;
    elements.pictureStatus.textContent = "Picture will be removed when you save changes.";

    clearMessage();
}

async function changePassword(event) {
    event.preventDefault();
    clearMessage();

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    document.getElementById("currentPasswordError").textContent = "";
    document.getElementById("newPasswordError").textContent = "";
    document.getElementById("confirmPasswordError").textContent = "";

    let valid = true;

    if (!currentPassword) {
        document.getElementById("currentPasswordError").textContent =
            "Enter your current password.";
        valid = false;
    }

    if (newPassword.length < 8) {
        document.getElementById("newPasswordError").textContent =
            "Your new password must contain at least 8 characters.";
        valid = false;
    }

    if (newPassword && newPassword === currentPassword) {
        document.getElementById("newPasswordError").textContent =
            "Your new password must be different from your current password.";
        valid = false;
    }

    if (newPassword !== confirmPassword) {
        document.getElementById("confirmPasswordError").textContent =
            "The passwords do not match.";
        valid = false;
    }

    if (!valid) {
        return;
    }

    setButtonLoading(elements.changePasswordButton, true, "Updating...");

    try {
        await apiRequest(`${API_BASE}/change-password`, {
            method: "POST",
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        elements.passwordForm.reset();

        showMessage("Your password has been changed successfully.", "success");
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        setButtonLoading(elements.changePasswordButton, false);
    }
}

function signOut() {
    sessionStorage.removeItem("supabaseAccessToken");
    sessionStorage.removeItem("loggedInUser");

    localStorage.removeItem("supabaseAccessToken");
    localStorage.removeItem("loggedInUser");

    window.location.href = "login.html";
}

function setupNavigation() {
    const tabs = document.querySelectorAll(".settings-tab");
    const sections = document.querySelectorAll(".settings-section");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(item => item.classList.remove("active"));
            tab.classList.add("active");
        });
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                tabs.forEach(tab => {
                    tab.classList.toggle(
                        "active",
                        tab.dataset.section === entry.target.id
                    );
                });
            }
        });
    }, {
        rootMargin: "-25% 0px -60% 0px"
    });

    sections.forEach(section => observer.observe(section));
}

function setupEvents() {
    elements.profileForm.addEventListener("submit", saveProfile);
    elements.passwordForm.addEventListener("submit", changePassword);

    elements.cancelProfileButton.addEventListener("click", resetProfileForm);

    elements.profilePictureInput.addEventListener(
        "change",
        handlePictureSelection
    );

    elements.removePictureButton.addEventListener(
        "click",
        handleRemovePicture
    );

    elements.username.addEventListener("input", () => {
        elements.usernameStatus.textContent = "";
        elements.usernameStatus.className = "username-status";

        scheduleUsernameCheck();
    });

    elements.bio.addEventListener("input", () => {
        elements.bioCount.textContent = elements.bio.value.length;
    });

    elements.firstName.addEventListener("input", () => {
        if (!selectedPicture && !removePicture) {
            elements.profileAvatar.textContent = getInitials(
                elements.firstName.value,
                elements.lastName.value
            );
        }
    });

    elements.lastName.addEventListener("input", () => {
        if (!selectedPicture && !removePicture) {
            elements.profileAvatar.textContent = getInitials(
                elements.firstName.value,
                elements.lastName.value
            );
        }
    });

    elements.signOutButton.addEventListener("click", signOut);

    elements.deleteAccountButton.addEventListener("click", () => {
        elements.deleteModal.hidden = false;
    });

    elements.closeDeleteModal.addEventListener("click", () => {
        elements.deleteModal.hidden = true;
    });

    elements.deleteModal.addEventListener("click", event => {
        if (event.target === elements.deleteModal) {
            elements.deleteModal.hidden = true;
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            elements.deleteModal.hidden = true;
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    setupEvents();
    setupNavigation();
    await loadSettings();
});
