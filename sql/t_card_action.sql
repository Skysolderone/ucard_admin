/*
 Navicat Premium Dump SQL

 Source Server         : ucard
 Source Server Type    : MySQL
 Source Server Version : 80042 (8.0.42)
 Source Host           : 192.168.3.3:3306
 Source Schema         : ucard

 Target Server Type    : MySQL
 Target Server Version : 80042 (8.0.42)
 File Encoding         : 65001

 Date: 13/10/2025 11:11:44
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for t_card_action
-- ----------------------------
DROP TABLE IF EXISTS `t_card_action`;
CREATE TABLE `t_card_action`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `wallet` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `card_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `transfer_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `transer_hash` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `trade_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `amount` decimal(20, 2) NULL DEFAULT NULL,
  `settlement_fee` decimal(20, 2) NULL DEFAULT NULL,
  `settlement_funds` decimal(20, 2) NULL DEFAULT NULL,
  `status` tinyint NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `card_type` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_wallet_trade_type`(`wallet` ASC, `trade_type` ASC) USING BTREE,
  INDEX `idx_card_action_wallet_trade_type`(`wallet` ASC, `trade_type` ASC) USING BTREE,
  INDEX `idx_card_action_card_id_transfer_id`(`card_id` ASC, `transfer_id` ASC) USING BTREE,
  INDEX `idx_card_action_transfer_id_status`(`transfer_id` ASC, `status` ASC) USING BTREE,
  INDEX `idx_card_action_card_id_wallet`(`card_id` ASC, `wallet` ASC) USING BTREE,
  INDEX `idx_card_action_wallet_status`(`wallet` ASC, `status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 35844 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
