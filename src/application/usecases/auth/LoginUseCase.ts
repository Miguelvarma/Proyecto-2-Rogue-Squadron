import { IPlayerRepository } from '../../../domain/repositories/IPlayerRepository';
import { DomainError } from '../../../domain/errors/DomainError';
import bcrypt from 'bcrypt';

export interface LoginInput {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(private readonly playerRepository: IPlayerRepository) {}

  async execute(input: LoginInput) {
    const player = await this.playerRepository.findByEmail(input.email);
    if (!player) throw new DomainError('Credenciales invalidas', 'UNAUTHORIZED');

    const valid = await bcrypt.compare(input.password, player.passwordHash);
    if (!valid) throw new DomainError('Credenciales invalidas', 'UNAUTHORIZED');

    return player;
  }
}
