import bcrypt from 'bcrypt';
import { env } from '../../config/env';
import { IPasswordHasher } from '../../application/usecases/auth/RegisterUser';

export class BcryptHasher implements IPasswordHasher {
  private readonly saltRounds: number;

  constructor() {
    this.saltRounds = 12;
  }

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}