import { Injectable } from '@nestjs/common';
import { APP_NAME } from '@pulse-fx/shared';

@Injectable()
export class AppService {
  getHello(): string {
    return `${APP_NAME} API`;
  }
}
