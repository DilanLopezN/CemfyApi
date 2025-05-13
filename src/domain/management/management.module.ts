import { Global, Module } from '@nestjs/common';
import { ManagementService } from './management.service';
import { ManagementController } from './management.controller';

@Global()
@Module({
  controllers: [ManagementController],
  providers: [ManagementService],
  exports: [ManagementService],
})
export class ManagementModule {}
