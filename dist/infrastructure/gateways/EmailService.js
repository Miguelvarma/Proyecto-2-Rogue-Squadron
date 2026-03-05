"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const logger_1 = require("../logging/logger");
class EmailService {
    async sendConfirmation(email) {
        logger_1.logger.info('email.confirmation.sent', {
            email,
            timestamp: new Date().toISOString(),
        });
        console.log(`📧 Email de confirmación enviado a: ${email}`);
    }
    async sendPasswordReset(email, token) {
        logger_1.logger.info('email.password-reset.sent', {
            email,
            timestamp: new Date().toISOString(),
        });
        console.log(`🔑 Email de recuperación enviado a: ${email}`);
    }
}
exports.EmailService = EmailService;
