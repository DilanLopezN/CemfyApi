import { Module } from '@nestjs/common';
import { ValtsService } from './valts.service';

import { PixService } from 'src/domain/payments/pix/pix.service';
import { ValtsController } from './valts.controller';

@Module({
  controllers: [ValtsController],
  providers: [ValtsService],
})
export class ValtsModule {}
