"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const uuid_1 = require("uuid");
class User {
    constructor(props) {
        this.id = props.id || (0, uuid_1.v4)();
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
    validate() {
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
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    toPublic() {
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
    toPersistence() {
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
    static fromPersistence(data) {
        return new User(data);
    }
}
exports.User = User;
