export class DomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) { super(message, 'VALIDATION_ERROR'); }
}
export class NotFoundError extends DomainError {
  constructor(resource: string) { super(`${resource} no encontrado`, 'NOT_FOUND'); }
}
export class AuthorizationError extends DomainError {
  constructor(message = 'No autorizado para esta accion') { super(message, 'FORBIDDEN'); }
}
export class ConflictError extends DomainError {
  constructor(message: string) { super(message, 'CONFLICT'); }
}
