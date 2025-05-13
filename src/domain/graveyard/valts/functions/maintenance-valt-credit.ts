import { $Enums, Prisma, PrismaClient } from '@prisma/client';
import { ValtMaintenanceDto } from '../dto/create-valt.dto';
import { GenericThrow } from 'src/core/errors/GenericThrow';
import { randomUUID } from 'crypto';
import { CreditService } from 'src/domain/payments/credit/credit.service';
const prisma = new PrismaClient();
const creditService = new CreditService();

type OwnerProps = {
  status: $Enums.PaymentStatus;
  id: number;
  assigneeId: number;
  valtsId: number;
  chargeId: string;
  paymentHistoryId: number;
};

export async function MaintenanceValtCredit(
  owner: OwnerProps,
  assignee: Prisma.AssigneeMaxAggregateOutputType,
  valt: Prisma.ValtsMaxAggregateOutputType,
  valtMaintenanceDto: ValtMaintenanceDto,
  type: $Enums.MaintenanceChoice,
) {
  try {
    if (type === $Enums.MaintenanceChoice.ANUAL) {
      const charge_id_credit = `C${assignee.id}V${valt.id}-${randomUUID()}`;
      const installment = await this.creditService
        .create({
          customId: charge_id_credit,
          installmentQuantity: 1,
          items: [
            {
              name: 'Manutenção jazigo',
              value: assignee.maintenanceValue,
              amount: 1,
            },
          ],
          payment: {
            credit_card: {
              customer: {
                cpf: assignee.cpf.replace(/[\.\-\s]/g, ''),
                email: assignee.email,
                name: assignee.name,
                phone_number: assignee.phone.replace(/[^\d]/g, ''),
              },
              installments: 1,
              payment_token: valtMaintenanceDto.creditToken,
            },
          },
          installment: false,
        })
        .catch((err) => {
          console.log(err);
        });

      await prisma.valtMaintenance.create({
        data: {
          chargeId: charge_id_credit,
          choiceMaintenance: 'ANUAL',
          isActive: false,
          assignee: {
            connect: { id: assignee.id },
          },
          valt: { connect: { id: valt.id } },
        },
      });

      if (!installment) throw new GenericThrow('Falha ao gerar cobrança');

      await prisma.paymentsGenerated.create({
        data: {
          assigneeId: assignee.id,
          chargeId: installment.data.charge_id.toString(),
          status: 'AGUARDANDO_PAGAMENTO',
          type: 'CREDITO',
          expireDate: new Date(valtMaintenanceDto.expireDate),
          paymentLink: installment.data.link,
          pdfLink: installment.data.pdf.charge,
          ValtOwners: {
            connect: { id: owner.id },
          },
        },
      });
      return installment;
    }

    if (type === $Enums.MaintenanceChoice.MENSAL) {
      const charge_id_credit = `C${assignee.id}V${valt.id}-${randomUUID()}`;
      const installment = await this.creditService
        .create({
          customId: charge_id_credit,
          installmentQuantity: 12,
          items: [
            {
              name: 'Manutenção jazigo',
              value: assignee.maintenanceValue,
              amount: 1,
            },
          ],
          payment: {
            credit_card: {
              customer: {
                cpf: assignee.cpf.replace(/[\.\-\s]/g, ''),
                email: assignee.email,
                name: assignee.name,
                phone_number: assignee.phone.replace(/[^\d]/g, ''),
              },
              installments: 12,
              payment_token: valtMaintenanceDto.creditToken,
            },
          },
          installment: false,
        })
        .catch((err) => {
          console.log(err);
        });

      await prisma.valtMaintenance.create({
        data: {
          chargeId: charge_id_credit,
          choiceMaintenance: 'MENSAL',
          isActive: false,
          assignee: {
            connect: { id: assignee.id },
          },
          valt: { connect: { id: valt.id } },
        },
      });

      if (!installment) throw new GenericThrow('Falha ao gerar cobrança');

      await prisma.paymentsGenerated.create({
        data: {
          assigneeId: assignee.id,
          chargeId: installment.data.charge_id.toString(),
          status: 'AGUARDANDO_PAGAMENTO',
          type: 'CREDITO',
          expireDate: new Date(valtMaintenanceDto.expireDate),
          paymentLink: installment.data.link,
          pdfLink: installment.data.pdf.charge,
          ValtOwners: {
            connect: { id: owner.id },
          },
        },
      });
      return installment;
    }

    if (type === $Enums.MaintenanceChoice.SEMESTRAL) {
      const charge_id_credit = `C${assignee.id}V${valt.id}-${randomUUID()}`;
      const installment = await this.creditService
        .create({
          customId: charge_id_credit,
          installmentQuantity: 2,
          items: [
            {
              name: 'Manutenção jazigo',
              value: assignee.maintenanceValue,
              amount: 1,
            },
          ],
          payment: {
            credit_card: {
              customer: {
                cpf: assignee.cpf.replace(/[\.\-\s]/g, ''),
                email: assignee.email,
                name: assignee.name,
                phone_number: assignee.phone.replace(/[^\d]/g, ''),
              },
              installments: 2,
              payment_token: valtMaintenanceDto.creditToken,
            },
          },
          installment: false,
        })
        .catch((err) => {
          console.log(err);
        });

      await prisma.valtMaintenance.create({
        data: {
          chargeId: charge_id_credit,
          choiceMaintenance: 'SEMESTRAL',
          isActive: false,
          assignee: {
            connect: { id: assignee.id },
          },
          valt: { connect: { id: valt.id } },
        },
      });

      if (!installment) throw new GenericThrow('Falha ao gerar cobrança');

      await prisma.paymentsGenerated.create({
        data: {
          assigneeId: assignee.id,
          chargeId: installment.data.charge_id.toString(),
          status: 'AGUARDANDO_PAGAMENTO',
          type: 'CREDITO',
          expireDate: new Date(valtMaintenanceDto.expireDate),
          paymentLink: installment.data.link,
          pdfLink: installment.data.pdf.charge,
          ValtOwners: {
            connect: { id: owner.id },
          },
        },
      });
      return installment;
    }

    throw new GenericThrow('Tipo de manutenção não encontrado');
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
