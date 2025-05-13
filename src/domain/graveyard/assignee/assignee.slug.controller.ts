import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  NotFoundException,
  Query,
  ParseIntPipe,
  InternalServerErrorException,
  Put,
} from '@nestjs/common';

import { AssigneeSlugDto } from './dto/assignee-slug.dto';
import { AssigneeSlugsService } from './assignee.slugs.service';

@Controller('assignee-slugs')
export class AssigneeSlugsController {
  constructor(private readonly assigneeSlugsService: AssigneeSlugsService) {}

  @Get()
  async findAllSlugs() {
    return await this.assigneeSlugsService.findAllSlugs();
  }

  @Post()
  async createAssigneeSlug(@Body() createAssigneeSlugDto: AssigneeSlugDto) {
    await this.assigneeSlugsService.createAssigneeSlug(createAssigneeSlugDto);
    return { message: 'Slug criado com sucesso' };
  }

  @Delete(':id')
  async removeAssigneeSlug(@Param('id') id: string) {
    return this.assigneeSlugsService.removeAssigneeSlug(+id);
  }

  @Get(':tag/:slug')
  async findAssigneeBySlug(
    @Param('tag') tag: string,
    @Param('slug') slug?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 10,
  ) {
    try {
      return this.assigneeSlugsService.findAssigneeBySlug({
        tag,
        slug,
        page,
        pageSize,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Put('assignee/:assigneeId/add-slug/:slugId')
  async addSlugToAssignee(
    @Param('assigneeId', ParseIntPipe) assigneeId: number,
    @Param('slugId', ParseIntPipe) slugId: number,
  ) {
    try {
      return await this.assigneeSlugsService.addSlugToAssignee(
        assigneeId,
        slugId,
      );
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Assignee ou Slug não encontrado');
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete('assignee/:assigneeId/remove-slug/:slugId')
  async removeSlugFromAssignee(
    @Param('assigneeId', ParseIntPipe) assigneeId: number,
    @Param('slugId', ParseIntPipe) slugId: number,
  ) {
    try {
      return await this.assigneeSlugsService.removeSlugFromAssignee(
        assigneeId,
        slugId,
      );
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          'Assignee ou Slug não encontrado ou relação inexistente',
        );
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
