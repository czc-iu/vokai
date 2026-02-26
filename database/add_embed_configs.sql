-- 添加嵌入式配置表
USE `tomybot`;

CREATE TABLE IF NOT EXISTS `embed_configs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `api_key` VARCHAR(64) NOT NULL UNIQUE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `knowledge_base_enabled` BOOLEAN DEFAULT TRUE,
  `custom_prompt` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_embed_configs_api_key` (`api_key`),
  KEY `idx_embed_configs_user_id` (`user_id`),
  CONSTRAINT `fk_embed_configs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 为现有用户生成API Key（可选）
-- INSERT INTO `embed_configs` (`user_id`, `api_key`, `is_active`, `knowledge_base_enabled`)
-- SELECT id, MD5(CONCAT(id, '-', NOW(), '-', RAND())), TRUE, TRUE
-- FROM `users`
-- WHERE id NOT IN (SELECT user_id FROM `embed_configs`);
