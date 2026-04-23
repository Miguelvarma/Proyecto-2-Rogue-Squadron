import { IPaymentRepository } from '../../../domain/repositories/IPaymentRepository';
import { IInventoryRepository } from '../../../domain/repositories/IInventoryRepository';
import { IPaymentGateway } from '../../ports/IPaymentGateway';
import { ConflictError } from '../../../domain/errors/DomainError';

export class ProcessPaymentWebhookUseCase {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly inventoryRepository: IInventoryRepository,
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute(payload: Buffer, signature: string) {
    // 1. Validar firma HMAC usando el nombre correcto del método y await
    // Nota: verifyWebhook devuelve { valid: boolean; event: Record<string, unknown> | null }
    const { valid, event } = await this.paymentGateway.verifyWebhook(payload, signature);
    
    if (!valid || !event) {
      throw new ConflictError('Firma HMAC invalida o evento vacío');
    }

    // El externalId ahora lo sacamos del evento procesado por el Gateway
    const externalId = event.id as string;

    // 2. Idempotencia — no procesar dos veces el mismo evento
    const existing = await this.paymentRepository.findByExternalId(externalId);
    if (existing?.status === 'COMPLETED') return existing;

    // 3. Actualizar estado del pago
    if (existing) {
      await this.paymentRepository.updateStatus(existing.id, 'COMPLETED');
    }

    return { processed: true, externalId };
  }
}
