/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 100427
 Source Host           : localhost:3306
 Source Schema         : nhl_stats

 Target Server Type    : MySQL
 Target Server Version : 100427
 File Encoding         : 65001

 Date: 05/04/2023 01:44:17
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for game_data
-- ----------------------------
DROP TABLE IF EXISTS `game_data`;
CREATE TABLE `game_data`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) NULL DEFAULT NULL,
  `home_team_id` int(11) NULL DEFAULT NULL,
  `home_team_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `away_team_id` int(11) NULL DEFAULT NULL,
  `away_team_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `start_time` datetime(0) NULL DEFAULT NULL,
  `end_time` datetime(0) NULL DEFAULT NULL,
  `status` enum('upcoming','in_progress','final') CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 305 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for player_stats
-- ----------------------------
DROP TABLE IF EXISTS `player_stats`;
CREATE TABLE `player_stats`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) NULL DEFAULT NULL,
  `player_id` int(11) NULL DEFAULT NULL,
  `player_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `team_id` int(11) NULL DEFAULT NULL,
  `team_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `age` int(11) NULL DEFAULT NULL,
  `number` int(11) NULL DEFAULT NULL,
  `position` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `assists` int(11) NULL DEFAULT NULL,
  `goals` int(11) NULL DEFAULT NULL,
  `hits` int(11) NULL DEFAULT NULL,
  `points` int(11) NULL DEFAULT NULL,
  `penalty_minutes` int(11) NULL DEFAULT NULL,
  `opponent_team_id` int(11) NULL DEFAULT NULL,
  `opponent_team_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 598 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
