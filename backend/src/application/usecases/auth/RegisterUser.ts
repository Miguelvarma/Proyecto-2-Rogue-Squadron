// src/application/usecases/auth/RegisterUser.ts
import { User }              from '../../../domain/entities/User';
import { IUserRepository }   from '../../../domain/repositories/IUserRepository';
import { validatePassword }  from '../../validators/passwordValidator';

export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface ITokenService {
  generate(payload: any): string;
  generateRefreshToken(payload: any): string;
  verify(token: string): any;
}

export interface IEmailService {
  sendConfirmation(email: string): Promise<void>;
}

interface RegisterUserDTO {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  apodo: string;
  avatar?: string;
}

export class RegisterUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService:   ITokenService,
    private readonly emailService:   IEmailService,
  ) {}

  async execute(data: RegisterUserDTO): Promise<{ user: any; token: string }> {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Contraseña inválida: ${passwordValidation.errors.join(', ')}`);
    }

    this.validateApodo(data.apodo);

    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) throw new Error('El email ya está registrado');

    const existingApodo = await this.userRepository.findByApodo(data.apodo);
    if (existingApodo) throw new Error('El apodo ya está en uso');

    const hashedPassword = await this.passwordHasher.hash(data.password);

    const user = new User({
      nombres:   data.nombres.trim(),
      apellidos: data.apellidos.trim(),
      email:     data.email.toLowerCase().trim(),
      password:  hashedPassword,
      apodo:     data.apodo.trim(),
      avatar:    data.avatar,
    });

    const savedUser = await this.userRepository.save(user);

    const token = this.tokenService.generate({
      userId: savedUser.id,
      email:  savedUser.email,
      apodo:  savedUser.apodo,
      rol:    savedUser.rol,
    });

    this.emailService.sendConfirmation(savedUser.email).catch(err => {
      console.error('Error enviando email:', err);
    });

    return { user: savedUser.toPublic(), token };
  }

  private validateApodo(apodo: string): void {
    const prohibidas = [
      'puto','puta','idiota','estupido','mierda','carajo',
      'messi','ronaldo','neymar','shakira',
      'trump','biden','putin','maduro','petro','uribe',
      'nike','adidas','apple','google','facebook','microsoft',
    ];
    const lower = apodo.toLowerCase();
    for (const p of prohibidas) {
      if (lower.includes(p)) throw new Error('El apodo contiene palabras no permitidas');
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(apodo)) {
      throw new Error('El apodo debe tener entre 3 y 20 caracteres alfanuméricos');
    }
  }
}