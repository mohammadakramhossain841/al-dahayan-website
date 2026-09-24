document.addEventListener("DOMContentLoaded", () => {
  initializeApplication();
});

function initializeApplication() {
  initializeLanguage();
  initializeNavigation();
  initializeSearch();
  initializePage();
}

function initializePage() {
  const page = document.body?.dataset?.page || "";

  document.dispatchEvent(
    new CustomEvent("alDahayanPageReady", {
      detail: {
        page: page,
        config: window.APP_CONFIG || {}
      }
    })
  );
}

function getCurrentLanguage() {
  return (
    document.documentElement.getAttribute("lang") ||
    window.APP_CONFIG?.site?.defaultLanguage ||
    "en"
  );
}

function setPageLanguage(language) {
  if (!window.APP_CONFIG?.site?.supportedLanguages?.includes(language)) {
    return;
  }

  document.documentElement.setAttribute("lang", language);

  const direction =
    window.APP_CONFIG.site.direction?.[language] || "ltr";

  document.documentElement.setAttribute("dir", direction);

  localStorage.setItem("alDahayanLanguage", language);
}

function getStoredLanguage() {
  return localStorage.getItem("alDahayanLanguage");
}

function isRTL() {
  return getCurrentLanguage() === "ar";
}

window.AlDahayanApp = {
  initialize: initializeApplication,
  getCurrentLanguage,
  setPageLanguage,
  getStoredLanguage,
  isRTL
};
