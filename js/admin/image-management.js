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
 * Backend:
 * GET    /api/v1/images
 * GET    /api/v1/images/:imageId
 * POST   /api/v1/images
 * PUT    /api/v1/images/:imageId
 * DELETE /api/v1/images/:imageId
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
        pageSize: 20,
        loading: false
    };


    /* =========================================================
       DOM HELPERS
    ========================================================= */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        Array.from(parent.querySelectorAll(selector));

    const byId = (id) =>
        document.getElementById(id);


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
       API CONFIGURATION
    ========================================================= */

    function getApiBaseUrl() {
        if (
            window.DAHAYAN_CONFIG &&
            typeof window.DAHAYAN_CONFIG.API_BASE_URL === "string"
        ) {
            return window.DAHAYAN_CONFIG.API_BASE_URL
                .replace(/\/+$/, "");
        }

        if (
            window.CONFIG &&
            typeof window.CONFIG.API_BASE_URL === "string"
        ) {
            return window.CONFIG.API_BASE_URL
                .replace(/\/+$/, "");
        }

        return window.location.origin
            .replace(/\/+$/, "");
    }


    function getApiUrl(path = "") {
        const baseUrl = getApiBaseUrl();

        return (
            `${baseUrl}/api/v1/images` +
            String(path)
        );
    }


    function getAuthToken() {
        if (
            window.DahayanAdminAuth &&
            typeof window.DahayanAdminAuth.getToken === "function"
        ) {
            return window.DahayanAdminAuth.getToken();
        }

        return sessionStorage.getItem(
            "dahayan_admin_token"
        );
    }


    function buildAuthHeaders(includeJson = false) {
        const token = getAuthToken();

        const headers = {};

        if (includeJson) {
            headers["Content-Type"] =
                "application/json";
        }

        if (token) {
            headers["Authorization"] =
                `Bearer ${token}`;
        }

        return headers;
    }


    /* =========================================================
       API REQUEST
    ========================================================= */

    async function apiRequest(
        path = "",
        options = {}
    ) {
        const requestOptions = {
            ...options,
            headers: {
                ...buildAuthHeaders(
                    options.body !== undefined
                ),
                ...(options.headers || {})
            }
        };

        let response;

        try {
            response = await fetch(
                getApiUrl(path),
                requestOptions
            );
        } catch (error) {
            throw new Error(
                "Unable to connect to the image management API."
            );
        }

        let data = null;

        try {
            data = await response.json();
        } catch (error) {
            data = null;
        }

        if (
            response.status === 401
        ) {
            throw new Error(
                "Your admin session has expired. Please sign in again."
            );
        }

        if (
            response.status === 403
        ) {
            throw new Error(
                "You do not have permission to perform this image management action."
            );
        }

        if (!response.ok) {
            throw new Error(
                getApiErrorMessage(data) ||
                `Image API request failed (${response.status}).`
            );
        }

        if (
            data &&
            data.success === false
        ) {
            throw new Error(
                getApiErrorMessage(data) ||
                "Image API request failed."
            );
        }

        return data;
    }


    function getApiErrorMessage(data) {
        if (!data) {
            return "";
        }

        if (
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

        if (
            typeof data.message === "string"
        ) {
            return data.message;
        }

        return "";
    }


    /* =========================================================
       INITIALIZATION
    ========================================================= */

    document.addEventListener(
        "DOMContentLoaded",
        init
    );


    function init() {
        bindEvents();
        loadImages();
        updateBulkActions();
    }


    /* =========================================================
       EVENTS
    ========================================================= */

    function bindEvents() {
        elements.search?.addEventListener(
            "input",
            handleFilters
        );

        elements.entityFilter?.addEventListener(
            "change",
            handleFilters
        );

        elements.typeFilter?.addEventListener(
            "change",
            handleFilters
        );

        elements.statusFilter?.addEventListener(
            "change",
            handleFilters
        );

        elements.selectAll?.addEventListener(
            "change",
            handleSelectAll
        );

        elements.uploadButton?.addEventListener(
            "click",
            () => {
                openUploadModal();
            }
        );

        elements.bulkDeleteButton?.addEventListener(
            "click",
            handleBulkDelete
        );

        elements.modalClose?.addEventListener(
            "click",
            closeModal
        );

        elements.modalCancel?.addEventListener(
            "click",
            closeModal
        );

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

        document.addEventListener(
            "keydown",
            (event) => {
                if (event.key === "Escape") {
                    closeModal();
                }
            }
        );
    }


    /* =========================================================
       LOAD IMAGES
    ========================================================= */

    async function loadImages() {
        state.loading = true;

        renderLoadingState();

        try {
            const response =
                await apiRequest("");

            const rawImages =
                Array.isArray(response?.images)
                    ? response.images
                    : Array.isArray(response?.assets)
                        ? response.assets
                        : Array.isArray(response?.data)
                            ? response.data
                            : [];

            state.images =
                rawImages.map(
                    normalizeImageRecord
                );

            state.selectedIds.clear();
            state.currentPage = 1;

            handleFilters();

            showMessage(
                `Image registry loaded: ${state.images.length} image(s).`
            );
        } catch (error) {
            console.error(
                "Image registry load error:",
                error
            );

            state.images = [];
            state.filteredImages = [];
            state.selectedIds.clear();

            renderTable();
            updateCounters();

            showMessage(
                error.message ||
                "Failed to load image registry.",
                true
            );
        } finally {
            state.loading = false;
        }
    }


    function renderLoadingState() {
        if (!elements.imageTableBody) {
            return;
        }

        elements.imageTableBody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-state">
                    Loading image registry...
                </td>
            </tr>
        `;
    }


    /* =========================================================
       NORMALIZE BACKEND IMAGE
    ========================================================= */

    function normalizeImageRecord(image) {
        const active =
            image?.active !== false;

        const status =
            active
                ? "active"
                : "disabled";

        const imageId =
            image?.imageId ||
            image?.id ||
            "";

        const imageType =
            image?.type ||
            image?.imageType ||
            "";

        const url =
            image?.cdnUrl ||
            image?.url ||
            image?.storageUrl ||
            buildStorageUrl(image);

        return {
            id: imageId,

            imageId: imageId,

            entityType:
                image?.entityType || "",

            entityId:
                image?.entityId || "",

            entityName:
                image?.entityName || "",

            namespace:
                image?.namespace || "",

            imageType:
                imageType,

            type:
                imageType,

            storageProvider:
                image?.storageProvider ||
                "",

            storagePath:
                image?.storagePath ||
                "",

            cdnUrl:
                image?.cdnUrl ||
                null,

            fileName:
                image?.fileName ||
                "",

            mimeType:
                image?.mimeType ||
                "",

            fileSizeBytes:
                Number(image?.fileSizeBytes || 0),

            width:
                image?.width ?? null,

            height:
                image?.height ?? null,

            url: url,

            altEn:
                image?.altText ||
                image?.altEn ||
                "",

            altAr:
                image?.altTextArabic ||
                image?.altAr ||
                "",

            captionEn:
                image?.caption ||
                image?.captionEn ||
                "",

            captionAr:
                image?.captionArabic ||
                image?.captionAr ||
                "",

            active:
                active,

            status:
                image?.status ||
                status,

            isPrimary:
                Boolean(image?.isPrimary),

            order:
                image?.order ??
                image?.sortOrder ??
                0,

            createdAt:
                image?.createdAt ||
                null,

            updatedAt:
                image?.updatedAt ||
                null
        };
    }


    function buildStorageUrl(image) {
        if (
            !image ||
            !image.storagePath
        ) {
            return "";
        }

        const path =
            String(image.storagePath)
                .replace(/^\/+/, "");

        const baseUrl =
            getApiBaseUrl()
                .replace(/\/+$/, "");

        /*
         * The backend serves the repository
         * root as static content.
         */
        return `${baseUrl}/${path}`;
    }


    /* =========================================================
       FILTERS
    ========================================================= */

    function handleFilters() {
        const searchValue =
            (
                elements.search?.value ||
                ""
            )
                .trim()
                .toLowerCase();

        const entityValue =
            elements.entityFilter?.value ||
            "";

        const typeValue =
            elements.typeFilter?.value ||
            "";

        const statusValue =
            elements.statusFilter?.value ||
            "";

        state.filteredImages =
            state.images.filter(
                (image) => {
                    const searchableText = [
                        image.id,
                        image.imageId,
                        image.entityId,
                        image.entityName,
                        image.entityType,
                        image.imageType,
                        image.namespace,
                        image.altEn,
                        image.altAr,
                        image.captionEn,
                        image.captionAr,
                        image.fileName
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    const matchesSearch =
                        !searchValue ||
                        searchableText.includes(
                            searchValue
                        );

                    const matchesEntity =
                        !entityValue ||
                        image.entityType ===
                            entityValue;

                    const matchesType =
                        !typeValue ||
                        image.imageType ===
                            typeValue;

                    const matchesStatus =
                        !statusValue ||
                        image.status ===
                            statusValue;

                    return (
                        matchesSearch &&
                        matchesEntity &&
                        matchesType &&
                        matchesStatus
                    );
                }
            );

        state.currentPage = 1;

        renderTable();
        updateCounters();
        updateBulkActions();
    }


    /* =========================================================
       TABLE
    ========================================================= */

    function renderTable() {
        if (!elements.imageTableBody) {
            return;
        }

        if (state.loading) {
            renderLoadingState();
            return;
        }

        if (
            !state.filteredImages.length
        ) {
            elements.imageTableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="empty-state">
                        No images found.
                    </td>
                </tr>
            `;

            updateSelectAllState();

            return;
        }

        const startIndex =
            (
                state.currentPage - 1
            ) *
            state.pageSize;

        const endIndex =
            startIndex +
            state.pageSize;

        const pageImages =
            state.filteredImages.slice(
                startIndex,
                endIndex
            );

        elements.imageTableBody.innerHTML =
            pageImages
                .map(renderImageRow)
                .join("");

        updateRowSelectionUI();
    }


    function renderImageRow(image) {
        const checked =
            state.selectedIds.has(
                image.id
            )
                ? "checked"
                : "";

        const primaryBadge =
            image.isPrimary
                ? `
                    <span class="badge badge-primary">
                        Primary
                    </span>
                `
                : "";

        const statusBadge =
            renderStatusBadge(
                image.status
            );

        const thumbnail =
            image.url
                ? `
                    <img
                        src="${escapeAttribute(
                            image.url
                        )}"
                        alt="${escapeAttribute(
                            image.altEn || ""
                        )}"
                        class="image-management-thumbnail"
                        loading="lazy"
                    >
                `
                : `
                    <div class="image-management-placeholder">
                        No Image
                    </div>
                `;

        return `
            <tr
                data-image-id="${escapeAttribute(
                    image.id
                )}"
            >

                <td>
                    <input
                        type="checkbox"
                        class="image-row-checkbox"
                        data-id="${escapeAttribute(
                            image.id
                        )}"
                        ${checked}
                    >
                </td>

                <td>
                    ${thumbnail}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(
                            image.id || "-"
                        )}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(
                        image.entityType || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        image.entityId || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        image.imageType || "-"
                    )}
                    ${primaryBadge}
                </td>

                <td>
                    ${statusBadge}
                </td>

                <td>
                    ${escapeHtml(
                        image.altEn || "-"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        image.order ?? "-"
                    )}
                </td>

                <td>
                    <div class="image-row-actions">

                        <button
                            type="button"
                            class="btn btn-sm"
                            data-action="edit"
                            data-id="${escapeAttribute(
                                image.id
                            )}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm"
                            data-action="primary"
                            data-id="${escapeAttribute(
                                image.id
                            )}"
                            ${
                                image.isPrimary
                                    ? "disabled"
                                    : ""
                            }
                        >
                            ${
                                image.isPrimary
                                    ? "Primary"
                                    : "Set Primary"
                            }
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-danger"
                            data-action="remove"
                            data-id="${escapeAttribute(
                                image.id
                            )}"
                        >
                            Remove
                        </button>

                    </div>
                </td>

            </tr>
        `;
    }


    function renderStatusBadge(status) {
        const normalized =
            String(
                status || "active"
            ).toLowerCase();

        if (
            normalized === "active"
        ) {
            return `
                <span class="badge badge-success">
                    Active
                </span>
            `;
        }

        if (
            normalized === "disabled"
        ) {
            return `
                <span class="badge badge-warning">
                    Disabled
                </span>
            `;
        }

        if (
            normalized === "archived"
        ) {
            return `
                <span class="badge badge-secondary">
                    Archived
                </span>
            `;
        }

        return `
            <span class="badge">
                ${escapeHtml(
                    status || "-"
                )}
            </span>
        `;
    }


    /* =========================================================
       TABLE ACTIONS
    ========================================================= */

    function handleTableAction(event) {
        const button =
            event.target.closest(
                "[data-action]"
            );

        if (!button) {
            return;
        }

        const action =
            button.dataset.action;

        const id =
            button.dataset.id;

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
            event.target.closest(
                ".image-row-checkbox"
            );

        if (!checkbox) {
            return;
        }

        const id =
            checkbox.dataset.id;

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
        const checked =
            event.target.checked;

        const visibleImages =
            getCurrentPageImages();

        visibleImages.forEach(
            (image) => {
                if (checked) {
                    state.selectedIds.add(
                        image.id
                    );
                } else {
                    state.selectedIds.delete(
                        image.id
                    );
                }
            }
        );

        updateRowSelectionUI();
        updateBulkActions();
    }


    function getCurrentPageImages() {
        const startIndex =
            (
                state.currentPage - 1
            ) *
            state.pageSize;

        const endIndex =
            startIndex +
            state.pageSize;

        return state.filteredImages.slice(
            startIndex,
            endIndex
        );
    }


    function updateRowSelectionUI() {
        $$(".image-row-checkbox").forEach(
            (checkbox) => {
                checkbox.checked =
                    state.selectedIds.has(
                        checkbox.dataset.id
                    );
            }
        );

        updateSelectAllState();
    }


    function updateSelectAllState() {
        if (!elements.selectAll) {
            return;
        }

        const visibleImages =
            getCurrentPageImages();

        const visibleIds =
            visibleImages.map(
                (image) => image.id
            );

        if (!visibleIds.length) {
            elements.selectAll.checked =
                false;

            elements.selectAll.indeterminate =
                false;

            return;
        }

        const selectedCount =
            visibleIds.filter(
                (id) =>
                    state.selectedIds.has(id)
            ).length;

        elements.selectAll.checked =
            selectedCount ===
            visibleIds.length;

        elements.selectAll.indeterminate =
            selectedCount > 0 &&
            selectedCount <
                visibleIds.length;
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
            state.images.find(
                (item) =>
                    item.id === id
            );

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
                image.status === "disabled"
                    ? "disabled"
                    : "active";
        }

        if (elements.isPrimary) {
            elements.isPrimary.checked =
                Boolean(
                    image.isPrimary
                );
        }

        if (elements.imagePreview) {
            if (image.url) {
                elements.imagePreview.innerHTML = `
                    <img
                        src="${escapeAttribute(
                            image.url
                        )}"
                        alt="${escapeAttribute(
                            image.altEn || ""
                        )}"
                    >
                `;
            } else {
                elements.imagePreview.innerHTML =
                    "";
            }
        }

        /*
         * File input cannot be populated
         * from an existing image for security
         * reasons. It remains empty during edit.
         */
        if (elements.imageFile) {
            elements.imageFile.value = "";
        }

        showModal();
    }


    function showModal() {
        if (!elements.modal) {
            return;
        }

        elements.modal.classList.add(
            "is-open"
        );

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

        elements.modal.classList.remove(
            "is-open"
        );

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
            elements.imagePreview.innerHTML =
                "";
        }

        if (elements.imageStatus) {
            elements.imageStatus.value =
                "active";
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
            alert(
                validation.message
            );

            event.target.value = "";

            if (elements.imagePreview) {
                elements.imagePreview.innerHTML =
                    "";
            }

            return;
        }

        const objectUrl =
            URL.createObjectURL(file);

        if (elements.imagePreview) {
            elements.imagePreview.innerHTML = `
                <img
                    src="${escapeAttribute(
                        objectUrl
                    )}"
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

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {
            return {
                valid: false,
                message:
                    "Only JPG, JPEG, PNG and WEBP images are allowed."
            };
        }

        if (
            file.size > maxSize
        ) {
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

        if (
            state.loading
        ) {
            return;
        }

        const file =
            elements.imageFile?.files?.[0];

        if (
            !state.currentEditId &&
            !file
        ) {
            alert(
                "Please select an image."
            );

            return;
        }

        if (file) {
            const validation =
                validateImageFile(file);

            if (!validation.valid) {
                alert(
                    validation.message
                );

                return;
            }
        }

        const formData = {
            entityType:
                elements.entityType?.value ||
                "",

            entityId:
                elements.entityId?.value
                    .trim() || "",

            imageType:
                elements.imageType?.value ||
                "",

            altEn:
                elements.imageAltEn?.value
                    .trim() || "",

            altAr:
                elements.imageAltAr?.value
                    .trim() || "",

            captionEn:
                elements.imageCaptionEn?.value
                    .trim() || "",

            captionAr:
                elements.imageCaptionAr?.value
                    .trim() || "",

            status:
                elements.imageStatus?.value ||
                "active",

            isPrimary:
                Boolean(
                    elements.isPrimary?.checked
                )
        };

        if (
            !formData.entityType
        ) {
            alert(
                "Please select an entity type."
            );

            return;
        }

        if (
            !formData.entityId
        ) {
            alert(
                "Please enter the entity ID."
            );

            return;
        }

        if (
            !formData.imageType
        ) {
            alert(
                "Please select an image type."
            );

            return;
        }

        setSaveButtonLoading(true);

        try {
            if (state.currentEditId) {
                await updateExistingImage(
                    state.currentEditId,
                    formData
                );

                showMessage(
                    "Image updated successfully."
                );
            } else {
                const base64 =
                    await fileToBase64(file);

                await uploadNewImage(
                    file,
                    base64,
                    formData
                );

                showMessage(
                    "Image uploaded successfully."
                );
            }

            closeModal();

            await loadImages();
        } catch (error) {
            console.error(
                "Image form submission error:",
                error
            );

            showMessage(
                error.message ||
                "Failed to save image.",
                true
            );
        } finally {
            setSaveButtonLoading(false);
        }
    }


    /* =========================================================
       UPLOAD IMAGE
    ========================================================= */

    async function uploadNewImage(
        file,
        base64,
        formData
    ) {
        const payload = {
            imageBase64:
                base64,

            mimeType:
                file.type,

            entityType:
                formData.entityType,

            entityId:
                formData.entityId,

            entityName:
                "",

            type:
                formData.imageType,

            altText:
                formData.altEn,

            altTextArabic:
                formData.altAr,

            caption:
                formData.captionEn,

            captionArabic:
                formData.captionAr,

            isPrimary:
                formData.isPrimary
        };

        /*
         * The backend registry uses
         * active/inactive rather than
         * a frontend-only status string.
         *
         * New uploads are active by default.
         */
        const response =
            await apiRequest(
                "",
                {
                    method: "POST",
                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );

        return response?.image ||
            null;
    }


    /* =========================================================
       UPDATE IMAGE
    ========================================================= */

    async function updateExistingImage(
        id,
        formData
    ) {
        const payload = {
            entityType:
                formData.entityType,

            entityId:
                formData.entityId,

            type:
                formData.imageType,

            altText:
                formData.altEn,

            altTextArabic:
                formData.altAr,

            caption:
                formData.captionEn,

            captionArabic:
                formData.captionAr,

            isPrimary:
                formData.isPrimary,

            active:
                formData.status === "active"
        };

        const response =
            await apiRequest(
                `/${encodeURIComponent(
                    id
                )}`,
                {
                    method: "PUT",
                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );

        return response?.image ||
            null;
    }


    /* =========================================================
       FILE TO BASE64
    ========================================================= */

    function fileToBase64(file) {
        return new Promise(
            (resolve, reject) => {
                const reader =
                    new FileReader();

                reader.onload = () => {
                    resolve(
                        reader.result
                    );
                };

                reader.onerror = () => {
                    reject(
                        new Error(
                            "Unable to read the selected image."
                        )
                    );
                };

                reader.readAsDataURL(
                    file
                );
            }
        );
    }


    /* =========================================================
       SET PRIMARY
    ========================================================= */

    async function setPrimary(id) {
        const image =
            state.images.find(
                (item) =>
                    item.id === id
            );

        if (!image) {
            return;
        }

        if (image.isPrimary) {
            return;
        }

        const confirmed =
            window.confirm(
                "Set this image as the primary image?"
            );

        if (!confirmed) {
            return;
        }

        try {
            await apiRequest(
                `/${encodeURIComponent(
                    id
                )}`,
                {
                    method: "PUT",
                    body:
                        JSON.stringify({
                            isPrimary: true
                        })
                }
            );

            showMessage(
                "Primary image updated successfully."
            );

            await loadImages();
        } catch (error) {
            console.error(
                "Set primary error:",
                error
            );

            showMessage(
                error.message ||
                "Failed to update primary image.",
                true
            );
        }
    }


    /* =========================================================
       REMOVE IMAGE
    ========================================================= */

    async function removeImage(id) {
        const image =
            state.images.find(
                (item) =>
                    item.id === id
            );

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

        try {
            await apiRequest(
                `/${encodeURIComponent(
                    id
                )}`,
                {
                    method: "DELETE"
                }
            );

            state.selectedIds.delete(
                id
            );

            showMessage(
                "Image reference removed successfully."
            );

            await loadImages();
        } catch (error) {
            console.error(
                "Remove image error:",
                error
            );

            showMessage(
                error.message ||
                "Failed to remove image.",
                true
            );
        }
    }


    /* =========================================================
       BULK REMOVE
    ========================================================= */

    async function handleBulkDelete() {
        const ids =
            Array.from(
                state.selectedIds
            );

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
         * Backend currently exposes
         * individual DELETE only.
         *
         * Therefore bulk removal performs
         * one verified DELETE request per ID.
         */
        try {
            setBulkDeleteLoading(
                true
            );

            const results =
                await Promise.allSettled(
                    ids.map(
                        (id) =>
                            apiRequest(
                                `/${encodeURIComponent(
                                    id
                                )}`,
                                {
                                    method:
                                        "DELETE"
                                }
                            )
                    )
                );

            const failed =
                results.filter(
                    (result) =>
                        result.status ===
                        "rejected"
                );

            state.selectedIds.clear();

            if (
                failed.length === 0
            ) {
                showMessage(
                    `${ids.length} image reference(s) removed successfully.`
                );
            } else {
                showMessage(
                    `${ids.length - failed.length} image(s) removed. ${failed.length} image(s) failed.`,
                    true
                );
            }

            await loadImages();
        } catch (error) {
            console.error(
                "Bulk image removal error:",
                error
            );

            showMessage(
                error.message ||
                "Bulk image removal failed.",
                true
            );
        } finally {
            setBulkDeleteLoading(
                false
            );
        }
    }


    /* =========================================================
       BUTTON LOADING
    ========================================================= */

    function setSaveButtonLoading(
        loading
    ) {
        if (
            !elements.saveButton
        ) {
            return;
        }

        elements.saveButton.disabled =
            loading;

        if (loading) {
            elements.saveButton.dataset
                .originalText =
                elements.saveButton.textContent;

            elements.saveButton.textContent =
                "Saving...";
        } else {
            elements.saveButton.textContent =
                elements.saveButton.dataset
                    .originalText ||
                "Save";
        }
    }


    function setBulkDeleteLoading(
        loading
    ) {
        if (
            !elements.bulkDeleteButton
        ) {
            return;
        }

        elements.bulkDeleteButton.disabled =
            loading ||
            state.selectedIds.size === 0;

        if (loading) {
            elements.bulkDeleteButton.dataset
                .originalText =
                elements.bulkDeleteButton.textContent;

            elements.bulkDeleteButton.textContent =
                "Removing...";
        } else {
            elements.bulkDeleteButton.textContent =
                elements.bulkDeleteButton.dataset
                    .originalText ||
                "Bulk Remove";
        }
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
                        image.status ===
                        "active"
                ).length;
        }

        if (primary) {
            primary.textContent =
                state.images.filter(
                    (image) =>
                        image.isPrimary ===
                        true
                ).length;
        }

        if (archived) {
            archived.textContent =
                state.images.filter(
                    (image) =>
                        image.status ===
                        "archived"
                ).length;
        }
    }


    /* =========================================================
       MESSAGE
    ========================================================= */

    function showMessage(
        message,
        isError = false
    ) {
        const container =
            byId(
                "imageManagementMessage"
            );

        if (!container) {
            return;
        }

        container.textContent =
            message;

        container.classList.toggle(
            "error",
            Boolean(isError)
        );

        container.classList.add(
            "show"
        );

        window.setTimeout(
            () => {
                container.classList.remove(
                    "show"
                );

                container.classList.remove(
                    "error"
                );
            },
            4000
        );
    }


    /* =========================================================
       SECURITY / OUTPUT HELPERS
    ========================================================= */

    function escapeHtml(value) {
        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    function escapeAttribute(value) {
        return escapeHtml(
            value
        );
    }

})();
