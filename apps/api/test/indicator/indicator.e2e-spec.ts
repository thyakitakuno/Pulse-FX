import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { loginAsSeedAdmin } from '../helpers/auth.helper';

describe('IndicatorController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    accessToken = await loginAsSeedAdmin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /indicators/sync/fx', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/indicators/sync/fx')
        .expect(401);
    });

    it('should sync FX indicators from BCB when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .post('/indicators/sync/fx')
        .set('x-api-key', process.env.API_KEY as string)
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'USD-BRL',
            status: expect.any(String),
          }),
        ]),
      );
    });
  });

  describe('POST /indicators/sync/macro', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/indicators/sync/macro')
        .expect(401);
    });

    it('should not reject the request when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .post('/indicators/sync/macro')
        .set('x-api-key', process.env.API_KEY as string);

      expect(response.status).not.toBe(401);
    });
  });

  describe('GET /indicators', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer()).get('/indicators').expect(401);
    });

    it('should return the dashboard when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/indicators')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ code: 'USD-BRL' })]),
      );
    });
  });

  describe('GET /indicators/:code', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer()).get('/indicators/USD-BRL').expect(401);
    });

    it('should return the indicator detail when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/indicators/USD-BRL')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({ code: 'USD-BRL' }),
      );
    });
  });
});
