import { Global, Module } from '@nestjs/common';
import { FleshService } from './flesh.service';
import { FleshController } from './flesh.controller';

@Global()
@Module({
  controllers: [FleshController],
  providers: [FleshService],
  exports: [FleshService],
})
export class FleshModule {}
