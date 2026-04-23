// src/application/usecases/Heroes/CrearHeroe.ts
import { IHeroRepository } from "../../repositories/IHeroRepository";
import { Heroe } from "../../../domain/entities/Heroe";

interface CrearHeroeDTO {
  name: string;
  description: string;
  price: number;
  stars: number;
  type: 'principal' | 'secundario' | 'Guerrero' | 'Mago' | 'Arquero' | 'Tanque' | 'Asesino';
  image: string;
}

export class CrearHeroe {
  constructor(private heroRepository: IHeroRepository) {}

  async ejecutar(data: CrearHeroeDTO): Promise<Heroe> {
    // Crear la entidad (esto valida automáticamente)
    const heroe = new Heroe(
      null,
      data.name,
      data.description,
      data.price,
      data.stars,
      data.type,
      data.image
    );
    
    // Guardar en el repositorio
    return await this.heroRepository.create(heroe);
  }
}