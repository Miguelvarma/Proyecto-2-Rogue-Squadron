import { v4 as uuidv4 } from 'uuid';

export interface UserProps {
  id?: string;
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  apodo: string;
  avatar?: string;
  rol?: 'PLAYER' | 'ADMIN' | 'MODERATOR';
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  public readonly id: string;
  public readonly nombres: string;
  public readonly apellidos: string;
  public readonly email: string;
  public readonly password: string;
  public readonly apodo: string;
  public readonly avatar: string | null;
  public readonly rol: 'PLAYER' | 'ADMIN' | 'MODERATOR';
  public readonly emailVerified: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id || uuidv4();
    this.nombres = props.nombres;
    this.apellidos = props.apellidos;
    this.email = props.email.toLowerCase();
    this.password = props.password;
    this.apodo = props.apodo;
    this.avatar = props.avatar || null;
    this.rol = props.rol || 'PLAYER';
    this.emailVerified = props.emailVerified || false;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  private validate(): void {
    if (!this.nombres || this.nombres.trim().length < 2) {
      throw new Error('Nombres debe tener al menos 2 caracteres');
    }

    if (!this.apellidos || this.apellidos.trim().length < 2) {
      throw new Error('Apellidos debe tener al menos 2 caracteres');
    }

    if (!this.isValidEmail(this.email)) {
      throw new Error('Email inválido');
    }

    if (!this.apodo || this.apodo.length < 3 || this.apodo.length > 20) {
      throw new Error('Apodo debe tener entre 3 y 20 caracteres');
    }

    if (!this.password) {
      throw new Error('Password es requerido');
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }


  
 public toPublic(): Omit<UserProps, 'password'> {
  return {
    id: this.id,
    nombres: this.nombres,
    apellidos: this.apellidos,
    email: this.email,
    apodo: this.apodo,
    avatar: this.avatar ?? undefined,
    rol: this.rol,
    emailVerified: this.emailVerified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
}
  public toPersistence(): UserProps {
    return {
      id: this.id,
      nombres: this.nombres,
      apellidos: this.apellidos,
      email: this.email,
      password: this.password,
      apodo: this.apodo,
      avatar: this.avatar || undefined,
      rol: this.rol,
      emailVerified: this.emailVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPersistence(data: UserProps): User {
    return new User(data);
  }
}