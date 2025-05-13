import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  AssignPromotion,
  CreatePromotionDto,
} from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class PromotionsService {
  constructor(private prismaService: PrismaService) {}

  async create(createPromotionDto: CreatePromotionDto) {
    try {
      const promotion = await this.prismaService.promotion.create({
        data: createPromotionDto,
      });
      return promotion;
    } catch (error) {
      throw error;
    }
  }

  async assignPromotion(assignPromotionDto: AssignPromotion) {
    try {
      // Validação de entrada
      if (!assignPromotionDto.promotionId) {
        throw new Error('ID da promoção é obrigatório');
      }

      // Verificar se pelo menos um tipo de atribuição foi fornecido
      if (
        (!assignPromotionDto.servicesIds ||
          assignPromotionDto.servicesIds.length === 0) &&
        (!assignPromotionDto.graveyards ||
          assignPromotionDto.graveyards.length === 0) &&
        (!assignPromotionDto.vaultTypes ||
          assignPromotionDto.vaultTypes.length === 0)
      ) {
        throw new Error(
          'Pelo menos um serviço, cemitério ou tipo de jazigo deve ser fornecido',
        );
      }

      // Verificar se a promoção existe
      const existingPromotion = await this.prismaService.promotion.findUnique({
        where: { id: assignPromotionDto.promotionId },
      });

      if (!existingPromotion) {
        throw new Error(
          `Promoção com ID ${assignPromotionDto.promotionId} não encontrada`,
        );
      }

      // Preparar conexões para serviços
      if (
        assignPromotionDto.servicesIds &&
        assignPromotionDto.servicesIds.length > 0
      ) {
        // Verificar se os serviços existem
        const existingServices =
          await this.prismaService.graveyardServices.findMany({
            where: { id: { in: assignPromotionDto.servicesIds } },
            select: { id: true },
          });

        const existingServiceIds = existingServices.map(
          (service) => service.id,
        );
        const nonExistingServiceIds = assignPromotionDto.servicesIds.filter(
          (id) => !existingServiceIds.includes(id),
        );

        if (nonExistingServiceIds.length > 0) {
          throw new Error(
            `Os seguintes serviços não existem: ${nonExistingServiceIds.join(
              ', ',
            )}`,
          );
        }
      }

      // Preparar conexões para cemitérios (graveyards)
      if (
        assignPromotionDto.graveyards &&
        assignPromotionDto.graveyards.length > 0
      ) {
        // Verificar se os cemitérios existem
        const existinggraveyards = await this.prismaService.graveyards.findMany(
          {
            where: { id: { in: assignPromotionDto.graveyards } },
            select: { id: true },
          },
        );

        const existingStandIds = existinggraveyards.map((stand) => stand.id);
        const nonExistingStandIds = assignPromotionDto.graveyards.filter(
          (id) => !existingStandIds.includes(id),
        );

        if (nonExistingStandIds.length > 0) {
          throw new Error(
            `Os seguintes cemitérios não existem: ${nonExistingStandIds.join(
              ', ',
            )}`,
          );
        }
      }

      // Preparar conexões para tipos de jazigos
      if (
        assignPromotionDto.vaultTypes &&
        assignPromotionDto.vaultTypes.length > 0
      ) {
        // Verificar se os tipos de jazigos existem
        const existingVaultTypes = await this.prismaService.valts.findMany({
          where: { valtTypeId: { in: assignPromotionDto.vaultTypes } },
          select: { id: true },
        });

        const existingVaultTypeIds = existingVaultTypes.map(
          (vaultType) => vaultType.id,
        );
        const nonExistingVaultTypeIds = assignPromotionDto.vaultTypes.filter(
          (id) => !existingVaultTypeIds.includes(id),
        );

        if (nonExistingVaultTypeIds.length > 0) {
          throw new Error(
            `Os seguintes tipos de jazigos não existem: ${nonExistingVaultTypeIds.join(
              ', ',
            )}`,
          );
        }
      }

      // Atualizar a promoção com as novas conexões
      const updatedPromotion = await this.prismaService.promotion.update({
        where: {
          id: assignPromotionDto.promotionId,
        },
        data: {
          graveyards: {
            connect: assignPromotionDto.graveyards?.map((id) => ({ id })),
          },
          promotedServices: {
            connect: assignPromotionDto.servicesIds?.map((id) => ({ id })),
          },
          promotedValtsTypes: {
            connect: assignPromotionDto.vaultTypes?.map((id) => ({ id })),
          },
        },
        include: {
          promotedServices: true,
          graveyards: true,
          promotedValtsTypes: true,
        },
      });

      return updatedPromotion;
    } catch (error) {
      // Melhorar tratamento de erros para diferentes tipos
      console.log(error);
      if (error instanceof PrismaClientKnownRequestError) {
        // Tratar erros específicos do Prisma
        if (error.code === 'P2025') {
          throw new Error('Registro não encontrado para atualização');
        }
        throw new Error(`Erro do banco de dados: ${error.message}`);
      }

      // Repassar o erro original ou personalizado
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prismaService.promotion.findMany({
        include: {
          graveyards: {
            select: {
              id: true,
              nameGraveyards: true,
            },
          },
          promotedServices: {
            select: {
              id: true,
              serviceName: true,
            },
          },
          promotedValtsTypes: {
            select: {
              id: true,
              valtType: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const promotion = await this.prismaService.promotion.findUnique({
        where: { id },
        include: {
          graveyards: {
            select: {
              id: true,
              nameGraveyards: true,
            },
          },
          promotedServices: {
            select: {
              id: true,
              serviceName: true,
            },
          },
          promotedValtsTypes: {
            select: {
              id: true,
              valtType: true,
            },
          },
        },
      });

      if (!promotion) {
        throw new NotFoundException(`Promoção com ID ${id} não encontrada`);
      }

      return promotion;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updatePromotionDto: UpdatePromotionDto) {
    try {
      const promotion = await this.prismaService.promotion.findUnique({
        where: { id },
      });

      if (!promotion) {
        throw new NotFoundException(`Promoção com ID ${id} não encontrada`);
      }

      return await this.prismaService.promotion.update({
        where: { id },
        data: updatePromotionDto,
      });
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const promotion = await this.prismaService.promotion.findUnique({
        where: { id },
      });

      if (!promotion) {
        throw new NotFoundException(`Promoção com ${id} não encontrada`);
      }

      return await this.prismaService.promotion.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }
}
