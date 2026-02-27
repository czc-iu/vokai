-- TomyBot Database Schema
-- MySQL 8.0+

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `tomybot`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `tomybot`;

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `phone_verified` BOOLEAN DEFAULT FALSE,
  `avatar` VARCHAR(500) DEFAULT NULL,
  `company` VARCHAR(100) DEFAULT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `email_verified` BOOLEAN DEFAULT FALSE,
  `email_verified_at` DATETIME DEFAULT NULL,
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`),
  KEY `idx_users_phone` (`phone`),
  KEY `idx_users_status` (`status`),
  KEY `idx_users_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 对话会话表
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) DEFAULT '新对话',
  `model` VARCHAR(50) DEFAULT 'qwen-plus',
  `metadata` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversations_user_id` (`user_id`),
  KEY `idx_conversations_created_at` (`created_at`),
  CONSTRAINT `fk_conversations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 消息表
CREATE TABLE IF NOT EXISTS `messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `conversation_id` BIGINT UNSIGNED NOT NULL,
  `role` ENUM('user', 'assistant', 'system') NOT NULL,
  `content` TEXT NOT NULL,
  `tokens` INT UNSIGNED DEFAULT 0,
  `metadata` JSON DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_messages_conversation_id` (`conversation_id`),
  KEY `idx_messages_created_at` (`created_at`),
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 联系表单
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `company` VARCHAR(100) DEFAULT NULL,
  `subject` VARCHAR(255) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contacts_status` (`status`),
  KEY `idx_contacts_email` (`email`),
  KEY `idx_contacts_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户会话表 (用于JWT refresh token)
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `refresh_token` VARCHAR(500) NOT NULL,
  `user_agent` VARCHAR(500) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sessions_user_id` (`user_id`),
  KEY `idx_sessions_refresh_token` (`refresh_token`),
  KEY `idx_sessions_expires_at` (`expires_at`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 系统配置表
CREATE TABLE IF NOT EXISTS `system_config` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_config_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认配置
INSERT INTO `system_config` (`key`, `value`, `description`) VALUES
('site_name', 'TomyBot', '网站名称'),
('site_slogan', '让客服更智能，让服务更高效', '网站标语'),
('contact_email', 'info@sayco.com.cn', '联系邮箱'),
('company_name', '赛熠可信息技术（上海）有限公司', '公司名称');

-- 用户记忆表
CREATE TABLE IF NOT EXISTS `user_memories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `key` VARCHAR(100) NOT NULL,
  `value` TEXT NOT NULL,
  `source` ENUM('auto', 'manual') DEFAULT 'auto',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_memories_user_key` (`user_id`, `key`),
  CONSTRAINT `fk_memories_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MCP 服务表
CREATE TABLE IF NOT EXISTS `mcp_services` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `command` VARCHAR(255) NOT NULL,
  `args` JSON DEFAULT NULL,
  `env` JSON DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'error') DEFAULT 'active',
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_mcp_services_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认 MCP 服务
INSERT INTO `mcp_services` (`name`, `command`, `args`, `env`, `status`, `description`) VALUES
('web-search', 'node', '["/app/mcp-services/node_modules/.bin/mcp-web-search"]', '{}', 'active', '多引擎网页搜索服务 - 支持 DuckDuckGo、Bing、SearXNG，无需 API Key');

-- Skills 技能表
CREATE TABLE IF NOT EXISTS `skills` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `path` VARCHAR(500) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `enabled` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_skills_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 白名单命令表
CREATE TABLE IF NOT EXISTS `whitelisted_commands` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `command` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `enabled` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_whitelisted_commands_command` (`command`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认白名单命令
INSERT INTO `whitelisted_commands` (`command`, `description`) VALUES
('python3', 'Python 3 解释器'),
('node', 'Node.js 运行时'),
('date', '显示日期时间'),
('echo', '输出文本');

-- =====================================================
-- 电商功能表
-- =====================================================

-- Token 余额表
CREATE TABLE IF NOT EXISTS `token_balances` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `balance` BIGINT DEFAULT 0 COMMENT '当前余额（tokens）',
  `total_purchased` BIGINT DEFAULT 0 COMMENT '累计购买',
  `total_consumed` BIGINT DEFAULT 0 COMMENT '累计消耗',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_token_balances_user_id` (`user_id`),
  CONSTRAINT `fk_token_balances_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Token 交易记录表
CREATE TABLE IF NOT EXISTS `token_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `type` ENUM('purchase', 'consume', 'refund', 'gift') NOT NULL,
  `amount` BIGINT NOT NULL COMMENT '变动数量（正数增加，负数减少）',
  `balance_after` BIGINT NOT NULL COMMENT '变动后余额',
  `description` VARCHAR(255) DEFAULT NULL,
  `reference_type` VARCHAR(50) DEFAULT NULL COMMENT '关联类型：order, conversation, etc.',
  `reference_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_token_transactions_user_id` (`user_id`),
  KEY `idx_token_transactions_type` (`type`),
  KEY `idx_token_transactions_created_at` (`created_at`),
  CONSTRAINT `fk_token_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 服务套餐表
CREATE TABLE IF NOT EXISTS `services` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `tokens` BIGINT NOT NULL COMMENT '包含的token数量',
  `price` DECIMAL(10, 2) NOT NULL COMMENT '价格（元）',
  `original_price` DECIMAL(10, 2) DEFAULT NULL COMMENT '原价',
  `validity_days` INT DEFAULT NULL COMMENT '有效期（天），NULL表示永久',
  `features` JSON DEFAULT NULL COMMENT '套餐特性列表',
  `is_popular` BOOLEAN DEFAULT FALSE COMMENT '是否热门推荐',
  `is_active` BOOLEAN DEFAULT TRUE,
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_services_is_active` (`is_active`),
  KEY `idx_services_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认服务套餐
INSERT INTO `services` (`name`, `description`, `tokens`, `price`, `original_price`, `validity_days`, `features`, `is_popular`, `sort_order`) VALUES
('体验版', '适合个人用户试用', 10000, 9.90, 19.90, 30, '["1万tokens额度", "1个月有效期", "基础模型支持", "智能对话", "知识库查询", "标准响应速度"]', FALSE, 1),
('基础版', '适合轻度使用用户', 50000, 39.90, 59.90, 90, '["5万tokens额度", "3个月有效期", "全部模型支持", "优先响应", "智能对话", "知识库查询"]', FALSE, 2),
('专业版', '适合中度使用用户', 200000, 129.90, 199.90, 180, '["20万tokens额度", "6个月有效期", "全部模型支持", "优先响应", "专属客服", "高级功能解锁"]', TRUE, 3),
('企业版', '适合重度使用用户', 1000000, 499.90, 799.90, NULL, '["100万tokens额度", "永久有效", "全部模型支持", "最高优先级", "专属客服", "API接入"]', FALSE, 4);

-- 购物车表
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `service_id` BIGINT UNSIGNED NOT NULL,
  `quantity` INT DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_cart_items_user_service` (`user_id`, `service_id`),
  KEY `idx_cart_items_user_id` (`user_id`),
  CONSTRAINT `fk_cart_items_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(32) NOT NULL COMMENT '订单号',
  `user_id` BIGINT UNSIGNED NOT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL COMMENT '订单总金额',
  `total_tokens` BIGINT NOT NULL COMMENT '订单总tokens',
  `status` ENUM('pending', 'paid', 'cancelled', 'refunded') DEFAULT 'pending',
  `payment_method` VARCHAR(20) DEFAULT NULL COMMENT '支付方式',
  `paid_at` DATETIME DEFAULT NULL,
  `cancelled_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_orders_order_no` (`order_no`),
  KEY `idx_orders_user_id` (`user_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_created_at` (`created_at`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 订单明细表
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `service_id` BIGINT UNSIGNED NOT NULL,
  `service_name` VARCHAR(100) NOT NULL,
  `tokens` BIGINT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `quantity` INT DEFAULT 1,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order_id` (`order_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 支付记录表
CREATE TABLE IF NOT EXISTS `payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `payment_no` VARCHAR(64) NOT NULL COMMENT '支付流水号',
  `method` VARCHAR(20) NOT NULL COMMENT '支付方式：alipay, wechat, balance',
  `amount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  `transaction_id` VARCHAR(64) DEFAULT NULL COMMENT '第三方交易号',
  `paid_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_payments_payment_no` (`payment_no`),
  KEY `idx_payments_order_id` (`order_id`),
  KEY `idx_payments_user_id` (`user_id`),
  KEY `idx_payments_status` (`status`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 每日Token消耗统计表
CREATE TABLE IF NOT EXISTS `token_daily_stats` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `total_tokens` BIGINT DEFAULT 0 COMMENT '当日消耗总tokens',
  `conversation_count` INT DEFAULT 0 COMMENT '对话次数',
  `message_count` INT DEFAULT 0 COMMENT '消息数量',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_token_daily_stats_user_date` (`user_id`, `date`),
  KEY `idx_token_daily_stats_date` (`date`),
  CONSTRAINT `fk_token_daily_stats_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 分享消息表
CREATE TABLE IF NOT EXISTS `shared_messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `share_id` VARCHAR(20) NOT NULL COMMENT '分享ID',
  `message_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联消息ID',
  `content` TEXT NOT NULL COMMENT '分享内容',
  `view_count` INT DEFAULT 0 COMMENT '查看次数',
  `expires_at` DATETIME DEFAULT NULL COMMENT '过期时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_shared_messages_share_id` (`share_id`),
  KEY `idx_shared_messages_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 管理员表
CREATE TABLE IF NOT EXISTS `admins` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '关联用户ID',
  `role` ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin' COMMENT '角色',
  `permissions` JSON DEFAULT NULL COMMENT '权限列表',
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active' COMMENT '状态',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_admins_user_id` (`user_id`),
  KEY `idx_admins_role` (`role`),
  KEY `idx_admins_status` (`status`),
  CONSTRAINT `fk_admins_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认管理员（需要根据实际用户ID修改）
INSERT INTO `admins` (`user_id`, `role`, `permissions`, `status`) VALUES
(1, 'super_admin', '["all"]', 'active');

-- 管理员操作日志表
CREATE TABLE IF NOT EXISTS `admin_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_id` BIGINT UNSIGNED NOT NULL COMMENT '管理员ID',
  `action` VARCHAR(100) NOT NULL COMMENT '操作类型',
  `resource_type` VARCHAR(50) DEFAULT NULL COMMENT '资源类型',
  `resource_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '资源ID',
  `details` JSON DEFAULT NULL COMMENT '操作详情',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '用户代理',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_logs_admin_id` (`admin_id`),
  KEY `idx_admin_logs_action` (`action`),
  KEY `idx_admin_logs_created_at` (`created_at`),
  CONSTRAINT `fk_admin_logs_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
