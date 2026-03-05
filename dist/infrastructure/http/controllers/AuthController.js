"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const logger_1 = require("../../logging/logger");
class AuthController {
    constructor(registerUser, loginUser) {
        this.registerUser = registerUser;
        this.loginUser = loginUser;
        this.register = async (req, res, next) => {
            try {
                const result = await this.registerUser.execute(req.body);
                (0, logger_1.logAuthEvent)('login', {
                    userId: result.user.id,
                    ip: req.ip || '',
                    userAgent: req.headers['user-agent'] || '',
                    success: true,
                });
                res.status(201).json({
                    message: 'Usuario registrado exitosamente',
                    user: result.user,
                    token: result.token,
                });
            }
            catch (error) {
                next(error);
            }
        };
        // NUEVO: Login
        this.login = async (req, res, next) => {
            try {
                const result = await this.loginUser.execute(req.body, req.ip || '', req.headers['user-agent'] || '');
                // Establecer refresh token como httpOnly cookie
                res.cookie('refreshToken', result.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
                });
                res.status(200).json({
                    message: 'Login exitoso',
                    user: result.user,
                    accessToken: result.accessToken
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AuthController = AuthController;
