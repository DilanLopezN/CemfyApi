import { Global, Module } from '@nestjs/common';
import { BilletService } from './billet.service';
import { BilletController } from './billet.controller';
import { ManagementService } from 'src/domain/management/management.service';

@Global()
@Module({
  controllers: [BilletController],
  providers: [BilletService, ManagementService],
  exports: [BilletService],
})
export class BilletModule {}
