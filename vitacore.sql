-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        12.2.2-MariaDB - MariaDB Server
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.14.0.7165
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- 테이블 vitacore.app_devices 구조 내보내기
DROP TABLE IF EXISTS `app_devices`;
CREATE TABLE IF NOT EXISTS `app_devices` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `character_id` bigint(20) unsigned NOT NULL,
  `device_name` varchar(100) NOT NULL,
  `device_identifier` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_active_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `device_identifier` (`device_identifier`),
  KEY `idx_app_devices_character_id` (`character_id`),
  CONSTRAINT `fk_app_devices_character` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 vitacore.app_devices:~1 rows (대략적) 내보내기
INSERT INTO `app_devices` (`id`, `character_id`, `device_name`, `device_identifier`, `created_at`, `updated_at`, `last_active_at`, `is_active`) VALUES
	(1, 2, 'iPhone', '8FAA35DE-BB2D-4771-A9BA-A90FCAB1D4BA', '2026-06-01 22:33:38', '2026-06-02 00:36:55', '2026-06-02 00:36:55', 1);

-- 테이블 vitacore.characters 구조 내보내기
DROP TABLE IF EXISTS `characters`;
CREATE TABLE IF NOT EXISTS `characters` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `age` int(10) unsigned NOT NULL,
  `gender` varchar(20) NOT NULL,
  `height` decimal(5,2) NOT NULL,
  `weight` decimal(5,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_characters_user_id` (`user_id`),
  CONSTRAINT `fk_characters_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_characters_gender` CHECK (`gender` in ('male','female','other'))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 vitacore.characters:~1 rows (대략적) 내보내기
INSERT INTO `characters` (`id`, `user_id`, `name`, `age`, `gender`, `height`, `weight`, `created_at`) VALUES
	(2, 1, 'Ko', 21, 'male', 170.00, 68.00, '2026-06-01 22:33:00');

-- 테이블 vitacore.connection_codes 구조 내보내기
DROP TABLE IF EXISTS `connection_codes`;
CREATE TABLE IF NOT EXISTS `connection_codes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `character_id` bigint(20) unsigned NOT NULL,
  `code` varchar(20) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_connection_codes_character_id` (`character_id`),
  KEY `idx_connection_codes_code` (`code`),
  CONSTRAINT `fk_connection_codes_character` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 vitacore.connection_codes:~15 rows (대략적) 내보내기
INSERT INTO `connection_codes` (`id`, `character_id`, `code`, `created_at`, `expires_at`, `used_at`, `is_used`) VALUES
	(5, 2, 'GDJR4PG2', '2026-06-01 22:33:08', '2026-06-01 22:38:08', '2026-06-01 22:33:38', 1),
	(6, 2, 'CPS95TN9', '2026-06-01 22:41:50', '2026-06-01 22:46:50', '2026-06-01 22:42:06', 1),
	(7, 2, '4F6UA1RF', '2026-06-01 22:48:04', '2026-06-01 22:53:04', '2026-06-01 22:48:21', 1),
	(8, 2, 'WQCTPNQO', '2026-06-01 23:06:50', '2026-06-01 23:11:50', '2026-06-01 23:07:05', 1),
	(9, 2, '9G9MVQ7U', '2026-06-01 23:14:54', '2026-06-01 23:19:54', '2026-06-01 23:15:16', 1),
	(10, 2, '7IP7TCMX', '2026-06-01 23:16:26', '2026-06-01 23:21:26', NULL, 0),
	(11, 2, 'BA8A8LGX', '2026-06-01 23:26:20', '2026-06-01 23:27:05', NULL, 0),
	(12, 2, 'J0BE5TKA', '2026-06-01 23:27:05', '2026-06-01 23:27:52', NULL, 0),
	(13, 2, '4ZS0LU6K', '2026-06-01 23:27:52', '2026-06-01 23:32:52', NULL, 0),
	(14, 2, '50ANUW9N', '2026-06-01 23:38:33', '2026-06-01 23:43:33', '2026-06-01 23:38:58', 1),
	(15, 2, 'MPAN7YV9', '2026-06-01 23:39:20', '2026-06-01 23:39:27', NULL, 0),
	(16, 2, 'RN3KJA8J', '2026-06-01 23:39:27', '2026-06-01 23:39:40', NULL, 0),
	(17, 2, '502OJ8UP', '2026-06-01 23:39:40', '2026-06-01 23:44:40', NULL, 0),
	(18, 2, '4ITFC4XX', '2026-06-02 00:17:10', '2026-06-02 00:22:10', NULL, 0),
	(19, 2, 'DT9H5BNQ', '2026-06-02 00:36:33', '2026-06-02 00:41:33', '2026-06-02 00:36:54', 1);

-- 테이블 vitacore.email_verification_tokens 구조 내보내기
DROP TABLE IF EXISTS `email_verification_tokens`;
CREATE TABLE IF NOT EXISTS `email_verification_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 vitacore.email_verification_tokens:~1 rows (대략적) 내보내기
INSERT INTO `email_verification_tokens` (`id`, `email`, `token_hash`, `expires_at`, `verified_at`, `created_at`) VALUES
	(2, 'erwwfsasd', '$2b$10$VZc7XUEP/99PjeolH/Kn7.iSVC.Wso98N3t1y29V2ix8Uxz3cRZWm', '2026-06-01 03:45:04', NULL, '2026-06-01 03:40:04');

-- 테이블 vitacore.measurements 구조 내보내기
DROP TABLE IF EXISTS `measurements`;
CREATE TABLE IF NOT EXISTS `measurements` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `character_id` bigint(20) unsigned NOT NULL,
  `vital_type_id` bigint(20) unsigned NOT NULL,
  `app_device_id` bigint(20) unsigned DEFAULT NULL,
  `original_measurement_id` bigint(20) unsigned DEFAULT NULL,
  `value` float NOT NULL,
  `measured_at` datetime NOT NULL,
  `source_type` enum('device','simulation','manual') NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_measurements_character_id` (`character_id`),
  KEY `idx_measurements_vital_type_id` (`vital_type_id`),
  KEY `idx_measurements_app_device_id` (`app_device_id`),
  KEY `idx_measurements_original_measurement_id` (`original_measurement_id`),
  KEY `idx_measurements_measured_at` (`measured_at`),
  CONSTRAINT `fk_measurements_app_device` FOREIGN KEY (`app_device_id`) REFERENCES `app_devices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_measurements_character` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_measurements_original` FOREIGN KEY (`original_measurement_id`) REFERENCES `measurements` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_measurements_vital_type` FOREIGN KEY (`vital_type_id`) REFERENCES `vital_types` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=139 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 vitacore.measurements:~91 rows (대략적) 내보내기
INSERT INTO `measurements` (`id`, `character_id`, `vital_type_id`, `app_device_id`, `original_measurement_id`, `value`, `measured_at`, `source_type`, `created_at`) VALUES
	(1, 2, 1, 1, NULL, 113, '2026-06-01 22:48:32', 'device', '2026-06-01 22:48:32'),
	(2, 2, 2, 1, NULL, 96, '2026-06-01 22:48:32', 'device', '2026-06-01 22:48:32'),
	(3, 2, 1, 1, NULL, 113, '2026-06-01 22:48:39', 'device', '2026-06-01 22:48:39'),
	(4, 2, 2, 1, NULL, 96, '2026-06-01 22:48:39', 'device', '2026-06-01 22:48:39'),
	(5, 2, 1, 1, NULL, 90, '2026-06-01 23:07:13', 'device', '2026-06-01 23:07:13'),
	(6, 2, 2, 1, NULL, 96, '2026-06-01 23:07:13', 'device', '2026-06-01 23:07:13'),
	(7, 2, 1, 1, NULL, 90, '2026-06-01 23:15:20', 'device', '2026-06-01 23:15:20'),
	(8, 2, 2, 1, NULL, 96, '2026-06-01 23:15:20', 'device', '2026-06-01 23:15:20'),
	(9, 2, 1, 1, NULL, 90, '2026-06-01 23:15:22', 'device', '2026-06-01 23:15:22'),
	(10, 2, 2, 1, NULL, 96, '2026-06-01 23:15:22', 'device', '2026-06-01 23:15:22'),
	(11, 2, 1, 1, NULL, 90, '2026-06-01 23:39:00', 'device', '2026-06-01 23:39:00'),
	(12, 2, 2, 1, NULL, 96, '2026-06-01 23:39:00', 'device', '2026-06-01 23:39:00'),
	(13, 2, 1, 1, NULL, 90, '2026-06-01 23:39:18', 'device', '2026-06-01 23:39:18'),
	(14, 2, 2, 1, NULL, 96, '2026-06-01 23:39:18', 'device', '2026-06-01 23:39:18'),
	(15, 2, 1, 1, NULL, 90, '2026-06-01 23:39:24', 'device', '2026-06-01 23:39:24'),
	(16, 2, 2, 1, NULL, 96, '2026-06-01 23:39:24', 'device', '2026-06-01 23:39:24'),
	(17, 2, 1, NULL, NULL, 75, '2026-06-02 00:32:44', 'manual', '2026-06-02 00:32:44'),
	(18, 2, 2, NULL, NULL, 98, '2026-06-02 00:32:44', 'manual', '2026-06-02 00:32:44'),
	(19, 2, 4, NULL, NULL, 118, '2026-06-02 00:32:44', 'manual', '2026-06-02 00:32:44'),
	(20, 2, 3, NULL, NULL, 16, '2026-06-02 00:32:44', 'manual', '2026-06-02 00:32:44'),
	(21, 2, 5, NULL, NULL, 76, '2026-06-02 00:32:44', 'manual', '2026-06-02 00:32:44'),
	(22, 2, 8, NULL, NULL, 36.7, '2026-06-02 00:32:44', 'manual', '2026-06-02 00:32:44'),
	(23, 2, 4, NULL, NULL, 40, '2026-06-02 00:33:15', 'manual', '2026-06-02 00:33:15'),
	(24, 2, 5, NULL, NULL, 97, '2026-06-02 00:33:15', 'manual', '2026-06-02 00:33:15'),
	(25, 2, 3, NULL, NULL, 22, '2026-06-02 00:33:15', 'manual', '2026-06-02 00:33:15'),
	(26, 2, 1, NULL, NULL, 117, '2026-06-02 00:33:15', 'manual', '2026-06-02 00:33:15'),
	(27, 2, 2, NULL, NULL, 95, '2026-06-02 00:33:15', 'manual', '2026-06-02 00:33:15'),
	(28, 2, 8, NULL, NULL, 36.1, '2026-06-02 00:33:15', 'manual', '2026-06-02 00:33:15'),
	(29, 2, 1, NULL, NULL, 99, '2026-06-02 00:33:28', 'manual', '2026-06-02 00:33:28'),
	(30, 2, 4, NULL, NULL, 121, '2026-06-02 00:33:28', 'manual', '2026-06-02 00:33:28'),
	(31, 2, 5, NULL, NULL, 52, '2026-06-02 00:33:28', 'manual', '2026-06-02 00:33:28'),
	(32, 2, 3, NULL, NULL, 22, '2026-06-02 00:33:28', 'manual', '2026-06-02 00:33:28'),
	(33, 2, 2, NULL, NULL, 95, '2026-06-02 00:33:28', 'manual', '2026-06-02 00:33:28'),
	(34, 2, 8, NULL, NULL, 36.1, '2026-06-02 00:33:28', 'manual', '2026-06-02 00:33:28'),
	(35, 2, 1, NULL, NULL, 75, '2026-06-02 00:35:09', 'simulation', '2026-06-02 00:35:09'),
	(36, 2, 2, NULL, NULL, 98, '2026-06-02 00:35:09', 'simulation', '2026-06-02 00:35:09'),
	(37, 2, 3, NULL, NULL, 16, '2026-06-02 00:35:09', 'simulation', '2026-06-02 00:35:09'),
	(38, 2, 4, NULL, NULL, 118, '2026-06-02 00:35:09', 'simulation', '2026-06-02 00:35:09'),
	(39, 2, 5, NULL, NULL, 76, '2026-06-02 00:35:09', 'simulation', '2026-06-02 00:35:09'),
	(40, 2, 8, NULL, NULL, 36.7, '2026-06-02 00:35:09', 'simulation', '2026-06-02 00:35:09'),
	(41, 2, 1, NULL, NULL, 105, '2026-06-02 00:35:28', 'simulation', '2026-06-02 00:35:28'),
	(42, 2, 4, NULL, NULL, 133, '2026-06-02 00:35:28', 'simulation', '2026-06-02 00:35:28'),
	(43, 2, 5, NULL, NULL, 82, '2026-06-02 00:35:28', 'simulation', '2026-06-02 00:35:28'),
	(44, 2, 3, NULL, NULL, 25, '2026-06-02 00:35:28', 'simulation', '2026-06-02 00:35:28'),
	(45, 2, 2, NULL, NULL, 98, '2026-06-02 00:35:28', 'simulation', '2026-06-02 00:35:28'),
	(46, 2, 8, NULL, NULL, 37.9, '2026-06-02 00:35:28', 'simulation', '2026-06-02 00:35:28'),
	(47, 2, 1, NULL, NULL, 115, '2026-06-02 00:35:40', 'simulation', '2026-06-02 00:35:40'),
	(48, 2, 4, NULL, NULL, 138, '2026-06-02 00:35:40', 'simulation', '2026-06-02 00:35:40'),
	(49, 2, 5, NULL, NULL, 84, '2026-06-02 00:35:40', 'simulation', '2026-06-02 00:35:40'),
	(50, 2, 3, NULL, NULL, 28, '2026-06-02 00:35:40', 'simulation', '2026-06-02 00:35:40'),
	(51, 2, 2, NULL, NULL, 98, '2026-06-02 00:35:40', 'simulation', '2026-06-02 00:35:40'),
	(52, 2, 8, NULL, NULL, 38.3, '2026-06-02 00:35:40', 'simulation', '2026-06-02 00:35:40'),
	(53, 2, 1, NULL, NULL, 125, '2026-06-02 00:35:44', 'simulation', '2026-06-02 00:35:44'),
	(54, 2, 4, NULL, NULL, 143, '2026-06-02 00:35:44', 'simulation', '2026-06-02 00:35:44'),
	(55, 2, 5, NULL, NULL, 86, '2026-06-02 00:35:44', 'simulation', '2026-06-02 00:35:44'),
	(56, 2, 3, NULL, NULL, 31, '2026-06-02 00:35:44', 'simulation', '2026-06-02 00:35:44'),
	(57, 2, 2, NULL, NULL, 98, '2026-06-02 00:35:44', 'simulation', '2026-06-02 00:35:44'),
	(58, 2, 8, NULL, NULL, 38.7, '2026-06-02 00:35:44', 'simulation', '2026-06-02 00:35:44'),
	(59, 2, 1, NULL, NULL, 135, '2026-06-02 00:35:48', 'simulation', '2026-06-02 00:35:48'),
	(60, 2, 4, NULL, NULL, 148, '2026-06-02 00:35:48', 'simulation', '2026-06-02 00:35:48'),
	(61, 2, 5, NULL, NULL, 88, '2026-06-02 00:35:48', 'simulation', '2026-06-02 00:35:48'),
	(62, 2, 3, NULL, NULL, 34, '2026-06-02 00:35:48', 'simulation', '2026-06-02 00:35:48'),
	(63, 2, 2, NULL, NULL, 98, '2026-06-02 00:35:48', 'simulation', '2026-06-02 00:35:48'),
	(64, 2, 8, NULL, NULL, 39.1, '2026-06-02 00:35:48', 'simulation', '2026-06-02 00:35:48'),
	(65, 2, 1, NULL, NULL, 145, '2026-06-02 00:35:53', 'simulation', '2026-06-02 00:35:53'),
	(66, 2, 4, NULL, NULL, 153, '2026-06-02 00:35:53', 'simulation', '2026-06-02 00:35:53'),
	(67, 2, 5, NULL, NULL, 90, '2026-06-02 00:35:53', 'simulation', '2026-06-02 00:35:53'),
	(68, 2, 3, NULL, NULL, 37, '2026-06-02 00:35:53', 'simulation', '2026-06-02 00:35:53'),
	(69, 2, 2, NULL, NULL, 98, '2026-06-02 00:35:53', 'simulation', '2026-06-02 00:35:53'),
	(70, 2, 8, NULL, NULL, 39.5, '2026-06-02 00:35:53', 'simulation', '2026-06-02 00:35:53'),
	(71, 2, 1, NULL, NULL, 155, '2026-06-02 00:35:59', 'simulation', '2026-06-02 00:35:59'),
	(72, 2, 4, NULL, NULL, 158, '2026-06-02 00:35:59', 'simulation', '2026-06-02 00:35:59'),
	(73, 2, 5, NULL, NULL, 92, '2026-06-02 00:35:59', 'simulation', '2026-06-02 00:35:59'),
	(74, 2, 3, NULL, NULL, 40, '2026-06-02 00:35:59', 'simulation', '2026-06-02 00:35:59'),
	(75, 2, 2, NULL, NULL, 98, '2026-06-02 00:35:59', 'simulation', '2026-06-02 00:35:59'),
	(76, 2, 8, NULL, NULL, 39.9, '2026-06-02 00:35:59', 'simulation', '2026-06-02 00:35:59'),
	(77, 2, 1, NULL, NULL, 134, '2026-06-02 00:36:15', 'simulation', '2026-06-02 00:36:15'),
	(78, 2, 4, NULL, NULL, 167, '2026-06-02 00:36:15', 'simulation', '2026-06-02 00:36:15'),
	(79, 2, 5, NULL, NULL, 98, '2026-06-02 00:36:15', 'simulation', '2026-06-02 00:36:15'),
	(80, 2, 3, NULL, NULL, 37, '2026-06-02 00:36:15', 'simulation', '2026-06-02 00:36:15'),
	(81, 2, 2, NULL, NULL, 98, '2026-06-02 00:36:15', 'simulation', '2026-06-02 00:36:15'),
	(82, 2, 8, NULL, NULL, 37.8, '2026-06-02 00:36:15', 'simulation', '2026-06-02 00:36:15'),
	(83, 2, 1, NULL, NULL, 113, '2026-06-02 00:36:23', 'simulation', '2026-06-02 00:36:23'),
	(84, 2, 4, NULL, NULL, 176, '2026-06-02 00:36:23', 'simulation', '2026-06-02 00:36:23'),
	(85, 2, 5, NULL, NULL, 104, '2026-06-02 00:36:23', 'simulation', '2026-06-02 00:36:23'),
	(86, 2, 3, NULL, NULL, 34, '2026-06-02 00:36:23', 'simulation', '2026-06-02 00:36:23'),
	(87, 2, 2, NULL, NULL, 98, '2026-06-02 00:36:23', 'simulation', '2026-06-02 00:36:23'),
	(88, 2, 8, NULL, NULL, 35.7, '2026-06-02 00:36:23', 'simulation', '2026-06-02 00:36:23'),
	(89, 2, 1, 1, NULL, 90, '2026-06-02 00:36:55', 'device', '2026-06-02 00:36:55'),
	(90, 2, 2, 1, NULL, 96, '2026-06-02 00:36:55', 'device', '2026-06-02 00:36:55'),
	(91, 2, 3, 1, NULL, 34, '2026-06-02 00:36:55', 'simulation', '2026-06-02 00:36:55');

-- 테이블 vitacore.security_event_archives 구조 내보내기
DROP TABLE IF EXISTS `security_event_archives`;
CREATE TABLE IF NOT EXISTS `security_event_archives` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `type` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` bigint(20) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_security_events_user_id` (`user_id`),
  KEY `idx_security_events_type` (`type`),
  KEY `idx_security_type` (`type`),
  KEY `idx_security_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 vitacore.security_event_archives:~0 rows (대략적) 내보내기

-- 테이블 vitacore.security_events 구조 내보내기
DROP TABLE IF EXISTS `security_events`;
CREATE TABLE IF NOT EXISTS `security_events` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `type` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` bigint(20) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_security_events_user_id` (`user_id`),
  KEY `idx_security_events_type` (`type`),
  KEY `idx_security_type` (`type`),
  KEY `idx_security_user` (`user_id`),
  CONSTRAINT `fk_security_events_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=204 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 vitacore.security_events:~163 rows (대략적) 내보내기
INSERT INTO `security_events` (`id`, `user_id`, `type`, `description`, `created_at`, `target_type`, `target_id`, `ip_address`) VALUES
	(1, NULL, 'REQUEST_VERIFICATION_SUCCESS', '인증 코드 발송 성공: asdfg041231@naver.com', '2026-06-01 01:07:03', NULL, NULL, NULL),
	(2, NULL, 'SIGNUP_FAILED_EMAIL_NOT_VERIFIED', '이메일 인증 없이 회원가입 시도: asdfg041231@naver.com', '2026-06-01 01:07:25', NULL, NULL, NULL),
	(3, NULL, 'VERIFY_EMAIL_SUCCESS', '이메일 인증 완료: asdfg041231@naver.com', '2026-06-01 01:07:26', NULL, NULL, NULL),
	(4, 1, 'SIGNUP_SUCCESS', '회원가입 성공: asdfg041231@naver.com', '2026-06-01 01:07:27', NULL, NULL, NULL),
	(5, 1, 'LOGIN_SUCCESS', '로그인 성공', '2026-06-01 01:07:39', NULL, NULL, NULL),
	(6, 1, 'CHARACTER_CREATED', '캐릭터 생성: 김담영', '2026-06-01 01:09:59', NULL, NULL, NULL),
	(7, 1, 'CONNECTION_CODE_CREATED', 'character_id=1, code=MAST86BY, expires_at=2026-05-31T16:16:26.807Z', '2026-06-01 01:11:26', NULL, NULL, NULL),
	(8, 1, 'LOGIN_SUCCESS', '로그인 성공', '2026-06-01 02:01:12', NULL, NULL, NULL),
	(9, 1, 'LOGIN_SUCCESS', '로그인 성공', '2026-06-01 02:04:22', NULL, NULL, NULL),
	(10, 1, 'CONNECTION_CODE_CREATED', 'character_id=1, code=QY577HEH, expires_at=2026-05-31T17:45:34.534Z', '2026-06-01 02:40:34', NULL, NULL, NULL),
	(11, 1, 'LOGIN_SUCCESS', '로그인 성공', '2026-06-01 03:07:41', NULL, NULL, NULL),
	(12, 1, 'LOGIN_SUCCESS', '로그인 성공', '2026-06-01 03:36:35', NULL, NULL, NULL),
	(13, NULL, 'REQUEST_VERIFICATION_EMAIL_SEND_FAILED', '인증 코드 메일 발송 실패: erwwfsasd', '2026-06-01 03:40:05', NULL, NULL, NULL),
	(14, NULL, 'LOGIN_FAILED_USER_NOT_FOUND', '존재하지 않는 이메일 로그인 시도: asaa2@123', '2026-06-01 03:40:18', NULL, NULL, NULL),
	(15, 1, 'LOGIN_SUCCESS', '로그인 성공', '2026-06-01 03:40:26', NULL, NULL, NULL),
	(16, 1, 'CONNECTION_CODE_CREATED', 'character_id=1, code=3JFE8YP0, expires_at=2026-05-31T18:46:34.712Z', '2026-06-01 03:41:34', NULL, NULL, NULL),
	(17, 1, 'CONNECTION_CODE_CREATED', 'character_id=1, code=U9JWE2VZ, expires_at=2026-05-31T18:46:44.377Z', '2026-06-01 03:41:44', NULL, NULL, NULL),
	(18, 1, 'CHARACTER_DELETED', '캐릭터 삭제: 김담영', '2026-06-01 03:48:12', NULL, NULL, NULL),
	(19, 1, 'LOGIN_SUCCESS', '로그인 성공', '2026-06-01 22:32:41', 'user', 1, '::1'),
	(20, 1, 'CHARACTER_CREATED', '캐릭터 생성: Ko', '2026-06-01 22:33:00', 'character', 2, '::1'),
	(21, 1, 'CONNECTION_CODE_CREATED', '연결 코드가 생성되었습니다.', '2026-06-01 22:33:08', 'character', 2, '::1'),
	(22, NULL, 'CONNECTION_CODE_VERIFY_FAILED_INVALID', '유효하지 않은 연결 코드 검증 시도', '2026-06-01 22:33:23', NULL, NULL, '::ffff:192.168.45.253'),
	(23, 1, 'CONNECTION_CODE_USED', '연결 코드가 사용되었습니다.', '2026-06-01 22:33:38', 'character', 2, '::ffff:192.168.45.253'),
	(24, 1, 'DEVICE_CONNECTED', '기기가 연결되었습니다.', '2026-06-01 22:33:38', 'character', 2, '::ffff:192.168.45.253'),
	(25, 1, 'CONNECTION_CODE_CREATED', '연결 코드가 생성되었습니다.', '2026-06-01 22:41:50', 'character', 2, '::1'),
	(26, 1, 'CONNECTION_CODE_USED', '연결 코드가 사용되었습니다.', '2026-06-01 22:42:06', 'character', 2, '::ffff:192.168.45.253'),
	(27, 1, 'DEVICE_CONNECTED', '기기가 연결되었습니다.', '2026-06-01 22:42:06', 'character', 2, '::ffff:192.168.45.253'),
	(28, 1, 'CONNECTION_CODE_CREATED', '연결 코드가 생성되었습니다.', '2026-06-01 22:48:04', 'character', 2, '::1'),
	(29, 1, 'CONNECTION_CODE_USED', '연결 코드가 사용되었습니다.', '2026-06-01 22:48:22', 'character', 2, '::ffff:192.168.45.253'),
	(30, 1, 'DEVICE_CONNECTED', '기기가 연결되었습니다.', '2026-06-01 22:48:22', 'character', 2, '::ffff:192.168.45.253'),
	(31, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=HR, value=113', '2026-06-01 22:48:32', 'measurement', 1, '::ffff:192.168.45.253'),
	(32, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=SPO2, value=96', '2026-06-01 22:48:32', 'measurement', 2, '::ffff:192.168.45.253'),
	(33, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=HR, value=113', '2026-06-01 22:48:39', 'measurement', 3, '::ffff:192.168.45.253'),
	(34, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=SPO2, value=96', '2026-06-01 22:48:39', 'measurement', 4, '::ffff:192.168.45.253'),
	(35, NULL, 'CONNECTION_CODE_VERIFY_FAILED_INVALID', '유효하지 않은 연결 코드 검증 시도', '2026-06-01 23:06:31', NULL, NULL, '::ffff:192.168.45.253'),
	(36, 1, 'CONNECTION_CODE_CREATED', '연결 코드가 생성되었습니다.', '2026-06-01 23:06:50', 'character', 2, '::1'),
	(37, NULL, 'CONNECTION_CODE_VERIFY_FAILED_INVALID', '유효하지 않은 연결 코드 검증 시도', '2026-06-01 23:07:01', NULL, NULL, '::ffff:192.168.45.253'),
	(38, 1, 'CONNECTION_CODE_USED', '연결 코드가 사용되었습니다.', '2026-06-01 23:07:05', 'character', 2, '::ffff:192.168.45.253'),
	(39, 1, 'DEVICE_CONNECTED', '기기가 연결되었습니다.', '2026-06-01 23:07:05', 'character', 2, '::ffff:192.168.45.253'),
	(40, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=HR, value=90', '2026-06-01 23:07:13', 'measurement', 5, '::ffff:192.168.45.253'),
	(41, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=SPO2, value=96', '2026-06-01 23:07:13', 'measurement', 6, '::ffff:192.168.45.253'),
	(42, 1, 'CONNECTION_CODE_CREATED', '연결 코드가 생성되었습니다.', '2026-06-01 23:14:54', 'character', 2, '::1'),
	(43, NULL, 'CONNECTION_CODE_VERIFY_FAILED_INVALID', '유효하지 않은 연결 코드 검증 시도', '2026-06-01 23:15:11', NULL, NULL, '::ffff:192.168.45.253'),
	(44, 1, 'CONNECTION_CODE_USED', '연결 코드가 사용되었습니다.', '2026-06-01 23:15:16', 'character', 2, '::ffff:192.168.45.253'),
	(45, 1, 'DEVICE_CONNECTED', '기기가 연결되었습니다.', '2026-06-01 23:15:16', 'character', 2, '::ffff:192.168.45.253'),
	(46, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=HR, value=90', '2026-06-01 23:15:20', 'measurement', 7, '::ffff:192.168.45.253'),
	(47, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=SPO2, value=96', '2026-06-01 23:15:20', 'measurement', 8, '::ffff:192.168.45.253'),
	(48, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=HR, value=90', '2026-06-01 23:15:22', 'measurement', 9, '::ffff:192.168.45.253'),
	(49, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=SPO2, value=96', '2026-06-01 23:15:22', 'measurement', 10, '::ffff:192.168.45.253'),
	(50, 1, 'CONNECTION_CODE_CREATED', '연결 코드가 생성되었습니다.', '2026-06-01 23:16:26', 'character', 2, '::1'),
	(51, 1, 'MANUAL_VITAL_UPDATED', 'SpO2 수동 입력값이 98으로 변경되었습니다.', '2026-06-01 23:16:35', 'character', 2, '::1'),
	(52, 1, 'MANUAL_VITAL_UPDATED', 'HR 수동 입력값이 75으로 변경되었습니다.', '2026-06-01 23:16:41', 'character', 2, '::1'),
	(53, 1, 'CONNECTION_CODE_CREATED', '연결 코드가 생성되었습니다.', '2026-06-01 23:26:20', 'character', 2, '::1'),
	(54, 1, 'CONNECTION_CODE_CREATED', '연결 코드가 생성되었습니다.', '2026-06-01 23:27:05', 'character', 2, '::1'),
	(55, 1, 'CONNECTION_CODE_CREATED', '연결 코드가 생성되었습니다.', '2026-06-01 23:27:52', 'character', 2, '::1'),
	(56, 1, 'LOGIN_SUCCESS', '로그인 성공', '2026-06-01 23:38:17', 'user', 1, '::1'),
	(57, 1, 'CONNECTION_CODE_CREATED', '연결 코드가 생성되었습니다.', '2026-06-01 23:38:33', 'character', 2, '::1'),
	(58, 1, 'CONNECTION_CODE_USED', '연결 코드가 사용되었습니다.', '2026-06-01 23:38:58', 'character', 2, '::ffff:192.168.45.253'),
	(59, 1, 'DEVICE_CONNECTED', '기기가 연결되었습니다.', '2026-06-01 23:38:58', 'character', 2, '::ffff:192.168.45.253'),
	(60, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=HR, value=90', '2026-06-01 23:39:00', 'measurement', 11, '::ffff:192.168.45.253'),
	(61, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=SPO2, value=96', '2026-06-01 23:39:00', 'measurement', 12, '::ffff:192.168.45.253'),
	(62, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=HR, value=90', '2026-06-01 23:39:18', 'measurement', 13, '::ffff:192.168.45.253'),
	(63, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=SPO2, value=96', '2026-06-01 23:39:18', 'measurement', 14, '::ffff:192.168.45.253'),
	(64, 1, 'CONNECTION_CODE_CREATED', '연결 코드가 생성되었습니다.', '2026-06-01 23:39:20', 'character', 2, '::1'),
	(65, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=HR, value=90', '2026-06-01 23:39:24', 'measurement', 15, '::ffff:192.168.45.253'),
	(66, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=SPO2, value=96', '2026-06-01 23:39:24', 'measurement', 16, '::ffff:192.168.45.253'),
	(67, 1, 'CONNECTION_CODE_CREATED', '연결 코드가 생성되었습니다.', '2026-06-01 23:39:27', 'character', 2, '::1'),
	(68, 1, 'CONNECTION_CODE_CREATED', '연결 코드가 생성되었습니다.', '2026-06-01 23:39:40', 'character', 2, '::1'),
	(69, 1, 'CONNECTION_CODE_CREATED', '연결 코드가 생성되었습니다.', '2026-06-02 00:17:10', 'character', 2, '::1'),
	(70, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=HR, value=75, reason=vital page DEFAULT', '2026-06-02 00:32:44', 'measurement', 17, '::1'),
	(71, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=SPO2, value=98, reason=vital page DEFAULT', '2026-06-02 00:32:44', 'measurement', 18, '::1'),
	(72, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=SBP, value=118, reason=vital page DEFAULT', '2026-06-02 00:32:44', 'measurement', 19, '::1'),
	(73, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=RR, value=16, reason=vital page DEFAULT', '2026-06-02 00:32:44', 'measurement', 20, '::1'),
	(74, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=DBP, value=76, reason=vital page DEFAULT', '2026-06-02 00:32:44', 'measurement', 21, '::1'),
	(75, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=TEMP, value=36.7, reason=vital page DEFAULT', '2026-06-02 00:32:44', 'measurement', 22, '::1'),
	(76, 1, 'ANOMALY_DETECTED', '[WARNING] 캐릭터가 생존하기 어려운 상태입니다. 즉시 조치를 취해 주세요.', '2026-06-02 00:33:15', 'character', 2, '::1'),
	(77, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=SBP, value=40, reason=APPLY_BLEEDING', '2026-06-02 00:33:15', 'measurement', 23, '::1'),
	(78, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=DBP, value=97, reason=APPLY_BLEEDING', '2026-06-02 00:33:15', 'measurement', 24, '::1'),
	(79, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=RR, value=22, reason=APPLY_BLEEDING', '2026-06-02 00:33:15', 'measurement', 25, '::1'),
	(80, 1, 'ANOMALY_DETECTED', '위험 SBP 감지: SBP=40', '2026-06-02 00:33:15', 'measurement', 23, '::1'),
	(81, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=HR, value=117, reason=APPLY_BLEEDING', '2026-06-02 00:33:15', 'measurement', 26, '::1'),
	(82, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=SPO2, value=95, reason=APPLY_BLEEDING', '2026-06-02 00:33:15', 'measurement', 27, '::1'),
	(83, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=TEMP, value=36.1, reason=APPLY_BLEEDING', '2026-06-02 00:33:15', 'measurement', 28, '::1'),
	(84, 1, 'COMMAND_APPLIED', 'APPLY_BLEEDING 적용', '2026-06-02 00:33:15', 'character', 2, '::1'),
	(85, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=HR, value=99, reason=APPLY_FLUID', '2026-06-02 00:33:28', 'measurement', 29, '::1'),
	(86, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=SBP, value=121, reason=APPLY_FLUID', '2026-06-02 00:33:28', 'measurement', 30, '::1'),
	(87, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=DBP, value=52, reason=APPLY_FLUID', '2026-06-02 00:33:28', 'measurement', 31, '::1'),
	(88, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=RR, value=22, reason=APPLY_FLUID', '2026-06-02 00:33:28', 'measurement', 32, '::1'),
	(89, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=TEMP, value=36.1, reason=APPLY_FLUID', '2026-06-02 00:33:28', 'measurement', 34, '::1'),
	(90, 1, 'MANUAL_VITAL_UPDATED', '수동 바이탈 입력값이 저장되었습니다. vital_type=SPO2, value=95, reason=APPLY_FLUID', '2026-06-02 00:33:28', 'measurement', 33, '::1'),
	(91, 1, 'COMMAND_APPLIED', 'APPLY_FLUID 적용', '2026-06-02 00:33:28', 'character', 2, '::1'),
	(92, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=HR, value=75, reason=vital page DEFAULT', '2026-06-02 00:35:09', 'measurement', 35, '::1'),
	(93, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SPO2, value=98, reason=vital page DEFAULT', '2026-06-02 00:35:09', 'measurement', 36, '::1'),
	(94, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SBP, value=118, reason=vital page DEFAULT', '2026-06-02 00:35:09', 'measurement', 38, '::1'),
	(95, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=DBP, value=76, reason=vital page DEFAULT', '2026-06-02 00:35:09', 'measurement', 39, '::1'),
	(96, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=RR, value=16, reason=vital page DEFAULT', '2026-06-02 00:35:09', 'measurement', 37, '::1'),
	(97, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=TEMP, value=36.7, reason=vital page DEFAULT', '2026-06-02 00:35:09', 'measurement', 40, '::1'),
	(98, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=DBP, value=82, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:28', 'measurement', 43, '::1'),
	(99, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SBP, value=133, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:28', 'measurement', 42, '::1'),
	(100, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SPO2, value=98, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:28', 'measurement', 45, '::1'),
	(101, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=HR, value=105, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:28', 'measurement', 41, '::1'),
	(102, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=RR, value=25, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:28', 'measurement', 44, '::1'),
	(103, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=TEMP, value=37.9, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:28', 'measurement', 46, '::1'),
	(104, 1, 'COMMAND_APPLIED', 'APPLY_METABOLISM_UP 적용', '2026-06-02 00:35:28', 'character', 2, '::1'),
	(105, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=HR, value=115, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:40', 'measurement', 47, '::1'),
	(106, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=DBP, value=84, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:40', 'measurement', 49, '::1'),
	(107, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SBP, value=138, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:40', 'measurement', 48, '::1'),
	(108, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=RR, value=28, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:40', 'measurement', 50, '::1'),
	(109, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SPO2, value=98, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:40', 'measurement', 51, '::1'),
	(110, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=TEMP, value=38.3, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:40', 'measurement', 52, '::1'),
	(111, 1, 'COMMAND_APPLIED', 'APPLY_METABOLISM_UP 적용', '2026-06-02 00:35:40', 'character', 2, '::1'),
	(112, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=HR, value=125, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:44', 'measurement', 53, '::1'),
	(113, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=DBP, value=86, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:44', 'measurement', 55, '::1'),
	(114, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SBP, value=143, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:44', 'measurement', 54, '::1'),
	(115, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SPO2, value=98, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:44', 'measurement', 57, '::1'),
	(116, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=TEMP, value=38.7, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:44', 'measurement', 58, '::1'),
	(117, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=RR, value=31, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:44', 'measurement', 56, '::1'),
	(118, 1, 'COMMAND_APPLIED', 'APPLY_METABOLISM_UP 적용', '2026-06-02 00:35:44', 'character', 2, '::1'),
	(119, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=HR, value=135, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:48', 'measurement', 59, '::1'),
	(120, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=DBP, value=88, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:48', 'measurement', 61, '::1'),
	(121, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=RR, value=34, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:48', 'measurement', 62, '::1'),
	(122, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SBP, value=148, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:48', 'measurement', 60, '::1'),
	(123, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SPO2, value=98, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:48', 'measurement', 63, '::1'),
	(124, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=TEMP, value=39.1, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:48', 'measurement', 64, '::1'),
	(125, 1, 'COMMAND_APPLIED', 'APPLY_METABOLISM_UP 적용', '2026-06-02 00:35:48', 'character', 2, '::1'),
	(126, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=HR, value=145, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:53', 'measurement', 65, '::1'),
	(127, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SBP, value=153, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:53', 'measurement', 66, '::1'),
	(128, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=DBP, value=90, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:53', 'measurement', 67, '::1'),
	(129, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=RR, value=37, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:53', 'measurement', 68, '::1'),
	(130, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SPO2, value=98, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:53', 'measurement', 69, '::1'),
	(131, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=TEMP, value=39.5, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:53', 'measurement', 70, '::1'),
	(132, 1, 'COMMAND_APPLIED', 'APPLY_METABOLISM_UP 적용', '2026-06-02 00:35:53', 'character', 2, '::1'),
	(133, 1, 'ANOMALY_DETECTED', '[WARNING] 캐릭터가 생존하기 어려운 상태입니다. 즉시 조치를 취해 주세요.', '2026-06-02 00:35:59', 'character', 2, '::1'),
	(134, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SBP, value=158, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:59', 'measurement', 72, '::1'),
	(135, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=HR, value=155, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:59', 'measurement', 71, '::1'),
	(136, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=DBP, value=92, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:59', 'measurement', 73, '::1'),
	(137, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SPO2, value=98, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:59', 'measurement', 75, '::1'),
	(138, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=RR, value=40, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:59', 'measurement', 74, '::1'),
	(139, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=TEMP, value=39.9, reason=APPLY_METABOLISM_UP', '2026-06-02 00:35:59', 'measurement', 76, '::1'),
	(140, 1, 'ANOMALY_DETECTED', '위험 RR 감지: RR=40', '2026-06-02 00:35:59', 'measurement', 74, '::1'),
	(141, 1, 'COMMAND_APPLIED', 'APPLY_METABOLISM_UP 적용', '2026-06-02 00:35:59', 'character', 2, '::1'),
	(142, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SBP, value=167, reason=APPLY_COLD', '2026-06-02 00:36:15', 'measurement', 78, '::1'),
	(143, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=HR, value=134, reason=APPLY_COLD', '2026-06-02 00:36:15', 'measurement', 77, '::1'),
	(144, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=DBP, value=98, reason=APPLY_COLD', '2026-06-02 00:36:15', 'measurement', 79, '::1'),
	(145, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=RR, value=37, reason=APPLY_COLD', '2026-06-02 00:36:15', 'measurement', 80, '::1'),
	(146, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SPO2, value=98, reason=APPLY_COLD', '2026-06-02 00:36:15', 'measurement', 81, '::1'),
	(147, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=TEMP, value=37.8, reason=APPLY_COLD', '2026-06-02 00:36:15', 'measurement', 82, '::1'),
	(148, 1, 'COMMAND_APPLIED', 'APPLY_COLD 적용', '2026-06-02 00:36:15', 'character', 2, '::1'),
	(149, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=HR, value=113, reason=APPLY_COLD', '2026-06-02 00:36:23', 'measurement', 83, '::1'),
	(150, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SBP, value=176, reason=APPLY_COLD', '2026-06-02 00:36:23', 'measurement', 84, '::1'),
	(151, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=RR, value=34, reason=APPLY_COLD', '2026-06-02 00:36:23', 'measurement', 86, '::1'),
	(152, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=SPO2, value=98, reason=APPLY_COLD', '2026-06-02 00:36:23', 'measurement', 87, '::1'),
	(153, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=DBP, value=104, reason=APPLY_COLD', '2026-06-02 00:36:23', 'measurement', 85, '::1'),
	(154, 1, 'SIMULATION_VITAL_UPDATED', '시뮬레이션 바이탈 입력값이 저장되었습니다. vital_type=TEMP, value=35.7, reason=APPLY_COLD', '2026-06-02 00:36:23', 'measurement', 88, '::1'),
	(155, 1, 'COMMAND_APPLIED', 'APPLY_COLD 적용', '2026-06-02 00:36:23', 'character', 2, '::1'),
	(156, 1, 'CONNECTION_CODE_CREATED', '연결 코드가 생성되었습니다.', '2026-06-02 00:36:33', 'character', 2, '::1'),
	(157, 1, 'CONNECTION_CODE_USED', '연결 코드가 사용되었습니다.', '2026-06-02 00:36:54', 'character', 2, '::ffff:192.168.45.253'),
	(158, 1, 'DEVICE_CONNECTED', '기기가 연결되었습니다.', '2026-06-02 00:36:54', 'character', 2, '::ffff:192.168.45.253'),
	(159, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=HR, value=90', '2026-06-02 00:36:55', 'measurement', 89, '::ffff:192.168.45.253'),
	(160, 1, 'DEVICE_VITAL_UPDATED', '실측 바이탈 반영: characterId=2, vitalCode=HR, value=90, unit=bpm, source_type=device, device=iPhone, measured_at=2026-06-01T15:36:55.880Z, created_at=2026-06-01T15:36:55.889Z', '2026-06-02 00:36:55', 'character', 2, '::ffff:192.168.45.253'),
	(161, 1, 'MEASUREMENT_CREATED', '측정값이 저장되었습니다. vital_type=SPO2, value=96', '2026-06-02 00:36:55', 'measurement', 90, '::ffff:192.168.45.253'),
	(162, 1, 'DEVICE_VITAL_UPDATED', '실측 바이탈 반영: characterId=2, vitalCode=SPO2, value=96, unit=%, source_type=device, device=iPhone, measured_at=2026-06-01T15:36:55.902Z, created_at=2026-06-01T15:36:55.906Z', '2026-06-02 00:36:55', 'character', 2, '::ffff:192.168.45.253'),
	(163, 1, 'DERIVED_VITAL_UPDATED', 'SpO2 96% 기반으로 RR 34회/분 도출. characterId=2, vitalCode=RR, value=34, unit=breaths/min, source_type=simulation, device=iPhone, measured_at=2026-06-01T15:36:55.902Z, created_at=2026-06-01T15:36:55.910Z', '2026-06-02 00:36:55', 'character', 2, '::ffff:192.168.45.253');

-- 테이블 vitacore.users 구조 내보내기
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 vitacore.users:~1 rows (대략적) 내보내기
INSERT INTO `users` (`id`, `name`, `email`, `email_verified`, `password_hash`, `created_at`, `updated_at`, `last_login_at`, `is_active`) VALUES
	(1, '고은채', 'asdfg041231@naver.com', 1, '$2b$10$wbPhXxZi8xGt1nwJCMzZ4esAsHNSXE5gOpWVFydMSROaL/p9uMVwu', '2026-06-01 01:07:27', '2026-06-01 23:38:17', '2026-06-01 23:38:17', 1);

-- 테이블 vitacore.vital_types 구조 내보내기
DROP TABLE IF EXISTS `vital_types`;
CREATE TABLE IF NOT EXISTS `vital_types` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 vitacore.vital_types:~8 rows (대략적) 내보내기
INSERT INTO `vital_types` (`id`, `name`, `code`) VALUES
	(1, 'HR', 'HR'),
	(2, 'SpO2', 'SPO2'),
	(3, 'RR', 'RR'),
	(4, 'SBP', 'SBP'),
	(5, 'DBP', 'DBP'),
	(6, 'MAP', 'MAP'),
	(7, 'ECG', 'ECG'),
	(8, 'TEMP', 'TEMP');

-- 테이블 vitacore.wave_measurements 구조 내보내기
DROP TABLE IF EXISTS `wave_measurements`;
CREATE TABLE IF NOT EXISTS `wave_measurements` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `measurement_id` bigint(20) unsigned NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)),
  `measured_at` datetime NOT NULL,
  `sampling_rate` int(11) NOT NULL,
  `duration_seconds` decimal(6,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_wave_measurements_measurement_id` (`measurement_id`),
  CONSTRAINT `fk_wave_measurements_measurement` FOREIGN KEY (`measurement_id`) REFERENCES `measurements` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 테이블 데이터 vitacore.wave_measurements:~0 rows (대략적) 내보내기

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
