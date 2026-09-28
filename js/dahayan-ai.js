(function () {
    "use strict";

    const INVENTORY_API = "/api/v1/inventory";
    const WHATSAPP_NUMBER = "966XXXXXXXXX";

    const root = document.querySelector("[data-dahayan-ai]");

    if (!root) {
        return;
    }

    const trigger = root.querySelector("[data-dahayan-ai-trigger]");
    const panel = root.querySelector("[data-dahayan-ai-panel]");
    const closeButton = root.querySelector("[data-dahayan-ai-close]");
    const messages = root.querySelector("[data-dahayan-ai-messages]");
    const form = root.querySelector("[data-dahayan-ai-form]");
    const input = root.querySelector("[data-dahayan-ai-input]");
    const typing = root.querySelector("[data-dahayan-ai-typing]");

    function openPanel() {
        if (!panel) {
            return;
        }

        panel.classList.add("is-open");
        panel.setAttribute("aria-hidden", "false");

        if (trigger) {
            trigger.setAttribute("aria-expanded", "true");
        }

        if (input) {
            setTimeout(function () {
                input.focus();
            }, 100);
        }
    }

    function closePanel() {
        if (!panel) {
            return;
        }

        panel.classList.remove("is-open");
        panel.setAttribute("aria-hidden", "true");

        if (trigger) {
            trigger.setAttribute("aria-expanded", "false");
        }
    }

    function scrollMessages() {
        if (!messages) {
            return;
        }

        messages.scrollTop = messages.scrollHeight;
    }

    function addMessage(text, type) {
        if (!messages) {
            return;
        }

        const wrapper = document.createElement("div");

        wrapper.className =
            "dahayan-ai-message " +
            (type === "user"
                ? "dahayan-ai-message-user"
                : "dahayan-ai-message-bot");

        if (type !== "user") {
            const avatar = document.createElement("div");
            avatar.className = "dahayan-ai-avatar";

            const image = document.createElement("img");
            image.src =
                "/assets/images/file_00000000fff481f488bf6682be5f33c4.png";
            image.alt = "MAHANOOR";

            avatar.appendChild(image);
            wrapper.appendChild(avatar);
        }

        const bubble = document.createElement("div");
        bubble.className = "dahayan-ai-bubble";
        bubble.textContent = text;

        wrapper.appendChild(bubble);
        messages.appendChild(wrapper);

        scrollMessages();
    }

    function showTyping() {
        if (typing) {
            typing.hidden = false;
            scrollMessages();
        }
    }

    function hideTyping() {
        if (typing) {
            typing.hidden = true;
        }
    }

    async function checkAvailability(oemNumber) {
        try {
            const response = await fetch(
                INVENTORY_API +
                    "/oem/" +
                    encodeURIComponent(oemNumber)
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                return {
                    success: false
                };
            }

            return data;
        } catch (error) {
            console.error(
                "DAHAYAN AI inventory error:",
                error
            );

            return {
                success: false
            };
        }
    }

    async function handleOEM(oemNumber) {
        showTyping();

        const result = await checkAvailability(oemNumber);

        hideTyping();

        if (!result.success) {
            addMessage(
                "I could not verify this OEM number right now. Please contact Al-Dahayan for assistance.",
                "bot"
            );
            return;
        }

        const item =
            result.item ||
            (Array.isArray(result.items)
                ? result.items[0]
                : null);

        if (!item) {
            addMessage(
                "I could not find verified inventory for OEM " +
                    oemNumber +
                    ".",
                "bot"
            );
            return;
        }

        const status = item.status || "unknown";

        if (status === "in_stock") {
            addMessage(
                "Verified availability: OEM " +
                    oemNumber +
                    " is currently in stock.",
                "bot"
            );
        } else if (status === "low_stock") {
            addMessage(
                "Verified availability: OEM " +
                    oemNumber +
                    " has limited stock available.",
                "bot"
            );
        } else if (status === "out_of_stock") {
            addMessage(
                "Verified inventory shows OEM " +
                    oemNumber +
                    " is currently out of stock.",
                "bot"
            );
        } else {
            addMessage(
                "The current verified inventory status for OEM " +
                    oemNumber +
                    " is unavailable.",
                "bot"
            );
        }
    }

    function respondToAction(action) {
        if (action === "find-part") {
            addMessage(
                "Sure. Tell me the part you are looking for, and I will help identify it.",
                "bot"
            );
            return;
        }

        if (action === "vehicle") {
            addMessage(
                "Please provide the Toyota or Lexus model and year you want to search.",
                "bot"
            );
            return;
        }

        if (action === "oem") {
            addMessage(
                "Please enter the OEM part number. I can check it against verified inventory.",
                "bot"
            );
            return;
        }

        if (action === "availability") {
            addMessage(
                "Send me an OEM part number and I will check its verified availability.",
                "bot"
            );
            return;
        }

        if (action === "whatsapp") {
            if (
                !WHATSAPP_NUMBER ||
                WHATSAPP_NUMBER.includes("X")
            ) {
                addMessage(
                    "WhatsApp connection is being prepared. Please use the Contact page for now.",
                    "bot"
                );
                return;
            }

            window.open(
                "https://wa.me/" + WHATSAPP_NUMBER,
                "_blank",
                "noopener"
            );
        }
    }

    function handleUserMessage(text) {
        const value = text.trim();

        if (!value) {
            return;
        }

        addMessage(value, "user");

        const oemMatch = value.match(
            /\b\d{5}[-\s]?[A-Z0-9]{4,}\b/i
        );

        if (oemMatch) {
            const oem = oemMatch[0].replace(/\s+/g, "");
            handleOEM(oem);
            return;
        }

        showTyping();

        setTimeout(function () {
            hideTyping();

            addMessage(
                "I can help with Toyota and Lexus parts, OEM numbers, vehicle searches, verified availability, and connecting you with Al-Dahayan.",
                "bot"
            );
        }, 500);
    }

    if (trigger) {
        trigger.addEventListener("click", function () {
            if (
                panel &&
                panel.classList.contains("is-open")
            ) {
                closePanel();
            } else {
                openPanel();
            }
        });
    }

    if (closeButton) {
        closeButton.addEventListener("click", closePanel);
    }

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!input) {
                return;
            }

            const value = input.value;
            input.value = "";

            handleUserMessage(value);
        });
    }

    root
        .querySelectorAll("[data-ai-action]")
        .forEach(function (button) {
            button.addEventListener("click", function () {
                respondToAction(
                    button.getAttribute("data-ai-action")
                );
            });
        });

    document.addEventListener("keydown", function (event) {
        if (
            event.key === "Escape" &&
            panel &&
            panel.classList.contains("is-open")
        ) {
            closePanel();
        }
    });

    window.DahayanAI = {
        open: openPanel,
        close: closePanel,
        checkAvailability: checkAvailability
    };

    console.log("DAHAYAN AI / MAHANOOR initialized");
})();