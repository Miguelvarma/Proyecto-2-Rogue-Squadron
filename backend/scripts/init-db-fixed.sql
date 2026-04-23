-- ============================================
-- ✅ INICIALIZACIÓN CORREGIDA - NEXUS BATTLES
-- ============================================

DROP DATABASE IF EXISTS nexus_battles;
CREATE DATABASE nexus_battles 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE nexus_battles;

-- ============================================
-- Tabla: users
-- ============================================
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  nombres VARCHAR(50) NOT NULL,
  apellidos VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  apodo VARCHAR(20) UNIQUE NOT NULL,
  avatar VARCHAR(500) DEFAULT NULL,
  rol ENUM('PLAYER', 'ADMIN', 'MODERATOR') DEFAULT 'PLAYER',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_apodo (apodo),
  INDEX idx_rol (rol),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: items
-- ============================================
CREATE TABLE items (
  id VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo ENUM('Héroe', 'Arma', 'Armadura', 'Habilidad', 'Ítem', 'Épica') NOT NULL,
  rareza ENUM('Común', 'Rara', 'Épica', 'Legendaria') DEFAULT 'Común',
  imagen VARCHAR(500) DEFAULT NULL,
  descripcion TEXT,
  habilidades JSON,
  efectos JSON,
  ataque INT DEFAULT 0,
  defensa INT DEFAULT 0,
  user_id VARCHAR(36) DEFAULT NULL,
  en_subasta BOOLEAN DEFAULT FALSE,
  en_mazo_activo BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_nombre (nombre),
  INDEX idx_tipo (tipo),
  INDEX idx_rareza (rareza),
  INDEX idx_user_id (user_id),
  INDEX idx_activo (activo),
  INDEX idx_en_subasta (en_subasta),
  INDEX idx_en_mazo_activo (en_mazo_activo),
  
  FULLTEXT INDEX idx_fulltext_search (nombre, descripcion)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: decks
-- ============================================
CREATE TABLE decks (
  id VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  user_id VARCHAR(36) NOT NULL,
  estrategia ENUM('Agresivo', 'Defensivo', 'Balanceado', 'Personalizado') DEFAULT 'Balanceado',
  activo BOOLEAN DEFAULT TRUE,
  es_principal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_activo (activo),
  INDEX idx_es_principal (es_principal)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: deck_items
-- ============================================
CREATE TABLE deck_items (
  deck_id VARCHAR(36) NOT NULL,
  item_id VARCHAR(36) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (deck_id, item_id),
  
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  
  INDEX idx_deck_id (deck_id),
  INDEX idx_item_id (item_id),
  INDEX idx_position (position)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: ratings
-- ============================================
CREATE TABLE ratings (
  id VARCHAR(36) PRIMARY KEY,
  item_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  stars INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_user_item (user_id, item_id),
  
  INDEX idx_item_id (item_id),
  INDEX idx_user_id (user_id),
  INDEX idx_stars (stars),
  
  CONSTRAINT chk_stars CHECK (stars >= 1 AND stars <= 5)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: comments
-- ============================================
CREATE TABLE comments (
  id VARCHAR(36) PRIMARY KEY,
  item_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_item_id (item_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS DE PRUEBA
-- ============================================

-- Usuarios de prueba
INSERT INTO users (id, nombres, apellidos, email, password, apodo, rol) VALUES
('user-1', 'Juan', 'Pérez', 'juan@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYmKvJn.eDm', 'JuanGamer', 'PLAYER'),
('user-2', 'María', 'González', 'maria@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYmKvJn.eDm', 'MariaWarrior', 'PLAYER'),
('admin-1', 'Admin', 'Sistema', 'admin@nexusbattles.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYmKvJn.eDm', 'AdminMaster', 'ADMIN');

-- Items de prueba (primeros 20)
INSERT INTO items (id, nombre, tipo, rareza, imagen, descripcion, habilidades, efectos, ataque, defensa, user_id) VALUES
('item-1', 'Espada de Fuego Eterno', 'Arma', 'Legendaria', 'https://example.com/espada-fuego.jpg', 'Una espada legendaria forjada en las llamas', '["Golpe flamígero", "Llamarada"]', '["Quemadura +5"]', 75, 10, NULL),
('item-2', 'Armadura de Hielo', 'Armadura', 'Épica', 'https://example.com/armadura-hielo.jpg', 'Protección gélida', '["Escudo congelante"]', '["Congelación +3"]', 5, 80, NULL),
('item-3', 'Héroe Guerrero', 'Héroe', 'Común', 'https://example.com/guerrero.jpg', 'Guerrero básico', '["Golpe poderoso"]', '["Fuerza +2"]', 50, 40, NULL),
('item-4', 'Báculo del Mago', 'Arma', 'Rara', 'https://example.com/baculo.jpg', 'Aumenta poder mágico', '["Bola de fuego"]', '["Poder mágico +10"]', 40, 5, NULL),
('item-5', 'Poción de Vida', 'Ítem', 'Común', 'https://example.com/pocion.jpg', 'Restaura 50 vida', '["Curación"]', '["Vida +50"]', 0, 0, NULL),
('item-6', 'Dragón de Batalla', 'Héroe', 'Legendaria', 'https://example.com/dragon.jpg', 'Criatura poderosa', '["Aliento de fuego"]', '["Quemadura +8"]', 90, 60, NULL),
('item-7', 'Escudo de Plata', 'Armadura', 'Rara', 'https://example.com/escudo.jpg', 'Escudo resistente', '["Reflejo mágico"]', '["Defensa +15"]', 0, 70, NULL),
('item-8', 'Daga Envenenada', 'Arma', 'Épica', 'https://example.com/daga.jpg', 'Daga con veneno mortal', '["Ataque rápido"]', '["Veneno +4"]', 45, 0, NULL),
('item-9', 'Arco Élfico', 'Arma', 'Épica', 'https://example.com/arco.jpg', 'Arco élfico mágico', '["Disparo preciso"]', '["Precisión +6"]', 55, 0, NULL),
('item-10', 'Casco del Caballero', 'Armadura', 'Rara', 'https://example.com/casco.jpg', 'Casco protector', '["Protección craneal"]', '["Defensa +12"]', 0, 60, NULL),
('item-11', 'Hechizo de Teletransporte', 'Habilidad', 'Épica', 'https://example.com/teletransporte.jpg', 'Teletransporte', '["Teletransporte"]', '["Movilidad +10"]', 0, 0, NULL),
('item-12', 'Anillo de Poder', 'Ítem', 'Legendaria', 'https://example.com/anillo.jpg', 'Anillo de poder supremo', '["Poder aumentado"]', '["Todos +5"]', 10, 10, NULL),
('item-13', 'Mago Oscuro', 'Héroe', 'Épica', 'https://example.com/mago-oscuro.jpg', 'Maestro de magia oscura', '["Magia oscura"]', '["Poder +8"]', 65, 30, NULL),
('item-14', 'Botas de Velocidad', 'Armadura', 'Común', 'https://example.com/botas.jpg', 'Botas rápidas', '["Velocidad"]', '["Velocidad +5"]', 0, 20, NULL),
('item-15', 'Lanza del Destino', 'Arma', 'Legendaria', 'https://example.com/lanza.jpg', 'Lanza de los héroes', '["Embestida heroica"]', '["Ataque +10"]', 85, 15, NULL),
('item-16', 'Elixir de Maná', 'Ítem', 'Común', 'https://example.com/elixir.jpg', 'Restaura maná', '["Restaurar maná"]', '["Maná +50"]', 0, 0, NULL),
('item-17', 'Espada Vorpalina', 'Arma', 'Legendaria', 'https://example.com/espada-vorpal.jpg', 'Espada dimensional', '["Corte dimensional"]', '["Instakill 5%"]', 120, 15, NULL),
('item-18', 'Armadura del Vacío', 'Armadura', 'Legendaria', 'https://example.com/armadura-vacio.jpg', 'Armadura oscura', '["Absorber luz"]', '["Defensa +50"]', 0, 150, NULL),
('item-19', 'Mago del Caos', 'Héroe', 'Legendaria', 'https://example.com/mago-caos.jpg', 'Manipulador de realidad', '["Realidad alternativa"]', '["Poder +40"]', 130, 40, NULL),
('item-20', 'Poción de Inmortalidad', 'Ítem', 'Legendaria', 'https://example.com/pocion-inmortal.jpg', 'Inmortalidad permanente', '["Inmortalidad"]', '["Invulnerabilidad"]', 0, 0, NULL);

-- Asignar items al usuario
UPDATE items SET user_id = 'user-1' WHERE id IN ('item-1', 'item-3', 'item-5', 'item-7');
UPDATE items SET user_id = 'user-2' WHERE id IN ('item-2', 'item-4', 'item-6', 'item-8');

-- Crear mazos
INSERT INTO decks (id, nombre, descripcion, user_id, estrategia, es_principal) VALUES
('deck-1', 'Mazo de Fuego', 'Estrategia agresiva', 'user-1', 'Agresivo', TRUE),
('deck-2', 'Mazo Defensivo', 'Estrategia defensiva', 'user-2', 'Defensivo', TRUE);

-- Agregar items a mazos
INSERT INTO deck_items (deck_id, item_id, position) VALUES
('deck-1', 'item-1', 1),
('deck-1', 'item-3', 2),
('deck-1', 'item-5', 3),
('deck-2', 'item-2', 1),
('deck-2', 'item-4', 2),
('deck-2', 'item-6', 3);

-- Marcar items en mazo activo
UPDATE items SET en_mazo_activo = TRUE WHERE id IN ('item-1', 'item-3', 'item-5', 'item-2', 'item-4', 'item-6');

-- Calificaciones
INSERT INTO ratings (id, item_id, user_id, stars) VALUES
('rating-1', 'item-1', 'user-2', 5),
('rating-2', 'item-2', 'user-1', 4),
('rating-3', 'item-3', 'user-2', 3),
('rating-4', 'item-6', 'user-1', 5);

-- Comentarios
INSERT INTO comments (id, item_id, user_id, content) VALUES
('comment-1', 'item-1', 'user-2', 'Increíble arma'),
('comment-2', 'item-2', 'user-1', 'Muy buena defensa'),
('comment-3', 'item-6', 'user-1', 'El mejor héroe');

-- Verificar los datos
SELECT COUNT(*) as total_items FROM items WHERE activo = TRUE;
SELECT COUNT(*) as total_users FROM users;
