// src/application/usecases/Heroes/EliminarHeroe.ts
import { IHeroRepository } from "../../repositories/IHeroRepository";

export class EliminarHeroe {
  constructor(private heroRepository: IHeroRepository) {}

  async ejecutar(id: string) {  // ✅ string
    const idNumber = parseInt(id);
    
    if (isNaN(idNumber)) {
      throw new Error("ID inválido");
    }
    
    const existingHero = await this.heroRepository.findById(idNumber);
    
    if (!existingHero) {
      throw new Error("Héroe no encontrado");
    }
    
    await this.heroRepository.delete(idNumber);
    
    return { success: true };
  }
}