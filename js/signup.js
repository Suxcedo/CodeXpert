const signupForm = document.getElementById("signupForm");

const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const password = document.getElementById("password");


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
    function (event) {

        event.preventDefault();

        const nameValue =
            fullName.value.trim();

        const emailValue =
            email.value.trim();

        const passwordValue =
            password.value;

        let formValid = true;


        if (nameValue === "") {

            showError(
                fullName,
                "Please enter your full name."
            );

            formValid = false;

        } else {

            showSuccess(fullName);
        }


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


        if (!formValid) {
            return;
        }


        const firstName =
            nameValue.split(/\s+/)[0];


        const user = {

            fullName: nameValue,

            firstName: firstName,

            email: emailValue,

            streak: 0,

            xp: 0,

            lessonsCompleted: 0,

            weeklyActivity: [
                false,
                false,
                false,
                false,
                false,
                false,
                false
            ]
        };


        localStorage.setItem(
            "codexpertUser",
            JSON.stringify(user)
        );


        window.location.href =
            "home.html";
    }
);


[
    fullName,
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