import { Module } from '@nestjs/common';
import { DefaultersService } from './defaulters.service';
import { DefaultersController } from './defaulters.controller';

@Module({
  controllers: [DefaultersController],
  providers: [DefaultersService],
})
export class DefaultersModule {}
