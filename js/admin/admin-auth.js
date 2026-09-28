/* =========================================
   AL-DAHAYAN ADMIN AUTHENTICATION
   Admin Login & Session Management
   ========================================= */

(function () {
  "use strict";


  /* =========================================
     CONFIGURATION
     ========================================= */

  const LOGIN_FORM_ID = "adminLoginForm";
  const USERNAME_FIELD_ID = "adminUsername";
  const PASSWORD_FIELD_ID = "adminPassword";
  const LOGIN_BUTTON_ID = "adminLoginButton";
  const ERROR_MESSAGE_ID = "adminLoginError";


  /*
   * IMPORTANT:
   * The authentication endpoint should come from
   * the existing project configuration.
   *
   * Do not hard-code credentials, passwords,
   * JWT tokens, or secrets in this file.
   */

  function getApiBaseUrl() {
    if (
      window.DAHAYAN_CONFIG &&
      typeof window.DAHAYAN_CONFIG.API_BASE_URL === "string"
    ) {
      return window.DAHAYAN_CONFIG.API_BASE_URL.replace(/\/$/, "");
    }

    if (
      window.CONFIG &&
      typeof window.CONFIG.API_BASE_URL === "string"
    ) {
      return window.CONFIG.API_BASE_URL.replace(/\/$/, "");
    }

    return "";
  }


  /* =========================================
     STORAGE KEYS
     ========================================= */

  const STORAGE_KEYS = {
    token: "dahayan_admin_token",
    admin: "dahayan_admin_user"
  };


  /* =========================================
     DOM HELPERS
     ========================================= */

  function getElement(id) {
    return document.getElementById(id);
  }


  /* =========================================
     MESSAGE HANDLING
     ========================================= */

  function showError(message) {
    const errorElement = getElement(ERROR_MESSAGE_ID);

    if (!errorElement) {
      return;
    }

    errorElement.textContent =
      message || "Unable to sign in. Please try again.";

    errorElement.hidden = false;
  }


  function clearError() {
    const errorElement = getElement(ERROR_MESSAGE_ID);

    if (!errorElement) {
      return;
    }

    errorElement.textContent = "";
    errorElement.hidden = true;
  }


  /* =========================================
     BUTTON STATE
     ========================================= */

  function setLoading(isLoading) {
    const button = getElement(LOGIN_BUTTON_ID);

    if (!button) {
      return;
    }

    const normalText =
      button.querySelector(".admin-login-button-text");

    const loadingText =
      button.querySelector(".admin-login-loading");

    button.disabled = isLoading;

    if (normalText) {
      normalText.hidden = isLoading;
    }

    if (loadingText) {
      loadingText.hidden = !isLoading;
    }
  }


  /* =========================================
     RESPONSE MESSAGE
     ========================================= */

  function getResponseMessage(data) {
    if (!data) {
      return "Unable to sign in. Please try again.";
    }

    if (typeof data.message === "string") {
      return data.message;
    }

    if (
      data.error &&
      typeof data.error === "string"
    ) {
      return data.error;
    }

    if (
      data.error &&
      typeof data.error.message === "string"
    ) {
      return data.error.message;
    }

    return "Unable to sign in. Please check your credentials.";
  }


  /* =========================================
     SAVE SESSION
     ========================================= */

  function saveSession(data) {
    /*
     * The verified backend currently returns a
     * successful authentication response containing
     * the authenticated admin information and JWT.
     *
     * We only store values returned by the backend.
     */

    if (!data || typeof data !== "object") {
      return false;
    }

    const token =
      data.token ||
      data.accessToken ||
      data.jwt ||
      null;

    const admin =
      data.admin ||
      data.user ||
      data.data?.admin ||
      data.data?.user ||
      null;

    if (!token) {
      return false;
    }

    sessionStorage.setItem(
      STORAGE_KEYS.token,
      token
    );

    if (admin) {
      sessionStorage.setItem(
        STORAGE_KEYS.admin,
        JSON.stringify(admin)
      );
    }

    return true;
  }


  /* =========================================
     LOGIN REQUEST
     ========================================= */

  async function login(username, password) {

    const apiBaseUrl = getApiBaseUrl();

    if (!apiBaseUrl) {
      throw new Error(
        "Admin API configuration is not available."
      );
    }


    /*
     * Authentication route.
     *
     * This is kept in one place so it can be aligned
     * with the verified backend route without changing
     * the rest of the Admin Panel.
     */

    const loginUrl =
      `${apiBaseUrl}/api/admin/login`;


    const response = await fetch(
      loginUrl,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          username: username,
          password: password
        })
      }
    );


    let data = null;

    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }


    if (!response.ok) {
      throw new Error(
        getResponseMessage(data)
      );
    }


    if (!data || data.success !== true) {
      throw new Error(
        getResponseMessage(data)
      );
    }


    if (!saveSession(data)) {
      throw new Error(
        "Login succeeded but no authentication token was returned."
      );
    }


    return data;
  }


  /* =========================================
     LOGIN FORM
     ========================================= */

  function initializeLoginForm() {

    const form =
      getElement(LOGIN_FORM_ID);

    if (!form) {
      return;
    }


    form.addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();

        clearError();

        const usernameInput =
          getElement(USERNAME_FIELD_ID);

        const passwordInput =
          getElement(PASSWORD_FIELD_ID);


        const username =
          usernameInput
            ? usernameInput.value.trim()
            : "";

        const password =
          passwordInput
            ? passwordInput.value
            : "";


        /* Validation */

        if (!username) {
          showError(
            "Please enter your username or email."
          );

          if (usernameInput) {
            usernameInput.focus();
          }

          return;
        }


        if (!password) {
          showError(
            "Please enter your password."
          );

          if (passwordInput) {
            passwordInput.focus();
          }

          return;
        }


        setLoading(true);


        try {

          await login(
            username,
            password
          );


          /*
           * Authentication successful.
           *
           * Dashboard page will be created next.
           */

          window.location.href =
            "dashboard.html";


        } catch (error) {

          console.error(
            "Admin login error:",
            error
          );

          showError(
            error.message ||
            "Unable to sign in. Please try again."
          );

        } finally {

          setLoading(false);

        }

      }
    );
  }


  /* =========================================
     SESSION HELPERS
     ========================================= */

  function getAdminToken() {
    return sessionStorage.getItem(
      STORAGE_KEYS.token
    );
  }


  function getAdminUser() {

    const value =
      sessionStorage.getItem(
        STORAGE_KEYS.admin
      );

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }


  function isAuthenticated() {
    return Boolean(
      getAdminToken()
    );
  }


  function logout() {

    sessionStorage.removeItem(
      STORAGE_KEYS.token
    );

    sessionStorage.removeItem(
      STORAGE_KEYS.admin
    );

    window.location.href =
      "login.html";
  }


  /* =========================================
     GLOBAL ADMIN AUTH API
     ========================================= */

  window.DahayanAdminAuth = {

    getToken:
      getAdminToken,

    getAdmin:
      getAdminUser,

    isAuthenticated:
      isAuthenticated,

    logout:
      logout

  };


  /* =========================================
     INITIALIZE
     ========================================= */

  document.addEventListener(
    "DOMContentLoaded",
    initializeLoginForm
  );

})();
