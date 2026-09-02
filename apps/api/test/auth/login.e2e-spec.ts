import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AuthController (e2e) - Login', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should authenticate with correct username and password and return an accessToken', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'paul', password: 'thomson' })
      .expect(200);

    expect(response.body.accessToken).toEqual(expect.any(String));
  });

  it('should return 401 when the password is incorrect', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'paul', password: 'wrong-password' })
      .expect(401);
  });

  it('should return 401 when the username does not exist', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'ghost', password: 'thomson' })
      .expect(401);
  });

  it('should return 400 when the payload is invalid', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: '', password: '' })
      .expect(400);
  });
});
