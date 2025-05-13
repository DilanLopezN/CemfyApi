import { Module } from '@nestjs/common';
import { DeceasedsService } from './deceaseds.service';
import { DeceasedsController } from './deceaseds.controller';

@Module({
  controllers: [DeceasedsController],
  providers: [DeceasedsService],
})
export class DeceasedsModule {}
