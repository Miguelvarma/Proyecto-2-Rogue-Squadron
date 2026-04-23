-- ============================================
-- BASE DE DATOS: Nexus Battles - Completa
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
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID del usuario',
  nombres VARCHAR(50) NOT NULL COMMENT 'Nombres del usuario',
  apellidos VARCHAR(50) NOT NULL COMMENT 'Apellidos del usuario',
  email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Email único',
  password VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada con bcrypt factor 12',
  apodo VARCHAR(20) UNIQUE NOT NULL COMMENT 'Apodo único del jugador',
  avatar VARCHAR(500) DEFAULT NULL COMMENT 'URL del avatar',
  rol ENUM('PLAYER', 'ADMIN', 'MODERATOR') DEFAULT 'PLAYER' COMMENT 'Rol del usuario',
  email_verified BOOLEAN DEFAULT FALSE COMMENT 'Si el email está verificado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización',
  
  INDEX idx_email (email),
  INDEX idx_apodo (apodo),
  INDEX idx_rol (rol),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Usuarios registrados en el sistema';

-- ============================================
-- Tabla: items
-- ============================================

CREATE TABLE items (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID del ítem',
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del ítem',
  tipo ENUM('Héroe', 'Arma', 'Armadura', 'Habilidad', 'Ítem', 'Épica') NOT NULL COMMENT 'Tipo de ítem según el juego',
  rareza ENUM('Común', 'Rara', 'Épica', 'Legendaria') DEFAULT 'Común' COMMENT 'Rareza del ítem',
  imagen VARCHAR(500) DEFAULT NULL COMMENT 'URL de la imagen del ítem',
  descripcion TEXT COMMENT 'Descripción detallada del ítem',
  habilidades JSON COMMENT 'Array de strings con habilidades del ítem',
  efectos JSON COMMENT 'Array de strings con efectos del ítem',
  ataque INT DEFAULT 0 COMMENT 'Puntos de ataque',
  defensa INT DEFAULT 0 COMMENT 'Puntos de defensa',
  user_id VARCHAR(36) DEFAULT NULL COMMENT 'ID del usuario propietario (NULL = sistema)',
  en_subasta BOOLEAN DEFAULT FALSE COMMENT 'Si el ítem está actualmente en subasta',
  en_mazo_activo BOOLEAN DEFAULT FALSE COMMENT 'Si el ítem está en un mazo activo',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Soft delete - Si el ítem está activo',
  deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha de eliminación (soft delete)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización',
  
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
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Ítems del inventario del juego';

-- ============================================
-- Tabla: decks
-- ============================================

CREATE TABLE decks (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID del mazo',
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del mazo',
  descripcion TEXT COMMENT 'Descripción del mazo',
  user_id VARCHAR(36) NOT NULL COMMENT 'ID del usuario propietario',
  estrategia ENUM('Agresivo', 'Defensivo', 'Balanceado', 'Personalizado') DEFAULT 'Balanceado' COMMENT 'Estrategia del mazo',
  activo BOOLEAN DEFAULT TRUE COMMENT 'Si el mazo está activo',
  es_principal BOOLEAN DEFAULT FALSE COMMENT 'Si es el mazo principal del usuario',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_user_id (user_id),
  INDEX idx_activo (activo),
  INDEX idx_es_principal (es_principal)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Mazos de cartas de los jugadores';

-- ============================================
-- Tabla: deck_items
-- ============================================

CREATE TABLE deck_items (
  deck_id VARCHAR(36) NOT NULL COMMENT 'ID del mazo',
  item_id VARCHAR(36) NOT NULL COMMENT 'ID del ítem',
  position INT NOT NULL DEFAULT 0 COMMENT 'Posición del ítem en el mazo',
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha en que se agregó al mazo',
  
  PRIMARY KEY (deck_id, item_id),
  
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  
  INDEX idx_deck_id (deck_id),
  INDEX idx_item_id (item_id),
  INDEX idx_position (position)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Relación entre mazos e ítems';

-- ============================================
-- Tabla: ratings
-- ============================================

CREATE TABLE ratings (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID de la calificación',
  item_id VARCHAR(36) NOT NULL COMMENT 'ID del ítem calificado',
  user_id VARCHAR(36) NOT NULL COMMENT 'ID del usuario que califica',
  stars INT NOT NULL COMMENT 'Calificación en estrellas (1-5)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de calificación',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización',
  
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_user_item (user_id, item_id) COMMENT 'Un usuario solo puede calificar un ítem una vez',
  
  INDEX idx_item_id (item_id),
  INDEX idx_user_id (user_id),
  INDEX idx_stars (stars),
  
  CONSTRAINT chk_stars CHECK (stars >= 1 AND stars <= 5)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Calificaciones de ítems por usuarios';

-- ============================================
-- Tabla: comments
-- ============================================

CREATE TABLE comments (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID del comentario',
  item_id VARCHAR(36) NOT NULL COMMENT 'ID del ítem comentado',
  user_id VARCHAR(36) NOT NULL COMMENT 'ID del usuario que comenta',
  content TEXT NOT NULL COMMENT 'Contenido del comentario',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de actualización',
  
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_item_id (item_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Comentarios de usuarios sobre ítems';

-- ============================================
-- INSERTAR USUARIOS
-- ============================================

INSERT INTO users (id, nombres, apellidos, email, password, apodo, rol) VALUES
('user-1', 'Juan', 'Pérez', 'juan@test.com', '$2b$12$qJplY7/Ud1Shrj6wUFDIcuNw1boxpJSalBza8g2x8GfB2SPmNkrDa', 'JuanGamer', 'PLAYER'),
('user-2', 'María', 'González', 'maria@test.com', '$2b$12$3B4YsA/9DYDgHAb6aTd.bu5mwkRe2/UV5eqBufM4AX6dGBwgp/9IK', 'MariaWarrior', 'PLAYER'),
('admin-1', 'Admin', 'Sistema', 'admin@nexusbattles.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYmKvJn.eDm', 'AdminMaster', 'ADMIN');

-- ============================================
-- INSERTAR 70 ITEMS (PRIMEROS 16)
-- ============================================

INSERT INTO items (id, nombre, tipo, rareza, imagen, descripcion, habilidades, efectos, ataque, defensa, user_id) VALUES
('item-1', 'Espada de Fuego Eterno', 'Arma', 'Legendaria', 'https://example.com/espada-fuego.jpg', 'Una espada legendaria forjada en las llamas del dragón ancestral', '["Golpe flamígero", "Llamarada"]', '["Quemadura +5", "Ignición permanente"]', 75, 10, NULL),
('item-2', 'Armadura de Hielo', 'Armadura', 'Épica', 'https://example.com/armadura-hielo.jpg', 'Protección gélida que congela a los enemigos', '["Escudo congelante"]', '["Congelación +3", "Resistencia al fuego"]', 5, 80, NULL),
('item-3', 'Héroe Guerrero', 'Héroe', 'Común', 'https://example.com/guerrero.jpg', 'Guerrero básico con equilibrio entre ataque y defensa', '["Golpe poderoso"]', '["Fuerza +2"]', 50, 40, NULL),
('item-4', 'Báculo del Mago', 'Arma', 'Rara', 'https://example.com/baculo.jpg', 'Aumenta el poder mágico del portador', '["Bola de fuego", "Rayo arcano"]', '["Poder mágico +10"]', 40, 5, NULL),
('item-5', 'Poción de Vida', 'Ítem', 'Común', 'https://example.com/pocion.jpg', 'Restaura 50 puntos de vida', '["Curación instantánea"]', '["Vida +50"]', 0, 0, NULL),
('item-6', 'Dragón de Batalla', 'Héroe', 'Legendaria', 'https://example.com/dragon.jpg', 'Criatura poderosa con aliento de fuego', '["Aliento de fuego", "Vuelo"]', '["Quemadura +8", "Intimidación"]', 90, 60, NULL),
('item-7', 'Escudo de Plata', 'Armadura', 'Rara', 'https://example.com/escudo.jpg', 'Escudo resistente con propiedades mágicas', '["Reflejo mágico"]', '["Defensa +15", "Resistencia mágica"]', 0, 70, NULL),
('item-8', 'Daga Envenenada', 'Arma', 'Épica', 'https://example.com/daga.jpg', 'Daga impregnada con veneno mortal', '["Ataque rápido", "Envenenar"]', '["Veneno +4", "Velocidad +3"]', 45, 0, NULL),
('item-9', 'Arco Élfico', 'Arma', 'Épica', 'https://example.com/arco.jpg', 'Arco de precisión élfica con flechas mágicas', '["Disparo preciso", "Flecha de luz"]', '["Precisión +6", "Daño a distancia"]', 55, 0, NULL),
('item-10', 'Casco del Caballero', 'Armadura', 'Rara', 'https://example.com/casco.jpg', 'Casco que protege de golpes críticos', '["Protección craneal"]', '["Defensa +12", "Anti-crítico"]', 0, 60, NULL),
('item-11', 'Hechizo de Teletransporte', 'Habilidad', 'Épica', 'https://example.com/teletransporte.jpg', 'Permite moverse instantáneamente', '["Teletransporte"]', '["Movilidad +10"]', 0, 0, NULL),
('item-12', 'Anillo de Poder', 'Ítem', 'Legendaria', 'https://example.com/anillo.jpg', 'Anillo que otorga poder supremo', '["Poder aumentado"]', '["Todos los atributos +5"]', 10, 10, NULL),
('item-13', 'Mago Oscuro', 'Héroe', 'Épica', 'https://example.com/mago-oscuro.jpg', 'Maestro de la magia oscura', '["Magia oscura", "Drenar vida"]', '["Poder mágico +8", "Robo de vida"]', 65, 30, NULL),
('item-14', 'Botas de Velocidad', 'Armadura', 'Común', 'https://example.com/botas.jpg', 'Botas que aumentan la velocidad', '["Velocidad aumentada"]', '["Velocidad +5"]', 0, 20, NULL),
('item-15', 'Lanza del Destino', 'Arma', 'Legendaria', 'https://example.com/lanza.jpg', 'Lanza legendaria de los antiguos héroes', '["Embestida heroica", "Perforación"]', '["Ataque +10", "Ignorar armadura"]', 85, 15, NULL),
('item-16', 'Elixir de Maná', 'Ítem', 'Común', 'https://example.com/elixir.jpg', 'Restaura puntos de maná', '["Restaurar maná"]', '["Maná +50"]', 0, 0, NULL);

-- ============================================
-- INSERTAR 70 ITEMS (ITEMS 17-40)
-- ============================================

INSERT INTO items (id, nombre, tipo, rareza, imagen, descripcion, habilidades, efectos, ataque, defensa, user_id) VALUES
('item-17', 'Espada Vorpalina', 'Arma', 'Legendaria', 'https://example.com/espada-vorpal.jpg', 'Una espada que corta cualquier cosa, incluso el tiempo', '["Corte dimensional", "Velocidad extrema"]', '["Instakill 5%", "Corte +20"]', 120, 15, NULL),
('item-18', 'Armadura del Vacío', 'Armadura', 'Legendaria', 'https://example.com/armadura-vacio.jpg', 'Armadura hecha de pura oscuridad', '["Absorber luz", "Invisibilidad"]', '["Defensa +50", "Esquiva +30"]', 0, 150, NULL),
('item-19', 'Mago del Caos', 'Héroe', 'Legendaria', 'https://example.com/mago-caos.jpg', 'Manipula la realidad a su antojo', '["Realidad alternativa", "Caos controlado"]', '["Poder +40", "Locura +10"]', 130, 40, NULL),
('item-20', 'Poción de Inmortalidad', 'Ítem', 'Legendaria', 'https://example.com/pocion-inmortal.jpg', 'Otorga inmortalidad por 10 segundos', '["Inmortalidad"]', '["Invulnerabilidad", "Regeneración"]', 0, 0, NULL),
('item-21', 'Arco de la Luna', 'Arma', 'Épica', 'https://example.com/arco-luna.jpg', 'Arco que dispara flechas de luz lunar', '["Flecha lunar", "Cegar"]', '["Daño +25", "Precisión +15"]', 70, 5, NULL),
('item-22', 'Yelmo del Dragón', 'Armadura', 'Épica', 'https://example.com/yelmo-dragon.jpg', 'Yelmo forjado con hueso de dragón', '["Resistir fuego", "Intimidar"]', '["Defensa +30", "Resistencia +20"]', 5, 85, NULL),
('item-23', 'Daga del Asesino', 'Arma', 'Rara', 'https://example.com/daga-asesino.jpg', 'Daga diseñada para ataques sorpresa', '["Ataque sigiloso", "Veneno rápido"]', '["Crítico +15", "Velocidad +10"]', 55, 5, NULL),
('item-24', 'Botas del Viento', 'Armadura', 'Rara', 'https://example.com/botas-viento.jpg', 'Botas que te hacen correr como el viento', '["Carrera rápida", "Salto alto"]', '["Velocidad +25", "Agilidad +15"]', 0, 25, NULL),
('item-25', 'Báculo del Sabio', 'Arma', 'Rara', 'https://example.com/baculo-sabio.jpg', 'Báculo que aumenta la sabiduría', '["Sabiduría infinita", "Conocimiento"]', '["Magia +20", "Mana +30"]', 35, 10, NULL),
('item-26', 'Escudo del Paladín', 'Armadura', 'Rara', 'https://example.com/escudo-paladin.jpg', 'Escudo sagrado que protege de la oscuridad', '["Proteger aliados", "Luz divina"]', '["Defensa +35", "Resistencia mágica +25"]', 5, 75, NULL),
('item-27', 'Amuleto de la Suerte', 'Ítem', 'Rara', 'https://example.com/amuleto-suerte.jpg', 'Trae buena suerte a su portador', '["Suerte +10", "Encontrar tesoro"]', '["Drop rate +5%", "Crítico +5%"]', 5, 5, NULL),
('item-28', 'Espada de Hierro', 'Arma', 'Común', 'https://example.com/espada-hierro.jpg', 'Espada básica de hierro', '["Corte básico"]', '["Ataque +5"]', 30, 5, NULL),
('item-29', 'Escudo de Madera', 'Armadura', 'Común', 'https://example.com/escudo-madera.jpg', 'Escudo de madera reforzada', '["Bloquear"]', '["Defensa +10"]', 0, 35, NULL),
('item-30', 'Poción de Maná', 'Ítem', 'Común', 'https://example.com/pocion-mana.jpg', 'Restaura 30 puntos de maná', '["Restaurar maná"]', '["Maná +30"]', 0, 0, NULL),
('item-31', 'Arco Corto', 'Arma', 'Común', 'https://example.com/arco-corto.jpg', 'Arco básico para caza menor', '["Disparo rápido"]', '["Daño +10"]', 25, 0, NULL),
('item-32', 'Armadura de Cuero', 'Armadura', 'Común', 'https://example.com/armadura-cuero.jpg', 'Armadura ligera de cuero', '["Movimiento rápido"]', '["Defensa +15", "Agilidad +5"]', 0, 30, NULL),
('item-33', 'Héroe Novato', 'Héroe', 'Común', 'https://example.com/heroe-novato.jpg', 'Héroe en entrenamiento', '["Ataque básico", "Defensa básica"]', '["Progreso +1"]', 20, 20, NULL),
('item-34', 'Habilidad: Patada', 'Habilidad', 'Común', 'https://example.com/patada.jpg', 'Patada básica', '["Patada"]', '["Daño +5"]', 15, 0, NULL),
('item-35', 'Anillo de Cobre', 'Ítem', 'Común', 'https://example.com/anillo-cobre.jpg', 'Anillo simple de cobre', '["Sin habilidades"]', '["Suerte +1"]', 1, 1, NULL),
('item-36', 'Capa de Viajero', 'Armadura', 'Común', 'https://example.com/capa.jpg', 'Capa para protegerse del frío', '["Resistir frío"]', '["Defensa +5", "Resistencia +5"]', 0, 15, NULL),
('item-37', 'Invocador de Demonios', 'Héroe', 'Épica', 'https://example.com/invocador.jpg', 'Puede invocar demonios del inframundo', '["Invocar demonio", "Fuego infernal"]', '["Poder +25", "Miedo +15"]', 80, 40, NULL),
('item-38', 'Armadura Esquelética', 'Armadura', 'Épica', 'https://example.com/armadura-hueso.jpg', 'Armadura hecha de huesos de dragón', '["Intimidar", "Resistir muerte"]', '["Defensa +45", "Resistencia oscura +30"]', 10, 95, NULL),
('item-39', 'Espada de Luz', 'Arma', 'Legendaria', 'https://example.com/espada-luz.jpg', 'Espada hecha de luz pura', '["Cegar", "Luz divina"]', '["Daño +50", "Ceguera +10"]', 110, 20, NULL),
('item-40', 'Elixir de Velocidad', 'Ítem', 'Rara', 'https://example.com/elixir-velocidad.jpg', 'Aumenta drásticamente la velocidad', '["Velocidad extrema"]', '["Velocidad +50"]', 0, 0, NULL);

-- ============================================
-- INSERTAR 70 ITEMS (ITEMS 41-70)
-- ============================================

INSERT INTO items (id, nombre, tipo, rareza, imagen, descripcion, habilidades, efectos, ataque, defensa, user_id) VALUES
('item-41', 'Espada del Abismo', 'Arma', 'Legendaria', 'https://example.com/abismo.jpg', 'Espada oscura infinita', '["Abyss slash"]', '["Daño +70"]', 140, 20, NULL),
('item-42', 'Titán de Hierro', 'Héroe', 'Legendaria', 'https://example.com/titan.jpg', 'Gigante imparable', '["Golpe titan"]', '["HP +200"]', 160, 120, NULL),
('item-43', 'Armadura Solar', 'Armadura', 'Legendaria', 'https://example.com/solar.jpg', 'Armadura del sol', '["Radiación"]', '["Defensa +130"]', 0, 150, NULL),
('item-44', 'Corona del Rey', 'Ítem', 'Legendaria', 'https://example.com/corona.jpg', 'Dominio total', '["Liderazgo"]', '["Todo +25"]', 20, 20, NULL),
('item-45', 'Habilidad: Apocalipsis', 'Habilidad', 'Legendaria', 'https://example.com/apocalipsis.jpg', 'Destrucción masiva', '["Boom total"]', '["Area +100"]', 150, 0, NULL),
('item-46', 'Espada Eléctrica', 'Arma', 'Épica', 'https://example.com/electrica.jpg', 'Electricidad pura', '["Shock"]', '["Parálisis"]', 90, 10, NULL),
('item-47', 'Cazador Nocturno', 'Héroe', 'Épica', 'https://example.com/cazador.jpg', 'Sigilo en la noche', '["Invisibilidad"]', '["Crit +25"]', 85, 40, NULL),
('item-48', 'Armadura Fantasma', 'Armadura', 'Épica', 'https://example.com/fantasma.jpg', 'Intangible', '["Evadir"]', '["Defensa +75"]', 0, 95, NULL),
('item-49', 'Orbe Arcano', 'Ítem', 'Épica', 'https://example.com/orbe.jpg', 'Magia pura', '["Mana boost"]', '["Mana +40"]', 10, 10, NULL),
('item-50', 'Habilidad: Tormenta Eléctrica', 'Habilidad', 'Épica', 'https://example.com/tormenta.jpg', 'Rayos múltiples', '["Rayos"]', '["Area +40"]', 80, 0, NULL),
('item-51', 'Espada Forjada', 'Arma', 'Rara', 'https://example.com/forjada.jpg', 'Alta calidad', '["Golpe fuerte"]', '["Ataque +30"]', 70, 10, NULL),
('item-52', 'Guardián', 'Héroe', 'Rara', 'https://example.com/guardian.jpg', 'Protector', '["Defensa"]', '["HP +50"]', 60, 50, NULL),
('item-53', 'Armadura Pesada', 'Armadura', 'Rara', 'https://example.com/pesada.jpg', 'Alta defensa', '["Bloqueo"]', '["Defensa +80"]', 0, 100, NULL),
('item-54', 'Collar Mágico', 'Ítem', 'Rara', 'https://example.com/collar.jpg', 'Poder mágico', '["Mana"]', '["Mana +20"]', 5, 5, NULL),
('item-55', 'Habilidad: Ráfaga', 'Habilidad', 'Rara', 'https://example.com/rafaga.jpg', 'Ataque rápido', '["Speed hit"]', '["Daño +25"]', 60, 0, NULL),
('item-56', 'Espada Corta', 'Arma', 'Común', 'https://example.com/corta.jpg', 'Ligera', '["Cut"]', '["Ataque +10"]', 35, 5, NULL),
('item-57', 'Soldado Elite', 'Héroe', 'Común', 'https://example.com/soldado.jpg', 'Entrenado', '["Ataque"]', '["HP +10"]', 40, 30, NULL),
('item-58', 'Armadura Básica', 'Armadura', 'Común', 'https://example.com/basica.jpg', 'Simple', '["Defensa"]', '["Defensa +25"]', 0, 45, NULL),
('item-59', 'Poción Pequeña', 'Ítem', 'Común', 'https://example.com/pocion.jpg', 'Cura leve', '["Heal"]', '["HP +15"]', 0, 0, NULL),
('item-60', 'Habilidad: Golpe Rápido', 'Habilidad', 'Común', 'https://example.com/golpe.jpg', 'Ataque veloz', '["Fast hit"]', '["Daño +10"]', 25, 0, NULL),
('item-61', 'Hacha Brutal', 'Arma', 'Épica', 'https://example.com/hacha.jpg', 'Gran daño', '["Smash"]', '["Crit +20"]', 100, 15, NULL),
('item-62', 'Bestia Salvaje', 'Héroe', 'Épica', 'https://example.com/bestia.jpg', 'Furia total', '["Rage"]', '["Ataque +40"]', 110, 60, NULL),
('item-63', 'Escudo Dorado', 'Armadura', 'Legendaria', 'https://example.com/dorado.jpg', 'Defensa máxima', '["Reflect"]', '["Defensa +150"]', 0, 170, NULL),
('item-64', 'Amuleto Oscuro', 'Ítem', 'Épica', 'https://example.com/amuleto.jpg', 'Poder prohibido', '["Dark"]', '["Power +20"]', 10, 10, NULL),
('item-65', 'Habilidad: Meteoro', 'Habilidad', 'Legendaria', 'https://example.com/meteoro.jpg', 'Impacto devastador', '["Meteor"]', '["Daño +120"]', 130, 0, NULL),
('item-66', 'Lanza Ligera', 'Arma', 'Común', 'https://example.com/lanza.jpg', 'Rápida', '["Pierce"]', '["Ataque +12"]', 38, 5, NULL),
('item-67', 'Explorador', 'Héroe', 'Rara', 'https://example.com/explorador.jpg', 'Ágil', '["Scout"]', '["Velocidad +20"]', 65, 30, NULL),
('item-68', 'Capa Sombría', 'Armadura', 'Épica', 'https://example.com/capa.jpg', 'Sigilo', '["Hide"]', '["Evasión +25"]', 0, 60, NULL),
('item-69', 'Poción Oscura', 'Ítem', 'Rara', 'https://example.com/oscura.jpg', 'Poder oscuro', '["Boost"]', '["Ataque +15"]', 5, 5, NULL),
('item-70', 'Habilidad: Corte Fantasma', 'Habilidad', 'Épica', 'https://example.com/corte.jpg', 'Ataque invisible', '["Ghost slash"]', '["Crit +35"]', 85, 0, NULL);

-- ============================================
-- ASIGNAR ITEMS A USUARIOS
-- ============================================

UPDATE items SET user_id = 'user-1' WHERE id IN ('item-1', 'item-3', 'item-5', 'item-7');
UPDATE items SET user_id = 'user-2' WHERE id IN ('item-2', 'item-4', 'item-6', 'item-8');

-- ============================================
-- INSERTAR MAZOS
-- ============================================

INSERT INTO decks (id, nombre, descripcion, user_id, estrategia, es_principal) VALUES
('deck-1', 'Mazo de Fuego', 'Estrategia agresiva basada en ataques de fuego', 'user-1', 'Agresivo', TRUE),
('deck-2', 'Mazo Defensivo', 'Estrategia defensiva con alta resistencia', 'user-2', 'Defensivo', TRUE);

-- ============================================
-- INSERTAR ITEMS EN MAZOS
-- ============================================

INSERT INTO deck_items (deck_id, item_id, position) VALUES
('deck-1', 'item-1', 1),
('deck-1', 'item-3', 2),
('deck-1', 'item-5', 3),
('deck-2', 'item-2', 1),
('deck-2', 'item-4', 2),
('deck-2', 'item-6', 3);

-- ============================================
-- MARCAR ITEMS EN MAZO ACTIVO
-- ============================================

UPDATE items SET en_mazo_activo = TRUE WHERE id IN ('item-1', 'item-3', 'item-5', 'item-2', 'item-4', 'item-6');

-- ============================================
-- INSERTAR CALIFICACIONES
-- ============================================

INSERT INTO ratings (id, item_id, user_id, stars) VALUES
('rating-1', 'item-1', 'user-2', 5),
('rating-2', 'item-2', 'user-1', 4),
('rating-3', 'item-3', 'user-2', 3),
('rating-4', 'item-6', 'user-1', 5);

-- ============================================
-- INSERTAR COMENTARIOS
-- ============================================

INSERT INTO comments (id, item_id, user_id, content) VALUES
('comment-1', 'item-1', 'user-2', '¡Increíble arma! Me ayudó a ganar muchas batallas.'),
('comment-2', 'item-2', 'user-1', 'Muy buena defensa contra ataques de fuego.'),
('comment-3', 'item-6', 'user-1', 'El mejor héroe del juego, sin duda.');

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

SELECT COUNT(*) as total_items FROM items WHERE activo = TRUE;
SELECT COUNT(*) as total_users FROM users;
