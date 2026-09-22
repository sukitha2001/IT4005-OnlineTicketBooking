-- ============================================================
-- Online Ticket Booking System — Full Schema (MySQL)
-- IT 4005 Advanced Software Engineering
-- ============================================================

CREATE DATABASE IF NOT EXISTS ticket_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ticket_booking;

-- ============================================================
-- 1. USER
-- ============================================================
CREATE TABLE IF NOT EXISTS `user` (
  `user_id`       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`          VARCHAR(120)  NOT NULL,
  `email`         VARCHAR(255)  NOT NULL,
  `password_hash` VARCHAR(255)  NOT NULL,
  `role`          ENUM('CUSTOMER','ORGANIZER','SYSTEM_ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `status`        ENUM('ACTIVE','DISABLED') NOT NULL DEFAULT 'ACTIVE',
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_user_email` (`email`)
) ENGINE=InnoDB;

CREATE INDEX `idx_user_email` ON `user` (`email`);

-- ============================================================
-- 2. VENUE
-- ============================================================
CREATE TABLE IF NOT EXISTS `venue` (
  `venue_id`   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(200) NOT NULL,
  `location`   VARCHAR(300) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 3. SEAT
-- ============================================================
CREATE TABLE IF NOT EXISTS `seat` (
  `seat_id`     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `venue_id`    BIGINT UNSIGNED NOT NULL,
  `row_label`   VARCHAR(10)  NOT NULL,
  `seat_number` INT UNSIGNED NOT NULL,
  `seat_type`   ENUM('STANDARD','VIP','BALCONY') NOT NULL DEFAULT 'STANDARD',
  UNIQUE KEY `uq_seat` (`venue_id`, `row_label`, `seat_number`),
  CONSTRAINT `fk_seat_venue` FOREIGN KEY (`venue_id`) REFERENCES `venue` (`venue_id`)
) ENGINE=InnoDB;

-- ============================================================
-- 4. EVENT
-- ============================================================
CREATE TABLE IF NOT EXISTS `event` (
  `event_id`         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `organizer_id`     BIGINT UNSIGNED NOT NULL,
  `title`            VARCHAR(300) NOT NULL,
  `description`      TEXT,
  `type`             ENUM('MOVIE','CONCERT','SPORT','THEATRE','OTHER') NOT NULL,
  `genre`            VARCHAR(100),
  `duration_minutes` INT UNSIGNED,
  `image_url`        VARCHAR(500),
  `status`           ENUM('DRAFT','PUBLISHED','UNPUBLISHED') NOT NULL DEFAULT 'DRAFT',
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_event_organizer` FOREIGN KEY (`organizer_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB;

CREATE INDEX `idx_event_status_type_genre` ON `event` (`status`, `type`, `genre`(50));

-- ============================================================
-- 5. SHOW
-- ============================================================
CREATE TABLE IF NOT EXISTS `show` (
  `show_id`    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `event_id`   BIGINT UNSIGNED NOT NULL,
  `venue_id`   BIGINT UNSIGNED NOT NULL,
  `start_time` DATETIME NOT NULL,
  `base_price` DECIMAL(10,2) NOT NULL CHECK (`base_price` >= 0),
  `status`     ENUM('SCHEDULED','CANCELLED','COMPLETED') NOT NULL DEFAULT 'SCHEDULED',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_show_event` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`),
  CONSTRAINT `fk_show_venue` FOREIGN KEY (`venue_id`) REFERENCES `venue` (`venue_id`)
) ENGINE=InnoDB;

CREATE INDEX `idx_show_event_time_status` ON `show` (`event_id`, `start_time`, `status`);

-- ============================================================
-- 6. SHOW_SEAT
-- ============================================================
CREATE TABLE IF NOT EXISTS `show_seat` (
  `show_seat_id`   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `show_id`        BIGINT UNSIGNED NOT NULL,
  `seat_id`        BIGINT UNSIGNED NOT NULL,
  `price`          DECIMAL(10,2) NOT NULL CHECK (`price` >= 0),
  `status`         ENUM('AVAILABLE','HELD','BOOKED') NOT NULL DEFAULT 'AVAILABLE',
  `hold_expires_at` DATETIME NULL DEFAULT NULL,
  UNIQUE KEY `uq_show_seat` (`show_id`, `seat_id`),
  CONSTRAINT `fk_ss_show` FOREIGN KEY (`show_id`) REFERENCES `show` (`show_id`),
  CONSTRAINT `fk_ss_seat` FOREIGN KEY (`seat_id`) REFERENCES `seat` (`seat_id`)
) ENGINE=InnoDB;

CREATE INDEX `idx_show_seat_show_status` ON `show_seat` (`show_id`, `status`);

-- ============================================================
-- 7. BOOKING
-- ============================================================
CREATE TABLE IF NOT EXISTS `booking` (
  `booking_id`   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`      BIGINT UNSIGNED NOT NULL,
  `show_id`      BIGINT UNSIGNED NOT NULL,
  `reference`    VARCHAR(50) NOT NULL,
  `booked_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total_amount` DECIMAL(10,2) NOT NULL CHECK (`total_amount` >= 0),
  `status`       ENUM('PENDING','PAYMENT_PROCESSING','CONFIRMED','PAYMENT_FAILED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_booking_reference` (`reference`),
  CONSTRAINT `fk_booking_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `fk_booking_show` FOREIGN KEY (`show_id`) REFERENCES `show` (`show_id`)
) ENGINE=InnoDB;

CREATE INDEX `idx_booking_user_date`   ON `booking` (`user_id`, `booked_at`);
CREATE INDEX `idx_booking_show_status` ON `booking` (`show_id`, `status`);

-- ============================================================
-- 8. BOOKING_SEAT
-- ============================================================
CREATE TABLE IF NOT EXISTS `booking_seat` (
  `booking_seat_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_id`      BIGINT UNSIGNED NOT NULL,
  `show_seat_id`    BIGINT UNSIGNED NOT NULL,
  `unit_price`      DECIMAL(10,2) NOT NULL CHECK (`unit_price` >= 0),
  UNIQUE KEY `uq_booking_seat_show_seat` (`show_seat_id`),
  CONSTRAINT `fk_bs_booking`   FOREIGN KEY (`booking_id`)   REFERENCES `booking`   (`booking_id`),
  CONSTRAINT `fk_bs_show_seat` FOREIGN KEY (`show_seat_id`) REFERENCES `show_seat` (`show_seat_id`)
) ENGINE=InnoDB;

-- ============================================================
-- 9. PAYMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS `payment` (
  `payment_id`            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_id`            BIGINT UNSIGNED NOT NULL,
  `method`                ENUM('CARD','ONLINE_BANKING','SIMULATED') NOT NULL DEFAULT 'SIMULATED',
  `amount`                DECIMAL(10,2) NOT NULL CHECK (`amount` >= 0),
  `status`                ENUM('PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'PENDING',
  `transaction_reference` VARCHAR(100) NULL DEFAULT NULL,
  `paid_at`               DATETIME NULL DEFAULT NULL,
  `created_at`            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_payment_booking` (`booking_id`),
  CONSTRAINT `fk_payment_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`)
) ENGINE=InnoDB;

-- ============================================================
-- 10. TICKET
-- ============================================================
CREATE TABLE IF NOT EXISTS `ticket` (
  `ticket_id`  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_id` BIGINT UNSIGNED NOT NULL,
  `qr_value`   VARCHAR(200) NOT NULL,
  `issued_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_ticket_booking` (`booking_id`),
  UNIQUE KEY `uq_ticket_qr`      (`qr_value`),
  CONSTRAINT `fk_ticket_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`)
) ENGINE=InnoDB;

-- ============================================================
-- 11. ANNOUNCEMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS `announcement` (
  `announcement_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `author_id`       BIGINT UNSIGNED NOT NULL,
  `event_id`        BIGINT UNSIGNED NULL DEFAULT NULL,
  `audience`        ENUM('ALL','CUSTOMERS','ORGANIZERS') NOT NULL DEFAULT 'ALL',
  `message`         TEXT NOT NULL,
  `created_at`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ann_author` FOREIGN KEY (`author_id`) REFERENCES `user`  (`user_id`),
  CONSTRAINT `fk_ann_event`  FOREIGN KEY (`event_id`)  REFERENCES `event` (`event_id`)
) ENGINE=InnoDB;

-- ============================================================
-- 12. AUDIT_LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS `audit_log` (
  `log_id`      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `actor_id`    BIGINT UNSIGNED NULL DEFAULT NULL,
  `action`      VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50)  NULL DEFAULT NULL,
  `entity_id`   BIGINT UNSIGNED NULL DEFAULT NULL,
  `details`     JSON NULL DEFAULT NULL,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_log_actor` FOREIGN KEY (`actor_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB;

CREATE INDEX `idx_audit_log_date_action` ON `audit_log` (`created_at`, `action`);
