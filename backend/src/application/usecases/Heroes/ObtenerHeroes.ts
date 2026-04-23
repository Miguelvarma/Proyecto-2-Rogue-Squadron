import { Heroe } from "../../../domain/entities/Heroe";

export class ObtenerHeroes {

  constructor(private heroRepository: any) {}

  async ejecutar(): Promise<Heroe[]> {
    return await this.heroRepository.findAll();
  }
}