// src/application/repositories/IHeroRepository.ts
import { Heroe } from "../../domain/entities/Heroe";

export interface IHeroRepository {
  findAll(): Promise<Heroe[]>;
  findById(id: number): Promise<Heroe | null>;
  create(hero: Omit<Heroe, 'id'>): Promise<Heroe>;
  update(id: number, hero: Partial<Heroe>): Promise<Heroe>;
  delete(id: number): Promise<void>;
}