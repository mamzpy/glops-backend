-- CreateTable
CREATE TABLE `Device` (
    `id` VARCHAR(191) NOT NULL,
    `deviceId` VARCHAR(191) NOT NULL,
    `secretHash` VARCHAR(191) NOT NULL,
    `stationId` VARCHAR(191) NOT NULL,
    `serialNumber` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'BLOCKED', 'MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
    `lastSeenAt` DATETIME(3) NULL,
    `registeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Device_deviceId_key`(`deviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
