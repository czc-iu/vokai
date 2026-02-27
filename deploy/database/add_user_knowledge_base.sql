-- 添加用户知识库表
USE `tomybot`;

CREATE TABLE IF NOT EXISTS `user_documents` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `description` TEXT DEFAULT NULL,
  `is_indexed` BOOLEAN DEFAULT FALSE COMMENT '是否已索引到向量库',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_documents_user_id` (`user_id`),
  KEY `idx_user_documents_is_indexed` (`is_indexed`),
  CONSTRAINT `fk_user_documents_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
