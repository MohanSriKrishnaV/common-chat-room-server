import { Test, TestingModule } from '@nestjs/testing';
import { UtilityController } from './utility.controller';

describe('UtilityController', () => {
  let controller: UtilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UtilityController],
    }).compile();

    controller = module.get<UtilityController>(UtilityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
