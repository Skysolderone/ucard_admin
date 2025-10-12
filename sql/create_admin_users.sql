-- 创建管理员用户表
CREATE TABLE IF NOT EXISTS `t_admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) DEFAULT 'user',
  `status` TINYINT DEFAULT 1 COMMENT '1:启用 0:禁用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_username` (`username`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员用户表';

-- 插入默认管理员用户
INSERT INTO `t_admin_users` (`username`, `password`, `role`, `status`)
VALUES ('admin', 'admin123456', 'admin', 1)
ON DUPLICATE KEY UPDATE
  `password` = 'admin123456',
  `role` = 'admin',
  `status` = 1;
