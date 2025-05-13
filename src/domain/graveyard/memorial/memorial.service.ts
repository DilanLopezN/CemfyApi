import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateHomageDto, CreateMemorialDto } from './dto/create-memorial.dto';
import { UpdateMemorialDto } from './dto/update-memorial.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GenericThrow } from 'src/core/errors/GenericThrow';
import { Prisma } from '@prisma/client';

@Injectable()
export class MemorialService {
  constructor(private prismaService: PrismaService) {}

  async create_memorial(createMemorialDto: CreateMemorialDto) {
    try {
      if (!createMemorialDto.deceasedId)
        throw new GenericThrow('Necessário falecido para criar um memorial');

      const memorialExists = await this.prismaService.memorial.findFirst({
        where: { deceasedId: createMemorialDto.deceasedId },
      });

      if (memorialExists)
        throw new GenericThrow('Já existe um memorial para este falecido');

      const memorial = await this.prismaService.memorial.create({
        data: {
          bornOn: createMemorialDto.bornOn,
          deceasedIin: createMemorialDto.deceasedIin,
          deceaseImageUrl: createMemorialDto.deceaseImageUrl,
          deceased: {
            connect: {
              id: createMemorialDto.deceasedId,
            },
          },
        },
      });

      return memorial;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Falecido não encontrado');
        }
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Memorial já registrado para este falecido',
          );
        }
      }
      throw error;
    }
  }

  async create_homenage(createHomenage: CreateHomageDto) {
    try {
      if (!createHomenage.token)
        throw new GenericThrow('Necessário um token para criar uma homenagem');

      const memorial = await this.prismaService.memorial.findFirst({
        where: { permissionToken: createHomenage.token },
      });

      if (!memorial)
        throw new GenericThrow(
          'Token expirado, solicite a geração de um novo token',
        );

      if (
        memorial.createHomageQuantity < 1 ||
        memorial.createHomageQuantity <= 0
      ) {
        await this.prismaService.memorial.update({
          where: { id: memorial.id },
          data: { permissionToken: null },
        });
        throw new GenericThrow('Máximo de homenagens cadastradas');
      }

      const homage = await this.prismaService.homage.create({
        data: {
          imageUrl: createHomenage.imageUrl || null,
          tributeFrom: createHomenage.tributeFrom,
          tributeMessage: createHomenage.tributeMessage,
          kinship: createHomenage.kinship,
          Memorial: {
            connect: {
              id: memorial.id,
            },
          },
        },
      });

      await this.prismaService.memorial.update({
        where: { id: memorial.id },
        data: {
          createHomageQuantity: { decrement: 1 },
        },
      });

      return homage;
    } catch (error) {
      if (error instanceof GenericThrow) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Memorial não encontrado');
        }
      }

      throw new GenericThrow('Erro ao criar homenagem: ' + error.message);
    }
  }

  async findAll() {
    try {
      const memorials = await this.prismaService.memorial.findMany({
        include: {
          deceased: true,
          homages: true,
        },
      });

      return memorials;
    } catch (error) {
      throw new GenericThrow('Erro ao buscar memoriais: ' + error.message);
    }
  }

  async findByDeceased(id: string) {
    try {
      if (!id) throw new GenericThrow('ID do falecido é necessário');

      const memorial = await this.prismaService.memorial.findUnique({
        where: {
          deceasedId: id,
        },
        include: {
          deceased: true,
          homages: true,
        },
      });

      if (!memorial) {
        throw new NotFoundException(
          'Memorial não encontrado para este falecido',
        );
      }

      return memorial;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof GenericThrow) throw error;

      throw new GenericThrow('Erro ao buscar memorial: ' + error.message);
    }
  }

  async update(id: number, updateMemorialDto: UpdateMemorialDto) {
    try {
      if (!id) throw new GenericThrow('ID do memorial é necessário');

      // Verificar se o memorial existe
      const memorialExists = await this.prismaService.memorial.findUnique({
        where: { id },
      });

      if (!memorialExists) {
        throw new NotFoundException('Memorial não encontrado');
      }

      // Preparar os dados para atualização
      const updateData: Prisma.MemorialUpdateInput = {};

      if (updateMemorialDto.bornOn !== undefined) {
        updateData.bornOn = updateMemorialDto.bornOn;
      }

      if (updateMemorialDto.deceasedIin !== undefined) {
        updateData.deceasedIin = updateMemorialDto.deceasedIin;
      }

      if (updateMemorialDto.deceaseImageUrl !== undefined) {
        updateData.deceaseImageUrl = updateMemorialDto.deceaseImageUrl;
      }

      // Realizar a atualização
      const updatedMemorial = await this.prismaService.memorial.update({
        where: { id },
        data: updateData,
        include: {
          deceased: true,
          homages: true,
        },
      });

      return updatedMemorial;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof GenericThrow) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Memorial não encontrado');
        }
      }

      throw new GenericThrow('Erro ao atualizar memorial: ' + error.message);
    }
  }

  async remove(id: number) {
    try {
      if (!id) throw new GenericThrow('ID do memorial é necessário');

      // Verificar se o memorial existe
      const memorialExists = await this.prismaService.memorial.findUnique({
        where: { id },
      });

      if (!memorialExists) {
        throw new NotFoundException('Memorial não encontrado');
      }

      // Remover primeiro as homenagens associadas ao memorial
      await this.prismaService.homage.deleteMany({
        where: { memorialId: id },
      });

      // Remover o memorial
      await this.prismaService.memorial.delete({
        where: { id },
      });

      return {
        message: 'Memorial e homenagens associadas removidos com sucesso',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof GenericThrow) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Memorial não encontrado');
        }
      }

      throw new GenericThrow('Erro ao remover memorial: ' + error.message);
    }
  }

  async generatePermissionToken(memorialId: number, quantity: number) {
    try {
      if (!memorialId) throw new GenericThrow('ID do memorial é necessário');

      if (quantity <= 0)
        throw new GenericThrow('A quantidade deve ser maior que zero');

      // Verificar se o memorial existe
      const memorial = await this.prismaService.memorial.findUnique({
        where: { id: memorialId },
      });

      if (!memorial) {
        throw new NotFoundException('Memorial não encontrado');
      }

      // Gerar um token aleatório
      const token = this.generateRandomToken();

      // Atualizar o memorial com o novo token e quantidade
      const updatedMemorial = await this.prismaService.memorial.update({
        where: { id: memorialId },
        data: {
          permissionToken: token,
          createHomageQuantity: quantity,
        },
      });

      return {
        token: updatedMemorial.permissionToken,
        quantity: updatedMemorial.createHomageQuantity,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof GenericThrow) throw error;

      throw new GenericThrow(
        'Erro ao gerar token de permissão: ' + error.message,
      );
    }
  }

  // Método auxiliar para gerar um token aleatório
  private generateRandomToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
