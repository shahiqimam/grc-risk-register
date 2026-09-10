import { NotFoundException } from '@nestjs/common';
import { RisksService } from './risks.service';

describe('RisksService', () => {
  function service(overrides: Record<string, any> = {}) {
    return new RisksService(
      { transaction: jest.fn() } as any,
      { calculate: jest.fn() } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {
        findOne: jest.fn().mockResolvedValue(null),
        ...overrides.usersRepository
      } as any
    );
  }

  it('rejects risk creation when the owner does not exist', async () => {
    await expect(
      service().create({
        title: 'Missing owner risk',
        description: 'A sufficiently long generic risk description.',
        category: 'CYBERSECURITY' as any,
        likelihood: 3,
        impact: 4,
        ownerId: 'b9d9d900-0000-4000-8000-000000000000',
        status: 'OPEN' as any,
        reviewDate: '2026-12-31'
      })
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
