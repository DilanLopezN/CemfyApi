import { Module } from '@nestjs/common';
import { DrawersService } from './drawers.service';
import { DrawersController } from './drawers.controller';

@Module({
  controllers: [DrawersController],
  providers: [DrawersService],
})
export class DrawersModule {}
