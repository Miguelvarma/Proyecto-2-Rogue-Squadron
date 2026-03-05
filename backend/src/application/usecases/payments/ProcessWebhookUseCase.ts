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

  async execute(payload: Buffer, signature: string, event: Record<string, unknown>) {
    // 1. Validar firma HMAC — rechaza si es invalida
    const isValid = this.paymentGateway.validateWebhookSignature(payload, signature);
    if (!isValid) throw new ConflictError('Firma HMAC invalida');

    const externalId = event['id'] as string;

    // 2. Idempotencia — no procesar dos veces el mismo evento
    const existing = await this.paymentRepository.findByExternalId(externalId);
    if (existing?.status === 'COMPLETED') return existing;

    // 3. Actualizar estado del pago (dentro de transaccion ACID en el repositorio)
    if (existing) {
      await this.paymentRepository.updateStatus(existing.id, 'COMPLETED');
    }

    return { processed: true, externalId };
  }
}
