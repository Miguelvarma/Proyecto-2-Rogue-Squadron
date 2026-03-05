"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepositoryMySQL = void 0;
const User_1 = require("../../../domain/entities/User");
const database_1 = require("../database");
class UserRepositoryMySQL {
    async findByEmail(email) {
        const connection = (0, database_1.getConnection)();
        const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
        if (rows.length === 0)
            return null;
        return this.mapToDomain(rows[0]);
    }
    async findByApodo(apodo) {
        const connection = (0, database_1.getConnection)();
        const [rows] = await connection.query('SELECT * FROM users WHERE apodo = ?', [apodo]);
        if (rows.length === 0)
            return null;
        return this.mapToDomain(rows[0]);
    }
    async findById(id) {
        const connection = (0, database_1.getConnection)();
        const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
        if (rows.length === 0)
            return null;
        return this.mapToDomain(rows[0]);
    }
    async save(user) {
        const connection = (0, database_1.getConnection)();
        const data = user.toPersistence();
        await connection.query(`INSERT INTO users (id, nombres, apellidos, email, password, apodo, avatar, rol, email_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            data.id,
            data.nombres,
            data.apellidos,
            data.email,
            data.password,
            data.apodo,
            data.avatar || null,
            data.rol,
            data.emailVerified ? 1 : 0,
            data.createdAt,
            data.updatedAt,
        ]);
        return user;
    }
    async update(user) {
        const connection = (0, database_1.getConnection)();
        const data = user.toPersistence();
        await connection.query(`UPDATE users 
       SET nombres = ?, apellidos = ?, email = ?, apodo = ?, avatar = ?, 
           rol = ?, email_verified = ?, updated_at = ?
       WHERE id = ?`, [
            data.nombres,
            data.apellidos,
            data.email,
            data.apodo,
            data.avatar || null,
            data.rol,
            data.emailVerified ? 1 : 0,
            new Date(),
            data.id,
        ]);
        return user;
    }
    mapToDomain(row) {
        return User_1.User.fromPersistence({
            id: row.id,
            nombres: row.nombres,
            apellidos: row.apellidos,
            email: row.email,
            password: row.password,
            apodo: row.apodo,
            avatar: row.avatar || undefined,
            rol: row.rol,
            emailVerified: Boolean(row.email_verified),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    }
}
exports.UserRepositoryMySQL = UserRepositoryMySQL;
