// src/infrastructure/http/controllers/HeroController.ts
import { Request, Response } from "express";
import { CrearHeroe } from "../../../application/usecases/Heroes/CrearHeroe";
import { ObtenerHeroes } from "../../../application/usecases/Heroes/ObtenerHeroes";
import { ObtenerHeroePorId } from "../../../application/usecases/Heroes/ObtenerHeroePorId";
import { ActualizarHeroe } from "../../../application/usecases/Heroes/ActualizarHeroe";
import { EliminarHeroe } from "../../../application/usecases/Heroes/EliminarHeroe";

export class HeroController {

  constructor(
    private crearHeroe: CrearHeroe,
    private obtenerHeroes: ObtenerHeroes,
    private obtenerHeroePorId: ObtenerHeroePorId,
    private actualizarHeroe: ActualizarHeroe,
    private eliminarHeroe: EliminarHeroe
  ) {}

  // 🔥 CREAR HEROE (Versión con imagen por body - base64)
  async crear(req: Request, res: Response) {
    try {
      const { name, description, price, stars, type, image } = req.body;

      console.log("📦 Recibido:", { name, description, price, stars, type, hasImage: !!image });

      if (!name || !description || !type) {
        return res.status(400).json({
          success: false,
          error: "Faltan campos: name, description, type"
        });
      }

      const hero = await this.crearHeroe.ejecutar({
        name,
        description,
        price: Number(price),
        stars: Number(stars),
        type,
        image: image || ""
      });

      res.status(201).json({
        success: true,
        message: `✅ Héroe "${name}" creado`,
        hero
      });

    } catch (error: any) {
      console.error("❌ Error:", error.message);
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // 🔥 CREAR HEROE CON ARCHIVO (Versión con multer - file)
  // Si usas multer, descomenta esta versión y comenta la de arriba
  /*
  async crear(req: Request, res: Response) {
    try {
      const { name, description, price, stars, type } = req.body;
      const imagePath = req.file?.path || "";

      console.log("📦 Recibido:", { name, description, price, stars, type, imagePath });

      if (!name || !description || !type) {
        return res.status(400).json({
          success: false,
          error: "Faltan campos: name, description, type"
        });
      }

      const hero = await this.crearHeroe.ejecutar({
        name,
        description,
        price: Number(price),
        stars: Number(stars),
        type,
        image: imagePath
      });

      res.status(201).json({
        success: true,
        message: `✅ Héroe "${name}" creado`,
        hero
      });

    } catch (error: any) {
      console.error("❌ Error:", error.message);
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
  */

  // 🔥 LISTAR HEROES
  async listar(req: Request, res: Response) {
    try {
      const heroes = await this.obtenerHeroes.ejecutar();
      res.json({
        success: true,
        count: heroes.length,
        heroes
      });
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // 🔥 OBTENER POR ID
  async obtenerPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const hero = await this.obtenerHeroePorId.ejecutar(parseInt(id));
      
      if (!hero) {
        return res.status(404).json({ 
          success: false, 
          error: "Héroe no encontrado" 
        });
      }
      
      res.json({ success: true, hero });
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // 🔥 ACTUALIZAR HEROE
  async actualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, price, stars, type, image } = req.body;
      
      console.log("✏️ Actualizando héroe ID:", id);
      
      const hero = await this.actualizarHeroe.ejecutar({
        id: id,
        name,
        description,
        price: price ? Number(price) : undefined,
        stars: stars ? Number(stars) : undefined,
        type,
        image
      });
      
      res.json({ 
        success: true, 
        message: "✅ Héroe actualizado exitosamente",
        hero
      });
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // 🔥 ELIMINAR HEROE
  async eliminar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log("🗑️ Eliminando héroe ID:", id);
      
      await this.eliminarHeroe.ejecutar(id);
      
      res.json({ 
        success: true, 
        message: "✅ Héroe eliminado exitosamente"
      });
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}