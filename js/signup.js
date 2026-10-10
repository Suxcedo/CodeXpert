document.addEventListener("DOMContentLoaded", function () {

    const signupForm =
        document.getElementById("signupForm");

    const firstName =
        document.getElementById("firstName");

    const lastName =
        document.getElementById("lastName");

    const username =
        document.getElementById("username");

    const email =
        document.getElementById("email");

    const password =
        document.getElementById("password");


    function showError(input, message) {

        const formGroup =
            input.closest(".form-group");

        const errorMessage =
            formGroup.querySelector(".error-message");

        formGroup.classList.remove("success");

        formGroup.classList.add("error");

        errorMessage.textContent = message;
    }


    function showSuccess(input) {

        const formGroup =
            input.closest(".form-group");

        const errorMessage =
            formGroup.querySelector(".error-message");

        formGroup.classList.remove("error");

        formGroup.classList.add("success");

        errorMessage.textContent = "";
    }


    function isValidEmail(emailAddress) {

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailPattern.test(emailAddress);
    }


    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const firstNameValue =
                firstName.value.trim();

            const lastNameValue =
                lastName.value.trim();

            const usernameValue =
                username.value.trim();

            const emailValue =
                email.value.trim();

            const passwordValue =
                password.value;


            let formValid = true;


            // First Name validation

            if (firstNameValue === "") {

                showError(
                    firstName,
                    "Please enter your first name."
                );

                formValid = false;

            } else {

                showSuccess(firstName);
            }


            // Last Name validation

            if (lastNameValue === "") {

                showError(
                    lastName,
                    "Please enter your last name."
                );

                formValid = false;

            } else {

                showSuccess(lastName);
            }


            // Username validation

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


            // Email validation

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


            // Password validation

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


            // Stop if validation failed

            if (!formValid) {
                return;
            }


            // Send signup information to backend

            try {

                const response =
                    await fetch(
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


                const result =
                    await response.json();

console.log("Signup response:", result);
                // Backend returned an error

                if (!response.ok) {

                    showError(
                        username,
                        result.message
                    );

                    return;
                }


                // Account created successfully

                alert(result.message);

                console.log(
                    "Account created:",
                    result.user
                );


            } catch (error) {

                console.error(
                    "Signup request failed:",
                    error
                );


                alert(
                    "Unable to connect to the server. Please try again."
                );
            }

        }
    );


    // Clear validation messages while typing

    [
        firstName,
        lastName,
        username,
        email,
        password

    ].forEach(function (input) {

        input.addEventListener(
            "input",
            function () {

                const formGroup =
                    input.closest(".form-group");

                const errorMessage =
                    formGroup.querySelector(
                        ".error-message"
                    );


                formGroup.classList.remove(
                    "error",
                    "success"
                );


                errorMessage.textContent = "";

            }
        );

    });

});