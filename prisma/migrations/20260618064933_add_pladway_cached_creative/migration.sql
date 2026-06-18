-- CreateTable
CREATE TABLE `PladwayCachedCreative` (
    `id` VARCHAR(191) NOT NULL,
    `adId` VARCHAR(191) NULL,
    `creativeId` VARCHAR(191) NOT NULL,
    `sourceUrl` TEXT NOT NULL,
    `storagePath` VARCHAR(191) NULL,
    `cachedUrl` VARCHAR(191) NULL,
    `mimeType` VARCHAR(191) NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `durationSeconds` INTEGER NULL,
    `status` ENUM('PENDING', 'DOWNLOADING', 'READY', 'FAILED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `downloadAttempts` INTEGER NOT NULL DEFAULT 0,
    `lastError` TEXT NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PladwayCachedCreative_creativeId_key`(`creativeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
