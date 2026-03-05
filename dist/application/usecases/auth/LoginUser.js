"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUser = void 0;
const logger_1 = require("../../../infrastructure/logging/logger");
class LoginUser {
    constructor(userRepository, passwordHasher, tokenService) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
    }
    async execute(data, ip, userAgent) {
        // 1. Buscar usuario por email
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            // ✅ CORRECCIÓN: Usar logger directamente en lugar de logAuthEvent
            logger_1.logger.warn('auth.login.failed', {
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
        const isValidPassword = await this.passwordHasher.compare(data.password, user.password);
        if (!isValidPassword) {
            logger_1.logger.warn('auth.login.failed', {
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
        logger_1.logger.info('auth.login.success', {
            userId: user.id,
            ip,
            userAgent,
            success: true,
            timestamp: new Date().toISOString()
        });
        return {
            user: user.toPublic(),
            accessToken,
            refreshToken
        };
    }
}
exports.LoginUser = LoginUser;
