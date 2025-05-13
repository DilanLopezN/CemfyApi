import { Module } from '@nestjs/common';
import { HooksService } from './hooks.service';
import { HooksController } from './hooks.controller';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { PrismaModule } from 'src/core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HooksController],
  providers: [HooksService],
})
export class HooksModule {}
