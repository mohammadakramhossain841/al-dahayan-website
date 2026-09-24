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

  paths: {
    data: "./data/",
    pages: "./pages/",
    components: "./components/",
    api: "./api/"
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
  }
};

function getDataPath(fileName) {
  return APP_CONFIG.paths.data + fileName;
}

window.APP_CONFIG = APP_CONFIG;
window.getDataPath = getDataPath;
