import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HealthController } from '../src/health.controller';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { UsersService } from '../src/modules/users/users.service';

const request = require('supertest') as any;

describe('Core HTTP routes', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController, AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue({
              accessToken: 'test-token',
              user: { id: 'user-1', name: 'Demo Admin', email: 'admin@example.test', role: 'ADMIN' }
            }),
            register: jest.fn(),
            safeUser: jest.fn()
          }
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn()
          }
        }
      ]
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns API health', () => {
    return request(app.getHttpServer()).get('/api/v1/health').expect(200).expect({ status: 'ok' });
  });

  it('logs in through the auth route', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@example.test', password: 'ChangeMe123!' })
      .expect(201)
      .expect(({ body }: { body: { accessToken: string; user: { email: string } } }) => {
        expect(body.accessToken).toBe('test-token');
        expect(body.user.email).toBe('admin@example.test');
      });
  });
});
