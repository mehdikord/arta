-- CreateTable
CREATE TABLE `product_files` (
    `id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `storage_key` VARCHAR(500) NOT NULL,
    `kind` ENUM('TEXT', 'VIDEO', 'AUDIO', 'ARCHIVE') NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `product_files_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_files` ADD CONSTRAINT `product_files_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate legacy products.file_url into product_files (one row per existing product)
-- displayName: for private storage keys the original file name (key = uuid-<name>),
-- for public URLs the path basename, falling back to the product title.
-- kind: derived from the extension; unknown/legacy archives become ARCHIVE.
INSERT INTO `product_files` (`id`, `product_id`, `display_name`, `storage_key`, `kind`, `sort_order`, `created_at`)
SELECT
    UUID(),
    p.`id`,
    CASE
        WHEN p.`file_url` LIKE '________-____-____-____-%'
            THEN SUBSTRING(p.`file_url`, 38)
        WHEN p.`file_url` LIKE '%/%'
            THEN RIGHT(p.`file_url`, LOCATE('/', REVERSE(p.`file_url`)) - 1)
        ELSE p.`title`
    END,
    p.`file_url`,
    CASE
        WHEN LOWER(RIGHT(p.`file_url`, 4)) = '.pdf' THEN 'TEXT'
        WHEN LOWER(RIGHT(p.`file_url`, 5)) = '.docx' THEN 'TEXT'
        WHEN LOWER(RIGHT(p.`file_url`, 4)) = '.txt' THEN 'TEXT'
        WHEN LOWER(RIGHT(p.`file_url`, 4)) = '.mp4' THEN 'VIDEO'
        WHEN LOWER(RIGHT(p.`file_url`, 5)) = '.webm' THEN 'VIDEO'
        WHEN LOWER(RIGHT(p.`file_url`, 4)) = '.mp3' THEN 'AUDIO'
        WHEN LOWER(RIGHT(p.`file_url`, 4)) = '.m4a' THEN 'AUDIO'
        WHEN LOWER(RIGHT(p.`file_url`, 4)) = '.ogg' THEN 'AUDIO'
        WHEN LOWER(RIGHT(p.`file_url`, 4)) = '.wav' THEN 'AUDIO'
        ELSE 'ARCHIVE'
    END,
    0,
    NOW(3)
FROM `products` p
WHERE p.`deleted_at` IS NULL;
