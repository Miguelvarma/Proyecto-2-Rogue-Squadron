import { RegisterUseCase } from '../../../src/application/usecases/auth/RegisterUseCase';
import { IPlayerRepository } from '../../../src/domain/repositories/IPlayerRepository';
import { ConflictError } from '../../../src/domain/errors/DomainError';

const mockRepo: jest.Mocked<IPlayerRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  updateRank: jest.fn(),
  getRankings: jest.fn(),
};

describe('RegisterUseCase', () => {
  const useCase = new RegisterUseCase(mockRepo);

  beforeEach(() => jest.clearAllMocks());

  it('debe registrar jugador nuevo', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.findByUsername.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue({ id: '1', username: 'testuser', email: 'test@test.com' } as any);

    const result = await useCase.execute({ username: 'testuser', email: 'test@test.com', password: 'pass12345' });
    expect(result.username).toBe('testuser');
  });

  it('debe rechazar si el email ya existe', async () => {
    mockRepo.findByEmail.mockResolvedValue({ id: '1' } as any);
    await expect(useCase.execute({ username: 'u', email: 'existe@test.com', password: 'p' }))
      .rejects.toThrow(ConflictError);
  });
});
