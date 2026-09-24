const APP_CONFIG = {
  company: {
    name: "Al-Dahayan Trading Company",
    arabicName: "شركة الضحيان التجارية"
  },

  site: {
    name: "Al-Dahayan Trading Company",
    defaultLanguage: "en",
    supportedLanguages: ["en", "ar"],

    direction: {
      en: "ltr",
      ar: "rtl"
    }
  },

  /*
   * Project root paths.
   * These paths are resolved from the current HTML document.
   */
  paths: {
    root: "../",
    data: "../data/",
    pages: "./",
    components: "../components/",
    api: "../api/",
    css: "../css/",
    js: "../js/"
  },

  dataFiles: {
    vehicles: "vehicles.json",
    models: "models.json",
    oemParts: "oem-parts.json",
    partCategories: "part-categories.json",
    compatibility: "compatibility.json",
    locations: "locations.json",
    inventory: "inventory.json",
    partPrices: "part-prices.json",
    inquiries: "inquiries.json",
    services: "services.json",
    company: "company.json"
  },

  contact: {
    country: "Saudi Arabia",
    phone: "",
    whatsapp: "",
    email: ""
  },

  features: {
    oemSearch: true,
    vehicleSearch: true,
    vinSearch: true,
    inventory: true,
    inquiry: true,
    bilingual: true
  },

  environment: {
    mode: "development",
    production: false
  }
};


/*
 * Get the correct project root.
 *
 * index.html is in the root, while pages and admin files
 * are inside subfolders.
 */
function getProjectRoot() {
  const path = window.location.pathname;

  if (
    path.includes("/pages/") ||
    path.includes("/admin/")
  ) {
    return "../";
  }

  return "./";
}


/*
 * Get a project-relative path.
 */
function getProjectPath(type) {
  const root = getProjectRoot();

  const paths = {
    root: root,
    data: root + "data/",
    pages: root + "pages/",
    components: root + "components/",
    api: root + "api/",
    css: root + "css/",
    js: root + "js/"
  };

  return paths[type] || root;
}


/*
 * Get a data file path.
 */
function getDataPath(fileName) {
  return getProjectPath("data") + fileName;
}


/*
 * Get a page path.
 */
function getPagePath(fileName) {
  return getProjectPath("pages") + fileName;
}


/*
 * Get a component path.
 */
function getComponentPath(fileName) {
  return getProjectPath("components") + fileName;
}


/*
 * Get an API path.
 */
function getApiPath(path = "") {
  return getProjectPath("api") + path;
}


window.APP_CONFIG = APP_CONFIG;
window.getProjectRoot = getProjectRoot;
window.getProjectPath = getProjectPath;
window.getDataPath = getDataPath;
window.getPagePath = getPagePath;
window.getComponentPath = getComponentPath;
window.getApiPath = getApiPath;
