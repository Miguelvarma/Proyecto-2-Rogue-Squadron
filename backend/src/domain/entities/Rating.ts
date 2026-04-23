// domain/entities/Rating.ts
export class Rating {
  constructor(
    public readonly id: string,
    public readonly itemId: string,    // ⚠️ Cambiado de productId a itemId
    public readonly userId: string,
    public readonly score: number,      // En el código se llama score
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(itemId: string, userId: string, score: number): Rating {
    const now = new Date();
    return new Rating(
      crypto.randomUUID(),
      itemId,
      userId,
      score,
      now,
      now
    );
  }

  updateScore(newScore: number): Rating {
    return new Rating(
      this.id,
      this.itemId,
      this.userId,
      newScore,
      this.createdAt,
      new Date()
    );
  }
}