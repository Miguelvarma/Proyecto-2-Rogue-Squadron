/**
 * Valida la complejidad de una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {{ isValid: boolean, errors: string[] }}
 */
function validatePassword(password) {
  const errors = [];

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

  if (!/[0-9]/.test(password)) {
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

module.exports = { validatePassword };
