import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateSquareDto } from './dto/create-square.dto';
import { UpdateSquareDto } from './dto/update-square.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SquaresService {
  constructor(private prismaService: PrismaService) {}

  async create(createSquareDto: CreateSquareDto) {
    // Validar campos obrigatórios
    if (!createSquareDto.graveyardsId) {
      throw new BadRequestException(
        'A quadra deve estar vinculada a um cemitério',
      );
    }

    if (!createSquareDto.identificator) {
      throw new BadRequestException(
        'Um identificador é obrigatório para esta quadra',
      );
    }
    if (!createSquareDto.sectorId) {
      throw new BadRequestException('Setor da quadra e obrigatória');
    }

    try {
      // Verificar existência do cemitério antes de criar a quadra
      const cemetery = await this.prismaService.graveyards.findUnique({
        where: { id: createSquareDto.graveyardsId },
      });

      if (!cemetery) {
        throw new NotFoundException(
          `Cemitério com ID ${createSquareDto.graveyardsId} não encontrado`,
        );
      }

      // Verificar se já existe uma quadra com o mesmo identificador neste cemitério
      const existingSquare = await this.prismaService.squares.findFirst({
        where: {
          identificator: createSquareDto.identificator,
          graveyardsId: createSquareDto.graveyardsId,
        },
      });

      if (existingSquare) {
        throw new BadRequestException(
          `Quadra com identificador ${createSquareDto.identificator} já existe neste cemitério`,
        );
      }

      // Criar quadra
      const square = await this.prismaService.squares.create({
        data: {
          identificator: createSquareDto.identificator,
          coordenates: createSquareDto.coordenates,
          dimensions: createSquareDto.dimensions,
          image: createSquareDto.image,
          status: 'AVAILABLE',
          Sectors: {
            connect: { id: createSquareDto.sectorId },
          },
          Graveyards: {
            connect: {
              id: createSquareDto.graveyardsId,
            },
          },
        },
      });

      return square;
    } catch (error) {
      // Tratar erros específicos do Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Violação de restrição única
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Já existe uma quadra com este identificador',
          );
        }
        // Violação de chave estrangeira
        if (error.code === 'P2003') {
          throw new BadRequestException('Referência inválida para o cemitério');
        }
      }

      // Reenviar erros inesperados
      throw error;
    }
  }

  async findAllByGraveyard(graveyardId: string) {
    try {
      // Verificar existência do cemitério
      const cemetery = await this.prismaService.graveyards.findUnique({
        where: { id: graveyardId },
      });

      if (!cemetery) {
        throw new NotFoundException(
          `Cemitério com ID ${graveyardId} não encontrado`,
        );
      }

      const squares = await this.prismaService.squares.findMany({
        where: {
          graveyardsId: graveyardId,
        },
      });

      return squares;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao recuperar quadras');
    }
  }

  async findAllByPartner(partnerId: string) {
    try {
      // Verificar existência do parceiro
      const partner = await this.prismaService.partner.findUnique({
        where: { id: partnerId },
      });

      if (!partner) {
        throw new NotFoundException(
          `Parceiro com ID ${partnerId} não encontrado`,
        );
      }

      const squares = await this.prismaService.squares.findMany({
        where: {
          Graveyards: {
            partnerId: partnerId,
          },
        },
        include: {
          Sectors: true,
          valts: {
            select: {
              id: true,
              identificator: true,
            },
          },
        },
      });

      return squares;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao recuperar quadras por parceiro');
    }
  }

  async findAll() {
    try {
      const squares = await this.prismaService.squares.findMany({
        include: {
          Sectors: true,
          valts: {
            select: {
              id: true,
              identificator: true,
            },
          },
        },
      });
      return squares;
    } catch (error) {
      throw new BadRequestException('Erro ao recuperar todas as quadras');
    }
  }

  async findOne(id: string) {
    try {
      const square = await this.prismaService.squares.findUnique({
        where: { id },
        include: {
          valts: true,
        },
      });

      if (!square) {
        throw new NotFoundException(`Quadra com ID ${id} não encontrada`);
      }

      return square;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao recuperar quadra');
    }
  }

  async update(id: string, updateSquareDto: UpdateSquareDto) {
    try {
      // Verificar existência da quadra antes de atualizar
      const existingSquare = await this.prismaService.squares.findUnique({
        where: { id },
      });

      if (!existingSquare) {
        throw new NotFoundException(`Quadra com ID ${id} não encontrada`);
      }

      // Verificar violações de restrição única se atualizar o identificador
      if (updateSquareDto.identificator) {
        const duplicateSquare = await this.prismaService.squares.findFirst({
          where: {
            identificator: updateSquareDto.identificator,
            graveyardsId: existingSquare.graveyardsId,
            NOT: { id: id },
          },
        });

        if (duplicateSquare) {
          throw new BadRequestException(
            'Identificador deve ser único dentro do cemitério',
          );
        }
      }

      const updatedSquare = await this.prismaService.squares.update({
        where: { id },
        data: updateSquareDto,
      });

      return updatedSquare;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar quadra');
    }
  }

  async remove(id: string) {
    try {
      // Verificar existência da quadra antes de excluir
      const existingSquare = await this.prismaService.squares.findUnique({
        where: { id },
      });

      if (!existingSquare) {
        throw new NotFoundException(`Quadra com ID ${id} não encontrada`);
      }

      await this.prismaService.squares.delete({ where: { id } });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Tratar potenciais violações de restrição (por exemplo, quadra com registros relacionados)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Não é possível excluir quadra com registros relacionados',
          );
        }
      }

      throw new BadRequestException('Erro ao excluir quadra');
    }
  }
}
