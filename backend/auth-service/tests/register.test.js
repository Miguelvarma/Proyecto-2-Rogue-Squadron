const request = require('supertest');
const app = require('../src/app');

describe('POST /api/auth/register', () => {
  const validPayload = {
    nombres: 'Juan',
    apellidos: 'Pérez',
    email: 'juan.perez@example.com',
    password: 'ValidPass123!',
    apodo: 'Juancito',
    avatar: 'http://example.com/avatar.png'
  };

  test('debe registrar usuario correctamente y retornar token', async () => {
    const res = await request(app).post('/api/auth/register').send(validPayload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.user.email).toBe(validPayload.email.toLowerCase());
    expect(res.body.user.apodo).toBe(validPayload.apodo);
  });

  test('debe fallar si se registra el mismo email', async () => {
    const res = await request(app).post('/api/auth/register').send(validPayload);
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('message');
  });

  test('debe fallar si la contraseña no cumple reglas', async () => {
    const bad = { ...validPayload, email: 'nuevo@example.com', apodo: 'OtroApodo', password: 'short' };
    const res = await request(app).post('/api/auth/register').send(bad);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});
