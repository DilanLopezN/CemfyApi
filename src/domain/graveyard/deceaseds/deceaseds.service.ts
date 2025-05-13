import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { CreateDeceasedDto } from './dto/create-deceased.dto';
import { UpdateDeceasedDto } from './dto/update-deceased.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { $Enums, Prisma } from '@prisma/client';
import { R2Service } from 'src/core/storage/cloudflare-r2.service';
import { GenericThrow } from 'src/core/errors/GenericThrow';

@Injectable()
export class DeceasedsService {
  constructor(
    private prismaService: PrismaService,
    private r2Service: R2Service,
  ) {}

  async create(createDeceasedDto: CreateDeceasedDto) {
    try {
      if (
        !createDeceasedDto.fullName ||
        !createDeceasedDto.identificationDoc ||
        !createDeceasedDto.registration
      ) {
        throw new BadRequestException(
          'Dados obrigatórios ausentes: nome completo, documento de identificação e registro são obrigatórios',
        );
      }

      const deceasedData: any = {
        fullName: createDeceasedDto.fullName,
        identificationDoc: createDeceasedDto.identificationDoc,
        registration: createDeceasedDto.registration,

        birthDay: createDeceasedDto.birthDay
          ? new Date(createDeceasedDto.birthDay)
          : null,
        buriedIn: createDeceasedDto.buriedIn
          ? new Date(createDeceasedDto.buriedIn)
          : null,
        deceasedIn: createDeceasedDto.deceasedIn
          ? new Date(createDeceasedDto.deceasedIn)
          : null,
        deathDate: createDeceasedDto.deceasedIn
          ? new Date(createDeceasedDto.deceasedIn)
          : null,
        transferDate: createDeceasedDto.transferDate
          ? new Date(createDeceasedDto.transferDate)
          : null,

        religion: createDeceasedDto.religion,
        status: createDeceasedDto.status,
        typeOfGrave: createDeceasedDto.typeOfGrave,
        observations: createDeceasedDto.observations,

        sealNumber: createDeceasedDto.seal,
        graveRegistration: createDeceasedDto.graveRegistration,
        addObservation: createDeceasedDto.addObservation || false,
        authorizeBurial: createDeceasedDto.authorizeBurial || false,
        nameMother: createDeceasedDto.motherName,
        nameFather: createDeceasedDto.fatherName,
        gender: createDeceasedDto.gender,
        race: createDeceasedDto.race,
        maritalStatus: createDeceasedDto.maritalStatus,
        birthPlace: createDeceasedDto.birthPlace,

        deathCause: createDeceasedDto.deathCause,
        crm: createDeceasedDto.crm,
        doctorName: createDeceasedDto.doctorName,
        registryOffice: createDeceasedDto.registryOffice,
        declaredBy: createDeceasedDto.declaredBy,

        funeralHome: createDeceasedDto.funeralHome,
        vehiclePlate: createDeceasedDto.vehiclePlate,
        driverName: createDeceasedDto.driverName,
        relationship: createDeceasedDto.relationship,
      };

      const relations: any = {};

      if (createDeceasedDto.assigneeId) {
        const assigneeExists = await this.prismaService.assignee.findUnique({
          where: { id: Number(createDeceasedDto.assigneeId) },
        });

        if (!assigneeExists) {
          throw new NotFoundException(
            `Cessionário com ID ${createDeceasedDto.assigneeId} não encontrado`,
          );
        }

        relations.assignee = {
          connect: {
            id: Number(createDeceasedDto.assigneeId),
          },
        };
      }

      if (createDeceasedDto.drawerId) {
        const drawerExists = await this.prismaService.drawers.findUnique({
          where: { id: createDeceasedDto.drawerId },
        });

        if (!drawerExists) {
          throw new NotFoundException(
            `Gaveta com ID ${createDeceasedDto.drawerId} não encontrada`,
          );
        }

        relations.Drawers = {
          connect: {
            id: createDeceasedDto.drawerId,
          },
        };
      }

      // Criação do memorial
      if (createDeceasedDto.birthDay || createDeceasedDto.deceasedIn) {
        relations.memorial = {
          create: {
            bornOn: createDeceasedDto.birthDay
              ? new Date(createDeceasedDto.birthDay)
              : null,
            deceasedIin: createDeceasedDto.deceasedIn
              ? new Date(createDeceasedDto.deceasedIn)
              : null,
            deceaseImageUrl: '',
          },
        };
      }

      const finalData = {
        ...deceasedData,
        ...relations,
      };

      return await this.prismaService.$transaction(async (prisma) => {
        await prisma.drawers.update({
          where: { id: createDeceasedDto.drawerId },
          data: { status: 'UNAVAILABLE' },
        });

        const createdDeceased = await prisma.deceased.create({
          data: finalData,
        });

        return createdDeceased;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Erro de chave única (ex: identificationDoc duplicado)
        if (error.code === 'P2002') {
          const field = error.meta?.target as string[];
          throw new ConflictException(
            `Já existe um registro com o mesmo valor para ${field.join(', ')}`,
          );
        }

        // Erro de restrição de foreign key
        if (error.code === 'P2003') {
          throw new BadRequestException(
            `Referência inválida: ${error.meta?.field_name}`,
          );
        }

        // Registro necessário não encontrado
        if (error.code === 'P2025') {
          throw new NotFoundException('Registro relacionado não encontrado');
        }
      }

      // Repassar erros já tratados
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      // Log do erro para debugging
      console.error('Erro ao criar falecido:', error);

      // Erro genérico
      throw new InternalServerErrorException(
        'Ocorreu um erro ao criar o registro de falecido',
      );
    }
  }

  async findAll() {
    try {
      const deceaseds = await this.prismaService.deceased.findMany({
        include: {
          memorial: true,
          assignee: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return deceaseds;
    } catch (error) {
      console.error('Erro ao buscar falecidos:', error);
      throw new InternalServerErrorException(
        'Ocorreu um erro ao buscar os registros de falecidos',
      );
    }
  }

  async findOne(id: string) {
    try {
      const deceased = await this.prismaService.deceased.findUnique({
        where: { id },
        include: {
          documents: true,
          memorial: true,
          assignee: {
            include: {
              responsibles: true,
            },
          },
          Drawers: true,
          Funeral: true,
        },
      });

      if (!deceased) {
        throw new NotFoundException(`Falecido com ID ${id} não encontrado`);
      }

      const responsibles = [
        {
          id: deceased.assignee.id,
          fullName: deceased.assignee.name,
          phoneNumber: deceased.assignee.phone,
          identityNumber: deceased.assignee.rg,
          identityType: 'RG' as $Enums.IdentityType,
          ownershipNumber: 1,
          relationship: 'other' as $Enums.Relationship,
          assigneeId: deceased.assignee.id,
        },
        ...deceased.assignee.responsibles.map((r) => {
          return {
            id: r.id,
            fullName: r.fullName,
            phoneNumber: r.phoneNumber,
            identityNumber: r.identityNumber,
            identityType: r.identityType as $Enums.IdentityType,
            ownershipNumber: r.ownershipNumber + 1,
            relationship: r.relationship as $Enums.Relationship,
            assigneeId: deceased.assignee.id,
          };
        }),
      ];

      deceased.assignee.responsibles = responsibles;

      return deceased;
    } catch (error) {
      // Repassar NotFoundException
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error(`Erro ao buscar falecido com ID ${id}:`, error);
      throw new InternalServerErrorException(
        'Ocorreu um erro ao buscar o registro de falecido',
      );
    }
  }

  async update(id: string, updateDeceasedDto: UpdateDeceasedDto) {
    try {
      // Verificar se o registro existe
      const existingDeceased = await this.prismaService.deceased.findUnique({
        where: { id },
        include: { memorial: true },
      });

      if (!existingDeceased) {
        throw new NotFoundException(`Falecido com ID ${id} não encontrado`);
      }

      // Preparar dados para atualização
      const deceasedData: any = {};

      // Adicionar apenas campos que existem no DTO (para não sobrescrever com null)
      Object.keys(updateDeceasedDto).forEach((key) => {
        // Tratar datas especiais
        if (
          [
            'birthDay',
            'buriedIn',
            'deceasedIn',
            'deathDate',
            'dateOfExhumation',
            'transferDate',
          ].includes(key) &&
          updateDeceasedDto[key]
        ) {
          try {
            deceasedData[key] = new Date(updateDeceasedDto[key]);
          } catch (e) {
            throw new BadRequestException(`Data inválida para o campo ${key}`);
          }
        } else {
          deceasedData[key] = updateDeceasedDto[key];
        }
      });

      // Preparar relações
      const relations: any = {};

      if (updateDeceasedDto.assigneeId) {
        // Verificar se o assignee existe
        const assigneeExists = await this.prismaService.assignee.findUnique({
          where: { id: Number(updateDeceasedDto.assigneeId) },
        });

        if (!assigneeExists) {
          throw new NotFoundException(
            `Cessionário com ID ${updateDeceasedDto.assigneeId} não encontrado`,
          );
        }

        relations.assignee = {
          connect: {
            id: Number(updateDeceasedDto.assigneeId),
          },
        };
      }

      if (updateDeceasedDto.drawerId) {
        // Verificar se a gaveta existe
        const drawerExists = await this.prismaService.drawers.findUnique({
          where: { id: updateDeceasedDto.drawerId },
        });

        if (!drawerExists) {
          throw new NotFoundException(
            `Gaveta com ID ${updateDeceasedDto.drawerId} não encontrada`,
          );
        }

        relations.Drawers = {
          connect: {
            id: updateDeceasedDto.drawerId,
          },
        };
      }

      // Atualizar memorial se existir
      if (updateDeceasedDto.birthDay || updateDeceasedDto.deceasedIn) {
        if (existingDeceased?.memorial) {
          // Atualizar memorial existente
          relations.memorial = {
            update: {
              bornOn: updateDeceasedDto.birthDay
                ? new Date(updateDeceasedDto.birthDay)
                : undefined,
              deceasedIin: updateDeceasedDto.deceasedIn
                ? new Date(updateDeceasedDto.deceasedIn)
                : undefined,
            },
          };
        } else {
          // Criar novo memorial
          relations.memorial = {
            create: {
              bornOn: updateDeceasedDto.birthDay
                ? new Date(updateDeceasedDto.birthDay)
                : null,
              deceasedIin: updateDeceasedDto.deceasedIn
                ? new Date(updateDeceasedDto.deceasedIn)
                : null,
            },
          };
        }
      }

      // Combinar dados básicos com relações
      const finalData = {
        ...deceasedData,
        ...relations,
      };

      // Atualizar o registro
      return await this.prismaService.deceased.update({
        where: { id },
        data: finalData,
      });
    } catch (error) {
      // Tratar erros específicos do Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Erro de chave única
        if (error.code === 'P2002') {
          const field = error.meta?.target as string[];
          throw new ConflictException(
            `Já existe um registro com o mesmo valor para ${field.join(', ')}`,
          );
        }

        // Erro de restrição de foreign key
        if (error.code === 'P2003') {
          throw new BadRequestException(
            `Referência inválida: ${error.meta?.field_name}`,
          );
        }
      }

      // Repassar erros já tratados
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      console.error(`Erro ao atualizar falecido com ID ${id}:`, error);
      throw new InternalServerErrorException(
        'Ocorreu um erro ao atualizar o registro de falecido',
      );
    }
  }

  async remove(id: string) {
    try {
      // Verificar se o registro existe
      const existingDeceased = await this.prismaService.deceased.findUnique({
        where: { id },
      });

      if (!existingDeceased) {
        throw new NotFoundException(`Falecido com ID ${id} não encontrado`);
      }

      // Remover o registro
      return await this.prismaService.deceased.delete({
        where: { id },
      });
    } catch (error) {
      // Repassar NotFoundException
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Erro de restrição (não pode excluir por causa de relações)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Não é possível remover este registro pois existem dados relacionados',
        );
      }

      console.error(`Erro ao remover falecido com ID ${id}:`, error);
      throw new InternalServerErrorException(
        'Ocorreu um erro ao remover o registro de falecido',
      );
    }
  }

  async attachDeceasedsDocuments(
    documents: Array<{
      name: string;
      file: Express.Multer.File;
    }>,
    deceasedId: string,
  ) {
    if (!documents || documents.length === 0) {
      throw new Error('No files provided for upload');
    }

    // Extrair apenas os arquivos para upload
    const files = documents.map((doc) => doc.file);

    const uploadedUrls = await this.r2Service.uploadMultipleFiles(files);

    if (!uploadedUrls) {
      throw new GenericThrow('Falha ao realizar upload de arquivos');
    }

    // Usar Promise.all para aguardar a conclusão de todas as operações de criação
    await Promise.all(
      uploadedUrls.map(async (url, index) => {
        await this.prismaService.deceasedDocuments.create({
          data: {
            documentName: documents[index].name, // Usar o nome fornecido
            documentLink: url,
            Deceased: {
              connect: {
                id: deceasedId,
              },
            },
          },
        });
      }),
    );

    return { success: true };
  }
}
