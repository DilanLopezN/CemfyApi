import { Module } from '@nestjs/common';
import { SquaresService } from './squares.service';
import { SquaresController } from './squares.controller';

@Module({
  controllers: [SquaresController],
  providers: [SquaresService],
})
export class SquaresModule {}
