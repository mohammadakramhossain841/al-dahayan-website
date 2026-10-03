/**
 * Al-Dahayan Trading Company
 * Unified Image Storage Service
 *
 * File:
 * backend/services/imageStorageService.js
 *
 * Purpose:
 * Central storage abstraction for Admin Image Management.
 *
 * Design:
 * - Admin Panel is the upload source.
 * - Image metadata is stored in data/image-registry.json.
 * - Physical files are stored through a storage-provider abstraction.
 * - Current provider: repository/file storage.
 * - Future provider: object storage/CDN.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PROJECT_ROOT = path.join(__dirname, "..", "..");

const STORAGE_CONFIG_PATH = path.join(
    PROJECT_ROOT,
    "data",
    "image-storage.json"
);

const REGISTRY_PATH = path.join(
    PROJECT_ROOT,
    "data",
    "image-registry.json"
);

const DEFAULT_STORAGE_ROOT = path.join(
    PROJECT_ROOT,
    "assets",
    "images"
);

const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const NAMESPACE_MAP = {
    banner: "banners",
    homepage: "homepage",
    page: "banners",
    oem_part: "oem",
    vehicle: "vehicles",
    branch: "branches",
    ai: "ai"
};

const TYPE_MAP = {
    primary: "primary",
    gallery: "gallery",
    thumbnail: "thumbnail",
    installation: "installation",
    diagram: "diagram",
    main: "main",
    ads: "ads",
    hero: "hero",
    section: "sections",
    promotional: "promotional",
    avatar: "avatar",
    asset: "assets"
};


/* =========================================================
   CONFIGURATION
========================================================= */

function loadStorageConfig() {
    if (!fs.existsSync(STORAGE_CONFIG_PATH)) {
        throw new Error(
            "Image storage configuration not found"
        );
    }

    return JSON.parse(
        fs.readFileSync(
            STORAGE_CONFIG_PATH,
            "utf8"
        )
    );
}


function loadRegistry() {
    if (!fs.existsSync(REGISTRY_PATH)) {
        return {
            version: "1.0",
            status: "foundation",
            description:
                "Central image registry for all Al-Dahayan website image assets.",
            idPrefix: "IMG-",
            storageConfig: "data/image-storage.json",
            records: [],
            rules: {},
            supportedEntityTypes: [],
            supportedTypes: []
        };
    }

    return JSON.parse(
        fs.readFileSync(
            REGISTRY_PATH,
            "utf8"
        )
    );
}


function saveRegistry(registry) {
    const tempPath = `${REGISTRY_PATH}.tmp`;

    fs.writeFileSync(
        tempPath,
        JSON.stringify(
            registry,
            null,
            2
        ),
        "utf8"
    );

    fs.renameSync(
        tempPath,
        REGISTRY_PATH
    );
}


/* =========================================================
   VALIDATION
========================================================= */

function validateMimeType(mimeType) {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new Error(
            "Unsupported image type. Allowed: JPEG, PNG, WebP"
        );
    }
}


function validateFileSize(buffer) {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error(
            "Image data must be a Buffer"
        );
    }

    if (buffer.length === 0) {
        throw new Error(
            "Image file is empty"
        );
    }

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
        throw new Error(
            "Image file exceeds the 10 MB limit"
        );
    }
}


function validateEntityType(entityType) {
    if (!NAMESPACE_MAP[entityType]) {
        throw new Error(
            `Unsupported entity type: ${entityType}`
        );
    }
}


function validateImageType(type) {
    if (!TYPE_MAP[type]) {
        throw new Error(
            `Unsupported image type: ${type}`
        );
    }
}


/* =========================================================
   IMAGE ID
========================================================= */

function generateImageId(registry) {
    const existingIds = new Set(
        registry.records.map(
            (record) => record.imageId
        )
    );

    let imageId;

    do {
        const randomNumber = crypto.randomInt(
            1,
            1000000
        );

        imageId =
            `IMG-${String(randomNumber).padStart(6, "0")}`;
    } while (existingIds.has(imageId));

    return imageId;
}


/* =========================================================
   FILE EXTENSION
========================================================= */

function getExtensionFromMimeType(mimeType) {
    const extensions = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp"
    };

    return extensions[mimeType];
}


/* =========================================================
   SAFE STORAGE DIRECTORY
========================================================= */

function createStorageDirectory(
    namespace,
    type
) {
    const safeNamespace =
        NAMESPACE_MAP[namespace]
            ? NAMESPACE_MAP[namespace]
            : "other";

    const safeType =
        TYPE_MAP[type]
            ? TYPE_MAP[type]
            : "assets";

    const directory = path.join(
        DEFAULT_STORAGE_ROOT,
        safeNamespace,
        safeType
    );

    fs.mkdirSync(
        directory,
        {
            recursive: true
        }
    );

    return directory;
}


/* =========================================================
   SAVE PHYSICAL IMAGE
========================================================= */

function savePhysicalImage({
    buffer,
    imageId,
    mimeType,
    entityType,
    type
}) {
    const extension =
        getExtensionFromMimeType(
            mimeType
        );

    if (!extension) {
        throw new Error(
            "Unable to determine image extension"
        );
    }

    const directory =
        createStorageDirectory(
            entityType,
            type
        );

    const fileName =
        `${imageId}.${extension}`;

    const absolutePath =
        path.join(
            directory,
            fileName
        );

    fs.writeFileSync(
        absolutePath,
        buffer
    );

    const relativePath =
        path
            .relative(
                PROJECT_ROOT,
                absolutePath
            )
            .split(path.sep)
            .join("/");

    return {
        fileName,
        absolutePath,
        relativePath
    };
}


/* =========================================================
   REGISTER IMAGE
========================================================= */

function registerImage({
    buffer,
    mimeType,
    entityType,
    entityId,
    entityName = "",
    type,
    altText = "",
    altTextArabic = "",
    caption = "",
    captionArabic = "",
    isPrimary = false
}) {
    const config =
        loadStorageConfig();

    validateEntityType(
        entityType
    );

    validateImageType(
        type
    );

    validateMimeType(
        mimeType
    );

    validateFileSize(
        buffer
    );

    const registry =
        loadRegistry();

    const imageId =
        generateImageId(
            registry
        );

    const storage =
        savePhysicalImage({
            buffer,
            imageId,
            mimeType,
            entityType,
            type
        });

    const record = {
        imageId,

        entityType,

        entityId:
            entityId || null,

        entityName,

        namespace:
            NAMESPACE_MAP[
                entityType
            ],

        type,

        storageProvider:
            config.defaultStorageProvider ||
            "repository",

        storagePath:
            storage.relativePath,

        cdnUrl:
            null,

        fileName:
            storage.fileName,

        mimeType,

        fileSizeBytes:
            buffer.length,

        width:
            null,

        height:
            null,

        altText,

        altTextArabic,

        caption,

        captionArabic,

        active:
            true,

        isPrimary:
            Boolean(isPrimary),

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()
    };

    registry.records.push(
        record
    );

    saveRegistry(
        registry
    );

    return record;
}


/* =========================================================
   GET IMAGE
========================================================= */

function getImageById(
    imageId
) {
    const registry =
        loadRegistry();

    return (
        registry.records.find(
            (record) =>
                record.imageId ===
                imageId
        ) ||
        null
    );
}


/* =========================================================
   LIST IMAGES
========================================================= */

function listImages(
    filters = {}
) {
    const registry =
        loadRegistry();

    let records =
        Array.isArray(
            registry.records
        )
            ? [...registry.records]
            : [];

    if (filters.entityType) {
        records =
            records.filter(
                (record) =>
                    record.entityType ===
                    filters.entityType
            );
    }

    if (filters.entityId) {
        records =
            records.filter(
                (record) =>
                    record.entityId ===
                    filters.entityId
            );
    }

    if (filters.type) {
        records =
            records.filter(
                (record) =>
                    record.type ===
                    filters.type
            );
    }

    if (
        typeof filters.active ===
        "boolean"
    ) {
        records =
            records.filter(
                (record) =>
                    record.active ===
                    filters.active
            );
    }

    return records;
}


/* =========================================================
   UPDATE IMAGE METADATA
========================================================= */

function updateImage(
    imageId,
    updates = {}
) {
    const registry =
        loadRegistry();

    const index =
        registry.records.findIndex(
            (record) =>
                record.imageId ===
                imageId
        );

    if (index === -1) {
        return null;
    }

    const current =
        registry.records[index];

    const allowedFields = [
        "entityType",
        "entityId",
        "entityName",
        "type",
        "altText",
        "altTextArabic",
        "caption",
        "captionArabic",
        "active",
        "isPrimary"
    ];

    for (
        const field of allowedFields
    ) {
        if (
            Object.prototype.hasOwnProperty.call(
                updates,
                field
            )
        ) {
            current[field] =
                updates[field];
        }
    }

    current.updatedAt =
        new Date().toISOString();

    registry.records[index] =
        current;

    saveRegistry(
        registry
    );

    return current;
}


/* =========================================================
   SOFT DELETE
========================================================= */

function deactivateImage(
    imageId
) {
    return updateImage(
        imageId,
        {
            active: false
        }
    );
}


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
    loadStorageConfig,
    loadRegistry,
    saveRegistry,
    registerImage,
    getImageById,
    listImages,
    updateImage,
    deactivateImage
};
