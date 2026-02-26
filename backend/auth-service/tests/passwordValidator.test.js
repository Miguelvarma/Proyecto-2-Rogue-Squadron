const { validatePassword } = require('../src/utils/passwordValidator');

describe('validatePassword', () => {
  test('debe validar contraseña correcta', () => {
    const result = validatePassword('ValidPass123!');
    expect(result).toEqual({ isValid: true, errors: [] });
  });

  test('debe aceptar caracteres especiales válidos', () => {
    const candidates = ['Abc123!@#', 'MyP@ssw0rd', 'Valid_123?A'];

    candidates.forEach((value) => {
      const result = validatePassword(value);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  test('debe fallar si es menor a 8 caracteres', () => {
    const result = validatePassword('short1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('La contraseña debe tener al menos 8 caracteres');
  });

  test('debe fallar si no contiene mayúscula', () => {
    const result = validatePassword('alllowercase123!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Debe contener al menos una letra mayúscula');
  });

  test('debe fallar si no contiene minúscula', () => {
    const result = validatePassword('ALLUPPERCASE123!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Debe contener al menos una letra minúscula');
  });

  test('debe fallar si no contiene números', () => {
    const result = validatePassword('NoNumbers!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Debe contener al menos un número');
  });

  test('debe fallar si no contiene símbolos', () => {
    const result = validatePassword('NoSymbols123');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Debe contener al menos un símbolo especial');
  });

  test('debe acumular múltiples errores', () => {
    const result = validatePassword('OnlyLetters');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Debe contener al menos un número');
    expect(result.errors).toContain('Debe contener al menos un símbolo especial');
  });

  test('debe fallar para null', () => {
    const result = validatePassword(null);
    expect(result).toEqual({
      isValid: false,
      errors: ['La contraseña es requerida']
    });
  });

  test('debe fallar para string vacío', () => {
    const result = validatePassword('');
    expect(result).toEqual({
      isValid: false,
      errors: ['La contraseña es requerida']
    });
  });
});
