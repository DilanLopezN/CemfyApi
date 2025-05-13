import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  BuyValtDto,
  CreateValtDto,
  CreateValtType,
  ValtImageCoordenatesDto,
  ValtMaintenanceDto,
} from './dto/create-valt.dto';
import { UpdateValtDto } from './dto/update-valt.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { generateQrCode } from 'src/core/utils/generate-qrcode';
import { $Enums, DrawerStatus, Prisma, Valts } from '@prisma/client';
import { env } from 'src/core/env';
import { buyValtPix } from './functions/buy-valt-pix';
import { buyValtBillet } from './functions/buy-valt-billet';
import { buyValtFlesh } from './functions/buy-valt-flesh';
import { buyValtCredit } from './functions/buy-valt-credit';
import { MaintenanceValtPix } from './functions/maintenance-valt-pix';
import { GenericThrow } from 'src/core/errors/GenericThrow';
import { MaintenanceValtBillet } from './functions/maintenance-valt-billet';
import { MaintenanceValtFlesh } from './functions/maintenance-valt-flesh';
import { MaintenanceValtCredit } from './functions/maintenance-valt-credit';
import { rentValtBolix } from './functions/rent-valt-recurrent-bolix';
import { rentValtCredit } from './functions/rent-valt-recurrent-credit';
import { MailhandlerService } from 'src/core/mail/mailhandler.service';
import { R2Service } from 'src/core/storage/cloudflare-r2.service';
import { Readable } from 'stream';
import { RabbitService } from 'src/core/rabbitmq/rabbit.service';

@Injectable()
export class ValtsService {
  private readonly logger = new Logger(ValtsService.name);

  constructor(
    private prismaService: PrismaService,
    private mailService: MailhandlerService,
    private r2Service: R2Service,
    private rabbitService: RabbitService,
  ) {}

  async create(createValtDto: CreateValtDto) {
    try {
      const {
        drawersQuantity,
        squaresId,
        identificator,
        coordenates,
        dimensions,
        image,
        rentValue,
        saleValue,
        valtType,
      } = createValtDto;

      // Validações mais específicas com exceções mais descritivas
      if (!drawersQuantity || drawersQuantity <= 0) {
        throw new BadRequestException(
          'É necessário especificar ao menos uma gaveta por jazigo',
        );
      }

      if (!squaresId) {
        throw new BadRequestException(
          'É necessário atrelar o jazigo a uma quadra',
        );
      }

      if (!identificator || identificator.trim() === '') {
        throw new BadRequestException(
          'É necessário fornecer um identificador válido para o jazigo',
        );
      }

      // Verificar se a quadra existe
      const squareExists = await this.prismaService.squares.findUnique({
        where: { id: squaresId },
      });

      if (!squareExists) {
        throw new NotFoundException(
          `A quadra com ID ${squaresId} não foi encontrada`,
        );
      }

      // Verificar se o tipo de jazigo existe (se fornecido)
      if (valtType && valtType.id) {
        const typeExists = await this.prismaService.valtType.findUnique({
          where: { id: valtType.id },
        });

        if (!typeExists) {
          throw new NotFoundException(
            `O tipo de jazigo com ID ${valtType.id} não foi encontrado`,
          );
        }
      }

      // Verificar se já existe um jazigo com o mesmo identificador na mesma quadra
      const existingValt = await this.prismaService.valts.findFirst({
        where: {
          identificator,
          squaresId,
        },
      });

      if (existingValt) {
        throw new BadRequestException(
          `Já existe um jazigo com o identificador "${identificator}" nesta quadra`,
        );
      }

      return await this.prismaService.$transaction(async (prisma) => {
        // Criar o jazigo
        const valt = await prisma.valts.create({
          data: {
            identificator,
            drawersQuantity,
            coordenates: coordenates as { x: ''; y: '' }, // Explicitly cast to the expected type
            dimensions,
            image,
            rentValue: rentValue || 0,
            saleValue: saleValue || 0,
            status: 'AVAILABLE',
            Squares: {
              connect: { id: squaresId },
            },
            ...(valtType &&
              valtType.id && {
                type: {
                  connect: { id: valtType.id },
                },
              }),
          },
        });

        this.logger.log(
          `Jazigo criado com sucesso: ID ${valt.id}, Identificador: ${identificator}`,
        );

        // Criar gavetas para o jazigo
        const drawerData = Array.from(
          { length: drawersQuantity },
          (_, index) => ({
            identificator: `${identificator}-${index + 1}`,
            rentValue: 0,
            saleValue: 0,
            status: DrawerStatus.AVAILABLE,
            valtsId: valt.id,
          }),
        );

        await prisma.drawers.createMany({ data: drawerData });
        this.logger.log(
          `${drawersQuantity} gavetas criadas para o jazigo ${valt.id}`,
        );

        // Gerar o QRCode
        try {
          const url = `${env.FRONT_DOMAIN}/jazigos/${valt.id}`;
          const qrcode = await generateQrCode({ url });

          if (!qrcode) {
            throw new Error('Falha ao gerar QRCode do Jazigo');
          }

          // Atualizar o jazigo com a imagem do QRCode
          await prisma.valts.update({
            where: { id: valt.id },
            data: { image: qrcode },
          });

          this.logger.log(`QRCode gerado e associado ao jazigo ${valt.id}`);
        } catch (error) {
          this.logger.error(
            `Erro ao gerar QRCode para o jazigo ${valt.id}`,
            error.stack,
          );
          // Não interromper a transação em caso de falha no QR code
        }

        return valt;
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(
          `Erro do Prisma ao criar jazigo: ${error.message}`,
          error.stack,
        );

        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Já existe um jazigo com os mesmos dados',
          );
        }

        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Referência inválida a um recurso que não existe',
          );
        }
      }

      this.logger.error(
        `Erro inesperado ao criar jazigo: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll() {
    try {
      const valts = await this.prismaService.valts.findMany({
        select: {
          id: true,
          identificator: true,
          dimensions: true,
          coordenates: true,
          owner: true,
          drawersQuantity: true,
          imageUrl: true,
          imageUri: true,
          drawers: true,
          rentValue: true,
          saleValue: true,
          Squares: {
            select: { identificator: true },
          },
        },
      });

      if (!valts || valts.length === 0) {
        this.logger.log('Nenhum jazigo encontrado');
      } else {
        this.logger.log(`${valts.length} jazigos encontrados`);
      }

      return valts;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar todos os jazigos: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao buscar a lista de jazigos',
      );
    }
  }

  async findAllWithoutOwners() {
    try {
      const valts = await this.prismaService.valts.findMany({
        where: {
          owner: null,
        },

        select: {
          id: true,
          identificator: true,
          dimensions: true,
          coordenates: true,
          drawersQuantity: true,
          imageUrl: true,
          imageUri: true,
          drawers: true,
          rentValue: true,
          saleValue: true,
          owner: true,
          Squares: {
            select: { identificator: true },
          },
        },
      });

      if (!valts || valts.length === 0) {
        this.logger.log('Nenhum jazigo encontrado');
        return [];
      } else {
        this.logger.log(`${valts.length} jazigos encontrados`);
      }

      return valts;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar todos os jazigos: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao buscar a lista de jazigos',
      );
    }
  }

  async findAllValtTypes() {
    try {
      const types = await this.prismaService.valtType.findMany();
      return types;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar tipos de jazigos: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Erro ao buscar tipos de jazigos');
    }
  }

  async findAllBySquare(squareId: string) {
    try {
      if (!squareId) {
        throw new BadRequestException('ID da quadra não fornecido');
      }

      // Verificar se a quadra existe
      const squareExists = await this.prismaService.squares.findUnique({
        where: { id: squareId },
      });

      if (!squareExists) {
        throw new NotFoundException(
          `A quadra com ID ${squareId} não foi encontrada`,
        );
      }

      const valts = await this.prismaService.valts.findMany({
        select: {
          id: true,
          coordenates: true,
          dimensions: true,
          identificator: true,
          drawersQuantity: true,
          imageUri: true,
          imageUrl: true,
          rentValue: true,
          saleValue: true,
        },
        where: { squaresId: squareId },
      });

      this.logger.log(
        `${valts.length} jazigos encontrados na quadra ${squareId}`,
      );
      return valts;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `Erro ao buscar jazigos por quadra ${squareId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao buscar jazigos da quadra',
      );
    }
  }

  async findOne(id: number) {
    try {
      if (!id) {
        throw new BadRequestException('ID do jazigo não fornecido');
      }

      const valt = await this.prismaService.valts.findUnique({
        where: { id },
        include: {
          Squares: {
            select: { identificator: true },
          },
          drawers: {
            include: {
              deceades: {
                select: { fullName: true, image: true },
              },
            },
          },
        },
      });

      if (!valt) {
        throw new NotFoundException(`Jazigo com ID ${id} não encontrado`);
      }

      return valt;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `Erro ao buscar jazigo ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Erro ao buscar detalhes do jazigo ${id}`,
      );
    }
  }

  async findAllByGraveyard(graveyard: string) {
    try {
      if (!graveyard) {
        throw new BadRequestException('ID do cemitério não fornecido');
      }

      // Verificar se o cemitério existe
      const graveyardExists = await this.prismaService.graveyards.findUnique({
        where: { id: graveyard },
      });

      if (!graveyardExists) {
        throw new NotFoundException(
          `O cemitério com ID ${graveyard} não foi encontrado`,
        );
      }

      const valts = await this.prismaService.valts.findMany({
        select: {
          coordenates: true,
          dimensions: true,
          drawersQuantity: true,
          id: true,
          identificator: true,
          status: true,
          imageUrl: true,
          rentValue: true,
          saleValue: true,
        },
        where: {
          Squares: {
            Graveyards: {
              id: graveyard,
            },
          },
        },
      });

      this.logger.log(
        `${valts.length} jazigos encontrados no cemitério ${graveyard}`,
      );
      return valts;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `Erro ao buscar jazigos por cemitério ${graveyard}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao buscar jazigos do cemitério',
      );
    }
  }

  async findAllByPartner(partnerId: string) {
    try {
      if (!partnerId) {
        throw new BadRequestException('ID do parceiro não fornecido');
      }

      // Verificar se o parceiro existe
      const partnerExists = await this.prismaService.partner.findUnique({
        where: { id: partnerId },
      });

      if (!partnerExists) {
        throw new NotFoundException(
          `O parceiro com ID ${partnerId} não foi encontrado`,
        );
      }

      const valts = await this.prismaService.valts.findMany({
        select: {
          coordenates: true,
          dimensions: true,
          drawersQuantity: true,
          id: true,
          identificator: true,
          status: true,
          imageUrl: true,
          rentValue: true,
          saleValue: true,
        },
        where: {
          Squares: {
            Graveyards: {
              partnerId: partnerId,
            },
          },
        },
      });

      this.logger.log(
        `${valts.length} jazigos encontrados para o parceiro ${partnerId}`,
      );
      return valts;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `Erro ao buscar jazigos por parceiro ${partnerId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao buscar jazigos do parceiro',
      );
    }
  }

  async update(id: number, updateValtDto: UpdateValtDto) {
    try {
      if (!id) {
        throw new BadRequestException('ID do jazigo não fornecido');
      }

      // Verificar se o jazigo existe
      const valtExists = await this.prismaService.valts.findUnique({
        where: { id },
      });

      if (!valtExists) {
        throw new NotFoundException(`Jazigo com ID ${id} não encontrado`);
      }

      // Validar dados de atualização
      if (
        updateValtDto.drawersQuantity !== undefined &&
        updateValtDto.drawersQuantity <= 0
      ) {
        throw new BadRequestException(
          'A quantidade de gavetas deve ser maior que zero',
        );
      }

      // Verificar se está tentando alterar o identificador para um que já existe
      if (
        updateValtDto.identificator &&
        updateValtDto.identificator !== valtExists.identificator
      ) {
        const existingValt = await this.prismaService.valts.findFirst({
          where: {
            identificator: updateValtDto.identificator,
            squaresId: valtExists.squaresId,
            id: { not: id },
          },
        });

        if (existingValt) {
          throw new BadRequestException(
            `Já existe um jazigo com o identificador "${updateValtDto.identificator}" nesta quadra`,
          );
        }
      }

      // Atualizar o jazigo
      await this.prismaService.valts.update({
        where: { id },
        data: {
          coordenates: updateValtDto.coordenates,
          identificator: updateValtDto.identificator,
          dimensions: updateValtDto.dimensions,
          rentValue: updateValtDto.rentValue,
          saleValue: updateValtDto.saleValue,
          drawersQuantity: updateValtDto.drawersQuantity,
          status: updateValtDto.status,
        },
      });

      this.logger.log(`Jazigo ${id} atualizado com sucesso`);

      // Se a quantidade de gavetas foi alterada, pode ser necessário adicionar/remover gavetas
      if (
        updateValtDto.drawersQuantity &&
        updateValtDto.drawersQuantity !== valtExists.drawersQuantity
      ) {
        // Implementar lógica para ajustar o número de gavetas se necessário
        this.logger.log(
          `Atualização da quantidade de gavetas do jazigo ${id} pode requerer ajustes adicionais`,
        );
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(
          `Erro do Prisma ao atualizar jazigo ${id}: ${error.message}`,
          error.stack,
        );

        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Já existe um jazigo com os mesmos dados',
          );
        }
      }

      this.logger.error(
        `Erro ao atualizar jazigo ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Erro ao atualizar o jazigo ${id}`,
      );
    }
  }

  async remove(id: number) {
    try {
      if (!id) {
        throw new BadRequestException('ID do jazigo não fornecido');
      }

      // Verificar se o jazigo existe
      const valtExists = await this.prismaService.valts.findUnique({
        where: { id },
      });

      if (!valtExists) {
        throw new NotFoundException(`Jazigo com ID ${id} não encontrado`);
      }

      // Verificar se há gavetas com status diferente de AVAILABLE
      const drawers = await this.prismaService.drawers.findMany({
        where: {
          valtsId: id,
          status: { not: DrawerStatus.AVAILABLE },
        },
      });

      if (drawers.length > 0) {
        throw new BadRequestException(
          `Não é possível remover o jazigo ${id} pois possui ${drawers.length} gavetas em uso`,
        );
      }

      // Executar em transação para garantir que todas as gavetas sejam excluídas
      await this.prismaService.$transaction(async (prisma) => {
        // Remover todas as gavetas primeiro
        await prisma.drawers.deleteMany({
          where: { valtsId: id },
        });

        // Remover o jazigo
        await prisma.valts.delete({
          where: { id },
        });
      });

      this.logger.log(`Jazigo ${id} removido com sucesso`);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `Erro ao remover jazigo ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(`Erro ao remover o jazigo ${id}`);
    }
  }

  async findByQrCode(id: number) {
    try {
      if (!id) {
        throw new BadRequestException('ID do jazigo não fornecido');
      }

      const valt = await this.prismaService.valts.findUnique({
        where: { id },
        select: {
          identificator: true,
          imageUrl: true,
          squaresId: true,
          status: true,
          rentValue: true,
          saleValue: true,
          drawers: {
            select: {
              identificator: true,
              image: true,
              deceasedSupported: true,
              status: true,
              deceades: true,
            },
          },
        },
      });

      if (!valt) {
        throw new NotFoundException(`Jazigo com ID ${id} não encontrado`);
      }

      return valt;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      this.logger.error(
        `Erro ao buscar jazigo por QR code ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Erro ao buscar informações do jazigo por QR code`,
      );
    }
  }

  async createValtType({
    valtType,
    available,
    rentValue,
    saleValue,
  }: CreateValtType) {
    try {
      if (!valtType || valtType.trim() === '') {
        throw new BadRequestException(
          'É necessário fornecer um nome válido para o tipo de jazigo',
        );
      }

      // Verificar se já existe um tipo com o mesmo nome
      const existingType = await this.prismaService.valtType.findFirst({
        where: {
          valtType: { equals: valtType, mode: 'insensitive' },
        },
      });

      if (existingType) {
        throw new BadRequestException(
          `Já existe um tipo de jazigo com o nome "${valtType}"`,
        );
      }

      const newType = await this.prismaService.valtType.create({
        data: {
          valtType,
          available: available ?? true,
          rentValue: rentValue,
          saleValue: saleValue,
        },
      });

      this.logger.log(`Tipo de jazigo "${valtType}" criado com sucesso`);
      return newType;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Erro ao criar tipo de jazigo: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Erro ao criar o tipo de jazigo');
    }
  }

  async buyValt(buyValtDto: BuyValtDto) {
    try {
      const assignee = await this.prismaService.assignee.findUnique({
        where: { id: buyValtDto.assigneeId },
        include: {
          address: true,
          payment: true,
        },
      });

      if (!assignee) throw new GenericThrow('Cessionário não encontrado');

      const valt = await this.prismaService.valts.findUnique({
        where: { id: buyValtDto.valtId },
        include: {
          Squares: {
            include: {
              Graveyards: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!valt) throw new GenericThrow('Jazigo não encontrado');

      switch (buyValtDto.paymentType) {
        case (buyValtDto.paymentType = 'PIX'):
          const { pixCopy, qrCode } = await buyValtPix(
            assignee,
            valt,
            buyValtDto,
          );

          const { buffer, mimeType } = this.base64ToBuffer(qrCode);

          const qrCodeFile = {
            mimetype: mimeType,
            buffer,
          };

          const url = await this.r2Service.uploadFile(
            qrCodeFile as Express.Multer.File,
          );

          await this.mailService.sendPixMail({
            email: assignee.email,
            subject: 'Pix de venda de jazigo',
            image: url,
            text: pixCopy,
          });

          return {
            message: 'Pix gerado com sucesso!',
            pixCopy: pixCopy,
            qrCode: qrCode,
          };
        case (buyValtDto.paymentType = 'BOLETO'):
          const billets = await buyValtBillet(assignee, valt, buyValtDto);

          return billets;
        case (buyValtDto.paymentType = 'CARNE'):
          const carnets = await buyValtFlesh(assignee, valt, buyValtDto);
          return carnets;
        case (buyValtDto.paymentType = 'CREDITO'):
          const installment = await buyValtCredit(assignee, valt, buyValtDto);

          return installment;
        case (buyValtDto.paymentType = 'RECORRENCIA'):
          const recurrence =
            buyValtDto.rentType == 'BOLIX'
              ? await rentValtBolix(assignee, valt, buyValtDto)
              : await rentValtCredit(assignee, valt, buyValtDto);

          return recurrence;
      }
    } catch (error) {
      console.log(error);
      await this.rabbitService.reportPaymentFailure({ data: buyValtDto });
      throw error;
    }
  }

  async valtMaintenance(valtMaintenanceDto: ValtMaintenanceDto) {
    const assignee = await this.prismaService.assignee.findUnique({
      where: { id: valtMaintenanceDto.assigneeId },
      include: {
        ValtOwners: true,
      },
    });

    if (!assignee) throw new GenericThrow('Cessionário não encontrado');

    const valt = await this.prismaService.valts.findUnique({
      where: { id: valtMaintenanceDto.valtId },
    });

    if (!valt) throw new GenericThrow('Jazigo não encontrado');

    const owner = assignee.ValtOwners.find((v) => v.valtsId === valt.id);

    if (!owner) throw new GenericThrow('Cessionário não é dono do jazigo');

    switch (valtMaintenanceDto.paymentType) {
      case (valtMaintenanceDto.paymentType = 'PIX'):
        const pix = await MaintenanceValtPix(
          owner,
          assignee,
          valt,
          valtMaintenanceDto,
          valtMaintenanceDto.maintenanceType,
        );
        return pix;
      case (valtMaintenanceDto.paymentType = 'BOLETO'):
        const billet = await MaintenanceValtBillet(
          owner,
          assignee,
          valt,
          valtMaintenanceDto,
          valtMaintenanceDto.maintenanceType,
        );
        return billet;
      case (valtMaintenanceDto.paymentType = 'CARNE'):
        const flesh = await MaintenanceValtFlesh(
          owner,
          assignee,
          valt,
          valtMaintenanceDto,
          valtMaintenanceDto.maintenanceType,
        );
        return flesh;
      case (valtMaintenanceDto.paymentType = 'CREDITO'):
        const installment = await MaintenanceValtCredit(
          owner,
          assignee,
          valt,
          valtMaintenanceDto,
          valtMaintenanceDto.maintenanceType,
        );
        return installment;
    }
  }

  async valtImageCoordenates(valtImageCoordenatesDto: ValtImageCoordenatesDto) {
    const valt = await this.prismaService.valts.findUnique({
      where: { id: valtImageCoordenatesDto.valtId },
    });

    if (!valt) throw new GenericThrow('Jazigo não encontrado');

    const updatedValt = await this.prismaService.valts.update({
      where: {
        id: valtImageCoordenatesDto.valtId,
      },
      data: {
        drawersCoordenates: valtImageCoordenatesDto.coordenates,
      },
    });

    return updatedValt;
  }

  async getValtsWithAreas() {
    const valts = await this.prismaService.valts.findMany({
      where: {
        drawersCoordenates: {
          not: null,
        },
      },
    });

    return valts;
  }

  base64ToBuffer(base64String: string) {
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    if (!matches) throw new Error('Formato de Base64 inválido');

    const mimeType = matches[1]; // Exemplo: 'image/png'
    const base64Data = matches[2]; // Apenas os dados binários

    return {
      buffer: Buffer.from(base64Data, 'base64'),
      mimeType,
    };
  }
}
