document.addEventListener("DOMContentLoaded", function () {

    const signupForm = document.getElementById("signupForm");

    const firstName = document.getElementById("firstName");
    const lastName = document.getElementById("lastName");
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");

    const signupButton = document.getElementById("signupButton");


    // Display validation error

    function showError(input, message) {

        const formGroup = input.closest(".form-group");
        const errorMessage = formGroup.querySelector(".error-message");

        formGroup.classList.remove("success");
        formGroup.classList.add("error");

        errorMessage.textContent = message;
    }


    // Display successful validation

    function showSuccess(input) {

        const formGroup = input.closest(".form-group");
        const errorMessage = formGroup.querySelector(".error-message");

        formGroup.classList.remove("error");
        formGroup.classList.add("success");

        errorMessage.textContent = "";
    }


    // Clear validation styling

    function clearValidation(input) {

        const formGroup = input.closest(".form-group");
        const errorMessage = formGroup.querySelector(".error-message");

        formGroup.classList.remove("error", "success");
        errorMessage.textContent = "";
    }


    // Email validation

    function isValidEmail(emailAddress) {

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailPattern.test(emailAddress);
    }


    // Validate the form

    function validateForm() {

        const firstNameValue = firstName.value.trim();
        const lastNameValue = lastName.value.trim();
        const usernameValue = username.value.trim();
        const emailValue = email.value.trim();
        const passwordValue = password.value;
        const confirmPasswordValue = confirmPassword.value;

        let formValid = true;


        // First Name

        if (firstNameValue === "") {

            showError(
                firstName,
                "Please enter your first name."
            );

            formValid = false;

        } else {

            showSuccess(firstName);
        }


        // Last Name

        if (lastNameValue === "") {

            showError(
                lastName,
                "Please enter your last name."
            );

            formValid = false;

        } else {

            showSuccess(lastName);
        }


        // Username

        if (usernameValue === "") {

            showError(
                username,
                "Please enter a username."
            );

            formValid = false;

        } else if (usernameValue.length < 3) {

            showError(
                username,
                "Username must be at least 3 characters."
            );

            formValid = false;

        } else {

            showSuccess(username);
        }


        // Email

        if (emailValue === "") {

            showError(
                email,
                "Please enter your email address."
            );

            formValid = false;

        } else if (!isValidEmail(emailValue)) {

            showError(
                email,
                "Please enter a valid email address."
            );

            formValid = false;

        } else {

            showSuccess(email);
        }


        // Password

        if (passwordValue === "") {

            showError(
                password,
                "Please enter a password."
            );

            formValid = false;

        } else if (passwordValue.length < 6) {

            showError(
                password,
                "Password must be at least 6 characters."
            );

            formValid = false;

        } else {

            showSuccess(password);
        }


        // Confirm Password

        if (confirmPasswordValue === "") {

            showError(
                confirmPassword,
                "Please confirm your password."
            );

            formValid = false;

        } else if (passwordValue !== confirmPasswordValue) {

            showError(
                confirmPassword,
                "Passwords do not match. Please try again."
            );

            formValid = false;

        } else if (passwordValue !== "") {

            showSuccess(confirmPassword);
        }


        return formValid;
    }


    // Submit signup form

    signupForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        // Stop if validation fails

        if (!validateForm()) {
            return;
        }


        const firstNameValue = firstName.value.trim();
        const lastNameValue = lastName.value.trim();
        const usernameValue = username.value.trim();
        const emailValue = email.value.trim();
        const passwordValue = password.value;


        // Prevent multiple submissions

        signupButton.disabled = true;
        signupButton.textContent = "Creating account...";


        try {

            // Send signup information to backend

            const response = await fetch(
                "http://localhost:5000/api/auth/signup",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        firstName: firstNameValue,

                        lastName: lastNameValue,

                        username: usernameValue,

                        email: emailValue,

                        password: passwordValue

                    })
                }
            );


            const result = await response.json();


            // Handle backend errors

            if (!response.ok) {

                showError(
                    username,
                    result.message || "Unable to create your account. Please try again."
                );

                signupButton.disabled = false;
                signupButton.textContent = "Create Account →";

                return;
            }


            // Account successfully created

            console.log("Account created:", result.user);


            alert(
                result.message || "Your CodeXpert account has been created successfully! You can now log in."
            );


            // Redirect to login page

            window.location.href = "login.html";


        } catch (error) {

            console.error(
                "Signup request failed:",
                error
            );


            alert(
                "Unable to connect to the server. Please check your connection and try again."
            );


            signupButton.disabled = false;
            signupButton.textContent = "Create Account →";

        }

    });


    // Clear validation messages while typing

    [
        firstName,
        lastName,
        username,
        email,
        password,
        confirmPassword

    ].forEach(function (input) {

        input.addEventListener("input", function () {

            clearValidation(input);


            // Recheck password confirmation when either password changes

            if (
                input === password &&
                confirmPassword.value !== ""
            ) {

                if (password.value !== confirmPassword.value) {

                    showError(
                        confirmPassword,
                        "Passwords do not match. Please try again."
                    );

                } else {

                    showSuccess(confirmPassword);
                }
            }


            if (
                input === confirmPassword &&
                confirmPassword.value !== ""
            ) {

                if (password.value !== confirmPassword.value) {

                    showError(
                        confirmPassword,
                        "Passwords do not match. Please try again."
                    );

                } else {

                    showSuccess(confirmPassword);
                }
            }

        });

    });

});