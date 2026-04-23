// src/infrastructure/container.ts (o el archivo donde configuras)
import { Pool } from 'mysql2/promise';
import { MySQLHeroRepository } from './repositories/MySQLHeroRepository';
import { CrearHeroe } from '../application/usecases/Heroes/CrearHeroe';
import { ObtenerHeroes } from '../application/usecases/Heroes/ObtenerHeroes';
import { ObtenerHeroePorId } from '../application/usecases/Heroes/ObtenerHeroePorId';
import { ActualizarHeroe } from '../application/usecases/Heroes/ActualizarHeroe';
import { EliminarHeroe } from '../application/usecases/Heroes/EliminarHeroe';
import { HeroController } from '../infrastructure/http/controllers/HeroController';

// Configuración de la base de datos
const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nexus_battles',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Repositorio
const heroRepository = new MySQLHeroRepository(db);

// Casos de uso
const crearHeroe = new CrearHeroe(heroRepository);
const obtenerHeroes = new ObtenerHeroes(heroRepository);
const obtenerHeroePorId = new ObtenerHeroePorId(heroRepository);
const actualizarHeroe = new ActualizarHeroe(heroRepository);
const eliminarHeroe = new EliminarHeroe(heroRepository);

// Controlador con TODOS los casos de uso
const heroController = new HeroController(
  crearHeroe,
  obtenerHeroes,
  obtenerHeroePorId,
  actualizarHeroe,
  eliminarHeroe
);

export { heroController };