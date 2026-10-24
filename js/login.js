
document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const loginIdentifier = document.getElementById("loginIdentifier");
    const password = document.getElementById("password");
    const loginButton = loginForm
        ? loginForm.querySelector('button[type="submit"]')
        : null;

    // Check required HTML elements
    if (!loginForm || !loginIdentifier || !password) {
        console.error(
            "Login form elements are missing. Check the IDs in login.html."
        );
        return;
    }

    // Display an error message
    function showError(input, message) {
        const formGroup = input.closest(".form-group");

        if (!formGroup) return;

        const errorMessage = formGroup.querySelector(".error-message");

        formGroup.classList.remove("success");
        formGroup.classList.add("error");

        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }

    // Clear an error message
    function showSuccess(input) {
        const formGroup = input.closest(".form-group");

        if (!formGroup) return;

        const errorMessage = formGroup.querySelector(".error-message");

        formGroup.classList.remove("error");
        formGroup.classList.add("success");

        if (errorMessage) {
            errorMessage.textContent = "";
        }
    }

    // Show the login loading state
    function setLoginLoading(isLoading) {
        if (!loginButton) return;

        if (isLoading) {
            if (!loginButton.dataset.originalText) {
                loginButton.dataset.originalText =
                    loginButton.textContent.trim();
            }

            loginButton.disabled = true;
            loginButton.textContent = "Signing in...";
            loginButton.classList.add("loading");
        } else {
            loginButton.disabled = false;
            loginButton.textContent =
                loginButton.dataset.originalText || "Log In";
            loginButton.classList.remove("loading");
        }
    }

    // Handle login submission
    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        // Prevent repeated submissions while login is processing
        if (loginButton && loginButton.disabled) return;

        const identifierValue = loginIdentifier.value.trim();
        const passwordValue = password.value;

        let formValid = true;

        // Validate username or email
        if (identifierValue === "") {
            showError(
                loginIdentifier,
                "Please enter your username or email address."
            );
            formValid = false;
        } else {
            showSuccess(loginIdentifier);
        }

        // Validate password
        if (passwordValue.trim() === "") {
            showError(password, "Please enter your password.");
            formValid = false;
        } else {
            showSuccess(password);
        }

        if (!formValid) return;

        // Show loading state before sending the login request
        setLoginLoading(true);

        try {
            // Send login request to backend
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        identifier: identifierValue,
                        password: passwordValue
                    })
                }
            );

            const result = await response.json();

            console.log("Login response:", result);

            // Handle login failure
            if (!response.ok || !result.success) {
                showError(
                    password,
                    result.message || "Login failed. Please try again."
                );

                setLoginLoading(false);
                return;
            }

            // Save the user's profile for use on other pages
            sessionStorage.setItem(
                "loggedInUser",
                JSON.stringify(result.user)
            );

            // Save the Supabase access token for authenticated API requests
            if (result.session && result.session.access_token) {
                sessionStorage.setItem(
                    "supabaseAccessToken",
                    result.session.access_token
                );
            }

            console.log("Logged in user:", result.user);

            // Redirect according to enrollment status
            if (result.hasEnrollment) {
                window.location.href = "home.html";
            } else {
                window.location.href = "selection.html";
            }

        } catch (error) {
            console.error("Login request failed:", error);

            setLoginLoading(false);

            alert(
                "Unable to connect to the server. Please make sure your backend is running."
            );
        }
    });

    // Clear errors when the user types
    [loginIdentifier, password].forEach(function (input) {

        input.addEventListener("input", function () {

            const formGroup = input.closest(".form-group");

            if (!formGroup) return;

            const errorMessage = formGroup.querySelector(".error-message");

            formGroup.classList.remove("error", "success");

            if (errorMessage) {
                errorMessage.textContent = "";
            }
        });
    });

});
