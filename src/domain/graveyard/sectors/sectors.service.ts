import { Injectable } from '@nestjs/common';
import { CreateSectorDto, CreateSectorTagDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GenericThrow } from 'src/core/errors/GenericThrow';

@Injectable()
export class SectorsService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createSectorDto: CreateSectorDto) {
    if (!createSectorDto.identificator)
      throw new GenericThrow('Necessário identificador único');

    const sectorAlreadyExists = await this.prismaService.sectors.findUnique({
      where: { identificator: createSectorDto.identificator },
    });

    if (sectorAlreadyExists)
      throw new GenericThrow('Setor com esse identificador já existente');

    await this.prismaService.sectors.create({
      data: createSectorDto,
    });
  }

  async findAll() {
    return await this.prismaService.sectors.findMany({
      include: {
        Squares: true,
        tags: true,
      },
    });
  }

  async findOne(id: string) {
    return await this.prismaService.sectors.findUnique({ where: { id } });
  }

  async update(updateSectorDto: UpdateSectorDto) {
    await this.prismaService.sectors.update({
      where: { identificator: updateSectorDto.identificator },
      data: updateSectorDto,
    });
  }

  async remove(id: string) {
    await this.prismaService.sectors.delete({ where: { id } });
    return true; // or false based on the logic
  }

  async createSectorTag(createSectorTagDto: CreateSectorTagDto) {
    await this.prismaService.sectorTags.create({
      data: {
        tagHex: createSectorTagDto.tagHex,
        tagName: createSectorTagDto.tagName,
        Sectors: {
          connect: { id: createSectorTagDto.sectorId },
        },
      },
    });
  }
}
