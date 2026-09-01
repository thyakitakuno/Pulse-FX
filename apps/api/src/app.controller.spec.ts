import { Test, TestingModule } from '@nestjs/testing';
import { APP_NAME } from '@pulse-fx/shared';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the app name from @pulse-fx/shared', () => {
      expect(appController.getHello()).toBe(`${APP_NAME} API`);
    });
  });
});
