(function () {
"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("adminLoginForm");
    const usernameInput = document.getElementById("adminUsername");
    const passwordInput = document.getElementById("adminPassword");
    const errorBox = document.getElementById("adminLoginError");
    const loginButton = document.getElementById("adminLoginButton");
    const buttonText = loginButton
        ? loginButton.querySelector(".admin-login-button-text")
        : null;
    const loadingText = loginButton
        ? loginButton.querySelector(".admin-login-loading")
        : null;

    if (!form) {
        return;
    }

    function showError(message) {
        if (!errorBox) {
            return;
        }

        errorBox.textContent = message || "Admin login failed.";
        errorBox.hidden = false;
    }

    function clearError() {
        if (!errorBox) {
            return;
        }

        errorBox.textContent = "";
        errorBox.hidden = true;
    }

    function setLoading(isLoading) {
        if (loginButton) {
            loginButton.disabled = isLoading;
            loginButton.setAttribute("aria-busy", String(isLoading));
        }

        if (buttonText) {
            buttonText.hidden = isLoading;
        }

        if (loadingText) {
            loadingText.hidden = !isLoading;
        }
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        clearError();

        const username = usernameInput
            ? usernameInput.value.trim()
            : "";

        const password = passwordInput
            ? passwordInput.value
            : "";

        if (!username) {
            showError("Please enter your username or email.");
            if (usernameInput) {
                usernameInput.focus();
            }
            return;
        }

        if (!password) {
            showError("Please enter your password.");
            if (passwordInput) {
                passwordInput.focus();
            }
            return;
        }

        if (
            !window.AlDahayanAdminAuth ||
            typeof window.AlDahayanAdminAuth.login !== "function"
        ) {
            showError("Admin authentication is unavailable.");
            return;
        }

        setLoading(true);

        try {
            await window.AlDahayanAdminAuth.login(
                username,
                password
            );

            window.location.href = "dashboard.html";
        } catch (error) {
            console.error("Admin login error:", error);

            showError(
                error && error.message
                    ? error.message
                    : "Unable to sign in. Please try again."
            );
        } finally {
            setLoading(false);
        }
    });
});

})();
