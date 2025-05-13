import { $Enums, Prisma, PrismaClient } from '@prisma/client';
import { ValtMaintenanceDto } from '../dto/create-valt.dto';
import { GenericThrow } from 'src/core/errors/GenericThrow';

import { randomUUID } from 'crypto';
import { BilletService } from 'src/domain/payments/billet/billet.service';
const prisma = new PrismaClient();
const billetService = new BilletService();

type OwnerProps = {
  status: $Enums.PaymentStatus;
  id: number;
  assigneeId: number;
  valtsId: number;
  chargeId: string;
  paymentHistoryId: number;
};

export async function MaintenanceValtBillet(
  owner: OwnerProps,
  assignee: Prisma.AssigneeMaxAggregateOutputType,
  valt: Prisma.ValtsMaxAggregateOutputType,
  valtMaintenanceDto: ValtMaintenanceDto,
  type: $Enums.MaintenanceChoice,
) {
  try {
    if (type === $Enums.MaintenanceChoice.ANUAL) {
      const charge_id_billet = `C${assignee.id}V${valt.id}-${randomUUID()}`;
      const billets = await billetService.create({
        customId: charge_id_billet,
        installmentQuantity: 1,
        installment: false,
        items: [
          {
            amount: 1,
            name: 'Manutenção jazigo',
            value: assignee.maintenanceValue,
          },
        ],
        payment: {
          banking_billet: {
            expire_at: new Date(valtMaintenanceDto.expireDate)
              .toISOString()
              .split('T')[0],
            customer: {
              birth: new Date(assignee.birthdate).toISOString().split('T')[0],
              cpf: assignee.cpf.replace(/[\.\-\s]/g, ''),
              email: assignee.email,
              name: assignee.name,
              phone_number: assignee.phone.replace(/[^\d]/g, ''),
            },
          },
        },
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

      const billetArray = Array.isArray(billets) ? billets : [billets];

      for (const billet of billetArray) {
        await prisma.paymentsGenerated.create({
          data: {
            assigneeId: assignee.id,
            chargeId: billet.chargeId.toString(),
            status: 'AGUARDANDO_PAGAMENTO',
            type: 'BOLETO',
            expireDate: new Date(valtMaintenanceDto.expireDate),
            paymentLink: billet.paymentLink,
            pdfLink: billet.pdfLink,
            ValtOwners: {
              connect: { id: owner.id },
            },
          },
        });
      }

      return billets;
    }

    if (type === $Enums.MaintenanceChoice.MENSAL) {
      const charge_id_billet = `C${assignee.id}V${valt.id}-${randomUUID()}`;
      const billets = await billetService.create({
        customId: charge_id_billet,
        installmentQuantity: 12,
        installment: true,
        items: [
          {
            amount: 1,
            name: 'Manutenção jazigo',
            value: assignee.maintenanceValue,
          },
        ],
        payment: {
          banking_billet: {
            expire_at: new Date(valtMaintenanceDto.expireDate)
              .toISOString()
              .split('T')[0],
            customer: {
              birth: new Date(assignee.birthdate).toISOString().split('T')[0],
              cpf: assignee.cpf.replace(/[\.\-\s]/g, ''),
              email: assignee.email,
              name: assignee.name,
              phone_number: assignee.phone.replace(/[^\d]/g, ''),
            },
          },
        },
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

      const billetArray = Array.isArray(billets) ? billets : [billets];

      for (const billet of billetArray) {
        await prisma.paymentsGenerated.create({
          data: {
            assigneeId: assignee.id,
            chargeId: billet.chargeId.toString(),
            status: 'AGUARDANDO_PAGAMENTO',
            type: 'BOLETO',
            expireDate: new Date(valtMaintenanceDto.expireDate),
            paymentLink: billet.paymentLink,
            pdfLink: billet.pdfLink,
            ValtOwners: {
              connect: { id: owner.id },
            },
          },
        });
      }

      return billets;
    }

    if (type === $Enums.MaintenanceChoice.SEMESTRAL) {
      const charge_id_billet = `C${assignee.id}V${valt.id}-${randomUUID()}`;
      const billets = await billetService.create({
        customId: charge_id_billet,
        installmentQuantity: 2,
        installment: true,
        items: [
          {
            amount: 1,
            name: 'Manutenção jazigo',
            value: assignee.maintenanceValue,
          },
        ],
        payment: {
          banking_billet: {
            expire_at: new Date(valtMaintenanceDto.expireDate)
              .toISOString()
              .split('T')[0],
            customer: {
              birth: new Date(assignee.birthdate).toISOString().split('T')[0],
              cpf: assignee.cpf.replace(/[\.\-\s]/g, ''),
              email: assignee.email,
              name: assignee.name,
              phone_number: assignee.phone.replace(/[^\d]/g, ''),
            },
          },
        },
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

      const billetArray = Array.isArray(billets) ? billets : [billets];

      for (const billet of billetArray) {
        await prisma.paymentsGenerated.create({
          data: {
            assigneeId: assignee.id,
            chargeId: billet.chargeId.toString(),
            status: 'AGUARDANDO_PAGAMENTO',
            type: 'BOLETO',
            expireDate: new Date(valtMaintenanceDto.expireDate),
            paymentLink: billet.paymentLink,
            pdfLink: billet.pdfLink,
            ValtOwners: {
              connect: { id: owner.id },
            },
          },
        });
      }

      return billets;
    }

    throw new GenericThrow('Tipo de manutenção não encontrado');
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
