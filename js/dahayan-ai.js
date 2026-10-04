/* =========================================
   DAHAYAN AI ASSISTANT
   Assistant Identity: MAHANOOR

   Responsibilities:
   - Floating AI button
   - Chat open / close
   - MAHANOOR avatar
   - Premium AI presentation
   - Quick actions
   - OEM inventory lookup
   - Verified stock handling
   - WhatsApp connection
   - No customer location collection
   ========================================= */

(function () {
    "use strict";

    const AI_ROOT_SELECTOR = "[data-dahayan-ai]";

    const INVENTORY_API = "/api/v1/inventory";

    function getApiBaseUrl() {
        if (
            window.DAHAYAN_CONFIG &&
            window.DAHAYAN_CONFIG.API_BASE_URL
        ) {
            return window.DAHAYAN_CONFIG.API_BASE_URL.replace(/\/$/, "");
        }

        if (
            window.CONFIG &&
            window.CONFIG.API_BASE_URL
        ) {
            return window.CONFIG.API_BASE_URL.replace(/\/$/, "");
        }

        return window.location.origin;
    }

    const WHATSAPP_NUMBER = "966582327337";

    /*
     * Keep false until real premium authentication/subscription
     * is implemented on the backend.
     *
     * This allows us to test the conversation now.
     */
    const PREMIUM_CHAT_LOCKED = false;

    const AI_LOGO_PATH =
        "assets/images/file_00000000fff481f488bf6682be5f33c4.png";

    const MAHANOOR_AVATAR_PATH =
        "assets/images/mahanoor-avatar-1.png";

    let initialized = false;

    /* =========================================
       Utility
       ========================================= */

    function getRoot() {
        return document.querySelector(AI_ROOT_SELECTOR);
    }

    function getElement(selector) {
        const root = getRoot();

        return root
            ? root.querySelector(selector)
            : null;
    }

    function getProjectRoot() {
        if (typeof window.getProjectRoot === "function") {
            return window.getProjectRoot();
        }

        const pathname = window.location.pathname;

        if (
            pathname.includes("/pages/") ||
            pathname.includes("/admin/")
        ) {
            return "../";
        }

        return "./";
    }

    function getAssetPath(relativePath) {
        const root = getProjectRoot();

        return `${root}${relativePath}`.replace(
            /([^:]\/)\/+/g,
            "$1"
        );
    }

    /* =========================================
       Configure AI Images
       ========================================= */

    function configureIcons() {
        const root = getRoot();

        if (!root) {
            return;
        }

        const logoPath = getAssetPath(
            AI_LOGO_PATH
        );

        const avatarPath = getAssetPath(
            MAHANOOR_AVATAR_PATH
        );

        const logoImages =
            root.querySelectorAll(
                "[data-dahayan-ai-logo]"
            );

        const avatarImages =
            root.querySelectorAll(
                "[data-dahayan-ai-avatar]"
            );

        logoImages.forEach((img) => {
            img.src = logoPath;
        });

        avatarImages.forEach((img) => {
            img.src = avatarPath;
        });
    }

    /* =========================================
       Open / Close
       ========================================= */

    function openAssistant() {
        const panel =
            getElement("[data-dahayan-ai-panel]");

        const trigger =
            getElement("[data-dahayan-ai-trigger]");

        const input =
            getElement("[data-dahayan-ai-input]");

        if (!panel || !trigger) {
            return;
        }

        panel.hidden = false;

        trigger.setAttribute(
            "aria-expanded",
            "true"
        );

        document.body.classList.add(
            "dahayan-ai-open"
        );

        window.setTimeout(() => {
            if (input && !input.disabled) {
                input.focus();
            }
        }, 100);

        scrollMessagesToBottom();
    }

    function closeAssistant() {
        const panel =
            getElement("[data-dahayan-ai-panel]");

        const trigger =
            getElement("[data-dahayan-ai-trigger]");

        if (!panel || !trigger) {
            return;
        }

        panel.hidden = true;

        trigger.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.classList.remove(
            "dahayan-ai-open"
        );

        trigger.focus();
    }

    function toggleAssistant() {
        const panel =
            getElement("[data-dahayan-ai-panel]");

        if (!panel) {
            return;
        }

        if (panel.hidden) {
            openAssistant();
        } else {
            closeAssistant();
        }
    }

    /* =========================================
       Message Helpers
       ========================================= */

    function getMessagesContainer() {
        return getElement(
            "[data-dahayan-ai-messages]"
        );
    }

    function scrollMessagesToBottom() {
        const messages =
            getMessagesContainer();

        if (!messages) {
            return;
        }

        window.requestAnimationFrame(() => {
            messages.scrollTop =
                messages.scrollHeight;
        });
    }

    function appendMessage(
        message,
        type
    ) {
        const messages =
            getMessagesContainer();

        if (!messages) {
            return;
        }

        const wrapper =
            document.createElement("div");

        wrapper.className =
            type === "user"
                ? "dahayan-ai-message dahayan-ai-message-user"
                : "dahayan-ai-message dahayan-ai-message-bot";

        if (type === "user") {

            const content =
                document.createElement("div");

            content.className =
                "dahayan-ai-message-content";

            const paragraph =
                document.createElement("p");

            paragraph.textContent =
                message;

            content.appendChild(
                paragraph
            );

            wrapper.appendChild(
                content
            );

        } else {

            const avatar =
                document.createElement("div");

            avatar.className =
                "dahayan-ai-message-avatar";

            const image =
                document.createElement("img");

            image.src =
                getAssetPath(
                    MAHANOOR_AVATAR_PATH
                );

            image.alt =
                "MAHANOOR";

            image.setAttribute(
                "aria-hidden",
                "true"
            );

            avatar.appendChild(
                image
            );

            const content =
                document.createElement("div");

            content.className =
                "dahayan-ai-message-content";

            const name =
                document.createElement("span");

            name.className =
                "dahayan-ai-message-name";

            name.textContent =
                "MAHANOOR";

            const paragraph =
                document.createElement("p");

            paragraph.textContent =
                message;

            content.appendChild(
                name
            );

            content.appendChild(
                paragraph
            );

            wrapper.appendChild(
                avatar
            );

            wrapper.appendChild(
                content
            );
        }

        messages.appendChild(
            wrapper
        );

        scrollMessagesToBottom();
    }

    /* =========================================
       Typing Indicator
       ========================================= */

    function setTyping(visible) {
        const typing =
            getElement(
                "[data-dahayan-ai-typing]"
            );

        if (!typing) {
            return;
        }

        typing.hidden = !visible;

        typing.setAttribute(
            "aria-hidden",
            visible
                ? "false"
                : "true"
        );

        if (visible) {
            scrollMessagesToBottom();
        }
    }

    /* =========================================
       AI Response
       ========================================= */

    function respond(
        message,
        delay
    ) {
        setTyping(true);

        window.setTimeout(() => {

            setTyping(false);

            appendMessage(
                message,
                "bot"
            );

        }, delay || 450);
    }

    /* =========================================
       Quick Actions
       ========================================= */

    function handleQuickAction(action) {

        switch (action) {

            case "find-part":

                appendMessage(
                    "Find a Part",
                    "user"
                );

                respond(
                    "Sure. Please tell me the Toyota or Lexus part you are looking for. You can provide the part name, description, or OEM number.",
                    500
                );

                break;


            case "vehicle-search":

                appendMessage(
                    "Search by Vehicle",
                    "user"
                );

                respond(
                    "Sure. Please provide the Toyota or Lexus vehicle model and year. I can help narrow down the required part.",
                    500
                );

                break;


            case "oem-search":

                appendMessage(
                    "Search by OEM",
                    "user"
                );

                respond(
                    "Please enter the OEM part number. I will check the verified inventory data.",
                    500
                );

                break;


            case "availability":

                appendMessage(
                    "Check Availability",
                    "user"
                );

                respond(
                    "Please provide the OEM part number. I will check the verified inventory records.",
                    500
                );

                break;


            case "contact":

                appendMessage(
                    "Contact Al-Dahayan",
                    "user"
                );

                respond(
                    "Of course. You can connect with Al-Dahayan directly through WhatsApp using the button below.",
                    450
                );

                break;


            case "whatsapp":

                openWhatsApp();

                break;


            default:
                break;
        }
    }

    /* =========================================
       OEM Detection
       ========================================= */

    function looksLikeOEM(value) {

        const normalized =
            String(value || "")
                .trim()
                .toUpperCase();

        if (!normalized) {
            return false;
        }

        return /^[A-Z0-9]{4,8}[-][A-Z0-9]{3,8}$/
            .test(normalized);
    }

    /* =========================================
       Inventory API
       ========================================= */

    async function askMahanoorAI(message) {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: message
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`MAHANOOR AI request failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success || typeof data.response !== "string") {
    throw new Error("Invalid MAHANOOR AI response");
  }

  return data.response.trim();
}

async function lookupInventoryByOEM(
        oemNumber
    ) {

        const normalizedOEM =
            String(oemNumber || "")
                .trim()
                .toUpperCase();

        if (!normalizedOEM) {
            return null;
        }

        try {

            const response =
                await fetch(
                    `${INVENTORY_API}/oem/${encodeURIComponent(normalizedOEM)}`,
                    {
                        method: "GET",

                        headers: {
                            Accept:
                                "application/json"
                        }
                    }
                );

            if (!response.ok) {
                throw new Error(
                    `Inventory request failed: ${response.status}`
                );
            }

            const data =
                await response.json();

            if (
                !data ||
                data.success !== true
            ) {
                throw new Error(
                    "Invalid inventory response"
                );
            }

            return data;

        } catch (error) {

            console.error(
                "DAHAYAN AI inventory lookup error:",
                error
            );

            return null;
        }
    }

    /* =========================================
       Inventory Response
       ========================================= */

    function formatInventoryResponse(
        data,
        oemNumber
    ) {

        if (!data) {

            return (
                `I could not verify the inventory status for OEM ${oemNumber}. ` +
                "Please contact Al-Dahayan directly for confirmation."
            );
        }

        if (
            !Array.isArray(
                data.inventory
            ) ||
            data.inventory.length === 0
        ) {

            return (
                `I could not find a verified inventory record for OEM ${oemNumber}. ` +
                "Please contact Al-Dahayan for further assistance."
            );
        }

        const availableItems =
            data.inventory.filter(
                (item) =>
                    item.status === "in_stock" ||
                    item.status === "low_stock"
            );

        if (
            availableItems.length === 0
        ) {

            const hasOutOfStock =
                data.inventory.some(
                    (item) =>
                        item.status ===
                        "out_of_stock"
                );

            if (hasOutOfStock) {

                return (
                    `The verified inventory record for OEM ${oemNumber} ` +
                    "currently shows no available stock."
                );
            }

            return (
                `The inventory record for OEM ${oemNumber} exists, ` +
                "but its availability has not been verified yet."
            );
        }

        const firstAvailable =
            availableItems[0];

        let response =
            `Verified inventory for OEM ${oemNumber}: `;

        if (
            firstAvailable.status ===
            "in_stock"
        ) {

            response +=
                "In stock";

        } else {

            response +=
                "Low stock";
        }

        if (
            Number.isFinite(
                Number(
                    firstAvailable.availableQuantity
                )
            )
        ) {

            response +=
                ` (${Number(firstAvailable.availableQuantity)} available)`;
        }

        response += ".";

        /*
         * Location is intentionally not exposed.
         */

        return response;
    }

    /* =========================================
       User Message Processing
       ========================================= */

    async function processUserMessage(
        message
    ) {

        const normalized =
            String(message || "")
                .trim();

        if (!normalized) {
            return;
        }

        appendMessage(
            normalized,
            "user"
        );

        const upperMessage =
            normalized.toUpperCase();

        /*
         * OEM lookup
         */

        const possibleOEM =
            upperMessage.match(
                /\b[A-Z0-9]{4,8}-[A-Z0-9]{3,8}\b/
            );

        if (
            possibleOEM &&
            looksLikeOEM(
                possibleOEM[0]
            )
        ) {

            setTyping(true);

            const data =
                await lookupInventoryByOEM(
                    possibleOEM[0]
                );

            setTyping(false);

            appendMessage(
                formatInventoryResponse(
                    data,
                    possibleOEM[0]
                ),
                "bot"
            );

            return;
        }

        /* Greeting */

        if (
            /^(hi|hello|hey|salam|assalamualaikum)\b/i
                .test(normalized)
        ) {

            respond(
                "Hello! I'm MAHANOOR, the Al-Dahayan AI Assistant. How can I help you with Toyota or Lexus spare parts today?",
                450
            );

            return;
        }

        /* Availability */

        if (
            normalized
                .toLowerCase()
                .includes("availability") ||
            normalized
                .toLowerCase()
                .includes("stock")
        ) {

            respond(
                "Sure. Please provide the OEM part number so I can check the verified inventory records.",
                450
            );

            return;
        }

        /* WhatsApp / Contact */

        if (
            normalized
                .toLowerCase()
                .includes("whatsapp") ||
            normalized
                .toLowerCase()
                .includes("contact")
        ) {

            respond(
                "You can connect with Al-Dahayan directly through WhatsApp using the contact button below.",
                450
            );

            return;
        }

        /*
         *   /* Generic conversation response - Real MAHANOOR AI */
  setTyping(true);

  try {
    const aiResponse = await askMahanoorAI(normalized);
    appendMessage(aiResponse, "bot");
  } catch (error) {
    console.error("MAHANOOR AI error:", error);
    appendMessage(
      "I'm having trouble connecting to MAHANOOR right now. Please try again or use WhatsApp.",
      "bot"
    );
  } finally {
    setTyping(false);
  }

  if (
            !WHATSAPP_NUMBER ||
            WHATSAPP_NUMBER.includes(
                "XXXXXXXX"
            )
        ) {

            appendMessage(
                "WhatsApp connection is being prepared. Please use the Contact page to reach Al-Dahayan for now.",
                "bot"
            );

            return;
        }

        const whatsappMessage = "Hello Al-Dahayan, I would like assistance with Toyota/Lexus spare parts.";

        const url =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );
    }

    /* =========================================
       Form Handling
       ========================================= */

    function handleSubmit(event) {

        event.preventDefault();

        const input =
            getElement(
                "[data-dahayan-ai-input]"
            );

        if (!input) {
            return;
        }
  /* Premium chat lock disabled: MAHANOOR conversation is enabled. */

        const message =
            input.value.trim();

        if (!message) {
            return;
        }

        input.value = "";

        processUserMessage(
            message
        );
    }

    /* =========================================
       Keyboard Handling
       ========================================= */

    function handleKeydown(event) {

        if (
            event.key !== "Escape"
        ) {
            return;
        }

        const panel =
            getElement(
                "[data-dahayan-ai-panel]"
            );

        if (
            panel &&
            !panel.hidden
        ) {

            closeAssistant();
        }
    }

    /* =========================================
       Event Binding
       ========================================= */

    function bindEvents() {

        const trigger =
            getElement(
                "[data-dahayan-ai-trigger]"
            );

        const close =
            getElement(
                "[data-dahayan-ai-close]"
            );

        const form =
            getElement(
                "[data-dahayan-ai-form]"
            );

        const root =
            getRoot();

        if (trigger) {

            trigger.addEventListener(
                "click",
                toggleAssistant
            );
        }

        if (close) {

            close.addEventListener(
                "click",
                closeAssistant
            );
        }

        if (form) {

            form.addEventListener(
                "submit",
                handleSubmit
            );
        }

        if (root) {

            root.addEventListener(
                "click",
                (event) => {

                    const button =
                        event.target.closest(
                            "[data-ai-action]"
                        );

                    if (!button) {
                        return;
                    }

                    const action =
                        button.getAttribute(
                            "data-ai-action"
                        );

                    handleQuickAction(
                        action
                    );
                }
            );
        }

        document.addEventListener(
            "keydown",
            handleKeydown
        );
    }

    /* =========================================
       Premium State
       ========================================= */

    function configurePremiumState() {

        const input =
            getElement(
                "[data-dahayan-ai-input]"
            );

        const send =
            getElement(
                "[data-dahayan-ai-send]"
            );

        if (
            PREMIUM_CHAT_LOCKED
        ) {

            if (input) {
                input.disabled = true;
            }

            if (send) {
                send.disabled = true;
            }
        }
    }

    /* =========================================
       Initialization
       ========================================= */

    function init() {
console.log("MAHANOOR DEBUG: init() started");
        if (initialized) {
            return;
        }

        const root =
            getRoot();

        if (!root) {
            return;
        }

        initialized = true;

        configureIcons();

        configurePremiumState();

        bindEvents();

        window.dispatchEvent(
            new CustomEvent(
                "alDahayanAIReady",
                {
                    detail: {
                        assistant:
                            "MAHANOOR",

                        brand:
                            "DAHAYAN AI",

                        premium:
                            true
                    }
                }
            )
        );

        console.log(
            "DAHAYAN AI initialized — MAHANOOR"
        );
    }

    /* =========================================
       Public API
       ========================================= */

    window.DahayanAI = {
        init,
        open: openAssistant,
        close: closeAssistant,
        toggle: toggleAssistant,
        lookupInventoryByOEM,
        processUserMessage
    };

    /* =========================================
       Component Loader Integration
       ========================================= */

    function startWhenReady() {

        if (getRoot()) {

            init();

            return;
        }

        window.addEventListener(
            "alDahayanComponentsLoaded",
            init,
            { once: true }
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startWhenReady,
            { once: true }
        );

    } else {

        startWhenReady();
    }

})();
