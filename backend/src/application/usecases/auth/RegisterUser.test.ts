import { RegisterUser }    from '../../../../src/application/usecases/auth/RegisterUser';
import { IUserRepository } from '../../../../src/domain/repositories/IUserRepository';

const mockRepo: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  findByApodo: jest.fn(),
  findById:    jest.fn(),
  save:        jest.fn(),
  update:      jest.fn(),
};

const mockHasher = {
  hash:    jest.fn().mockResolvedValue('hashed_pass'),
  compare: jest.fn(),
};

const mockToken = {
  generate:             jest.fn().mockReturnValue('token_123'),
  generateRefreshToken: jest.fn().mockReturnValue('refresh_123'),
  verify:               jest.fn(),
};

const mockEmail = {
  sendConfirmation: jest.fn().mockResolvedValue(undefined),
};

const validDTO = {
  nombres:   'Juan',
  apellidos: 'Pérez',
  email:     'juan@test.com',
  password:  'SecurePass1!',
  apodo:     'juanp',
};

const savedUserMock: any = {
  id: 'uuid-1', nombres: 'Juan', apellidos: 'Pérez',
  email: 'juan@test.com', apodo: 'juanp', rol: 'PLAYER',
  emailVerified: false,
  toPublic: () => ({ id: 'uuid-1', nombres: 'Juan', email: 'juan@test.com', apodo: 'juanp' }),
};

describe('RegisterUser', () => {
  let useCase: RegisterUser;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegisterUser(mockRepo, mockHasher, mockToken, mockEmail);
  });

  it('debe registrar usuario nuevo y devolver user + token', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.findByApodo.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue(savedUserMock);

    const result = await useCase.execute(validDTO);

    expect(result.token).toBe('token_123');
    expect(result.user.apodo).toBe('juanp');
    expect(mockHasher.hash).toHaveBeenCalledWith(validDTO.password);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockToken.generate).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'juan@test.com', apodo: 'juanp' })
    );
  });

  it('debe rechazar si el email ya está registrado', async () => {
    mockRepo.findByEmail.mockResolvedValue(savedUserMock);

    await expect(useCase.execute(validDTO))
      .rejects.toThrow('El email ya está registrado');
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('debe rechazar si el apodo ya está en uso', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.findByApodo.mockResolvedValue(savedUserMock);

    await expect(useCase.execute(validDTO))
      .rejects.toThrow('El apodo ya está en uso');
  });

  it('debe rechazar si la contraseña no cumple los requisitos', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.findByApodo.mockResolvedValue(null);

    await expect(useCase.execute({ ...validDTO, password: 'weak' }))
      .rejects.toThrow('Contraseña inválida');
  });

  it('debe rechazar si el apodo contiene palabras prohibidas', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.findByApodo.mockResolvedValue(null);

    await expect(useCase.execute({ ...validDTO, apodo: 'supermessi' }))
      .rejects.toThrow('El apodo contiene palabras no permitidas');
  });

  it('no debe lanzar aunque el email de confirmación falle', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.findByApodo.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue(savedUserMock);
    mockEmail.sendConfirmation.mockRejectedValue(new Error('SMTP down'));

    await expect(useCase.execute(validDTO)).resolves.toBeDefined();
  });
});