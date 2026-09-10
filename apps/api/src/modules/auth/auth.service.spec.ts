import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/user-role.enum';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

describe('AuthService', () => {
  const jwtService = { sign: jest.fn(() => 'signed-token') };
  const user = {
    id: 'user-1',
    name: 'Demo User',
    email: 'demo@example.test',
    passwordHash: 'hash',
    role: UserRole.VIEWER
  };

  function service(usersService: Partial<Record<'findByEmail' | 'create', jest.Mock>>) {
    return new AuthService(usersService as any, jwtService as any);
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new viewer and returns a token with a safe user object', async () => {
    const usersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(user)
    };
    jest.mocked(bcrypt.hash).mockResolvedValue('hash' as never);

    const result = await service(usersService).register({
      name: 'Demo User',
      email: 'demo@example.test',
      password: 'ChangeMe123!'
    });

    expect(usersService.create).toHaveBeenCalledWith({ name: 'Demo User', email: 'demo@example.test', passwordHash: 'hash' });
    expect(result).toEqual({
      accessToken: 'signed-token',
      user: { id: 'user-1', name: 'Demo User', email: 'demo@example.test', role: UserRole.VIEWER }
    });
  });

  it('rejects duplicate registration emails', async () => {
    await expect(
      service({ findByEmail: jest.fn().mockResolvedValue(user) }).register({
        name: 'Demo User',
        email: 'demo@example.test',
        password: 'ChangeMe123!'
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('uses a generic login error for missing users and bad passwords', async () => {
    await expect(service({ findByEmail: jest.fn().mockResolvedValue(null) }).login({ email: 'x@example.test', password: 'bad' })).rejects.toBeInstanceOf(
      UnauthorizedException
    );

    jest.mocked(bcrypt.compare).mockResolvedValue(false as never);
    await expect(service({ findByEmail: jest.fn().mockResolvedValue(user) }).login({ email: 'demo@example.test', password: 'bad' })).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });
});
