import { Global, Module } from '@nestjs/common';
import { R2Service } from './cloudflare-r2.service';
import { UploadController } from './cloudflare-r2.controller';

@Global()
@Module({
  controllers: [UploadController],
  providers: [R2Service],
  exports: [R2Service],
})
export class StorageModule {}
