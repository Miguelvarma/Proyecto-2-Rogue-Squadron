import { IEmailService } from '../../application/usecases/auth/RegisterUser';
import { logger } from '../logging/logger';

export class EmailService implements IEmailService {
  async sendConfirmation(email: string): Promise<void> {
    logger.info('email.confirmation.sent', {
      email,
      timestamp: new Date().toISOString(),
    });

    console.log(`📧 Email de confirmación enviado a: ${email}`);
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    logger.info('email.password-reset.sent', {
      email,
      timestamp: new Date().toISOString(),
    });

    console.log(`🔑 Email de recuperación enviado a: ${email}`);
  }
}