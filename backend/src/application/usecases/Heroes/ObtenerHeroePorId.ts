// src/application/usecases/Heroes/ObtenerHeroePorId.ts
import { IHeroRepository } from "../../repositories/IHeroRepository";

export class ObtenerHeroePorId {
  constructor(private heroRepository: IHeroRepository) {}

  async ejecutar(id: number) {  // ✅ number
    const hero = await this.heroRepository.findById(id);
    
    if (!hero) {
      throw new Error("Héroe no encontrado");
    }
    
    return hero;
  }
}
