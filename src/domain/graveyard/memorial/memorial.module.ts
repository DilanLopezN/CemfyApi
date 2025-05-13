import { Module } from '@nestjs/common';
import { MemorialService } from './memorial.service';
import { MemorialController } from './memorial.controller';

@Module({
  controllers: [MemorialController],
  providers: [MemorialService],
})
export class MemorialModule {}
