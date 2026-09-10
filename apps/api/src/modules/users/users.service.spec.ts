import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserRole } from './user-role.enum';
import { UsersService } from './users.service';

describe('UsersService', () => {
  function service(repository: Record<string, jest.Mock>) {
    return new UsersService(repository as any);
  }

  it('normalizes email when creating users', async () => {
    const repository = {
      create: jest.fn((input) => input),
      save: jest.fn((input) => Promise.resolve(input))
    };

    const result = await service(repository).create({
      name: 'Demo',
      email: 'Demo@Example.TEST',
      passwordHash: 'hash'
    });

    expect(result.email).toBe('demo@example.test');
  });

  it('throws when a user is not found', async () => {
    await expect(service({ findOne: jest.fn().mockResolvedValue(null) }).findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('prevents removing the last admin role', async () => {
    const admin = { id: 'admin-1', role: UserRole.ADMIN };
    const repository = {
      findOne: jest.fn().mockResolvedValue(admin),
      count: jest.fn().mockResolvedValue(1),
      save: jest.fn()
    };

    await expect(service(repository).updateRole('admin-1', UserRole.VIEWER)).rejects.toBeInstanceOf(ConflictException);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
