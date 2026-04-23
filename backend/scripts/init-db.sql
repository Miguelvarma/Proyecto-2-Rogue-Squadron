-- ============================================================
-- THE NEXUS BATTLES V — Esquema unificado (merge de 4 ramas)
-- MySQL 8.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS nexus_battles CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexus_battles;

-- ── Jugadores (núcleo) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS players (
  id            CHAR(36)      PRIMARY KEY,
  username      VARCHAR(20)   NOT NULL UNIQUE,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('PLAYER','MODERATOR','ADMIN') NOT NULL DEFAULT 'PLAYER',
  `rank` INT NOT NULL DEFAULT 0,
  coins         INT           NOT NULL DEFAULT 0,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rank (`rank` DESC)
);

-- ── Usuarios extendidos (branch 4: nombres, apodo, avatar) ────
CREATE TABLE IF NOT EXISTS users (
  id             CHAR(36)      PRIMARY KEY,
  nombres        VARCHAR(50)   NOT NULL,
  apellidos      VARCHAR(50)   NOT NULL,
  email          VARCHAR(255)  NOT NULL UNIQUE,
  password       VARCHAR(255)  NOT NULL,
  apodo          VARCHAR(20)   NOT NULL UNIQUE,
  avatar         VARCHAR(500)  NULL,
  rol            ENUM('PLAYER','ADMIN','MODERATOR') NOT NULL DEFAULT 'PLAYER',
  email_verified TINYINT(1)    NOT NULL DEFAULT 0,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_apodo (apodo),
  INDEX idx_email (email)
);

-- ── Productos (tienda) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  stock       INT NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Ítems del inventario (branch 4) ──────────────────────────
CREATE TABLE IF NOT EXISTS items (
  id             CHAR(36)      PRIMARY KEY,
  nombre         VARCHAR(255)  NOT NULL,
  tipo           ENUM('Héroe','Arma','Armadura','Habilidad','Ítem','Épica') NOT NULL,
  rareza         ENUM('Común','Rara','Épica','Legendaria') NOT NULL DEFAULT 'Común',
  imagen         VARCHAR(500)  NULL,
  descripcion    TEXT          NOT NULL, 
  habilidades    JSON          NOT NULL, 
  efectos        JSON          NOT NULL, 
  ataque         INT           NOT NULL DEFAULT 0,
  defensa        INT           NOT NULL DEFAULT 0,
  user_id        CHAR(36)      NULL,
  en_subasta     TINYINT(1)    NOT NULL DEFAULT 0,
  en_mazo_activo TINYINT(1)    NOT NULL DEFAULT 0,
  activo         TINYINT(1)    NOT NULL DEFAULT 1,
  deleted_at     DATETIME      NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tipo (tipo),
  INDEX idx_rareza (rareza),
  INDEX idx_user (user_id),
  INDEX idx_activo (activo)
);

-- ── Calificaciones (branch 4) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id         CHAR(36)   PRIMARY KEY,
  item_id    VARCHAR(50) NOT NULL,
  user_id    CHAR(36)    NOT NULL,
  stars      TINYINT     NOT NULL CHECK (stars BETWEEN 1 AND 5),
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_item (user_id, item_id),
  INDEX idx_item (item_id)
);

-- ── Subastas ──────────────────────────────────────────────────
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
  id         CHAR(36)  PRIMARY KEY,
  auction_id CHAR(36)  NOT NULL,
  player_id  CHAR(36)  NOT NULL,
  amount     INT       NOT NULL,
  placed_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (auction_id) REFERENCES auctions(id),
  FOREIGN KEY (player_id)  REFERENCES players(id)
);

-- ── Misiones ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS missions (
  id           CHAR(36)      PRIMARY KEY,
  player_id    CHAR(36)      NOT NULL,
  title        VARCHAR(255)  NOT NULL,
  description  TEXT          NOT NULL,
  objective    TEXT          NOT NULL,
  reward_coins INT           NOT NULL DEFAULT 0,
  reward_item  CHAR(36)      NULL,
  status       ENUM('ACTIVE','COMPLETED','FAILED','EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  ai_model     VARCHAR(100)  NOT NULL,
  generated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at   DATETIME      NOT NULL,
  completed_at DATETIME      NULL,
  FOREIGN KEY (player_id) REFERENCES players(id),
  INDEX idx_player_status (player_id, status)
);

-- ── Inventario de jugador (clásico) ──────────────────────────
CREATE TABLE IF NOT EXISTS inventory_items (
  id               CHAR(36)     PRIMARY KEY,
  player_id        CHAR(36)     NOT NULL,
  item_template_id CHAR(36)     NOT NULL,
  name             VARCHAR(255) NOT NULL,
  rarity           ENUM('COMMON','RARE','EPIC','LEGENDARY') NOT NULL,
  metadata         JSON         NULL,
  acquired_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id),
  INDEX idx_player (player_id)
);

-- ── Pagos ─────────────────────────────────────────────────────
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

-- ── Carrito ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  product_id INT NOT NULL,
  quantity   INT NOT NULL DEFAULT 1,
  UNIQUE(user_id, product_id)
);

-- ── Órdenes ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  total      DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT NOT NULL,
  product_id INT NOT NULL,
  quantity   INT NOT NULL,
  price      DECIMAL(10,2) NOT NULL
);

-- ── Token blacklist ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS token_blacklist (
  jti        CHAR(36)  PRIMARY KEY,
  expires_at DATETIME  NOT NULL,
  INDEX idx_expires (expires_at)
);
