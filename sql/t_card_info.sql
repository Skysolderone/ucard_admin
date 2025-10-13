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

 Date: 13/10/2025 15:43:26
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for t_card_info
-- ----------------------------
DROP TABLE IF EXISTS `t_card_info`;
CREATE TABLE `t_card_info`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `wallet` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `card_type` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `card_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `card_holder_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `card_bin` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `card_cvv` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `card_no` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` tinyint NULL DEFAULT NULL,
  `card_amount` decimal(20, 2) NULL DEFAULT NULL,
  `kyc_status` tinyint NULL DEFAULT NULL,
  `fee` decimal(20, 2) NULL DEFAULT NULL,
  `expeire_time` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `cross_border_fee` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `transfer_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_card_info_wallet`(`wallet` ASC) USING BTREE,
  INDEX `idx_card_info_card_id`(`card_id` ASC) USING BTREE,
  INDEX `idx_card_info_wallet_card_id`(`wallet` ASC, `card_id` ASC) USING BTREE,
  INDEX `idx_card_info_wallet_kyc_status`(`wallet` ASC, `kyc_status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 729 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
