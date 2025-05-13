import { Injectable } from '@nestjs/common';
import { CreateDrawerDto } from './dto/create-drawer.dto';
import { UpdateDrawerDto } from './dto/update-drawer.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GenericThrow } from 'src/core/errors/GenericThrow';

@Injectable()
export class DrawersService {
  constructor(private prismaService: PrismaService) {}
  async create(createDrawerDto: CreateDrawerDto) {
    if (!createDrawerDto.valtId)
      throw new GenericThrow('Necessário criar gaveta em um jazigo!');

    if (!createDrawerDto.identificator)
      throw new GenericThrow('Necessário identificador para criar gaveta');

    const valt = await this.prismaService.valts.findUnique({
      where: { id: createDrawerDto.valtId },
      include: { drawers: true },
    });

    if (valt.drawers.length >= valt.drawersQuantity)
      throw new GenericThrow(
        'Número máximo de gavetas cadastradas neste jazigo!',
      );

    const drawer = await this.prismaService.drawers.create({
      data: {
        identificator: createDrawerDto.identificator,
        coordenates: createDrawerDto.coordenates,
        dimensions: createDrawerDto.dimensions,
        deceasedSupported: createDrawerDto.deceasedSupported,
        image: createDrawerDto.image,
        Valts: {
          connect: { id: createDrawerDto.valtId },
        },
      },
    });

    return drawer;
  }

  async findAll() {
    const drawers = await this.prismaService.drawers.findMany({
      include: {
        Valts: { select: { identificator: true } },
        assignee: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    return drawers;
  }

  async findAllByPartner(partnerId: string) {
    const drawers = await this.prismaService.drawers.findMany({
      where: {
        Valts: {
          Squares: {
            Graveyards: {
              partnerId: partnerId,
            },
          },
        },
      },
      include: {
        deceades: true,
        Valts: { select: { identificator: true } },
        assignee: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    return drawers;
  }

  async findAllByValt(valtId: number) {
    const drawers = await this.prismaService.drawers.findMany({
      where: {
        valtsId: valtId,
      },
      include: { deceades: true },
    });

    return drawers;
  }

  async findOne(id: string) {
    const drawer = await this.prismaService.drawers.findUnique({
      where: { id },
    });

    return drawer;
  }

  async update(id: string, updateDrawerDto: UpdateDrawerDto) {
    const drawer = await this.prismaService.drawers.update({
      where: { id },
      data: updateDrawerDto,
    });

    return drawer;
  }

  async remove(id: string) {
    await this.prismaService.drawers.delete({
      where: { id },
    });
  }
}
