import { IPlayerRepository } from '../../../domain/repositories/IPlayerRepository';
import { ConflictError } from '../../../domain/errors/DomainError';
import bcrypt from 'bcrypt';

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export class RegisterUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(input: RegisterInput) {
    const existingEmail = await this.playerRepository.findByEmail(input.email);
    if (existingEmail) throw new ConflictError('El email ya esta registrado');

    const existingUsername = await this.playerRepository.findByUsername(input.username);
    if (existingUsername) throw new ConflictError('El username ya esta en uso');

    const passwordHash = await bcrypt.hash(input.password, 12);
    const player = await this.playerRepository.save({
      username: input.username,
      email: input.email,
      passwordHash,
      role: 'PLAYER',
      rank: 0,
      coins: 0,
    });
    return player;
  }
}
