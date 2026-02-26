const { randomUUID } = require('crypto');

// Almacenamiento en memoria para Sprint 1 (mock DB)
const users = [];

function findByEmail(email) {
  if (!email) return null;
  return users.find((u) => u.email === email.toLowerCase());
}

function findByApodo(apodo) {
  if (!apodo) return null;
  return users.find((u) => u.apodo.toLowerCase() === apodo.toLowerCase());
}

async function createUser({ nombres, apellidos, email, password, apodo, avatar }) {
  const now = new Date().toISOString();
  const user = {
    id: randomUUID(),
    nombres,
    apellidos,
    email: email.toLowerCase(),
    password, // hashed
    apodo,
    avatar,
    rol: 'jugador',
    createdAt: now,
    updatedAt: now
  };

  users.push(user);
  return user;
}

module.exports = {
  findByEmail,
  findByApodo,
  createUser,
  // export users para tests/debug
  __users: users
};
