/**
 * Al-Dahayan Trading Company
 * Unified Image Management
 *
 * File:
 * js/admin/image-management.js
 *
 * Purpose:
 * Central Admin UI controller for website image management.
 *
 * NOTE:
 * This file is the frontend UI foundation.
 * Backend API endpoints will be connected after the existing
 * backend image architecture is audited.
 */

(() => {
    "use strict";

    /* =========================================================
       STATE
    ========================================================= */

    const state = {
        images: [],
        filteredImages: [],
        selectedIds: new Set(),
        currentEditId: null,
        currentPage: 1,
        pageSize: 20
    };

    /* =========================================================
       DOM HELPERS
    ========================================================= */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        Array.from(parent.querySelectorAll(selector));

    const byId = (id) => document.getElementById(id);

    /* =========================================================
       ELEMENTS
    ========================================================= */

    const elements = {
        search: byId("imageSearch"),
        entityFilter: byId("entityFilter"),
        typeFilter: byId("typeFilter"),
        statusFilter: byId("statusFilter"),

        imageTableBody: byId("imageTableBody"),

        selectAll: byId("selectAllImages"),

        uploadButton: byId("uploadImageBtn"),
        bulkDeleteButton: byId("bulkDeleteBtn"),

        modal: byId("imageModal"),
        modalTitle: byId("imageModalTitle"),
        modalClose: byId("imageModalClose"),
        modalCancel: byId("imageModalCancel"),

        imageForm: byId("imageForm"),

        imageFile: byId("imageFile"),
        imagePreview: byId("imagePreview"),

        entityType: byId("entityType"),
        entityId: byId("entityId"),
        imageType: byId("imageType"),

        imageAltEn: byId("imageAltEn"),
        imageAltAr: byId("imageAltAr"),

        imageCaptionEn: byId("imageCaptionEn"),
        imageCaptionAr: byId("imageCaptionAr"),

        imageStatus: byId("imageStatus"),
        isPrimary: byId("isPrimary"),

        saveButton: byId("saveImageBtn")
    };

    /* =========================================================
       INITIALIZATION
    ========================================================= */

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        bindEvents();
        loadImages();
        updateBulkActions();
    }

    /* =========================================================
       EVENTS
    ========================================================= */

    function bindEvents() {
        elements.search?.addEventListener("input", handleFilters);
        elements.entityFilter?.addEventListener("change", handleFilters);
        elements.typeFilter?.addEventListener("change", handleFilters);
        elements.statusFilter?.addEventListener("change", handleFilters);

        elements.selectAll?.addEventListener("change", handleSelectAll);

        elements.uploadButton?.addEventListener("click", () => {
            openUploadModal();
        });

        elements.bulkDeleteButton?.addEventListener(
            "click",
            handleBulkDelete
        );

        elements.modalClose?.addEventListener("click", closeModal);
        elements.modalCancel?.addEventListener("click", closeModal);

        elements.imageForm?.addEventListener(
            "submit",
            handleFormSubmit
        );

        elements.imageFile?.addEventListener(
            "change",
            handleImagePreview
        );

        elements.imageTableBody?.addEventListener(
            "click",
            handleTableAction
        );

        elements.imageTableBody?.addEventListener(
            "change",
            handleRowSelection
        );

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeModal();
            }
        });
    }

    /* =========================================================
       LOAD IMAGES
    ========================================================= */

    async function loadImages() {
        /*
         * Backend API connection will be added after
         * existing backend image architecture is verified.
         *
         * Do NOT invent an API endpoint here.
         */

        state.images = [];
        state.filteredImages = [];

        renderTable();
        updateCounters();
    }

    /* =========================================================
       FILTERS
    ========================================================= */

    function handleFilters() {
        const searchValue =
            (elements.search?.value || "").trim().toLowerCase();

        const entityValue =
            elements.entityFilter?.value || "";

        const typeValue =
            elements.typeFilter?.value || "";

        const statusValue =
            elements.statusFilter?.value || "";

        state.filteredImages = state.images.filter((image) => {
            const searchableText = [
                image.id,
                image.entityId,
                image.entityType,
                image.imageType,
                image.altEn,
                image.altAr,
                image.captionEn,
                image.captionAr
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !searchValue ||
                searchableText.includes(searchValue);

            const matchesEntity =
                !entityValue ||
                image.entityType === entityValue;

            const matchesType =
                !typeValue ||
                image.imageType === typeValue;

            const matchesStatus =
                !statusValue ||
                image.status === statusValue;

            return (
                matchesSearch &&
                matchesEntity &&
                matchesType &&
                matchesStatus
            );
        });

        state.currentPage = 1;

        renderTable();
        updateCounters();
    }

    /* =========================================================
       TABLE
    ========================================================= */

    function renderTable() {
        if (!elements.imageTableBody) {
            return;
        }

        if (!state.filteredImages.length) {
            elements.imageTableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="empty-state">
                        No images found.
                    </td>
                </tr>
            `;

            return;
        }

        elements.imageTableBody.innerHTML =
            state.filteredImages
                .map(renderImageRow)
                .join("");

        updateRowSelectionUI();
    }

    function renderImageRow(image) {
        const checked =
            state.selectedIds.has(image.id)
                ? "checked"
                : "";

        const primaryBadge =
            image.isPrimary
                ? `<span class="badge badge-primary">Primary</span>`
                : "";

        const statusBadge =
            renderStatusBadge(image.status);

        const thumbnail =
            image.url
                ? `
                    <img
                        src="${escapeAttribute(image.url)}"
                        alt="${escapeAttribute(image.altEn || "")}"
                        class="image-management-thumbnail"
                    >
                `
                : `
                    <div class="image-management-placeholder">
                        No Image
                    </div>
                `;

        return `
            <tr data-image-id="${escapeAttribute(image.id)}">

                <td>
                    <input
                        type="checkbox"
                        class="image-row-checkbox"
                        data-id="${escapeAttribute(image.id)}"
                        ${checked}
                    >
                </td>

                <td>
                    ${thumbnail}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(image.id || "-")}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(image.entityType || "-")}
                </td>

                <td>
                    ${escapeHtml(image.entityId || "-")}
                </td>

                <td>
                    ${escapeHtml(image.imageType || "-")}
                    ${primaryBadge}
                </td>

                <td>
                    ${statusBadge}
                </td>

                <td>
                    ${escapeHtml(image.altEn || "-")}
                </td>

                <td>
                    ${escapeHtml(image.order ?? "-")}
                </td>

                <td>
                    <div class="image-row-actions">

                        <button
                            type="button"
                            class="btn btn-sm"
                            data-action="edit"
                            data-id="${escapeAttribute(image.id)}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm"
                            data-action="primary"
                            data-id="${escapeAttribute(image.id)}"
                        >
                            Set Primary
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-danger"
                            data-action="remove"
                            data-id="${escapeAttribute(image.id)}"
                        >
                            Remove
                        </button>

                    </div>
                </td>

            </tr>
        `;
    }

    function renderStatusBadge(status) {
        const normalized = String(status || "active")
            .toLowerCase();

        if (normalized === "active") {
            return `<span class="badge badge-success">Active</span>`;
        }

        if (normalized === "disabled") {
            return `<span class="badge badge-warning">Disabled</span>`;
        }

        if (normalized === "archived") {
            return `<span class="badge badge-secondary">Archived</span>`;
        }

        return `<span class="badge">${escapeHtml(status || "-")}</span>`;
    }

    /* =========================================================
       TABLE ACTIONS
    ========================================================= */

    function handleTableAction(event) {
        const button =
            event.target.closest("[data-action]");

        if (!button) {
            return;
        }

        const action = button.dataset.action;
        const id = button.dataset.id;

        if (!id) {
            return;
        }

        switch (action) {
            case "edit":
                openEditModal(id);
                break;

            case "primary":
                setPrimary(id);
                break;

            case "remove":
                removeImage(id);
                break;

            default:
                break;
        }
    }

    /* =========================================================
       SELECTION
    ========================================================= */

    function handleRowSelection(event) {
        const checkbox =
            event.target.closest(".image-row-checkbox");

        if (!checkbox) {
            return;
        }

        const id = checkbox.dataset.id;

        if (!id) {
            return;
        }

        if (checkbox.checked) {
            state.selectedIds.add(id);
        } else {
            state.selectedIds.delete(id);
        }

        updateBulkActions();
        updateSelectAllState();
    }

    function handleSelectAll(event) {
        const checked = event.target.checked;

        state.filteredImages.forEach((image) => {
            if (checked) {
                state.selectedIds.add(image.id);
            } else {
                state.selectedIds.delete(image.id);
            }
        });

        updateRowSelectionUI();
        updateBulkActions();
    }

    function updateRowSelectionUI() {
        $$(".image-row-checkbox").forEach((checkbox) => {
            checkbox.checked =
                state.selectedIds.has(checkbox.dataset.id);
        });

        updateSelectAllState();
    }

    function updateSelectAllState() {
        if (!elements.selectAll) {
            return;
        }

        const visibleIds =
            state.filteredImages.map((image) => image.id);

        if (!visibleIds.length) {
            elements.selectAll.checked = false;
            elements.selectAll.indeterminate = false;
            return;
        }

        const selectedCount =
            visibleIds.filter((id) =>
                state.selectedIds.has(id)
            ).length;

        elements.selectAll.checked =
            selectedCount === visibleIds.length;

        elements.selectAll.indeterminate =
            selectedCount > 0 &&
            selectedCount < visibleIds.length;
    }

    function updateBulkActions() {
        if (!elements.bulkDeleteButton) {
            return;
        }

        elements.bulkDeleteButton.disabled =
            state.selectedIds.size === 0;
    }

    /* =========================================================
       UPLOAD MODAL
    ========================================================= */

    function openUploadModal() {
        state.currentEditId = null;

        if (elements.modalTitle) {
            elements.modalTitle.textContent =
                "Upload Image";
        }

        resetForm();

        showModal();
    }

    function openEditModal(id) {
        const image =
            state.images.find((item) => item.id === id);

        if (!image) {
            return;
        }

        state.currentEditId = id;

        if (elements.modalTitle) {
            elements.modalTitle.textContent =
                "Edit Image";
        }

        if (elements.entityType) {
            elements.entityType.value =
                image.entityType || "";
        }

        if (elements.entityId) {
            elements.entityId.value =
                image.entityId || "";
        }

        if (elements.imageType) {
            elements.imageType.value =
                image.imageType || "";
        }

        if (elements.imageAltEn) {
            elements.imageAltEn.value =
                image.altEn || "";
        }

        if (elements.imageAltAr) {
            elements.imageAltAr.value =
                image.altAr || "";
        }

        if (elements.imageCaptionEn) {
            elements.imageCaptionEn.value =
                image.captionEn || "";
        }

        if (elements.imageCaptionAr) {
            elements.imageCaptionAr.value =
                image.captionAr || "";
        }

        if (elements.imageStatus) {
            elements.imageStatus.value =
                image.status || "active";
        }

        if (elements.isPrimary) {
            elements.isPrimary.checked =
                Boolean(image.isPrimary);
        }

        if (elements.imagePreview) {
            if (image.url) {
                elements.imagePreview.innerHTML = `
                    <img
                        src="${escapeAttribute(image.url)}"
                        alt="${escapeAttribute(image.altEn || "")}"
                    >
                `;
            } else {
                elements.imagePreview.innerHTML = "";
            }
        }

        showModal();
    }

    function showModal() {
        if (!elements.modal) {
            return;
        }

        elements.modal.classList.add("is-open");
        elements.modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "image-modal-open"
        );
    }

    function closeModal() {
        if (!elements.modal) {
            return;
        }

        elements.modal.classList.remove("is-open");
        elements.modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "image-modal-open"
        );

        state.currentEditId = null;
    }

    function resetForm() {
        elements.imageForm?.reset();

        if (elements.imagePreview) {
            elements.imagePreview.innerHTML = "";
        }

        if (elements.imageStatus) {
            elements.imageStatus.value = "active";
        }
    }

    /* =========================================================
       IMAGE PREVIEW
    ========================================================= */

    function handleImagePreview(event) {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        const validation =
            validateImageFile(file);

        if (!validation.valid) {
            alert(validation.message);

            event.target.value = "";

            if (elements.imagePreview) {
                elements.imagePreview.innerHTML = "";
            }

            return;
        }

        const objectUrl =
            URL.createObjectURL(file);

        if (elements.imagePreview) {
            elements.imagePreview.innerHTML = `
                <img
                    src="${escapeAttribute(objectUrl)}"
                    alt="Image preview"
                >
            `;
        }
    }

    function validateImageFile(file) {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        const maxSize =
            10 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                message:
                    "Only JPG, JPEG, PNG and WEBP images are allowed."
            };
        }

        if (file.size > maxSize) {
            return {
                valid: false,
                message:
                    "Maximum image size is 10 MB."
            };
        }

        return {
            valid: true
        };
    }

    /* =========================================================
       FORM SUBMIT
    ========================================================= */

    async function handleFormSubmit(event) {
        event.preventDefault();

        const file =
            elements.imageFile?.files?.[0];

        if (!state.currentEditId && !file) {
            alert("Please select an image.");
            return;
        }

        if (file) {
            const validation =
                validateImageFile(file);

            if (!validation.valid) {
                alert(validation.message);
                return;
            }
        }

        const formData = {
            entityType:
                elements.entityType?.value || "",

            entityId:
                elements.entityId?.value.trim() || "",

            imageType:
                elements.imageType?.value || "",

            altEn:
                elements.imageAltEn?.value.trim() || "",

            altAr:
                elements.imageAltAr?.value.trim() || "",

            captionEn:
                elements.imageCaptionEn?.value.trim() || "",

            captionAr:
                elements.imageCaptionAr?.value.trim() || "",

            status:
                elements.imageStatus?.value || "active",

            isPrimary:
                Boolean(elements.isPrimary?.checked)
        };

        if (!formData.entityType) {
            alert("Please select an entity type.");
            return;
        }

        if (!formData.entityId) {
            alert("Please enter the entity ID.");
            return;
        }

        if (!formData.imageType) {
            alert("Please select an image type.");
            return;
        }

        /*
         * Backend upload/update will be connected here
         * after the existing backend architecture is audited.
         */

        console.log(
            "Image management form data:",
            formData
        );

        if (file) {
            console.log(
                "Selected image:",
                file.name
            );
        }

        alert(
            state.currentEditId
                ? "Image update is ready for backend integration."
                : "Image upload is ready for backend integration."
        );

        closeModal();
    }

    /* =========================================================
       SET PRIMARY
    ========================================================= */

    function setPrimary(id) {
        const image =
            state.images.find((item) => item.id === id);

        if (!image) {
            return;
        }

        const confirmed =
            window.confirm(
                "Set this image as the primary image?"
            );

        if (!confirmed) {
            return;
        }

        /*
         * Backend operation will be connected later.
         */

        state.images = state.images.map((item) => {
            if (
                item.entityType === image.entityType &&
                item.entityId === image.entityId
            ) {
                return {
                    ...item,
                    isPrimary: item.id === id
                };
            }

            return item;
        });

        handleFilters();

        showMessage(
            "Primary image updated locally. Backend integration pending."
        );
    }

    /* =========================================================
       REMOVE IMAGE
    ========================================================= */

    function removeImage(id) {
        const image =
            state.images.find((item) => item.id === id);

        if (!image) {
            return;
        }

        const confirmed =
            window.confirm(
                "Remove this image reference from the record?"
            );

        if (!confirmed) {
            return;
        }

        /*
         * Important:
         * This is reference removal only.
         * Physical file deletion must NOT happen automatically.
         *
         * Backend removal + audit history will be connected later.
         */

        state.images =
            state.images.filter(
                (item) => item.id !== id
            );

        state.selectedIds.delete(id);

        handleFilters();
        updateBulkActions();

        showMessage(
            "Image reference removed locally. Backend integration pending."
        );
    }

    /* =========================================================
       BULK REMOVE
    ========================================================= */

    function handleBulkDelete() {
        const ids =
            Array.from(state.selectedIds);

        if (!ids.length) {
            return;
        }

        const confirmed =
            window.confirm(
                `Remove ${ids.length} selected image reference(s)?`
            );

        if (!confirmed) {
            return;
        }

        /*
         * Backend bulk removal will be connected later.
         */

        state.images =
            state.images.filter(
                (image) => !state.selectedIds.has(image.id)
            );

        state.selectedIds.clear();

        handleFilters();
        updateBulkActions();

        if (elements.selectAll) {
            elements.selectAll.checked = false;
            elements.selectAll.indeterminate = false;
        }

        showMessage(
            "Selected image references removed locally. Backend integration pending."
        );
    }

    /* =========================================================
       COUNTERS
    ========================================================= */

    function updateCounters() {
        const total =
            byId("totalImageCount");

        const active =
            byId("activeImageCount");

        const primary =
            byId("primaryImageCount");

        const archived =
            byId("archivedImageCount");

        if (total) {
            total.textContent =
                state.images.length;
        }

        if (active) {
            active.textContent =
                state.images.filter(
                    (image) =>
                        image.status === "active"
                ).length;
        }

        if (primary) {
            primary.textContent =
                state.images.filter(
                    (image) =>
                        image.isPrimary === true
                ).length;
        }

        if (archived) {
            archived.textContent =
                state.images.filter(
                    (image) =>
                        image.status === "archived"
                ).length;
        }
    }

    /* =========================================================
       MESSAGE
    ========================================================= */

    function showMessage(message) {
        const container =
            byId("imageManagementMessage");

        if (!container) {
            return;
        }

        container.textContent = message;
        container.classList.add("show");

        window.setTimeout(() => {
            container.classList.remove("show");
        }, 4000);
    }

    /* =========================================================
       SECURITY / OUTPUT HELPERS
    ========================================================= */

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }

})();
