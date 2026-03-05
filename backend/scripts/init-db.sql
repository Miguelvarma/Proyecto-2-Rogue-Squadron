-- ============================================================
-- THE NEXUS BATTLES V — Esquema inicial de base de datos
-- MySQL 8.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS nexus_battles CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexus_battles;

CREATE TABLE IF NOT EXISTS players (
  id            CHAR(36)      PRIMARY KEY,
  username      VARCHAR(20)   NOT NULL UNIQUE,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('PLAYER','MODERATOR','ADMIN') NOT NULL DEFAULT 'PLAYER',
  rank          INT           NOT NULL DEFAULT 0,
  coins         INT           NOT NULL DEFAULT 0,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rank (rank DESC)
);

CREATE TABLE IF NOT EXISTS auctions (
  id                CHAR(36)     PRIMARY KEY,
  item_id           CHAR(36)     NOT NULL,
  seller_id         CHAR(36)     NOT NULL,
  start_price       INT          NOT NULL,
  current_price     INT          NOT NULL,
  current_bidder_id CHAR(36)     NULL,
  status            ENUM('ACTIVE','CLOSED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  ends_at           DATETIME     NOT NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES players(id),
  INDEX idx_status_ends (status, ends_at)
);

CREATE TABLE IF NOT EXISTS auction_bids (
  id          CHAR(36)  PRIMARY KEY,
  auction_id  CHAR(36)  NOT NULL,
  player_id   CHAR(36)  NOT NULL,
  amount      INT       NOT NULL,
  placed_at   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auction_id) REFERENCES auctions(id),
  FOREIGN KEY (player_id)  REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS missions (
  id            CHAR(36)      PRIMARY KEY,
  player_id     CHAR(36)      NOT NULL,
  title         VARCHAR(255)  NOT NULL,
  description   TEXT          NOT NULL,
  objective     TEXT          NOT NULL,
  reward_coins  INT           NOT NULL DEFAULT 0,
  reward_item   CHAR(36)      NULL,
  status        ENUM('ACTIVE','COMPLETED','FAILED','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  ai_model      VARCHAR(100)  NOT NULL,
  generated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at    DATETIME      NOT NULL,
  completed_at  DATETIME      NULL,
  FOREIGN KEY (player_id) REFERENCES players(id),
  INDEX idx_player_status (player_id, status)
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id               CHAR(36)   PRIMARY KEY,
  player_id        CHAR(36)   NOT NULL,
  item_template_id CHAR(36)   NOT NULL,
  name             VARCHAR(255) NOT NULL,
  rarity           ENUM('COMMON','RARE','EPIC','LEGENDARY') NOT NULL,
  metadata         JSON       NULL,
  acquired_at      DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id),
  INDEX idx_player (player_id)
);

CREATE TABLE IF NOT EXISTS payments (
  id          CHAR(36)      PRIMARY KEY,
  player_id   CHAR(36)      NOT NULL,
  amount      INT           NOT NULL,
  currency    CHAR(3)       NOT NULL DEFAULT 'USD',
  status      ENUM('PENDING','COMPLETED','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  external_id VARCHAR(255)  NOT NULL UNIQUE,
  description VARCHAR(500)  NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id),
  INDEX idx_external (external_id)
);

CREATE TABLE IF NOT EXISTS token_blacklist (
  jti        CHAR(36)  PRIMARY KEY,
  expires_at DATETIME  NOT NULL,
  INDEX idx_expires (expires_at)
);

CREATE TABLE if not exists cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE(user_id, product_id)
);

CREATE TABLE if not exists products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0
);

CREATE TABLE if not exists orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE if not exists order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
