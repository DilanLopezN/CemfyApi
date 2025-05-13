import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateExhumationDto } from './dto/create-exhumation.dto';
import { UpdateExhumationDto } from './dto/update-exhumation.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { Exhumation } from '@prisma/client';

@Injectable()
export class ExhumationService {
  constructor(private prismaService: PrismaService) {}

  async create(createExhumationDto: CreateExhumationDto): Promise<Exhumation> {
    try {
      const deceased = await this.prismaService.deceased.findUnique({
        where: { id: createExhumationDto.deceasedId },
      });

      if (!deceased) {
        throw new NotFoundException(
          `Falecido com ID ${createExhumationDto.deceasedId} não encontrado`,
        );
      }

      const drawer = await this.prismaService.drawers.findUnique({
        where: { id: createExhumationDto.drawersId },
        include: {
          deceades: true,
        },
      });

      if (!drawer) {
        throw new NotFoundException(
          `Gaveta com ID ${createExhumationDto.drawersId} não encontrada`,
        );
      }

      const deceasedInDrawer = drawer.deceades.find(
        (deceased) => deceased.id === createExhumationDto.deceasedId,
      );

      if (!deceasedInDrawer) {
        throw new NotFoundException(
          `Falecido não encontrado na gaveta com ID ${createExhumationDto.drawersId}`,
        );
      }

      // Validate dates
      const currentDate = new Date();
      if (
        createExhumationDto.exhumationDate &&
        new Date(createExhumationDto.exhumationDate) < currentDate
      ) {
        throw new BadRequestException(
          'Não é possível fazer exumação com data no passado',
        );
      }

      if (
        createExhumationDto.performedAt &&
        new Date(createExhumationDto.performedAt) <
          new Date(createExhumationDto.exhumationDate)
      ) {
        throw new BadRequestException(
          'Data de realização não pode ser anterior à data de exumação',
        );
      }

      // Create the exhumation record
      const exhumation = await this.prismaService.exhumation.create({
        data: {
          exhumationDate: createExhumationDto.exhumationDate,
          description: createExhumationDto.description,
          reason: createExhumationDto.reason,
          deceased: { connect: { id: createExhumationDto.deceasedId } },
          drawerExhumed: { connect: { id: createExhumationDto.drawersId } },
          performedAt: createExhumationDto.performedAt,
          destination: createExhumationDto.destination,
        },
      });

      await this.prismaService.drawers.update({
        where: { id: createExhumationDto.drawersId },
        data: { status: 'AVAILABLE' },
      });

      await this.prismaService.drawersHistory.create({
        data: {
          drawerId: createExhumationDto.drawersId,
          buriedDeceasedName: deceased.fullName,
          buriedId: deceased.id,
          buriedIn: deceased.buriedIn,
          identificator: `${deceased.id}-${drawer.id}`,
          Drawers: {
            connect: {
              id: createExhumationDto.drawersId,
            },
          },
        },
      });

      return exhumation;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      // Handle Prisma errors
      if (error.code === 'P2002') {
        throw new ConflictException('Uma restrição única seria violada.');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(
          'Registro para atualização não encontrado.',
        );
      }

      // For any other errors
      throw new BadRequestException(
        `Falha ao criar exumação: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Exhumation[]> {
    try {
      return await this.prismaService.exhumation.findMany({
        include: {
          deceased: true,
          drawerExhumed: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Falha ao recuperar exumações: ${error.message}`,
      );
    }
  }

  async findOne(id: number): Promise<Exhumation> {
    try {
      const exhumation = await this.prismaService.exhumation.findUnique({
        where: { id },
        include: {
          deceased: true,
          drawerExhumed: true,
        },
      });

      if (!exhumation) {
        throw new NotFoundException(`Exumação com ID ${id} não encontrada`);
      }

      return exhumation;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Falha ao recuperar exumação: ${error.message}`,
      );
    }
  }

  async update(
    id: number,
    updateExhumationDto: UpdateExhumationDto,
  ): Promise<Exhumation> {
    try {
      // Check if exhumation exists
      const existingExhumation = await this.prismaService.exhumation.findUnique(
        {
          where: { id },
        },
      );

      if (!existingExhumation) {
        throw new NotFoundException(`Exumação com ID ${id} não encontrada`);
      }

      // Validate dates if they're being updated
      const currentDate = new Date();
      if (
        updateExhumationDto.exhumationDate &&
        new Date(updateExhumationDto.exhumationDate) < currentDate
      ) {
        throw new BadRequestException(
          'Data de exumação não pode estar no passado',
        );
      }

      if (
        updateExhumationDto.performedAt &&
        updateExhumationDto.exhumationDate &&
        new Date(updateExhumationDto.performedAt) <
          new Date(updateExhumationDto.exhumationDate)
      ) {
        throw new BadRequestException(
          'Data de realização não pode ser anterior à data de exumação',
        );
      }

      // If exhumationDate is not provided but performedAt is, check against existing exhumationDate
      if (
        updateExhumationDto.performedAt &&
        !updateExhumationDto.exhumationDate &&
        new Date(updateExhumationDto.performedAt) <
          existingExhumation.exhumationDate
      ) {
        throw new BadRequestException(
          'Data de realização não pode ser anterior à data de exumação',
        );
      }

      // Update the exhumation
      return await this.prismaService.exhumation.update({
        where: { id },
        data: updateExhumationDto,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Falha ao atualizar exumação: ${error.message}`,
      );
    }
  }

  async remove(id: number): Promise<Exhumation> {
    try {
      // Check if exhumation exists
      const existingExhumation = await this.prismaService.exhumation.findUnique(
        {
          where: { id },
        },
      );

      if (!existingExhumation) {
        throw new NotFoundException(`Exumação com ID ${id} não encontrada`);
      }

      // Delete the exhumation
      return await this.prismaService.exhumation.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Falha ao remover exumação: ${error.message}`,
      );
    }
  }
}
