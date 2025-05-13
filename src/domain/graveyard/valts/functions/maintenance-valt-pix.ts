import { $Enums, Prisma, PrismaClient } from '@prisma/client';
import { ValtMaintenanceDto } from '../dto/create-valt.dto';
import { GenericThrow } from 'src/core/errors/GenericThrow';
import { PixService } from 'src/domain/payments/pix/pix.service';
import { env } from 'src/core/env';
import { randomUUID } from 'crypto';
const prisma = new PrismaClient();
const pixService = new PixService();

type OwnerProps = {
  status: $Enums.PaymentStatus;
  id: number;
  assigneeId: number;
  valtsId: number;
  chargeId: string;
  paymentHistoryId: number;
};

export async function MaintenanceValtPix(
  owner: OwnerProps,
  assignee: Prisma.AssigneeMaxAggregateOutputType,
  valt: Prisma.ValtsMaxAggregateOutputType,
  valtMaintenanceDto: ValtMaintenanceDto,
  type: $Enums.MaintenanceChoice,
) {
  try {
    if (type === $Enums.MaintenanceChoice.ANUAL) {
      const pixData = await pixService.create_charge({
        custom_id: `C${assignee.id}V${valt.id}-${randomUUID()}`,
        calendario: {
          expiracao: 3600,
        },
        chave: env.PIX_KEY,
        devedor: {
          cpf: assignee.cpf.replace(/\D/g, ''),
          nome: assignee.name,
        },
        valor: {
          original: `${assignee.maintenanceValue.toString()}.00`,
        },
        solicitacaoPagador: 'Manutenção de Jazigo Anual',
      });

      await prisma.valtMaintenance.create({
        data: {
          choiceMaintenance: 'ANUAL',
          isActive: false,
          assignee: {
            connect: { id: assignee.id },
          },
          valt: { connect: { id: valt.id } },
        },
      });

      await prisma.paymentsGenerated.create({
        data: {
          assigneeId: assignee.id,
          chargeId: pixData.txId,
          status: 'AGUARDANDO_PAGAMENTO',
          type: 'PIX',
          expireDate: new Date(valtMaintenanceDto.expireDate),
          paymentLink: pixData.pixLink,
          pdfLink: pixData.qrCode,
          ValtOwners: {
            connect: { id: owner.id },
          },
        },
      });

      return pixData;
    }

    if (type === $Enums.MaintenanceChoice.MENSAL) {
      const pixData = await this.pixService.create_charge({
        calendario: {
          expiracao: 3600,
        },
        chave: env.PIX_KEY,
        devedor: {
          cpf: assignee.cpf.replace(/\D/g, ''),
          nome: assignee.name,
        },
        valor: {
          original: `${assignee.maintenanceValue.toString()}.00`,
        },
        solicitacaoPagador: 'Manutenção de Jazigo Mensal',
      });

      await prisma.valtMaintenance.create({
        data: {
          choiceMaintenance: 'MENSAL',
          isActive: false,
          assignee: {
            connect: { id: assignee.id },
          },
          valt: { connect: { id: valt.id } },
        },
      });

      await prisma.paymentsGenerated.create({
        data: {
          assigneeId: assignee.id,
          chargeId: pixData.txId,
          status: 'AGUARDANDO_PAGAMENTO',
          type: 'PIX',
          expireDate: new Date(valtMaintenanceDto.expireDate),
          paymentLink: pixData.pixLink,
          pdfLink: pixData.qrCode,
          ValtOwners: {
            connect: { id: owner.id },
          },
        },
      });

      return pixData;
    }

    if (type === $Enums.MaintenanceChoice.SEMESTRAL) {
      const pixData = await this.pixService.create_charge({
        calendario: {
          expiracao: 3600,
        },
        chave: env.PIX_KEY,
        devedor: {
          cpf: assignee.cpf.replace(/\D/g, ''),
          nome: assignee.name,
        },
        valor: {
          original: `${assignee.maintenanceValue.toString()}.00`,
        },
        solicitacaoPagador: 'Manutenção de Jazigo Semestral',
      });

      await prisma.valtMaintenance.create({
        data: {
          choiceMaintenance: 'SEMESTRAL',
          isActive: false,
          assignee: {
            connect: { id: assignee.id },
          },
          valt: { connect: { id: valt.id } },
        },
      });

      await prisma.paymentsGenerated.create({
        data: {
          assigneeId: assignee.id,
          chargeId: pixData.txId,
          status: 'AGUARDANDO_PAGAMENTO',
          type: 'PIX',
          expireDate: new Date(valtMaintenanceDto.expireDate),
          paymentLink: pixData.pixLink,
          pdfLink: pixData.qrCode,
          ValtOwners: {
            connect: { id: owner.id },
          },
        },
      });
      return pixData;
    }

    throw new GenericThrow('Tipo de manutenção não encontrado');
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
