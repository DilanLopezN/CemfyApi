import { Module } from '@nestjs/common';
import { AssigneeHooksController } from './assignee-hooks.controller';
import { AssigneeHooksService } from './assignee-hooks.service';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Module({
  controllers: [AssigneeHooksController],
  providers: [AssigneeHooksService, PrismaService],
})
export class AssigneeHooksModule {}