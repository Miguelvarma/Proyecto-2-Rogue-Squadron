// src/application/usecases/Heroes/ActualizarHeroe.ts
import { IHeroRepository } from "../../repositories/IHeroRepository";
import { Heroe } from "../../../domain/entities/Heroe";

export interface ActualizarHeroeDTO {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stars?: number;
  type?: string;  // ✅ Mantener como string, luego validar
  image?: string;
}

export class ActualizarHeroe {
  constructor(private heroRepository: IHeroRepository) {}

  async ejecutar(data: ActualizarHeroeDTO) {
    const idNumber = parseInt(data.id);
    
    if (isNaN(idNumber)) {
      throw new Error("ID inválido");
    }
    
    const existingHero = await this.heroRepository.findById(idNumber);
    
    if (!existingHero) {
      throw new Error("Héroe no encontrado");
    }
    
    // ✅ Validar tipo si viene
    const tiposValidos = ['principal', 'secundario', 'Guerrero', 'Mago', 'Arquero', 'Tanque', 'Asesino'];
    if (data.type && !tiposValidos.includes(data.type)) {
      throw new Error(`Tipo inválido. Tipos permitidos: ${tiposValidos.join(', ')}`);
    }
    
    const updatedHero = await this.heroRepository.update(idNumber, {
      name: data.name,
      description: data.description,
      price: data.price,
      stars: data.stars,
      type: data.type as any,  // ✅ Usar 'as any' para evitar error de tipo
      image: data.image
    });
    
    return updatedHero;
  }
}