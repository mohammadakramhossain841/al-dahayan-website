(function () {
    "use strict";

    const CONFIG = window.AlDahayanConfig || null;
    const UTILS = window.AlDahayanUtils || null;

    let companyData = {};
    let effectiveConfig = {};
    let socialChannels = [];
    let initialized = false;

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

    function getDataPath(fileName) {
        if (
            CONFIG &&
            typeof CONFIG.getDataPath === "function"
        ) {
            return CONFIG.getDataPath(fileName);
        }

        if (
            window.AlDahayanConfig &&
            typeof window.AlDahayanConfig.getDataPath === "function"
        ) {
            return window.AlDahayanConfig.getDataPath(fileName);
        }

        if (
            typeof window.getDataPath === "function"
        ) {
            return window.getDataPath(fileName);
        }

        return `../data/${fileName}`;
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
     * Safe URL Helpers
     * ---------------------------------------------------------
     */

    function isAllowedExternalUrl(value) {
        const url = safeText(value).trim();

        if (!url) return false;

        try {
            const parsed = new URL(url, window.location.href);

            return [
                "http:",
                "https:",
                "mailto:",
                "tel:"
            ].includes(parsed.protocol);
        } catch (error) {
            return false;
        }
    }

    function normalizeExternalUrl(value) {
        const url = safeText(value).trim();

        if (!url) return "";

        if (
            url.startsWith("http://") ||
            url.startsWith("https://") ||
            url.startsWith("mailto:") ||
            url.startsWith("tel:")
        ) {
            return isAllowedExternalUrl(url) ? url : "";
        }

        if (
            url.startsWith("www.")
        ) {
            const fullUrl = `https://${url}`;
            return isAllowedExternalUrl(fullUrl)
                ? fullUrl
                : "";
        }

        return "";
    }

    /**
     * ---------------------------------------------------------
     * Company Data
     * ---------------------------------------------------------
     */

    async function loadCompanyData() {
        const dataPath = getDataPath("company.json");

        try {
            const response = await fetch(dataPath, {
                cache: "no-cache"
            });

            if (!response.ok) {
                throw new Error(
                    `Company data request failed: ${response.status}`
                );
            }

            const data = await response.json();

            companyData =
                data && typeof data === "object"
                    ? data
                    : {};

            return companyData;
        } catch (error) {
            console.warn(
                "Unable to load company.json:",
                error
            );

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
        if (
            CONFIG &&
            typeof CONFIG.getEffectiveAppConfig === "function"
        ) {
            effectiveConfig =
                CONFIG.getEffectiveAppConfig() || {};
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
            const channels =
                CONFIG.getAdminSocialChannels();

            socialChannels =
                Array.isArray(channels)
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

    function getNestedValue(
        object,
        path,
        fallback = ""
    ) {
        if (!object || !path) {
            return fallback;
        }

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
            getNestedValue(
                companyData,
                "companyName"
            ) ||
            "Al-Dahayan Trading Company"
        );
    }

    function getArabicCompanyName() {
        return (
            effectiveConfig?.company?.arabicName ||
            getNestedValue(
                companyData,
                "arabicName"
            ) ||
            getNestedValue(
                companyData,
                "companyArabicName"
            ) ||
            "شركة الضحيان التجارية"
        );
    }

    function getCountry() {
        return (
            effectiveConfig?.company?.country ||
            getNestedValue(
                companyData,
                "country"
            ) ||
            "Saudi Arabia"
        );
    }

    function getPhone() {
        return (
            effectiveConfig?.contact?.phone ||
            getNestedValue(
                companyData,
                "phone"
            ) ||
            getNestedValue(
                companyData,
                "contact.phone"
            ) ||
            ""
        );
    }

    function getWhatsApp() {
        return (
            effectiveConfig?.contact?.whatsapp ||
            getNestedValue(
                companyData,
                "whatsapp"
            ) ||
            getNestedValue(
                companyData,
                "contact.whatsapp"
            ) ||
            ""
        );
    }

    function getEmail() {
        return (
            effectiveConfig?.contact?.email ||
            getNestedValue(
                companyData,
                "email"
            ) ||
            getNestedValue(
                companyData,
                "contact.email"
            ) ||
            ""
        );
    }

    /**
     * ---------------------------------------------------------
     * Google Maps
     * ---------------------------------------------------------
     */

    function getMapsUrl() {
        const adminMaps =
            getSocialUrl("Google Maps");

        const companyMaps =
            getNestedValue(
                companyData,
                "googleMaps"
            ) ||
            getNestedValue(
                companyData,
                "maps"
            ) ||
            getNestedValue(
                companyData,
                "contact.googleMaps"
            ) ||
            "";

        return (
            normalizeExternalUrl(adminMaps) ||
            normalizeExternalUrl(companyMaps)
        );
    }

    /**
     * ---------------------------------------------------------
     * Social Channels
     * ---------------------------------------------------------
     */

    function getSocialChannel(platform) {
        const target =
            safeText(platform)
                .trim()
                .toLowerCase();

        return (
            socialChannels.find((channel) => {
                if (!channel) return false;

                const channelPlatform =
                    safeText(channel.platform)
                        .trim()
                        .toLowerCase();

                return (
                    channelPlatform === target &&
                    channel.active !== false
                );
            }) || null
        );
    }

    function getSocialUrl(platform) {
        const channel =
            getSocialChannel(platform);

        if (!channel) return "";

        const rawUrl =
            channel.url ||
            channel.link ||
            channel.value ||
            "";

        return normalizeExternalUrl(rawUrl);
    }

    /**
     * ---------------------------------------------------------
     * Apply Text Content
     * ---------------------------------------------------------
     */

    function applyTextContent() {
        $all(
            "[data-company-name]"
        ).forEach((element) => {
            element.textContent =
                getCompanyName();
        });

        $all(
            "[data-company-arabic-name]"
        ).forEach((element) => {
            element.textContent =
                getArabicCompanyName();
        });

        $all(
            "[data-company-country]"
        ).forEach((element) => {
            element.textContent =
                getCountry();
        });

        $all(
            "[data-company-phone]"
        ).forEach((element) => {
            element.textContent =
                getPhone();
        });

        $all(
            "[data-company-whatsapp]"
        ).forEach((element) => {
            element.textContent =
                getWhatsApp();
        });

        $all(
            "[data-company-email]"
        ).forEach((element) => {
            element.textContent =
                getEmail();
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
            [
                '[data-contact="phone"]',
                "[data-company-phone-link]",
                'a[href^="tel:"]'
            ].join(", ")
        ).forEach((element) => {
            if (!phone) {
                return;
            }

            const normalized =
                normalizePhone(phone);

            if (!normalized) {
                return;
            }

            element.setAttribute(
                "href",
                `tel:${normalized}`
            );

            if (
                element.hasAttribute(
                    "data-company-phone-link"
                ) ||
                element.getAttribute(
                    "data-contact"
                ) === "phone"
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
        const email =
            getEmail().trim();

        if (!email) {
            return;
        }

        $all(
            [
                '[data-contact="email"]',
                "[data-company-email-link]",
                'a[href^="mailto:"]'
            ].join(", ")
        ).forEach((element) => {
            element.setAttribute(
                "href",
                `mailto:${email}`
            );

            if (
                element.hasAttribute(
                    "data-company-email-link"
                ) ||
                element.getAttribute(
                    "data-contact"
                ) === "email"
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
        const whatsapp =
            getWhatsApp();

        if (!whatsapp) {
            return;
        }

        const number =
            normalizeWhatsApp(whatsapp);

        if (!number) {
            return;
        }

        const whatsappUrl =
            `https://wa.me/${number}`;

        $all(
            [
                '[data-contact="whatsapp"]',
                "[data-company-whatsapp-link]",
                'a[href*="wa.me"]'
            ].join(", ")
        ).forEach((element) => {
            element.setAttribute(
                "href",
                whatsappUrl
            );

            element.setAttribute(
                "target",
                "_blank"
            );

            element.setAttribute(
                "rel",
                "noopener noreferrer"
            );

            if (
                element.hasAttribute(
                    "data-company-whatsapp-link"
                ) ||
                element.getAttribute(
                    "data-contact"
                ) === "whatsapp"
            ) {
                element.style.display = "";
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
            getMapsUrl();

        $all(
            [
                '[data-contact="maps"]',
                "[data-company-maps]",
                'a[href*="google.com/maps"]'
            ].join(", ")
        ).forEach((element) => {
            if (!mapsUrl) {
                element.style.display = "none";
                return;
            }

            element.setAttribute(
                "href",
                mapsUrl
            );

            element.setAttribute(
                "target",
                "_blank"
            );

            element.setAttribute(
                "rel",
                "noopener noreferrer"
            );

            element.style.display = "";
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

        $all("[data-social]")
            .forEach((element) => {
                const key =
                    safeText(
                        element.getAttribute(
                            "data-social"
                        )
                    )
                        .trim()
                        .toLowerCase();

                const platform =
                    socialMap[key];

                if (!platform) {
                    return;
                }

                let url =
                    getSocialUrl(platform);

                /*
                 * WhatsApp can also use the
                 * main Admin contact number.
                 */
                if (
                    platform === "WhatsApp" &&
                    !url
                ) {
                    const whatsapp =
                        normalizeWhatsApp(
                            getWhatsApp()
                        );

                    if (whatsapp) {
                        url =
                            `https://wa.me/${whatsapp}`;
                    }
                }

                if (!url) {
                    element.style.display =
                        "none";

                    element.removeAttribute(
                        "href"
                    );

                    return;
                }

                element.setAttribute(
                    "href",
                    url
                );

                if (
                    url.startsWith(
                        "http://"
                    ) ||
                    url.startsWith(
                        "https://"
                    )
                ) {
                    element.setAttribute(
                        "target",
                        "_blank"
                    );

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
        $all(
            "[data-contact-value]"
        ).forEach((element) => {
            const type =
                safeText(
                    element.getAttribute(
                        "data-contact-value"
                    )
                )
                    .trim()
                    .toLowerCase();

            switch (type) {
                case "company":
                case "company-name":
                    element.textContent =
                        getCompanyName();
                    break;

                case "arabic-company":
                case "arabic-company-name":
                    element.textContent =
                        getArabicCompanyName();
                    break;

                case "country":
                    element.textContent =
                        getCountry();
                    break;

                case "phone":
                    element.textContent =
                        getPhone();
                    break;

                case "whatsapp":
                    element.textContent =
                        getWhatsApp();
                    break;

                case "email":
                    element.textContent =
                        getEmail();
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
        const phone =
            Boolean(getPhone());

        const whatsapp =
            Boolean(getWhatsApp());

        const email =
            Boolean(getEmail());

        const maps =
            Boolean(getMapsUrl());

        $all(
            "[data-show-if-contact]"
        ).forEach((element) => {
            const type =
                safeText(
                    element.getAttribute(
                        "data-show-if-contact"
                    )
                )
                    .trim()
                    .toLowerCase();

            let available = false;

            switch (type) {
                case "phone":
                    available = phone;
                    break;

                case "whatsapp":
                    available = whatsapp;
                    break;

                case "email":
                    available = email;
                    break;

                case "maps":
                    available = maps;
                    break;

                default:
                    available = false;
                    break;
            }

            element.style.display =
                available ? "" : "none";
        });
    }

    /**
     * ---------------------------------------------------------
     * Dispatch Public Contact Update Event
     * ---------------------------------------------------------
     */

    function dispatchContactUpdate() {
        document.dispatchEvent(
            new CustomEvent(
                "alDahayanContactUpdated",
                {
                    detail: {
                        company: {
                            name:
                                getCompanyName(),

                            arabicName:
                                getArabicCompanyName(),

                            country:
                                getCountry()
                        },

                        contact: {
                            phone:
                                getPhone(),

                            whatsapp:
                                getWhatsApp(),

                            email:
                                getEmail()
                        },

                        maps:
                            getMapsUrl(),

                        social:
                            [...socialChannels]
                    }
                }
            )
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
     * Refresh From Admin Settings
     * ---------------------------------------------------------
     */

    function refreshFromAdminSettings() {
        loadEffectiveConfig();
        loadSocialChannels();
        applyContactSettings();
    }

    /**
     * ---------------------------------------------------------
     * Storage Change Listener
     *
     * Allows contact information to refresh
     * when Admin settings change in another tab.
     * ---------------------------------------------------------
     */

    function setupStorageListener() {
        window.addEventListener(
            "storage",
            function (event) {
                const relevantKeys = [
                    "alDahayanWebsiteSettings",
                    "alDahayanSocialChannels",
                    "alDahayanAISettings"
                ];

                if (
                    event.key === null ||
                    relevantKeys.includes(event.key)
                ) {
                    refreshFromAdminSettings();
                }
            }
        );
    }

    /**
     * ---------------------------------------------------------
     * Custom Admin Update Events
     * ---------------------------------------------------------
     */

    function setupAdminEventListeners() {
        document.addEventListener(
            "alDahayanSettingsUpdated",
            refreshFromAdminSettings
        );

        document.addEventListener(
            "alDahayanSocialChannelsUpdated",
            refreshFromAdminSettings
        );

        document.addEventListener(
            "alDahayanConfigUpdated",
            refreshFromAdminSettings
        );
    }

    /**
     * ---------------------------------------------------------
     * Initialize
     * ---------------------------------------------------------
     */

    async function init() {
        if (initialized) {
            refresh();
            return;
        }

        try {
            await loadCompanyData();

            applyContactSettings();

            setupStorageListener();
            setupAdminEventListeners();

            initialized = true;

            document.dispatchEvent(
                new CustomEvent(
                    "alDahayanContactReady"
                )
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
     * Reload Company Data
     * ---------------------------------------------------------
     */

    async function reload() {
        await loadCompanyData();

        applyContactSettings();

        return getCompanyData();
    }

    /**
     * ---------------------------------------------------------
     * Public API
     * ---------------------------------------------------------
     */

    window.AlDahayanContact = {
        init,
        refresh,
        reload,

        getCompanyName,
        getArabicCompanyName,
        getCountry,

        getPhone,
        getWhatsApp,
        getEmail,

        getMapsUrl,

        getSocialChannel,
        getSocialUrl,

        getCompanyData: function () {
            return companyData;
        },

        getSocialChannels: function () {
            return [...socialChannels];
        },

        getEffectiveConfig: function () {
            return effectiveConfig;
        },

        isInitialized: function () {
            return initialized;
        }
    };

    /**
     * ---------------------------------------------------------
     * Auto Initialize
     * ---------------------------------------------------------
     */

    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }

})();
