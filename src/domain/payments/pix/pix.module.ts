import { Global, Module } from '@nestjs/common';
import { PixService } from './pix.service';
import { PixController } from './pix.controller';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [PixController],
  providers: [PixService],
  exports: [PixService],
})
export class PixModule {}
