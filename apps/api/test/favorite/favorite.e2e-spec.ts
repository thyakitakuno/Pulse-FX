import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { loginAsSeedAdmin } from '../helpers/auth.helper';

describe('FavoriteController (e2e)', () => {
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

    await request(app.getHttpServer())
      .post('/indicators/sync/fx')
      .set('x-api-key', process.env.API_KEY as string)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /favorites/:code', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer()).post('/favorites/USD-BRL').expect(401);
    });

    it('should favorite an indicator when authenticated', async () => {
      await request(app.getHttpServer())
        .post('/favorites/USD-BRL')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });
  });

  describe('GET /favorites', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer()).get('/favorites').expect(401);
    });

    it('should list the favorited indicators when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/favorites')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ code: 'USD-BRL' })]),
      );
    });
  });

  describe('DELETE /favorites/:code', () => {
    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .delete('/favorites/USD-BRL')
        .expect(401);
    });

    it('should unfavorite an indicator when authenticated', async () => {
      await request(app.getHttpServer())
        .delete('/favorites/USD-BRL')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });
  });
});
