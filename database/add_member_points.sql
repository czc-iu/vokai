-- 添加会员积分制度
USE `tomybot`;

-- 先添加token_balance列（如果不存在）
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'token_balance';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `users` ADD COLUMN `token_balance` BIGINT DEFAULT 0 COMMENT "Token余额" AFTER `company`'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加会员积分相关字段
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'points';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `users` ADD COLUMN `points` BIGINT DEFAULT 0 COMMENT "积分" AFTER `token_balance`'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'member_level';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `users` ADD COLUMN `member_level` TINYINT DEFAULT 0 COMMENT "会员等级：0=普通，1-6=L1-L6" AFTER `points`'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'total_recharged';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  'ALTER TABLE `users` ADD COLUMN `total_recharged` DECIMAL(10, 2) DEFAULT 0 COMMENT "累计充值金额" AFTER `member_level`'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 创建积分交易记录表
CREATE TABLE IF NOT EXISTS `point_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `type` ENUM('earn', 'redeem', 'adjust') NOT NULL,
  `amount` BIGINT NOT NULL COMMENT '变动数量（正数）',
  `balance_after` BIGINT NOT NULL COMMENT '变动后余额',
  `description` VARCHAR(255) DEFAULT NULL,
  `reference_type` VARCHAR(50) DEFAULT NULL COMMENT '关联类型：order, redeem, etc.',
  `reference_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_point_transactions_user_id` (`user_id`),
  KEY `idx_point_transactions_type` (`type`),
  KEY `idx_point_transactions_created_at` (`created_at`),
  CONSTRAINT `fk_point_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建并发限制表
CREATE TABLE IF NOT EXISTS `concurrent_sessions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `session_id` VARCHAR(64) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_concurrent_sessions_session` (`session_id`),
  KEY `idx_concurrent_sessions_user_expires` (`user_id`, `expires_at`),
  CONSTRAINT `fk_concurrent_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
