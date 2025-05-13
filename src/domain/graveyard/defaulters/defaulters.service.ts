import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateDefaulterDto } from './dto/create-defaulter.dto';
import { UpdateDefaulterDto } from './dto/update-defaulter.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { makeManagementService } from 'src/core/factories/make.financial.service';
import { DeliquencyStatus, Prisma } from '@prisma/client';

@Injectable()
export class DefaultersService {
  constructor(private prismaService: PrismaService) {}

  private managamentService = makeManagementService();

  async create(createDefaulterDto: CreateDefaulterDto) {
    try {
      // Verifica se o assignee existe
      const assignee = await this.prismaService.user.findUnique({
        where: { id: createDefaulterDto.assigneeId },
      });

      if (!assignee) {
        throw new NotFoundException(
          `Usuário com ID ${createDefaulterDto.assigneeId} não encontrado`,
        );
      }

      // Obtém o gerenciamento financeiro ativo
      const activeFinancialManagement = await (
        await this.managamentService
      ).getActiveFinancialManagement();

      if (!activeFinancialManagement) {
        throw new BadRequestException(
          'Não há gerenciamento financeiro ativo no momento',
        );
      }

      // Cria o registro de inadimplência
      const newDefaulter = await this.prismaService.delinquencyRecords.create({
        data: {
          assignee: {
            connect: {
              id: createDefaulterDto.assigneeId,
            },
          },
          financialManagement: {
            connect: { id: activeFinancialManagement.id },
          },
          status: createDefaulterDto.status,
          due_date: createDefaulterDto.due_date ?? null,
          last_payment_date: createDefaulterDto.last_payment_date ?? null,
          outstanding_amount: createDefaulterDto.outstanding_amount ?? null,
          overdue_days: createDefaulterDto.overdue_days ?? null,
        },
      });

      return {
        success: true,
        message: 'Registro de inadimplência criado com sucesso',
        data: newDefaulter,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Já existe um registro com estes dados',
          );
        }
        if (error.code === 'P2025') {
          throw new NotFoundException('Registro relacionado não encontrado');
        }
      }

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Erro ao criar registro de inadimplência',
      );
    }
  }

  async findAll() {
    try {
      const defaulters = await this.prismaService.delinquencyRecords.findMany({
        where: {
          status: 'ATIVO',
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        count: defaulters.length,
        data: defaulters,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao buscar registros de inadimplência',
      );
    }
  }

  async findOne(id: number) {
    try {
      const defaulter = await this.prismaService.delinquencyRecords.findUnique({
        where: { id },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!defaulter) {
        throw new NotFoundException(
          `Registro de inadimplência com ID ${id} não encontrado`,
        );
      }

      return {
        success: true,
        data: defaulter,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erro ao buscar registro de inadimplência com ID ${id}`,
      );
    }
  }

  async update(id: number, updateDefaulterDto: UpdateDefaulterDto) {
    try {
      // Verifica se o registro existe
      const existingRecord =
        await this.prismaService.delinquencyRecords.findUnique({
          where: { id },
        });

      if (!existingRecord) {
        throw new NotFoundException(
          `Registro de inadimplência com ID ${id} não encontrado`,
        );
      }

      // Verifica se o assignee existe, caso seja fornecido
      if (updateDefaulterDto.assigneeId) {
        const assignee = await this.prismaService.user.findUnique({
          where: { id: updateDefaulterDto.assigneeId },
        });

        if (!assignee) {
          throw new NotFoundException(
            `Usuário com ID ${updateDefaulterDto.assigneeId} não encontrado`,
          );
        }
      }

      // Prepara os dados para atualização
      const updateData: Prisma.DelinquencyRecordsUpdateInput = {};

      if (updateDefaulterDto.assigneeId) {
        updateData.assignee = {
          connect: { id: updateDefaulterDto.assigneeId },
        };
      }

      if (updateDefaulterDto.status !== undefined) {
        updateData.status = updateDefaulterDto.status;
      }

      if (updateDefaulterDto.due_date !== undefined) {
        updateData.due_date = updateDefaulterDto.due_date;
      }

      if (updateDefaulterDto.last_payment_date !== undefined) {
        updateData.last_payment_date = updateDefaulterDto.last_payment_date;
      }

      if (updateDefaulterDto.outstanding_amount !== undefined) {
        updateData.outstanding_amount = updateDefaulterDto.outstanding_amount;
      }

      if (updateDefaulterDto.overdue_days !== undefined) {
        updateData.overdue_days = updateDefaulterDto.overdue_days;
      }

      // Atualiza o registro
      const updatedDefaulter =
        await this.prismaService.delinquencyRecords.update({
          where: { id },
          data: updateData,
        });

      return {
        success: true,
        message: 'Registro de inadimplência atualizado com sucesso',
        data: updatedDefaulter,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Registro de inadimplência com ID ${id} não encontrado`,
          );
        }
      }

      throw new InternalServerErrorException(
        `Erro ao atualizar registro de inadimplência com ID ${id}`,
      );
    }
  }

  async remove(id: number) {
    try {
      // Verifica se o registro existe
      const existingRecord =
        await this.prismaService.delinquencyRecords.findUnique({
          where: { id },
        });

      if (!existingRecord) {
        throw new NotFoundException(
          `Registro de inadimplência com ID ${id} não encontrado`,
        );
      }

      // Remove o registro
      await this.prismaService.delinquencyRecords.delete({
        where: { id },
      });

      return {
        success: true,
        message: `Registro de inadimplência com ID ${id} removido com sucesso`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Registro de inadimplência com ID ${id} não encontrado`,
          );
        }
        if (error.code === 'P2003') {
          throw new BadRequestException(
            `Não é possível remover o registro pois ele está vinculado a outros registros`,
          );
        }
      }

      throw new InternalServerErrorException(
        `Erro ao remover registro de inadimplência com ID ${id}`,
      );
    }
  }

  async findByAssignee(assigneeId: number) {
    try {
      // Verifica se o usuário existe
      const assignee = await this.prismaService.user.findUnique({
        where: { id: assigneeId },
      });

      if (!assignee) {
        throw new NotFoundException(
          `Usuário com ID ${assigneeId} não encontrado`,
        );
      }

      // Busca os registros de inadimplência do usuário
      const defaulters = await this.prismaService.delinquencyRecords.findMany({
        where: {
          assigneeId,
        },
        include: {},
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        count: defaulters.length,
        data: defaulters,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Erro ao buscar registros de inadimplência do usuário ${assigneeId}`,
      );
    }
  }

  async findByStatus(status: DeliquencyStatus) {
    try {
      const defaulters = await this.prismaService.delinquencyRecords.findMany({
        where: {
          status: status,
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        count: defaulters.length,
        data: defaulters,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Erro ao buscar registros de inadimplência com status ${status}`,
      );
    }
  }
}
