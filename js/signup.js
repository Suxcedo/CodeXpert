const signupForm = document.getElementById("signupForm");

const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const terms = document.getElementById("terms");

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

const passwordStrength = document.querySelector(".password-strength");
const strengthText = document.getElementById("strengthText");

const termsError = document.getElementById("termsError");
const successMessage = document.getElementById("successMessage");



function showError(input, message) {
    const formGroup = input.closest(".form-group");

    formGroup.classList.remove("success");
    formGroup.classList.add("error");

    const errorMessage =
        formGroup.querySelector(".error-message");

    errorMessage.textContent = message;
}


function showSuccess(input) {
    const formGroup = input.closest(".form-group");

    formGroup.classList.remove("error");
    formGroup.classList.add("success");

    const errorMessage =
        formGroup.querySelector(".error-message");

    errorMessage.textContent = "";
}


function isValidEmail(emailAddress) {
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(emailAddress);
}


function isValidUsername(usernameValue) {
    const usernamePattern =
        /^[a-zA-Z0-9_]{3,20}$/;

    return usernamePattern.test(usernameValue);
}


/* Password Strength */

function checkPasswordStrength(passwordValue) {
    let score = 0;

    if (passwordValue.length >= 8) {
        score++;
    }

    if (/[A-Z]/.test(passwordValue)) {
        score++;
    }

    if (/[0-9]/.test(passwordValue)) {
        score++;
    }

    if (/[^A-Za-z0-9]/.test(passwordValue)) {
        score++;
    }

    passwordStrength.classList.remove(
        "weak",
        "medium",
        "good",
        "strong"
    );

    if (passwordValue.length === 0) {
        strengthText.textContent =
            "Use at least 8 characters";

        return;
    }

    if (score === 1) {
        passwordStrength.classList.add("weak");
        strengthText.textContent = "Weak password";
    } else if (score === 2) {
        passwordStrength.classList.add("medium");
        strengthText.textContent = "Medium password";
    } else if (score === 3) {
        passwordStrength.classList.add("good");
        strengthText.textContent = "Good password";
    } else if (score === 4) {
        passwordStrength.classList.add("strong");
        strengthText.textContent = "Strong password";
    }
}


function togglePasswordVisibility(
    input,
    button
) {
    if (input.type === "password") {
        input.type = "text";
        button.textContent = "Hide";
    } else {
        input.type = "password";
        button.textContent = "Show";
    }
}


togglePassword.addEventListener(
    "click",
    function () {
        togglePasswordVisibility(
            password,
            togglePassword
        );
    }
);


toggleConfirmPassword.addEventListener(
    "click",
    function () {
        togglePasswordVisibility(
            confirmPassword,
            toggleConfirmPassword
        );
    }
);

password.addEventListener(
    "input",
    function () {
        checkPasswordStrength(password.value);
    }
);

const formInputs = [
    firstName,
    lastName,
    username,
    email,
    password,
    confirmPassword
];


formInputs.forEach(function (input) {
    input.addEventListener(
        "input",
        function () {
            const formGroup =
                input.closest(".form-group");

            formGroup.classList.remove("error");

            const errorMessage =
                formGroup.querySelector(
                    ".error-message"
                );

            errorMessage.textContent = "";

            successMessage.classList.remove("show");
        }
    );
});


terms.addEventListener(
    "change",
    function () {
        termsError.textContent = "";
        successMessage.classList.remove("show");
    }
);


/* Form Submission */

signupForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        let formIsValid = true;

        successMessage.classList.remove("show");


        /* First name */

        if (firstName.value.trim() === "") {
            showError(
                firstName,
                "Please enter your first name."
            );

            formIsValid = false;
        } else {
            showSuccess(firstName);
        }


        /* Last name */

        if (lastName.value.trim() === "") {
            showError(
                lastName,
                "Please enter your last name."
            );

            formIsValid = false;
        } else {
            showSuccess(lastName);
        }


        /* Username */

        if (username.value.trim() === "") {
            showError(
                username,
                "Please choose a username."
            );

            formIsValid = false;

        } else if (
            !isValidUsername(
                username.value.trim()
            )
        ) {
            showError(
                username,
                "Use 3–20 letters, numbers or underscores."
            );

            formIsValid = false;

        } else {
            showSuccess(username);
        }


        /* Email */

        if (email.value.trim() === "") {
            showError(
                email,
                "Please enter your email address."
            );

            formIsValid = false;

        } else if (
            !isValidEmail(email.value.trim())
        ) {
            showError(
                email,
                "Please enter a valid email address."
            );

            formIsValid = false;

        } else {
            showSuccess(email);
        }


        /* Password */

        if (password.value === "") {
            showError(
                password,
                "Please create a password."
            );

            formIsValid = false;

        } else if (password.value.length < 8) {
            showError(
                password,
                "Password must be at least 8 characters."
            );

            formIsValid = false;

        } else {
            showSuccess(password);
        }


        /* Confirm password */

        if (confirmPassword.value === "") {
            showError(
                confirmPassword,
                "Please confirm your password."
            );

            formIsValid = false;

        } else if (
            confirmPassword.value !== password.value
        ) {
            showError(
                confirmPassword,
                "Passwords do not match."
            );

            formIsValid = false;

        } else {
            showSuccess(confirmPassword);
        }


        /* Terms */

        if (!terms.checked) {
            termsError.textContent =
                "Please accept the Terms of Service and Privacy Policy.";

            formIsValid = false;

        } else {
            termsError.textContent = "";
        }


        /* Successful validation */

        if (formIsValid) {
            successMessage.classList.add("show");

            /*
             Supabase registration will be added
             here when the backend is connected.
            */
        }
    }
);