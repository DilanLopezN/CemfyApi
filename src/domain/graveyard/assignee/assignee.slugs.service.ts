import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import {
  AssigneeSlugAndTagDto,
  AssigneeSlugDto,
} from './dto/assignee-slug.dto';
import { AssigneTags } from '@prisma/client';
import { format } from 'date-fns';
@Injectable()
export class AssigneeSlugsService {
  constructor(private prismaService: PrismaService) {}

  async findAllSlugs() {
    const slugs = await this.prismaService.assigneeSlugs.findMany();
    return slugs;
  }

  async createAssigneeSlug(createAssigneeSlugDto: AssigneeSlugDto) {
    await this.prismaService.assigneeSlugs.create({
      data: {
        slugName: createAssigneeSlugDto.slugName,
        slugHex: createAssigneeSlugDto.slugHex,
      },
    });
  }

  // Método para remover um slug de assignee pelo ID
  async removeAssigneeSlug(id: number) {
    await this.prismaService.assigneeSlugs.delete({
      where: { id },
    });

    return { message: 'Slug removido com sucesso' };
  }

  // Método para adicionar um slug a um assignee
  async addSlugToAssignee(assigneeId: number, slugId: number) {
    await this.prismaService.assignee.update({
      where: { id: assigneeId },
      data: {
        slugs: {
          connect: { id: slugId },
        },
      },
    });

    return { message: 'Slug adicionado ao assignee com sucesso' };
  }

  // Método para remover um slug de um assignee
  async removeSlugFromAssignee(assigneeId: number, slugId: number) {
    await this.prismaService.assignee.update({
      where: { id: assigneeId },
      data: {
        slugs: {
          disconnect: { id: slugId },
        },
      },
    });

    return { message: 'Slug removido do assignee com sucesso' };
  }

  async findAssigneeBySlug(findDto: AssigneeSlugAndTagDto) {
    const skip = (findDto.page - 1) * findDto.pageSize;

    // Construir a condição WHERE com AND explícito

    let whereCondition: any;

    const disponibleSLugs = await this.prismaService.assigneeSlugs.findMany();

    const hasSlug = disponibleSLugs.find((s) => s.slugName == findDto.slug);

    if (hasSlug !== undefined) {
      whereCondition = {
        AND: {
          tag: { equals: findDto.tag as AssigneTags },
          slugs: { slugName: findDto.slug },
        },
      };
    } else {
      whereCondition = {
        tag: { equals: findDto.tag as AssigneTags },
      };
    }

    const total = await this.prismaService.assignee.count({
      where: whereCondition,
    });

    const assignees = await this.prismaService.assignee.findMany({
      skip,
      take: findDto.pageSize,
      where: whereCondition,
      include: {
        slugs: true,

        ValtOwners: {
          select: {
            valt: {
              select: { id: true, identificator: true },
            },
          },
        },
      },
    });

    const formattedAssignees = assignees.map((assignee) => ({
      id: assignee.id,
      name: assignee.name,
      cpf: assignee.cpf,
      slug: assignee.slugs,
      tag: assignee.tag,
      createdAt: format(new Date(assignee.createdAt), 'dd/MM/yyyy'),
      valts: assignee.ValtOwners.length
        ? Array.from(
            new Map(
              assignee.ValtOwners.flatMap((owner) => owner.valt).map((valt) => [
                valt.id,
                valt,
              ]),
            ).values(),
          )
        : [{ id: null, identificator: 'SEM JAZIGO' }],
    }));

    return {
      formattedAssignees,
      meta: {
        total,
        page: findDto.page,
        pageSize: findDto.pageSize,
        totalPages: Math.ceil(total / findDto.pageSize),
        hasNext: findDto.page < Math.ceil(total / findDto.pageSize),
        hasPrevious: findDto.page > 1,
      },
    };
  }
}
