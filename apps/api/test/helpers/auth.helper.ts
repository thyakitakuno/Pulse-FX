import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export async function loginAsSeedAdmin(app: INestApplication): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ username: 'paul', password: 'thomson' })
    .expect(200);

  return response.body.accessToken;
}
