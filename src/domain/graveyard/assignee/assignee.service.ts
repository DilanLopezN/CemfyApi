import { Injectable } from '@nestjs/common';
import {
  ContractType,
  CreateAssigneDto,
  GenerateContractDto,
  LocalPaymentDto,
} from './dto/create-assignee.dto';
import { UpdateAssigneeDto } from './dto/update-assignee.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GenericThrow } from 'src/core/errors/GenericThrow';
import { format } from 'date-fns';
import * as puppeteer from 'puppeteer';
import { clausulas as saleContract } from './template/saleContract';
import { clausulas as saleContractValts } from './template/saleContractValts';
import { clausulas as locationContract } from './template/locationContract';
import { R2Service } from 'src/core/storage/cloudflare-r2.service';
import { ResourceNotFoundError } from 'src/core/errors/ResourceNotFoundError';
import { randomUUID } from 'node:crypto';
import { SendMessage } from 'src/core/messages/send-messages';
import FormData from 'form-data';
import * as fs from 'fs';
import axios from 'axios';
import { env } from 'src/core/env';
import { $Enums, Prisma } from '@prisma/client';
import verifyPromotions from '../valts/functions/verify-promotions';
import path from 'node:path';
import * as readline from 'readline';

@Injectable()
export class AssigneeService {
  constructor(
    private prismaService: PrismaService,
    private r2Service: R2Service,
  ) {}

  async sendMemorialLink(deceasedId: string) {
    const deceased = await this.prismaService.deceased.findUnique({
      where: { id: deceasedId },
      include: { assignee: true, memorial: true },
    });

    if (!deceased) throw new ResourceNotFoundError('Falecido não encontrado');

    const randomToken = randomUUID();

    const memorialLink = `https://cemiterio.ossbrasil.com/memorial/homenagem/${randomToken}`;

    await this.prismaService.memorial.update({
      where: {
        id: deceased.memorial.id,
      },
      data: {
        permissionToken: randomToken,
        createHomageQuantity: 3,
      },
    });

    try {
      const formattedPhone = deceased.assignee.phone.replace(/\D/g, '');

      const createdDate = await SendMessage({
        message: `Entre para criar uma homenagem, ${memorialLink}`,
        to: formattedPhone,
      });

      return createdDate;
    } catch (error) {
      throw error;
    }
  }

  async create(createAssigneeDto: CreateAssigneDto) {
    if (!createAssigneeDto.name)
      throw new GenericThrow('Nome é obrigatório para criar um Cessionário');

    if (!createAssigneeDto.cpf)
      throw new GenericThrow('CPF é obrigatório para criar um Cessionário');

    if (!createAssigneeDto.birthdate)
      throw new GenericThrow(
        'Data Nascimento é obrigatório para criar um Cessionário',
      );

    if (!createAssigneeDto.phone)
      throw new GenericThrow(
        'Telefone é obrigatório para criar um Cessionário',
      );

    if (!createAssigneeDto.address.zipcode)
      throw new GenericThrow('CEP é obrigatório para criar um Cessionário');

    const existingAssigneeCPF = await this.prismaService.assignee.findFirst({
      where: { cpf: createAssigneeDto.cpf },
    });

    if (existingAssigneeCPF) {
      throw new GenericThrow('CPF já cadastrado');
    }

    if (createAssigneeDto.registration) {
      const existingAssigneeRegistration =
        await this.prismaService.assignee.findFirst({
          where: { registration: createAssigneeDto.registration },
        });

      if (existingAssigneeRegistration) {
        throw new GenericThrow('Matrícula já cadastrada');
      }
    }

    const birthdate = new Date(createAssigneeDto.birthdate);
    birthdate.setHours(0, 0, 0, 0);

    const addressData = {
      address_name: createAssigneeDto.address.address_name || '',
      city: createAssigneeDto.address.city || '',
      state: createAssigneeDto.address.state || '',
      zipcode: createAssigneeDto.address.zipcode || '',
      neighborhood: createAssigneeDto.address.neighborhood || '',
      adress_number: createAssigneeDto.address.adress_number,
    };

    const responsiblesData = createAssigneeDto.responsibles.map(
      (responsible) => ({
        fullName: responsible.fullName || '',
        phoneNumber: responsible.phoneNumber || '',
        identityNumber: responsible.identityNumber || '',
        identityType: responsible.identityType as $Enums.IdentityType,
        ownershipNumber: Number(responsible.ownershipNumber) || 0,
        relationship: $Enums.Relationship[responsible.relationship]
          ? responsible.relationship
          : 'other',
      }),
    );

    const businessData = {
      enterprise: createAssigneeDto.enterprise || '',
      businessPosition: createAssigneeDto.businessPosition || '',
      businessPhone: createAssigneeDto.businessPhone || '',
      businessEmail: createAssigneeDto.businessEmail || '',
      businessAddress: createAssigneeDto.businessAddress || '',
      businessCity: createAssigneeDto.businessCity || '',
      businessState: createAssigneeDto.businessState || '',
      businessZipcode: createAssigneeDto.businessZipcode || '',
      businessAddressNumber: createAssigneeDto.businessAddressNumber,
    };

    const paymentData = {
      transactionType: String(createAssigneeDto.payment.transactionType) || '',
      payType: String(createAssigneeDto.payment.payType) || '',
      payInstallments: createAssigneeDto.payment.payInstallments || 0,
      paymentDate: createAssigneeDto.payment.paymentDate
        ? new Date(createAssigneeDto.payment.paymentDate)
        : undefined,
      discount: createAssigneeDto.payment.discount || 0,
      dueDate: String(createAssigneeDto.payment.dueDate) || '',
      dueDay: String(createAssigneeDto.payment.dueDay) || '0',
      maintenanceValue: createAssigneeDto.payment.maintenanceValue || 0,
      maintenancePeriod: createAssigneeDto.payment.maintenancePeriod || '',
      typeContract: createAssigneeDto.payment.typeContract || '',
      url: createAssigneeDto.payment.url || '',
      assinado: createAssigneeDto.payment.assinado || false,
    };

    const existingValt = await this.prismaService.valts.findUnique({
      where: {
        id: createAssigneeDto.valtsId,
      },
      include: {
        assignee: true,
      },
    });

    if (existingValt.assignee !== null) {
      throw new GenericThrow(
        'O jazigo já está alocado a um proprietário temporariamente',
      );
    }

    return this.prismaService
      .$transaction(
        async (prisma) => {
          const address = await prisma.address.create({
            data: addressData,
          });

          const relationships = await Promise.all(
            responsiblesData.map(async (responsible) => {
              return prisma.responsibles.create({
                data: responsible,
              });
            }),
          );

          const relationshipIds = relationships.map(
            (relationship) => relationship.id,
          );

          const business = await prisma.business.create({
            data: businessData,
          });

          const payment = await prisma.payment.create({
            data: paymentData,
          });

          const assigneeData: any = {
            birthdate: birthdate,
            tag: 'NEW',
            name: createAssigneeDto.name,
            cpf: createAssigneeDto.cpf,
            rg: createAssigneeDto.rg || '',
            phone: createAssigneeDto.phone || '',
            email: createAssigneeDto.email || '',
            maritalStatus: createAssigneeDto.maritalStatus || '',
            nationality: createAssigneeDto.nationality || '',
            status: createAssigneeDto.status || false,
            Squares: createAssigneeDto.squaresId
              ? { connect: { id: createAssigneeDto.squaresId } }
              : undefined,
            Valts: createAssigneeDto.valtsId
              ? { connect: { id: createAssigneeDto.valtsId } }
              : undefined,
            Drawers: createAssigneeDto.drawersId
              ? { connect: { id: createAssigneeDto.drawersId } }
              : undefined,
            saleValue: createAssigneeDto.saleValue,
            rentValue: createAssigneeDto.rentValue,
            responsibles: {
              connect: relationshipIds.map((r, index) => ({
                id: r,
              })),
            },
            address: { connect: { id: address.id } },
            business: { connect: { id: business.id } },
            payment: { connect: { id: payment.id } },
          };

          if (createAssigneeDto.registration) {
            assigneeData.registration = createAssigneeDto.registration;
          }

          if (createAssigneeDto.id) {
            assigneeData.id = createAssigneeDto.id;
          }

          const assignee = await prisma.assignee.create({
            data: assigneeData,
          });

          await prisma.valts.update({
            where: {
              id: createAssigneeDto.valtsId,
            },

            data: {
              assignee: {
                connect: { id: assignee.id },
              },
            },
          });

          await prisma.valtOwners.create({
            data: {
              amountValue: 0,
              serviceType: 'NOVO_PROPRIETARIO',
              transactionType: 'CREATED_OWNER',
              status: 'AGUARDANDO_PAGAMENTO',
              amountInstallments: 0,
              chargeId: randomUUID(),
              isActive: false,
              assignee: {
                connect: { id: assignee.id },
              },
              valt: {
                connect: {
                  id: createAssigneeDto.valtsId,
                },
              },
            },
          });

          return assignee;
        },
        { timeout: 10000 * 180 },
      )
      .catch((error) => {
        throw error;
      });
  }
  async generateContractPdf({
    assigneeId,
    contractType,
    valtId,
  }: GenerateContractDto): Promise<Buffer> {
    try {
      const assignee = await this.prismaService.assignee.findUnique({
        where: { id: assigneeId },
        include: {
          Valts: true,
          Squares: true,
          Drawers: true,
          payment: true,
          address: true,
          business: true,
          responsibles: true,
        },
      });

      if (!assignee) throw new GenericThrow('Contratante não encontrado');
      let value = null;
      let payType = 'Parcelado';
      if (assignee.payment.payType == 'cash') {
        payType = 'à vista';
      } else {
        value = assignee.saleValue / assignee.payment.payInstallments;
        value =
          'Parcelado ( em ' +
          assignee.payment.payInstallments +
          'x R$' +
          value.toFixed(2) +
          ')';
      }

      if (!assignee.payment.transactionType) {
        throw new GenericThrow(
          'Tipo de transação é obrigatório para gerar um contrato',
        );
      }

      let contractHtml;
      switch (true) {
        case contractType == 'VENDA_JAZIGO':
          const valt = await this.prismaService.valts.findUnique({
            where: { id: valtId },
            include: {
              Squares: {
                include: { Graveyards: true },
              },
            },
          });
          if (!valt)
            throw new GenericThrow(
              'Jazigo não informado para geração de contrato',
            );
          const contractTemplate = saleContractValts;

          contractHtml = contractTemplate(
            {
              contractNumber: assignee.id,
              name: assignee.name,
              nationality: assignee.nationality,
              maritalStatus: assignee.maritalStatus,
              profession: assignee.business.businessPosition,
              rg: assignee.rg,
              rgIssuer: 'SSP',
              cpf: assignee.cpf,
              birthdate: format(new Date(assignee.birthdate), 'dd/MM/yyyy'),
              address: assignee.address.address_name,
              city: assignee.address.city,
              state: assignee.address.state,
              phone: assignee.phone,
              payType: payType,
              payInstallments: value,
              payDate: assignee.payment.paymentDate
                ? format(new Date(assignee.payment.paymentDate), 'dd/MM/yyyy')
                : '',
              contractDate: format(new Date(), 'dd/MM/yyyy'),
              valts: valt,
              saleValue: assignee.saleValue,
              squares: valt.Squares,
              drawers: assignee.Drawers,
              dueDate: assignee.payment.dueDate,
            },
            valt.Squares.Graveyards,
          );
      }

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(contractHtml);
      const pdfBuffer = Buffer.from(
        await page.pdf({
          format: 'A4',
          margin: {
            top: '2cm',
            right: '1.5cm',
            bottom: '2cm',
            left: '1.5cm',
          },
        }),
      );
      await browser.close();
      // this.savePDF(pdfBuffer, assigneeId);
      this.uploadToD4Sign(pdfBuffer, assignee.email, assignee.id, contractType);

      await this.prismaService.valts.update({
        where: { id: valtId },
        data: { pendingSubscription: true },
      });
      return pdfBuffer;
    } catch (error) {
      console.log(error);
    }
  }

  async savePDF(pdfBuffer: Buffer, assigneeId: number): Promise<string> {
    const pdfKey = `contracts/contract_${assigneeId}.pdf`;

    try {
      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: `contract_${assigneeId}.pdf`,
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: pdfBuffer,
        size: pdfBuffer.length,
        stream: undefined,
        destination: undefined,
        filename: undefined,
        path: undefined,
      };

      const location = await this.r2Service.uploadFile(file);

      // await this.prismaService.assignee.update({
      //   where: { id: assigneeId },
      //   data: { payment.url: location },
      // });

      return location;
    } catch (error) {
      console.error(`Error uploading PDF: ${error.message}`);
      throw error;
    }
  }

  async updatePaymentStatus(
    nossoNumero: string,
    valorPago: number,
    dataPagamento: string,
  ) {
    const payment = await this.prismaService.paymentOld.findUnique({
      where: { id: Number(nossoNumero) },
    });

    const formattedDate = `20${dataPagamento.substring(
      4,
      6,
    )}-${dataPagamento.substring(2, 4)}-${dataPagamento.substring(0, 2)}`;

    if (payment) {
      await this.prismaService.paymentOld.update({
        where: { id: payment.id },
        data: {
          amountPaid: valorPago,
          paymentDate: new Date(formattedDate),
          status: 'PAID',
        },
      });
    }
  }

  private async uploadToD4Sign(
    pdfBuffer: Buffer,
    replacements: any,
    assigneeId: number,
    contractType: ContractType,
  ): Promise<any> {
    const d4signKey = 'live_crypt_eDcfSv4HUoryWAFl6oTwuVDQpXjif2S8';
    const d4signToken =
      'live_923ee4cb19617cb02bcccd5533392d5d82dfb94a173fa2a47a3cb1bba0f78a2f';
    const uuidcofre = '6991928e-c1b0-4fb6-82ab-19ca55ce316c';
    const uuidfolder = '44a941fe-1523-4754-abae-369918dd09d7';
    const apiUrl = 'https://secure.d4sign.com.br/api/v1';

    let type: string;
    switch (contractType) {
      case 'VENDA_JAZIGO':
        type = 'VENDA DE JAZIGO';
        break;
      case 'ALUGUEL_JAZIGO':
        type = 'ALUGUEL DE JAZIGO';
        break;
      case 'VENDA_GAVETA':
        type = 'VENDA DE GAVETA';
        break;
      case 'ALUGUEL_GAVETA':
        type = 'ALUGUEL DE GAVETA';
        break;
    }

    try {
      // Criar o diretório tmp se ele não existir
      const tmpDir = path.resolve(process.cwd(), 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      // Caminho completo para o arquivo temporário
      const tempFilePath = path.join(tmpDir, `contract_${Date.now()}.pdf`);
      fs.writeFileSync(tempFilePath, pdfBuffer);

      // Preparar os dados do formulário
      const formData = new FormData();
      formData.append('file', fs.createReadStream(tempFilePath));
      formData.append('uuid_folder', uuidfolder);

      const response = await axios.post(
        `${apiUrl}/documents/${uuidcofre}/upload?cryptKey=${d4signKey}&tokenAPI=${d4signToken}`,
        formData,
        {
          headers: formData.getHeaders(),
        },
      );

      const documentUuid = response.data.uuid;

      await this.registerWebhook(documentUuid);

      // Configurar assinaturas
      console.log(documentUuid, replacements);
      await this.configureSignatures(documentUuid, replacements);

      await this.prismaService.assignee.update({
        where: { id: assigneeId },
        data: { status: false },
      });

      await this.prismaService.documents.upsert({
        where: { documentUuid },
        update: {
          type,
          documentStatus: 'PENDENTE',
          updatedAt: new Date(),
        },
        create: {
          type,
          documentUuid,
          documentStatus: 'PENDENTE',
          assigneeId,
        },
      });

      fs.unlinkSync(tempFilePath);

      return {
        uuid: documentUuid,
      };
    } catch (error) {
      console.error('Erro ao enviar documento ao D4Sign', error);
      throw error;
    }
  }
  private async registerWebhook(documentUuid: string) {
    const d4signKey = env.D4SIGN_CRYPT; // Substitua pelo token
    const apiUrl = 'https://secure.d4sign.com.br/api/v1';
    const d4signToken = env.D4SIGN_TOKEN;
    const webhookUrl = `${env.CHARGES_HOOK_URL}/assignee/d4sign`; // Substitua pela URL do webhook

    const form = new FormData();
    form.append('uuid_document', documentUuid);
    form.append('url', webhookUrl);

    try {
      const response = await axios.post(
        `${apiUrl}/documents/${documentUuid}/webhooks`,
        form,
        {
          params: {
            tokenAPI: d4signToken,
            cryptKey: d4signKey,
          },
          headers: form.getHeaders(),
        },
      );

      return response.data;
    } catch (error: any) {
      console.error('Erro ao registrar o webhook:', error.message);
    }
  }
  private async configureSignatures(documentUuid: any, replacements: any) {
    const d4signKey = env.D4SIGN_CRYPT;
    const apiUrl = 'https://secure.d4sign.com.br/api/v1';
    const d4signToken = env.D4SIGN_TOKEN;

    const payload = {
      signers: [
        {
          email: replacements,
          act: '1',
          foreign: '0',
          certificadoicpbr: '0',
          skipemail: '0',
        },
      ],
    };

    try {
      const response = await axios.post(
        `${apiUrl}/documents/${documentUuid}/createlist?cryptKey=${d4signKey}&tokenAPI=${d4signToken}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      if (response.status === 200) {
        await this.sendDocumentToSigners(
          documentUuid,
          apiUrl,
          d4signToken,
          d4signKey,
        );
      }

      return {
        success: true,
        message: 'Assinaturas configuradas com sucesso',
        data: response.data,
      };
    } catch (error) {
      console.error('Erro ao configurar assinaturas no D4Sign', error);
    }
  }

  private async sendDocumentToSigners(
    uuid_document: string,
    apiUrl: string,
    d4signToken: string,
    d4signKey: string,
  ) {
    try {
      const body = {
        message: 'Segue documento para assinatura.',
        workflow: '0',
        skip_email: '0',
      };
      const response = await axios.post(
        `${apiUrl}/documents/${uuid_document}/sendtosigner?cryptKey=${d4signKey}&tokenAPI=${d4signToken}`,
        body,
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao enviar documento para assinaturas', error);
    }
  }

  async findAll(page = 1, pageSize = 25) {
    const skip = (page - 1) * pageSize;

    const assignees = await this.prismaService.assignee.findMany({
      skip,
      take: pageSize,
      include: {
        ValtOwners: {
          select: {
            valt: {
              select: { id: true, identificator: true },
            },
          },
        },
      },
    });

    const total = await this.prismaService.assignee.count();

    // Formata as datas dos registros
    const formattedAssignees = assignees.map((assignee) => ({
      id: assignee.id,
      tag: assignee.tag,
      name: assignee.name,
      cpf: assignee.cpf,
      createdAt: format(new Date(assignee.createdAt), 'dd/MM/yyyy'),
      valts: assignee.ValtOwners.length
        ? Array.from(
            new Map(
              assignee.ValtOwners.flatMap((owner) => owner.valt).map((valt) => [
                valt.id,
                valt,
              ]),
            ).values(),
          )
        : [{ id: null, identificator: 'SEM JAZIGO' }],
    }));

    // Retorna os dados com informações de paginação
    return {
      data: formattedAssignees,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page < Math.ceil(total / pageSize),
        hasPrevious: page > 1,
      },
    };
  }

  async findOne(id: number) {
    try {
      const assigneeData = await this.prismaService.assignee.findUnique({
        where: { id },
        include: {
          PaymentHistory: true,
          SubscriptionCharges: true,
          RecurrenceSubscriptions: true,
          ValtMaintenance: true,
          ValtOwners: true,
          Valts: true,
          Squares: true,
          Drawers: true,
          payment: true,
          address: true,
          business: true,
          responsibles: true,
          PaymentOld: true,
          Deceased: {
            include: {
              Funeral: true,
              Drawers: {
                include: {
                  Valts: { select: { id: true, identificator: true } },
                },
              },
            },
          },
          Documents: true,
        },
      });

      if (!assigneeData) {
        throw new GenericThrow('Contratante não encontrado');
      }

      const data = {
        id: assigneeData.id,
        name: assigneeData.name,
        cpf: assigneeData.cpf,
        rg: assigneeData.rg,
        phone: assigneeData.phone,
        email: assigneeData.email,
        birthdate: format(new Date(assigneeData.birthdate), 'yyyy-MM-dd'),
        saleValue: assigneeData.saleValue,
        rentValue: assigneeData.rentValue,
        PaymentHistory: assigneeData.PaymentHistory,
        ValtOwners: assigneeData.ValtOwners,
        paymentOld: assigneeData.PaymentOld,
        Valts: assigneeData.Valts.map((valt) => {
          return {
            ...valt,
            image: null,
          };
        }),
        Squares: assigneeData.Squares,
        Drawers: assigneeData.Drawers,
        payment: assigneeData.payment,
        responsibles: assigneeData.responsibles,
        documents: assigneeData.Documents.map((doc) => {
          return {
            ...doc,
            type: 'VENDA',
          };
        }),
        deceaseds: assigneeData.Deceased.map((deceased) => {
          return {
            id: deceased.id,
            name: deceased.fullName,
            birthdate: deceased.birthDay,
            deathDate: deceased.deathDate,
            buriedDate: deceased.buriedIn,
            deathCause: deceased.deathCause,
            valt: deceased.Drawers.valtsId,
            isBuried:
              deceased.Funeral != null
                ? deceased.Funeral.finished == true
                  ? 'SEPULTADO'
                  : 'EM ANDAMENTO'
                : 'SEPULTAMENTO NÃO AGENDADO',
          };
        }),
      };

      return data;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateAssigneeDto: UpdateAssigneeDto) {
    if (!updateAssigneeDto.name)
      throw new GenericThrow('Nome é obrigatório para atualizar um assignee');

    if (!updateAssigneeDto.cpf)
      throw new GenericThrow('CPF é obrigatório para atualizar um assignee');

    const existingAssignee = await this.prismaService.assignee.findFirst({
      where: { cpf: updateAssigneeDto.cpf, id: { not: id } },
    });

    if (existingAssignee) {
      throw new GenericThrow('CPF já cadastrado');
    }
    const birthdate = new Date(updateAssigneeDto.birthdate);
    birthdate.setHours(0, 0, 0, 0);

    const addressData = {
      address_name: updateAssigneeDto.address.address_name || '',
      city: updateAssigneeDto.address.city || '',
      state: updateAssigneeDto.address.state || '',
      zipcode: updateAssigneeDto.address.zipcode || '',
      neighborhood: updateAssigneeDto.address.neighborhood || '',
    };

    const businessData = {
      enterprise: updateAssigneeDto.business.enterprise || '',
      businessPosition: updateAssigneeDto.business.businessPosition || '',
      businessPhone: updateAssigneeDto.business.businessPhone || '',
      businessEmail: updateAssigneeDto.business.businessEmail || '',
      businessAddress: updateAssigneeDto.business.businessAddress || '',
      businessCity: updateAssigneeDto.business.businessCity || '',
      businessState: updateAssigneeDto.business.businessState || '',
      businessZipcode: updateAssigneeDto.business.businessZipcode || '',
    };

    const paymentData = {
      transactionType: String(updateAssigneeDto.payment.transactionType) || '',
      payType: String(updateAssigneeDto.payment.payType) || '',
      payInstallments: updateAssigneeDto.payment.payInstallments || 0,
      paymentDate: updateAssigneeDto.payment.paymentDate
        ? new Date(updateAssigneeDto.payment.paymentDate)
        : undefined,
      discount: updateAssigneeDto.payment.discount || 0,
      dueDate: String(updateAssigneeDto.payment.dueDate) || '',
      dueDay: String(updateAssigneeDto.payment.dueDay) || '0',
      maintenanceValue: updateAssigneeDto.payment.maintenanceValue || 0,
      maintenancePeriod: updateAssigneeDto.payment.maintenancePeriod || '',
      typeContract: updateAssigneeDto.payment.typeContract || '',
      url: updateAssigneeDto.payment.url || '',
      assinado: updateAssigneeDto.payment.assinado || false,
    };

    const address = await this.prismaService.address.create({
      data: addressData,
    });

    const business = await this.prismaService.business.create({
      data: businessData,
    });

    const payment = await this.prismaService.payment.create({
      data: paymentData,
    });

    const assigneeData: any = {
      birthdate: birthdate,
      name: updateAssigneeDto.name,
      cpf: updateAssigneeDto.cpf,
      rg: updateAssigneeDto.rg || '',
      phone: updateAssigneeDto.phone || '',
      email: updateAssigneeDto.email || '',
      maritalStatus: updateAssigneeDto.maritalStatus || '',
      nationality: updateAssigneeDto.nationality || '',
      status: updateAssigneeDto.status || false,
      Squares: updateAssigneeDto.squaresId
        ? { connect: { id: updateAssigneeDto.squaresId } }
        : undefined,
      Valts: updateAssigneeDto.valtsId
        ? { connect: { id: updateAssigneeDto.valtsId } }
        : undefined,
      Drawers: updateAssigneeDto.drawersId
        ? { connect: { id: updateAssigneeDto.drawersId } }
        : undefined,
      saleValue: updateAssigneeDto.saleValue || 0,
      rentValue: updateAssigneeDto.rentValue || 0,
      address: { connect: { id: address.id } },

      business: { connect: { id: business.id } },
      payment: { connect: { id: payment.id } },
    };
    // assigneeData.addressId = address.id;
    // assigneeData.relationshipId = relationship.id;
    // assigneeData.businessId = business.id;
    // assigneeData.paymentId = payment.id;

    const assignee = await this.prismaService.assignee.update({
      where: { id },
      data: assigneeData,
    });

    return assignee;
  }

  async remove(id: number) {
    await this.prismaService.assignee.delete({
      where: { id },
    });
  }

  async findAllAssignesByName(name?: string) {
    const assignees = await this.prismaService.assignee.findMany({
      where: {
        name: {
          startsWith: name,
          mode: 'default',
        },
      },
      include: {
        Valts: {
          select: {
            id: true,
            identificator: true,
            squaresId: true,
            drawers: {
              select: {
                id: true,
                identificator: true,
                status: true,
                sealId: true,
              },
            },
          },
        },
      },
    });

    return assignees;
  }

  async FindAllAssigneeDebits(assigneeId: number, valtId: number) {
    try {
      if (!assigneeId)
        throw new GenericThrow(
          'ID do cessionário é obrigatório para buscar débitos',
        );

      if (!valtId)
        throw new GenericThrow(
          'ID do jazigo é obrigatório para buscar débitos',
        );

      const assignee = await this.prismaService.assignee.findUnique({
        where: { id: assigneeId },
        include: {
          payment: true,
          PaymentHistory: true,
          SubscriptionCharges: true,
          RecurrenceSubscriptions: true,
          ValtOwners: {
            include: {
              payment: true,
              paymentsGenerated: true,
            },
          },
        },
      });

      if (!assignee) throw new GenericThrow('Cessionário não encontrado');

      const ValtOwnerData = assignee.ValtOwners.find(
        (v) => v.valtsId == valtId,
      );

      if (!ValtOwnerData)
        throw new GenericThrow(
          'Cessionário não possui jazigo como propriedade',
        );

      const assigneeData = {
        id: assignee.id,
        name: assignee.name,
        cpf: assignee.cpf,
        birthday: assignee.birthdate,
        phone: assignee.phone,
        contractStatus: assignee.payment.assinado ? 'Assinado' : 'Pendente',
        contractType: assignee.payment.transactionType,
        serviceType: ValtOwnerData.serviceType,
        transactionType: ValtOwnerData.transactionType,
        methodType: ValtOwnerData.payment?.method,
        parcelsGenerated: ValtOwnerData.paymentsGenerated,
        paymentsHistory: assignee.PaymentHistory,
      };
      return assigneeData;
    } catch (err) {
      throw err;
    }
  }

  async getAssigneeDeceaseds(assigneeId: number) {
    if (!assigneeId)
      throw new GenericThrow('Necessário informar o ID do cessionário');

    const assigneeData = await this.prismaService.assignee.findUnique({
      where: {
        id: assigneeId,
      },
      include: {
        Deceased: {
          include: {
            Drawers: {
              include: { Valts: { select: { id: true, identificator: true } } },
            },
          },
        },
        Documents: true,
      },
    });

    // const assignee = {
    //   documents: assigneeData.Documents,
    //   deceases: assigneeData.Deceased.map((deceased) => {
    //     return {
    //       id: deceased.id,
    //       name: deceased.fullName,
    //       birthdate: deceased.birthDay,
    //       deathDate: deceased.deathDate,
    //       buriedDate: deceased.buriedIn,
    //       deathCause: deceased.deathCause,
    //       valt: deceased.Drawers.valtsId,
    //     };
    //   }),
    // };

    return assigneeData;
  }

  async buyValtLocalPayment(localPaymentDto: LocalPaymentDto) {
    // Validações iniciais
    if (!localPaymentDto.assigneeId) {
      throw new GenericThrow('Necessário informar cessionário');
    }
    if (!localPaymentDto.valtId) {
      throw new GenericThrow('Necessário informar jazigo');
    }

    // Consultas em paralelo para melhorar performance
    const [valt, assignee, ownerData] = await Promise.all([
      this.prismaService.valts.findUnique({
        where: { id: Number(localPaymentDto.valtId) },
        include: { Squares: { include: { Graveyards: true } } },
      }),
      this.prismaService.assignee.findUnique({
        where: { id: Number(localPaymentDto.assigneeId) },
        include: { ValtOwners: true },
      }),
      this.prismaService.valtOwners.findUnique({
        where: { valtsId: Number(localPaymentDto.valtId) },
      }),
    ]);

    // Validações após consultas
    if (!valt) {
      throw new GenericThrow('Jazigo informado não encontrado');
    }
    if (!assignee) {
      throw new GenericThrow('Cessionário não encontrado');
    }
    if (!ownerData) {
      throw new GenericThrow(
        'Esse jazigo não possui um proprietário associado',
      );
    }

    // Verificação de promoções
    const promotion = await verifyPromotions(
      valt.valtTypeId,
      valt.Squares?.Graveyards?.id,
      [],
    );

    // Cálculo do valor de venda com aplicação de desconto se houver promoção
    const hasAssigneeSaleValue =
      typeof assignee.saleValue === 'number' && assignee.saleValue > 0;
    const baseValue = hasAssigneeSaleValue
      ? assignee.saleValue
      : valt.saleValue;
    const saleValue = promotion.hasPromotion
      ? baseValue * (1 - promotion.discount / 100)
      : baseValue;

    // Determinar se é uma venda com entrada e validar o totalValue se fornecido
    const isProhibited = !!localPaymentDto.prohibited;

    // Nova lógica para lidar com totalValue
    if (!isProhibited && localPaymentDto.totalValue !== undefined) {
      // Verificar se totalValue corresponde exatamente ao saleValue
      if (Number(localPaymentDto.totalValue) !== Number(saleValue)) {
        throw new GenericThrow(
          'O valor total informado deve ser igual ao valor de venda',
        );
      }
    }

    const amountPayed = isProhibited
      ? localPaymentDto.prohibitedValue
      : localPaymentDto.totalValue || saleValue;

    // Validar valor da entrada
    if (isProhibited && localPaymentDto.prohibitedValue > saleValue) {
      throw new GenericThrow('Valor de entrada excede valor de venda');
    }

    // Calcular valor restante
    const restValue = isProhibited
      ? saleValue - localPaymentDto.prohibitedValue
      : 0;

    // Status do pagamento baseado no tipo de venda
    const paymentStatus = isProhibited ? 'ENTRADA_LOCAL' : 'PAGAMENTOS_EM_DIA';

    // Upload do arquivo
    const attachmentUrl = await this.r2Service.uploadFile(localPaymentDto.file);

    // Transação para garantir consistência dos dados
    return await this.prismaService.$transaction(async (prisma) => {
      // Atualizar o valor de venda do cessionário
      if (isProhibited && hasAssigneeSaleValue) {
        await prisma.assignee.update({
          where: { id: assignee.id },
          data: {
            saleValue: {
              decrement: Number(localPaymentDto.prohibitedValue),
            },
          },
        });
      } else if (
        !isProhibited &&
        localPaymentDto.totalValue !== undefined &&
        hasAssigneeSaleValue
      ) {
        // Nova lógica: zerar o saleValue se totalValue for fornecido e não for prohibited
        await prisma.assignee.update({
          where: { id: assignee.id },
          data: {
            saleValue: 0,
          },
        });
      }

      // Criação do pagamento local
      const localPayment = await prisma.localPayment.create({
        data: {
          method: localPaymentDto.method,
          status: paymentStatus,
          prohibited: isProhibited,
          restValue,
          value: saleValue,
          assignee: { connect: { id: assignee.id } },
          attachments: {
            create: {
              amoutPayed: parseFloat(Number(amountPayed).toFixed(2)),
              attachUrl: attachmentUrl,
            },
          },
        },
      });

      // Gerar ID de cobrança único
      const chargeId = `C${assignee.id}V${valt.id}-${randomUUID()}`;

      // Atualização do proprietário do jazigo
      const owner = await prisma.valtOwners.update({
        where: { id: ownerData.id },
        data: {
          chargeId: chargeId.toString(),
          status: isProhibited ? 'ENTRADA_LOCAL' : 'PAGO_TOTAL',
          amountValue: Number(saleValue),
          serviceType: 'VENDA',
          transactionType: 'CHARGE',
          amountInstallments: Number(localPaymentDto.installmentQuantity),
          assignee: { connect: { id: assignee.id } },
          valt: { connect: { id: valt.id } },
          payment: {
            create: {
              financialManagementId: null,
              assigneeId: assignee.id,
              chargeId: localPayment.id.toString(),
              method: 'LOCAL',
              serviceType: 'VENDA',
              values: Number(amountPayed),
            },
          },
        },
      });

      // Criar parcelas futuras se houver mais de uma parcela
      if (Number(localPaymentDto.installmentQuantity) > 1) {
        const paymentsToCreate = Array.from(
          { length: Number(localPaymentDto.installmentQuantity) },
          (_, index) => {
            const currentDate = new Date();
            const expireDate = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + index + 1,
              currentDate.getDate(),
            );

            // Gerar ID único para cada parcela
            const installmentChargeId = `C${assignee.id}V${
              valt.id
            }-${randomUUID()}-P${index}`;

            // Calcular valor das parcelas (dividir o valor restante igualmente)
            const installmentValue = isProhibited
              ? restValue / Number(localPaymentDto.installmentQuantity)
              : saleValue / Number(localPaymentDto.installmentQuantity);

            return {
              assigneeId: assignee.id,
              chargeId: installmentChargeId,
              status: 'AGUARDANDO_PAGAMENTO',
              type: 'LOCAL' as $Enums.MethodType,
              expireDate,
              paymentLink: attachmentUrl,
              pdfLink: attachmentUrl,
              value: parseFloat(installmentValue.toFixed(2)), // Adicionar valor da parcela
            };
          },
        );

        // Criar todas as parcelas de uma só vez
        await prisma.paymentsGenerated.createMany({
          data: paymentsToCreate.map((payment) => ({
            ...payment,
            valtOwnersId: owner.id,
          })),
        });
      }

      // Enviar notificação sobre o pagamento (exemplo)
      // await this.notifyPaymentCreation(assignee.id, valt.id, isProhibited);

      return { localPayment, owner };
    });
  }

  async processRetFile(filePath: string) {
    const fileStream = fs.createReadStream(filePath, { encoding: 'latin1' });

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const tipoRegistro = line[0]; // Primeiro caractere define o tipo de registro

      if (tipoRegistro === '1') {
        // Registro de transação (boletos pagos)
        const nossoNumero = line.substring(37, 62).trim(); // Exemplo de campo (depende do banco)
        const valorPago = parseFloat(line.substring(152, 165).trim());
        const dataPagamento = line.substring(110, 118).trim();

        console.log(
          `Nosso Número: ${nossoNumero}, Valor Pago: ${valorPago}, Data: ${dataPagamento}`,
        );

        // Aqui você pode atualizar o banco de dados com os dados processados
        await this.updatePaymentStatus(nossoNumero, valorPago, dataPagamento);
      }
    }
  }
}
