const { validatePassword } = require('./passwordValidator');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const OFFENSIVE_WORDS = ['badword1', 'badword2', 'offensivo'];
const CELEBRITIES_BRANDS = ['elon', 'mcdonald', 'nike', 'apple'];

function validateRegisterInput({ nombres, apellidos, email, password, apodo }) {
  const errors = [];

  if (!nombres || typeof nombres !== 'string') errors.push('Los nombres son requeridos');
  if (!apellidos || typeof apellidos !== 'string') errors.push('Los apellidos son requeridos');
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) errors.push('Email inválido');
  if (!apodo || typeof apodo !== 'string') errors.push('Apodo es requerido');
  if (!password) errors.push('La contraseña es requerida');

  if (password) {
    const passResult = validatePassword(password);
    if (!passResult.isValid) {
      passResult.errors.forEach((e) => errors.push(e));
    }
  }

  return { valid: errors.length === 0, errors };
}

function isOffensive(apodo) {
  const lower = apodo.toLowerCase();
  return OFFENSIVE_WORDS.some((w) => lower.includes(w));
}

function containsCelebrityOrBrand(apodo) {
  const lower = apodo.toLowerCase();
  return CELEBRITIES_BRANDS.some((w) => lower.includes(w));
}

module.exports = { validateRegisterInput, isOffensive, containsCelebrityOrBrand };
