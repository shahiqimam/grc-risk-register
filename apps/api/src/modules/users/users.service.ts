import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './user-role.enum';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  create(input: { name: string; email: string; passwordHash: string; role?: UserRole }) {
    return this.usersRepository.save(this.usersRepository.create(input));
  }

  findAll() {
    return this.usersRepository.find({ order: { createdAt: 'DESC' } });
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email: email.toLowerCase() } });
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.findOne(id);
    if (user.role === UserRole.ADMIN && role !== UserRole.ADMIN) {
      const admins = await this.usersRepository.count({ where: { role: UserRole.ADMIN } });
      if (admins <= 1) {
        throw new ConflictException('Cannot remove the last ADMIN account');
      }
    }
    user.role = role;
    return this.usersRepository.save(user);
  }
}
