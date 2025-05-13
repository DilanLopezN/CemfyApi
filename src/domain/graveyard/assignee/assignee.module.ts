import { Module } from '@nestjs/common';
import { AssigneeService } from './assignee.service';
import { AssigneeController } from './assignee.controller';
import { AssigneeHooksController } from './hooks/assignee-hooks.controller';
import { AssigneeHooksService } from './hooks/assignee-hooks.service';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { AssigneeSlugsController } from './assignee.slug.controller';
import { AssigneeSlugsService } from './assignee.slugs.service';
import { AssigneeHistoryService } from './assignee.history.service';
import { AssigneeHistoryController } from './assignee.history.controller';

@Module({
  controllers: [
    AssigneeController,
    AssigneeHooksController,
    AssigneeSlugsController,
    AssigneeHistoryController,
  ],
  providers: [
    AssigneeService,
    AssigneeHooksService,
    AssigneeSlugsService,
    AssigneeHistoryService,
    PrismaService,
  ],
})
export class AssigneeModule {}
