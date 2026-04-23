import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IPasswordHasher } from './RegisterUser';
import { ITokenService } from './RegisterUser';
import { logger } from '../../../infrastructure/logging/logger';

interface LoginDTO {
  email: string;
  password: string;
}

export class LoginUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  async execute(data: LoginDTO, ip: string, userAgent: string): Promise<{ 
    player: any; 
    accessToken: string;
    refreshToken: string;
  }> {
    // 1. Buscar usuario por email
    const user = await this.userRepository.findByEmail(data.email);
    
    if (!user) {
      // ✅ CORRECCIÓN: Usar logger directamente en lugar de logAuthEvent
      logger.warn('auth.login.failed', {
        email: data.email,
        ip,
        userAgent,
        success: false,
        reason: 'Usuario no encontrado',
        timestamp: new Date().toISOString()
      });
      throw new Error('Credenciales inválidas');
    }

    // 2. Verificar contraseña
    const isValidPassword = await this.passwordHasher.compare(
      data.password, 
      user.password
    );

    if (!isValidPassword) {
      logger.warn('auth.login.failed', {
        userId: user.id,
        ip,
        userAgent,
        success: false,
        reason: 'Contraseña incorrecta',
        timestamp: new Date().toISOString()
      });
      throw new Error('Credenciales inválidas');
    }

    // 3. Generar tokens
    const payload = {
      userId: user.id,
      email: user.email,
      apodo: user.apodo,
      rol: user.rol
    };

    const accessToken = this.tokenService.generate(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    // 4. Log exitoso
    logger.info('auth.login.success', {
      userId: user.id,
      email: user.email,
      rol: user.rol,
      ip,
      userAgent,
      success: true,
      timestamp: new Date().toISOString()
    });

    console.log('✅ [LoginUser] Login exitoso para:', user.email, 'con token:', accessToken.substring(0, 20) + '...');

    return {
      player: user.toPublic(),
      accessToken,
      refreshToken
    };
  }
}