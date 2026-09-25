(function () {
    "use strict";

    const CONFIG = window.AlDahayanConfig || null;
    const UTILS = window.AlDahayanUtils || null;

    let companyData = {};
    let effectiveConfig = {};
    let socialChannels = [];

    /**
     * ---------------------------------------------------------
     * Basic Helpers
     * ---------------------------------------------------------
     */

    function $(selector, parent = document) {
        return parent.querySelector(selector);
    }

    function $all(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    }

    function safeText(value, fallback = "") {
        if (value === null || value === undefined || value === "") {
            return fallback;
        }

        return String(value);
    }

    function normalizePhone(value) {
        return safeText(value).replace(/[^\d+]/g, "");
    }

    function normalizeWhatsApp(value) {
        return safeText(value).replace(/[^\d]/g, "");
    }

    function getElementValue(element) {
        if (!element) return "";

        return (
            element.getAttribute("data-value") ||
            element.getAttribute("data-contact") ||
            element.textContent ||
            ""
        ).trim();
    }

    /**
     * ---------------------------------------------------------
     * Company Data
     * ---------------------------------------------------------
     */

    async function loadCompanyData() {
        const dataPath = CONFIG
            ? CONFIG.getDataPath("company.json")
            : "data/company.json";

        try {
            const response = await fetch(dataPath, {
                cache: "no-cache"
            });

            if (!response.ok) {
                throw new Error(`Company data request failed: ${response.status}`);
            }

            companyData = await response.json();
            return companyData;
        } catch (error) {
            console.warn("Unable to load company.json:", error);

            companyData = {};
            return companyData;
        }
    }

    /**
     * ---------------------------------------------------------
     * Admin Settings
     * ---------------------------------------------------------
     */

    function loadEffectiveConfig() {
        if (CONFIG && typeof CONFIG.getEffectiveAppConfig === "function") {
            effectiveConfig = CONFIG.getEffectiveAppConfig();
        } else {
            effectiveConfig = {};
        }

        return effectiveConfig;
    }

    function loadSocialChannels() {
        if (
            CONFIG &&
            typeof CONFIG.getAdminSocialChannels === "function"
        ) {
            const channels = CONFIG.getAdminSocialChannels();

            socialChannels = Array.isArray(channels)
                ? channels
                : [];
        } else {
            socialChannels = [];
        }

        return socialChannels;
    }

    /**
     * ---------------------------------------------------------
     * Nested Data Helper
     * ---------------------------------------------------------
     */

    function getNestedValue(object, path, fallback = "") {
        if (!object || !path) return fallback;

        const parts = path.split(".");
        let current = object;

        for (const part of parts) {
            if (
                current === null ||
                current === undefined ||
                typeof current !== "object" ||
                !(part in current)
            ) {
                return fallback;
            }

            current = current[part];
        }

        return current ?? fallback;
    }

    /**
     * ---------------------------------------------------------
     * Company Information Resolution
     *
     * Priority:
     * 1. Admin Panel settings
     * 2. company.json
     * 3. config.js defaults
     * ---------------------------------------------------------
     */

    function getCompanyName() {
        return (
            effectiveConfig?.company?.name ||
            getNestedValue(companyData, "name") ||
            getNestedValue(companyData, "companyName") ||
            "Al-Dahayan Trading Company"
        );
    }

    function getArabicCompanyName() {
        return (
            effectiveConfig?.company?.arabicName ||
            getNestedValue(companyData, "arabicName") ||
            getNestedValue(companyData, "companyArabicName") ||
            "شركة الضحيان التجارية"
        );
    }

    function getCountry() {
        return (
            effectiveConfig?.company?.country ||
            getNestedValue(companyData, "country") ||
            "Saudi Arabia"
        );
    }

    function getPhone() {
        return (
            effectiveConfig?.contact?.phone ||
            getNestedValue(companyData, "phone") ||
            getNestedValue(companyData, "contact.phone") ||
            ""
        );
    }

    function getWhatsApp() {
        return (
            effectiveConfig?.contact?.whatsapp ||
            getNestedValue(companyData, "whatsapp") ||
            getNestedValue(companyData, "contact.whatsapp") ||
            ""
        );
    }

    function getEmail() {
        return (
            effectiveConfig?.contact?.email ||
            getNestedValue(companyData, "email") ||
            getNestedValue(companyData, "contact.email") ||
            ""
        );
    }

    /**
     * ---------------------------------------------------------
     * Social Channels
     * ---------------------------------------------------------
     *
     * Admin Panel controls:
     * Facebook
     * YouTube
     * TikTok
     * X
     * Instagram
     * LinkedIn
     * WhatsApp
     * Google Maps
     * Website
     * Other
     */

    function getSocialChannel(platform) {
        const target = safeText(platform).toLowerCase();

        return socialChannels.find((channel) => {
            return (
                safeText(channel.platform).toLowerCase() === target &&
                channel.active !== false
            );
        }) || null;
    }

    function getSocialUrl(platform) {
        const channel = getSocialChannel(platform);

        if (!channel) return "";

        return (
            channel.url ||
            channel.link ||
            channel.value ||
            ""
        ).trim();
    }

    /**
     * ---------------------------------------------------------
     * Apply Text Content
     * ---------------------------------------------------------
     */

    function applyTextContent() {
        $all("[data-company-name]").forEach((element) => {
            element.textContent = getCompanyName();
        });

        $all("[data-company-arabic-name]").forEach((element) => {
            element.textContent = getArabicCompanyName();
        });

        $all("[data-company-country]").forEach((element) => {
            element.textContent = getCountry();
        });

        $all("[data-company-phone]").forEach((element) => {
            element.textContent = getPhone();
        });

        $all("[data-company-whatsapp]").forEach((element) => {
            element.textContent = getWhatsApp();
        });

        $all("[data-company-email]").forEach((element) => {
            element.textContent = getEmail();
        });
    }

    /**
     * ---------------------------------------------------------
     * Apply Phone Links
     * ---------------------------------------------------------
     */

    function applyPhoneLinks() {
        const phone = getPhone();

        $all(
            '[data-contact="phone"], [data-company-phone-link], a[href^="tel:"]'
        ).forEach((element) => {
            if (!phone) return;

            element.setAttribute(
                "href",
                `tel:${normalizePhone(phone)}`
            );

            if (
                element.hasAttribute("data-company-phone-link") ||
                element.getAttribute("data-contact") === "phone"
            ) {
                element.textContent = phone;
            }
        });
    }

    /**
     * ---------------------------------------------------------
     * Apply Email Links
     * ---------------------------------------------------------
     */

    function applyEmailLinks() {
        const email = getEmail();

        if (!email) return;

        $all(
            '[data-contact="email"], [data-company-email-link], a[href^="mailto:"]'
        ).forEach((element) => {
            element.setAttribute(
                "href",
                `mailto:${email}`
            );

            if (
                element.hasAttribute("data-company-email-link") ||
                element.getAttribute("data-contact") === "email"
            ) {
                element.textContent = email;
            }
        });
    }

    /**
     * ---------------------------------------------------------
     * Apply WhatsApp Links
     * ---------------------------------------------------------
     */

    function applyWhatsAppLinks() {
        const whatsapp = getWhatsApp();

        if (!whatsapp) return;

        const number = normalizeWhatsApp(whatsapp);

        const whatsappUrl =
            `https://wa.me/${number}`;

        $all(
            '[data-contact="whatsapp"], [data-company-whatsapp-link], a[href*="wa.me"]'
        ).forEach((element) => {
            element.setAttribute("href", whatsappUrl);

            if (
                element.hasAttribute("data-company-whatsapp-link") ||
                element.getAttribute("data-contact") === "whatsapp"
            ) {
                element.setAttribute("target", "_blank");
                element.setAttribute("rel", "noopener noreferrer");
            }
        });
    }

    /**
     * ---------------------------------------------------------
     * Apply Maps Links
     * ---------------------------------------------------------
     */

    function applyMapsLinks() {
        const mapsUrl =
            getSocialUrl("Google Maps") ||
            getNestedValue(companyData, "googleMaps") ||
            getNestedValue(companyData, "maps") ||
            getNestedValue(companyData, "contact.googleMaps") ||
            "";

        if (!mapsUrl) return;

        $all(
            '[data-contact="maps"], [data-company-maps], a[href*="google.com/maps"]'
        ).forEach((element) => {
            element.setAttribute("href", mapsUrl);
            element.setAttribute("target", "_blank");
            element.setAttribute("rel", "noopener noreferrer");
        });
    }

    /**
     * ---------------------------------------------------------
     * Apply Social Links
     * ---------------------------------------------------------
     */

    function applySocialLinks() {
        const socialMap = {
            facebook: "Facebook",
            youtube: "YouTube",
            tiktok: "TikTok",
            x: "X",
            twitter: "X",
            instagram: "Instagram",
            linkedin: "LinkedIn",
            whatsapp: "WhatsApp",
            googlemaps: "Google Maps",
            "google-maps": "Google Maps",
            website: "Website",
            other: "Other"
        };

        $all("[data-social]").forEach((element) => {
            const key = safeText(
                element.getAttribute("data-social")
            ).toLowerCase();

            const platform = socialMap[key];

            if (!platform) return;

            const url = getSocialUrl(platform);

            if (!url) {
                element.style.display = "none";
                return;
            }

            element.setAttribute("href", url);

            if (!url.startsWith("tel:")) {
                element.setAttribute("target", "_blank");
                element.setAttribute(
                    "rel",
                    "noopener noreferrer"
                );
            }

            element.style.display = "";
        });
    }

    /**
     * ---------------------------------------------------------
     * Generic Contact Elements
     * ---------------------------------------------------------
     */

    function applyGenericContactElements() {
        $all("[data-contact-value]").forEach((element) => {
            const type = safeText(
                element.getAttribute("data-contact-value")
            ).toLowerCase();

            switch (type) {
                case "company":
                case "company-name":
                    element.textContent = getCompanyName();
                    break;

                case "arabic-company":
                case "arabic-company-name":
                    element.textContent = getArabicCompanyName();
                    break;

                case "country":
                    element.textContent = getCountry();
                    break;

                case "phone":
                    element.textContent = getPhone();
                    break;

                case "whatsapp":
                    element.textContent = getWhatsApp();
                    break;

                case "email":
                    element.textContent = getEmail();
                    break;

                default:
                    break;
            }
        });
    }

    /**
     * ---------------------------------------------------------
     * Contact Visibility
     * ---------------------------------------------------------
     */

    function applyContactVisibility() {
        const phone = getPhone();
        const whatsapp = getWhatsApp();
        const email = getEmail();

        $all("[data-show-if-contact]").forEach((element) => {
            const type = safeText(
                element.getAttribute("data-show-if-contact")
            ).toLowerCase();

            let available = false;

            if (type === "phone") {
                available = Boolean(phone);
            } else if (type === "whatsapp") {
                available = Boolean(whatsapp);
            } else if (type === "email") {
                available = Boolean(email);
            } else if (type === "maps") {
                available = Boolean(getSocialUrl("Google Maps"));
            }

            element.style.display = available ? "" : "none";
        });
    }

    /**
     * ---------------------------------------------------------
     * Dispatch Public Contact Update Event
     * ---------------------------------------------------------
     */

    function dispatchContactUpdate() {
        document.dispatchEvent(
            new CustomEvent("alDahayanContactUpdated", {
                detail: {
                    company: {
                        name: getCompanyName(),
                        arabicName: getArabicCompanyName(),
                        country: getCountry()
                    },
                    contact: {
                        phone: getPhone(),
                        whatsapp: getWhatsApp(),
                        email: getEmail()
                    },
                    social: socialChannels
                }
            })
        );
    }

    /**
     * ---------------------------------------------------------
     * Main Apply Function
     * ---------------------------------------------------------
     */

    function applyContactSettings() {
        loadEffectiveConfig();
        loadSocialChannels();

        applyTextContent();
        applyPhoneLinks();
        applyEmailLinks();
        applyWhatsAppLinks();
        applyMapsLinks();
        applySocialLinks();
        applyGenericContactElements();
        applyContactVisibility();

        dispatchContactUpdate();
    }

    /**
     * ---------------------------------------------------------
     * Initialize
     * ---------------------------------------------------------
     */

    async function init() {
        try {
            await loadCompanyData();
            applyContactSettings();

            document.dispatchEvent(
                new CustomEvent("alDahayanContactReady")
            );
        } catch (error) {
            console.error(
                "Al-Dahayan contact system initialization failed:",
                error
            );
        }
    }

    /**
     * ---------------------------------------------------------
     * Refresh
     * ---------------------------------------------------------
     */

    function refresh() {
        applyContactSettings();
    }

    /**
     * ---------------------------------------------------------
     * Public API
     * ---------------------------------------------------------
     */

    window.AlDahayanContact = {
        init,
        refresh,

        getCompanyName,
        getArabicCompanyName,
        getCountry,

        getPhone,
        getWhatsApp,
        getEmail,

        getSocialChannel,
        getSocialUrl,

        getCompanyData: function () {
            return companyData;
        },

        getSocialChannels: function () {
            return [...socialChannels];
        }
    };

    /**
     * ---------------------------------------------------------
     * Auto Initialize
     * ---------------------------------------------------------
     */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }

})();
