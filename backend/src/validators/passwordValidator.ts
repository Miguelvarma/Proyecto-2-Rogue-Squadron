/**
 * SCRUM-43: Validador de contraseñas
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (typeof password !== 'string' || password.length === 0) {
    return {
      isValid: false,
      errors: ['La contraseña es requerida']
    };
  }

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('Debe contener al menos un número');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Debe contener al menos un símbolo especial');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}