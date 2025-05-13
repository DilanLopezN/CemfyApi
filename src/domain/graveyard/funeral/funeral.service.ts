import { Injectable } from '@nestjs/common';
import { CreateFuneralDto } from './dto/create-funeral.dto';
import { UpdateFuneralDto } from './dto/update-funeral.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { ResourceAlreadyExistsError } from 'src/core/errors/ResourceAlreadyExistsError';

@Injectable()
export class FuneralService {
  constructor(private prismaService: PrismaService) {}

  async create_room(createFuneralDto: CreateRoomDto) {
    const roomAlreadyExists = await this.prismaService.funeralRooms.findFirst({
      where: { roomIdentificator: createFuneralDto.roomIdentificator },
    });

    if (roomAlreadyExists)
      throw new ResourceAlreadyExistsError(
        'Sala de velorio já existe com esse identificador',
      );

    const room = await this.prismaService.funeralRooms.create({
      data: createFuneralDto,
    });

    return room;
  }

  async create_funeral(createFuneralDto: CreateFuneralDto) {
    const { startDate, endDate, funeralRoomsId, deceasedId } = createFuneralDto;

    // Validação de datas
    if (new Date(endDate) <= new Date(startDate)) {
      throw new Error('A data de término deve ser posterior à data de início.');
    }

    if (new Date(startDate) < new Date()) {
      throw new Error('A data de início deve ser no futuro.');
    }

    const scheduledFuneral = await this.prismaService.$transaction(
      async (prisma) => {
        // Verificar se a sala de velório está disponível
        const existingRoomReservation = await prisma.funeral.findFirst({
          where: {
            funeralRoomsId,
            OR: [
              {
                startDate: { lte: new Date(endDate) },
                endDate: { gte: new Date(startDate) },
              },
            ],
          },
        });

        if (existingRoomReservation) {
          throw new Error(
            'A sala de velório já está reservada para este período.',
          );
        }

        // Verificar se o falecido já possui um velório
        const existingDeceasedFuneral = await prisma.funeral.findFirst({
          where: { deceasedId },
        });

        if (existingDeceasedFuneral) {
          throw new Error('O falecido já possui um velório programado.');
        }

        // Criar o velório
        const funeral = await prisma.funeral.create({
          data: {
            endDate: new Date(endDate),
            startDate: new Date(startDate),
            FuneralRooms: {
              connect: { id: funeralRoomsId },
            },
            deceased: {
              connect: { id: deceasedId },
            },
          },
        });

        // Atualizar status do falecido
        const deceased = await prisma.deceased.update({
          where: { id: deceasedId },
          data: { status: 'EM_PREPARACAO' },
        });

        // Atualizar status da sala de velório
        const room = await prisma.funeralRooms.update({
          where: { id: funeralRoomsId },
          data: { status: 'EM_PREPARACAO' },
        });

        // Retornar os dados do velório agendado
        return {
          room,
          deceasedName: deceased.fullName,
          deceasedReligion: deceased.religion,
          startDate: funeral.startDate,
          endDate: funeral.endDate,
        };
      },
    );

    return scheduledFuneral;
  }
  async findAllRooms() {
    return this.prismaService.funeralRooms.findMany();
  }

  async findAllFunerals() {
    return this.prismaService.funeral.findMany({
      where: {
        finished: false,
      },
      include: {
        FuneralRooms: true,
        deceased: true,
      },
    });
  }

  async finishFuneral(funeralId: number) {
    await this.prismaService.funeral.update({
      where: { id: funeralId },
      data: { finished: true, endDate: new Date(Date.now()) },
    });
  }

  async findOne(id: number) {
    return `This action returns a #${id} funeral`;
  }

  async update(id: number, updateFuneralDto: UpdateFuneralDto) {
    return `This action updates a #${id} funeral`;
  }

  async remove(id: number) {
    return `This action removes a #${id} funeral`;
  }
}
