import { Module } from '@nestjs/common';
import { FuneralService } from './funeral.service';
import { FuneralController } from './funeral.controller';

@Module({
  controllers: [FuneralController],
  providers: [FuneralService],
})
export class FuneralModule {}
