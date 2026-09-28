(function () {
    "use strict";

    const API_PATH = "/api/v1/admin";

    function getToken() {
        return sessionStorage.getItem("alDahayanAdminToken");
    }

    function getAdmin() {
        const data = sessionStorage.getItem("alDahayanAdmin");

        if (!data) {
            return null;
        }

        try {
            return JSON.parse(data);
        } catch (error) {
            sessionStorage.removeItem("alDahayanAdmin");
            return null;
        }
    }

    function saveSession(result) {
        if (!result || !result.token || !result.admin) {
            throw new Error("Invalid login response.");
        }

        sessionStorage.setItem("alDahayanAdminToken", result.token);
        sessionStorage.setItem(
            "alDahayanAdmin",
            JSON.stringify(result.admin)
        );
    }

    function clearSession() {
        sessionStorage.removeItem("alDahayanAdminToken");
        sessionStorage.removeItem("alDahayanAdmin");
    }

    function isLoggedIn() {
        return Boolean(getToken() && getAdmin());
    }

    async function login(username, password) {
        const response = await fetch(`${API_PATH}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        let data;

        try {
            data = await response.json();
        } catch (error) {
            throw new Error("Invalid server response.");
        }

        if (!response.ok || !data || data.success !== true) {
            throw new Error(
                data && (data.error || data.message)
                    ? data.error || data.message
                    : "Admin login failed."
            );
        }

        saveSession(data);

        return data;
    }

    function getAuthHeaders() {
        const token = getToken();

        if (!token) {
            return {};
        }

        return {
            Authorization: `Bearer ${token}`
        };
    }

    function requireLogin(redirectPath) {
        if (isLoggedIn()) {
            return true;
        }

        window.location.href = redirectPath || "/login.html";
        return false;
    }

    function logout(redirectPath) {
        clearSession();
        window.location.href = redirectPath || "/login.html";
    }

    window.AlDahayanAdminAuth = {
        login: login,
        logout: logout,
        getToken: getToken,
        getAdmin: getAdmin,
        getAuthHeaders: getAuthHeaders,
        isLoggedIn: isLoggedIn,
        requireLogin: requireLogin,
        clearSession: clearSession
    };
})();
