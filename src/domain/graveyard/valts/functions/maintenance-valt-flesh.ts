import { $Enums, Prisma, PrismaClient } from '@prisma/client';
import { ValtMaintenanceDto } from '../dto/create-valt.dto';
import { GenericThrow } from 'src/core/errors/GenericThrow';
import { PixService } from 'src/domain/payments/pix/pix.service';
import { env } from 'src/core/env';
import { randomUUID } from 'crypto';
import { FleshService } from 'src/domain/payments/flesh/flesh.service';
const prisma = new PrismaClient();
const fleshService = new FleshService();

type OwnerProps = {
  status: $Enums.PaymentStatus;
  id: number;
  assigneeId: number;
  valtsId: number;
  chargeId: string;
  paymentHistoryId: number;
};

export async function MaintenanceValtFlesh(
  owner: OwnerProps,
  assignee: Prisma.AssigneeMaxAggregateOutputType,
  valt: Prisma.ValtsMaxAggregateOutputType,
  valtMaintenanceDto: ValtMaintenanceDto,
  type: $Enums.MaintenanceChoice,
) {
  try {
    if (type === $Enums.MaintenanceChoice.ANUAL) {
      const charge_id_flesh = `C${assignee.id}V${valt.id}-${randomUUID()}`;
      const carnets = await fleshService
        .create_flesh({
          customId: charge_id_flesh,
          split_items: false,
          repeats: 1,
          items: [
            {
              name: 'Manutenção jazigo',
              value: assignee.maintenanceValue,
              amount: 1,
            },
          ],
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
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });

      await prisma.valtMaintenance.create({
        data: {
          chargeId: charge_id_flesh,
          choiceMaintenance: 'ANUAL',
          isActive: false,
          assignee: {
            connect: { id: assignee.id },
          },
          valt: { connect: { id: valt.id } },
        },
      });

      for (const carnet of carnets.charges) {
        await prisma.paymentsGenerated.create({
          data: {
            assigneeId: assignee.id,
            chargeId: carnet.id.toString(),
            status: 'AGUARDANDO_PAGAMENTO',
            type: 'CARNE',
            expireDate: new Date(carnet.expiresAt),
            paymentLink: carnet.parcelLink,
            pdfLink: carnet.pdf,
            ValtOwners: {
              connect: { id: owner.id },
            },
          },
        });
      }

      return carnets;
    }

    if (type === $Enums.MaintenanceChoice.MENSAL) {
      const charge_id_flesh = `C${assignee.id}V${valt.id}-${randomUUID()}`;
      const carnets = await fleshService
        .create_flesh({
          customId: charge_id_flesh,
          split_items: false,
          repeats: 12,
          items: [
            {
              name: 'Manutenção jazigo',
              value: assignee.maintenanceValue,
              amount: 1,
            },
          ],
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
        })
        .catch((err) => {
          console.log(err);
          throw err;
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

      for (const carnet of carnets.charges) {
        await prisma.paymentsGenerated.create({
          data: {
            assigneeId: assignee.id,
            chargeId: carnet.id.toString(),
            status: 'AGUARDANDO_PAGAMENTO',
            type: 'CARNE',
            expireDate: new Date(carnet.expiresAt),
            paymentLink: carnet.parcelLink,
            pdfLink: carnet.pdf,
            ValtOwners: {
              connect: { id: owner.id },
            },
          },
        });
      }

      return carnets;
    }

    if (type === $Enums.MaintenanceChoice.SEMESTRAL) {
      const charge_id_flesh = `C${assignee.id}V${valt.id}-${randomUUID()}`;
      const carnets = await fleshService
        .create_flesh({
          customId: charge_id_flesh,
          split_items: false,
          repeats: 2,
          items: [
            {
              name: 'Manutenção jazigo',
              value: assignee.maintenanceValue,
              amount: 1,
            },
          ],
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
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });

      await prisma.valtMaintenance.create({
        data: {
          chargeId: charge_id_flesh,
          choiceMaintenance: 'SEMESTRAL',
          isActive: false,
          assignee: {
            connect: { id: assignee.id },
          },
          valt: { connect: { id: valt.id } },
        },
      });

      for (const carnet of carnets.charges) {
        await prisma.paymentsGenerated.create({
          data: {
            assigneeId: assignee.id,
            chargeId: carnet.id.toString(),
            status: 'AGUARDANDO_PAGAMENTO',
            type: 'CARNE',
            expireDate: new Date(carnet.expiresAt),
            paymentLink: carnet.parcelLink,
            pdfLink: carnet.pdf,
            ValtOwners: {
              connect: { id: owner.id },
            },
          },
        });
      }

      return carnets;
    }

    throw new GenericThrow('Tipo de manutenção não encontrado');
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
