CREATE TABLE `users`(
    `id` CHAR(36) NOT NULL,
    `email` TEXT NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(`id`)
);
ALTER TABLE
    `users` ADD UNIQUE `users_email_unique`(`email`);
ALTER TABLE
    `users` ADD UNIQUE `users_username_unique`(`username`);
CREATE TABLE `password_entries`(
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `site_name` VARCHAR(255) NOT NULL,
    `site_url` VARCHAR(255) NULL,
    `username` TEXT NOT NULL,
    `encrypted_password` TEXT NOT NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    PRIMARY KEY(`id`)
);
CREATE TABLE `audit_log`(
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `entry_id` VARCHAR(255) NOT NULL,
    `action` VARCHAR(255) NOT NULL,
    `performed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(`id`)
);
ALTER TABLE
    `audit_log` ADD INDEX `audit_log_entry_id_index`(`entry_id`);
ALTER TABLE
    `audit_log` ADD CONSTRAINT `audit_log_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `users`(`id`);
ALTER TABLE
    `password_entries` ADD CONSTRAINT `password_entries_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `users`(`id`);