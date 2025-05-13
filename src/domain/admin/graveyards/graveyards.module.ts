import { Module } from '@nestjs/common';
import { GraveyardsService } from './graveyards.service';
import { GraveyardsController } from './graveyards.controller';

@Module({
  controllers: [GraveyardsController],
  providers: [GraveyardsService],
})
export class GraveyardsModule {}
