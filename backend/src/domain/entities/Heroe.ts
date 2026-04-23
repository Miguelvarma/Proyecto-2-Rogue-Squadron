// src/domain/entities/Heroe.ts
export class Heroe {
  constructor(
    public id: number | null,
    public name: string,
    public description: string,
    public price: number,
    public stars: number,
    public type: 'principal' | 'secundario' | 'Guerrero' | 'Mago' | 'Arquero' | 'Tanque' | 'Asesino',
    public image: string
  ) {
    this.validate();
  }

  private validate() {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error("El nombre del héroe es obligatorio");
    }

    if (this.name.length < 3) {
      throw new Error("El nombre debe tener al menos 3 caracteres");
    }

    if (this.price < 0) {
      throw new Error("El precio no puede ser negativo");
    }

    if (this.stars < 1 || this.stars > 5) {
      throw new Error("Las estrellas deben estar entre 1 y 5");
    }

    if (!this.description || this.description.trim().length === 0) {
      throw new Error("La descripción es obligatoria");
    }

    // La imagen ya no es obligatoria
    // if (!this.image) {
    //   throw new Error("La imagen es obligatoria");
    // }
  }

  update(data: Partial<Omit<Heroe, 'id' | 'validate'>>): void {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error("El nombre del héroe es obligatorio");
      }
      this.name = data.name;
    }

    if (data.description !== undefined) {
      if (!data.description || data.description.trim().length === 0) {
        throw new Error("La descripción es obligatoria");
      }
      this.description = data.description;
    }

    if (data.price !== undefined) {
      if (data.price < 0) {
        throw new Error("El precio no puede ser negativo");
      }
      this.price = data.price;
    }

    if (data.stars !== undefined) {
      if (data.stars < 1 || data.stars > 5) {
        throw new Error("Las estrellas deben estar entre 1 y 5");
      }
      this.stars = data.stars;
    }

    if (data.type !== undefined) {
      this.type = data.type;
    }

    if (data.image !== undefined) {
      this.image = data.image;
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      stars: this.stars,
      type: this.type,
      image: this.image
    };
  }
}