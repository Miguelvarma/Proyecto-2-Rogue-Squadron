import { IMissionRepository } from '../../../domain/repositories/IMissionRepository';
import { IPlayerRepository } from '../../../domain/repositories/IPlayerRepository';
import { IAIGateway } from '../../ports/IAIGateway';
import { NotFoundError } from '../../../domain/errors/DomainError';

export class GenerateMissionUseCase {
  constructor(
    private readonly missionRepository: IMissionRepository,
    private readonly playerRepository: IPlayerRepository,
    private readonly aiGateway: IAIGateway,
  ) {}

  async execute(playerId: string) {
    const player = await this.playerRepository.findById(playerId);
    if (!player) throw new NotFoundError('Jugador');

    const activeMissions = await this.missionRepository.findActiveByPlayer(playerId);

    const missionData = await this.aiGateway.generateMission({
      playerId,
      rank: player.rank,
      completedMissions: activeMissions.length,
    });

    return this.missionRepository.save({
      ...missionData,
      playerId,
      status: 'ACTIVE',
      aiModel: 'nexus-ai-v1',
    });
  }
}
