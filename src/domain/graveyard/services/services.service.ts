import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prismaService: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    try {
      // Verificar se o graveyard existe
      const graveyardExists = await this.prismaService.graveyards.findUnique({
        where: { id: createServiceDto.graveyardsId },
      });

      if (!graveyardExists) {
        throw new NotFoundException(
          `Graveyard with ID ${createServiceDto.graveyardsId} not found`,
        );
      }

      return await this.prismaService.graveyardServices.create({
        data: {
          serviceName: createServiceDto.serviceName,
          serviceValue: createServiceDto.serviceValue,
          serviceDuration: createServiceDto.serviceDuration,
          needMaintenance: createServiceDto.needMaintenance,
          Graveyards: {
            connect: { id: createServiceDto.graveyardsId },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'A service with this name already exists for this graveyard',
          );
        } else if (error.code === 'P2003') {
          throw new BadRequestException('Foreign key constraint failed');
        }
      }
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create service');
    }
  }

  async findAll() {
    try {
      return await this.prismaService.graveyardServices.findMany({
        include: {
          Graveyards: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve services');
    }
  }

  async findOne(id: string) {
    try {
      const service = await this.prismaService.graveyardServices.findUnique({
        where: { id },
        include: {
          Graveyards: true,
        },
      });

      if (!service) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }

      return service;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve service');
    }
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    try {
      // Verificar se o serviço existe
      const serviceExists =
        await this.prismaService.graveyardServices.findUnique({
          where: { id },
        });

      if (!serviceExists) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }

      // Preparar os dados para atualização
      const updateData: Prisma.GraveyardServicesUpdateInput = {
        serviceName: updateServiceDto.serviceName,
        serviceValue: updateServiceDto.serviceValue,
        serviceDuration: updateServiceDto.serviceDuration,
        needMaintenance: updateServiceDto.needMaintenance,
      };

      // Adicionar conexão com graveyard se graveyardsId for fornecido
      if (updateServiceDto.graveyardsId) {
        // Verificar se o graveyard existe
        const graveyardExists = await this.prismaService.graveyards.findUnique({
          where: { id: updateServiceDto.graveyardsId },
        });

        if (!graveyardExists) {
          throw new NotFoundException(
            `Graveyard with ID ${updateServiceDto.graveyardsId} not found`,
          );
        }

        updateData.Graveyards = {
          connect: { id: updateServiceDto.graveyardsId },
        };
      }

      return await this.prismaService.graveyardServices.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'A service with this name already exists for this graveyard',
          );
        } else if (error.code === 'P2025') {
          throw new NotFoundException(`Service with ID ${id} not found`);
        }
      }
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update service with ID ${id}`,
      );
    }
  }

  async remove(id: string) {
    try {
      // Verificar se o serviço existe
      const serviceExists =
        await this.prismaService.graveyardServices.findUnique({
          where: { id },
        });

      if (!serviceExists) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }

      return await this.prismaService.graveyardServices.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Service with ID ${id} not found`);
        }
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete service with ID ${id}`,
      );
    }
  }
}
