import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateGraveyardDto } from './dto/create-graveyard.dto';
import { UpdateGraveyardDto } from './dto/update-graveyard.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { TenantService } from 'src/domain/partners/tenants/tenant.service';
import { ResourceAlreadyExistsError } from 'src/core/errors/ResourceAlreadyExistsError';
import { Prisma } from '@prisma/client';
import { GenericThrow } from 'src/core/errors/GenericThrow';

@Injectable()
export class GraveyardsService {
  private readonly logger = new Logger(GraveyardsService.name);

  constructor(
    private prismaService: PrismaService,
    private tenantService: TenantService,
  ) {}

  async create(createGraveyardDto: CreateGraveyardDto) {
    try {
      const graveyardAlreadyExits =
        await this.prismaService.graveyards.findUnique({
          where: {
            cnpj: createGraveyardDto.cnpj,
          },
        });

      if (graveyardAlreadyExits)
        throw new ResourceAlreadyExistsError(
          'Esse cemitério já está cadastrado!',
        );

      const graveyard = await this.prismaService.graveyards.create({
        data: {
          cep: createGraveyardDto.cep,
          cnpj: createGraveyardDto.cnpj,
          nameGraveyards: createGraveyardDto.nameGraveyard,
          street: createGraveyardDto.street,
          streetNumber: createGraveyardDto.streetNumber,
          city: createGraveyardDto.city,
          nameEnterprise: createGraveyardDto.nameEnterprise,
          state: createGraveyardDto.state,
          isActive: true,
          neighborhood: createGraveyardDto.neighborhood,

          Partner: {
            connect: {
              id: createGraveyardDto.partnerId,
            },
          },
        },
      });
      return graveyard;
    } catch (error) {
      this.logger.error(
        `Erro ao criar cemitério: ${error.message}`,
        error.stack,
      );

      if (error instanceof ResourceAlreadyExistsError) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new HttpException(
            'Parceiro não encontrado',
            HttpStatus.NOT_FOUND,
          );
        }
        if (error.code === 'P2002') {
          throw new HttpException(
            'Já existe um cemitério com este CNPJ',
            HttpStatus.CONFLICT,
          );
        }
      }

      throw new HttpException(
        'Erro ao criar cemitério',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      const graveyards = await this.prismaService.graveyards.findMany({
        include: {
          Partner: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });

      return graveyards;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar cemitérios: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Erro ao buscar cemitérios',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllByTenant(tenantId: string) {
    try {
      const graveyards = await this.prismaService.graveyards.findMany({
        where: {
          partnerId: this.tenantService.getTenant()?.id ?? tenantId,
        },
        include: {
          Partner: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });

      return graveyards;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar cemitérios do parceiro: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Erro ao buscar cemitérios do parceiro',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    try {
      const graveyard = await this.prismaService.graveyards.findUnique({
        where: { id },
        include: {
          Partner: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });

      if (!graveyard) {
        throw new NotFoundException(`Cemitério com ID ${id} não encontrado`);
      }

      return graveyard;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar cemitério ${id}: ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        'Erro ao buscar cemitério',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateGraveyardDto: UpdateGraveyardDto) {
    try {
      // Verificar se o cemitério existe antes de atualizar
      await this.findOne(id);

      // Se o CNPJ for atualizado, verificar se já existe outro cemitério com este CNPJ
      if (updateGraveyardDto.cnpj) {
        const existingGraveyard = await this.prismaService.graveyards.findFirst(
          {
            where: {
              cnpj: updateGraveyardDto.cnpj,
              id: { not: id },
            },
          },
        );

        if (existingGraveyard) {
          throw new HttpException(
            'Já existe outro cemitério com este CNPJ',
            HttpStatus.CONFLICT,
          );
        }
      }

      const updatedGraveyard = await this.prismaService.graveyards.update({
        where: { id },
        data: {
          cep: updateGraveyardDto.cep,
          cnpj: updateGraveyardDto.cnpj,
          nameGraveyards: updateGraveyardDto.nameGraveyard,
          street: updateGraveyardDto.street,
          streetNumber: updateGraveyardDto.streetNumber,
          city: updateGraveyardDto.city,
          nameEnterprise: updateGraveyardDto.nameEnterprise,
          state: updateGraveyardDto.state,
          isActive: updateGraveyardDto.isActive,
          neighborhood: updateGraveyardDto.neighborhood,
          partnerId: updateGraveyardDto.partnerId,
        },
        include: {
          Partner: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });

      return updatedGraveyard;
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar cemitério ${id}: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof HttpException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Cemitério com ID ${id} não encontrado`);
        }
        if (error.code === 'P2002') {
          throw new HttpException(
            'Já existe um cemitério com este CNPJ',
            HttpStatus.CONFLICT,
          );
        }
      }

      throw new HttpException(
        'Erro ao atualizar cemitério',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);

      const deletedGraveyard = await this.prismaService.graveyards.delete({
        where: { id },
      });

      return {
        message: `Cemitério ${deletedGraveyard.nameGraveyards} removido com sucesso`,
        id: deletedGraveyard.id,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao remover cemitério ${id}: ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Cemitério com ID ${id} não encontrado`);
        }
        // Tratar violações de chave estrangeira
        if (error.code === 'P2003') {
          throw new HttpException(
            'Não é possível remover este cemitério pois ele está sendo utilizado em outros registros',
            HttpStatus.CONFLICT,
          );
        }
      }

      throw new HttpException(
        'Erro ao remover cemitério',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGraveyardSquares(graveyardId: string) {
    if (!graveyardId)
      throw new GenericThrow(
        'Necessário informarar cemitério para visualização de quadras',
      );

    const squares = await this.prismaService.squares.findMany({
      where: {
        graveyardsId: graveyardId,
      },
      include: {
        valts: {
          select: {
            id: true,
            identificator: true,
          },
        },
      },
    });

    return squares;
  }
}
