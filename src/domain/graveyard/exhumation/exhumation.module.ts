import { Module } from '@nestjs/common';
import { ExhumationService } from './exhumation.service';
import { ExhumationController } from './exhumation.controller';

@Module({
  controllers: [ExhumationController],
  providers: [ExhumationService],
})
export class ExhumationModule {}
