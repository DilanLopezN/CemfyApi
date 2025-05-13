import { Injectable } from '@nestjs/common';
import path from 'path';
import { env } from 'src/core/env';
import { GenericThrow } from 'src/core/errors/GenericThrow';
import { ResourceNotFoundError } from 'src/core/errors/ResourceNotFoundError';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { verifyDefaulters } from 'src/core/utils/verify-defaulter';

type PaymentsDTO = {
  id: number;
  type: string;
  custom_id: string;
  status: {
    current: string;
    previous: string | null;
  };
  identifiers: {
    charge_id?: number;
    subscription_id?: number;
    carnet_id?: number;
  };
  created_at: string;
};

@Injectable()
export class HooksService {
  constructor(private prismaService: PrismaService) {}

  resolve_status_carnet(status: string) {
    switch (status) {
      case (status = 'up_to_date'):
        return 'EM_DIA';
      case (status = 'unpaid'):
        return 'ATRASADO';
      case (status = 'finished'):
        return 'PAGO_TOTAL';
      case (status = 'canceled'):
        return 'CANCELADO';
      case (status = 'new'):
        return 'NOVO_CARNE';
    }
  }

  resolve_status_charge(status: string) {
    switch (status) {
      case (status = 'paid'):
        return 'PAGO';
      case (status = 'waiting'):
        return 'AGUARDANDO';
      case (status = 'contested'):
        return 'CONTESTADO';
      case (status = 'unpaid'):
        return 'ATRASADO';
      case (status = 'approved'):
        return 'APROVADO_OPERADORA';
      case (status = 'canceled'):
        return 'CANCELADO';
    }
  }

  async change_valt_status(txId: string, status: string) {
    const ownerExists = await this.prismaService.valtOwners.findUnique({
      where: { chargeId: txId },
    });

    if (!ownerExists)
      throw new ResourceNotFoundError('Proprietário não encontrado');

    switch (status) {
      case (status = 'paid'):
        await this.prismaService.valtOwners.update({
          where: {
            chargeId: txId,
          },
          data: {
            status: 'PAGAMENTOS_EM_DIA',
          },
        });

        break;
      case (status = 'waiting'):
        await this.prismaService.valtOwners.update({
          where: {
            chargeId: txId,
          },
          data: {
            status: 'AGUARDANDO_PAGAMENTO',
          },
        });

        break;
      case (status = 'up_to_date'):
        await this.prismaService.valtOwners.update({
          where: {
            chargeId: txId,
          },
          data: {
            status: 'PAGAMENTOS_EM_DIA',
          },
        });

        break;
      case (status = 'unpaid'):
        await this.prismaService.valtOwners.update({
          where: {
            chargeId: txId,
          },
          data: {
            status: 'PAGAMENTO_ATRASADO',
          },
        });

        break;
      case (status = 'finished'):
        await this.prismaService.valtOwners.update({
          where: {
            chargeId: txId,
          },
          data: {
            status: 'PAGO_TOTAL',
          },
        });

        break;
      case (status = 'canceled'):
        await this.prismaService.valtOwners.update({
          where: {
            chargeId: txId,
          },
          data: {
            status: 'CANCELADO',
          },
        });

        break;
    }
  }

  async change_payments_status(data: Array<PaymentsDTO>, custom_id: string) {
    try {
      if (!data) throw new GenericThrow('Nenhum dado recebido da EFI');

      const owner = await this.prismaService.valtOwners.findUnique({
        where: {
          chargeId: custom_id,
        },
        include: { assignee: true, valt: true },
      });

      if (!owner) throw new GenericThrow('Proprietário não encontrado!');

      const convertTrasanctionType = (type: string) => {
        switch (true) {
          case type == 'carnet' || type == 'carnet_charge':
            return 'CARNET';
          case type == 'subscription' || type == 'subscription_charge':
            return 'SUBSCRIPTION';
          case type == 'charge' || type == 'charge':
            return 'CHARGE';
        }
      };

      const isDefaulter = await verifyDefaulters(
        { data },
        convertTrasanctionType(data[0].type),
        owner.amountValue,
        owner.amountInstallments,
      );

      if (isDefaulter.isDefaulter) {
        await this.prismaService.delinquencyRecords.create({
          data: {
            status: 'ATIVO',
            assignee: {
              connect: { id: owner.assignee.id },
            },
            outstanding_amount: isDefaulter.defaulterCharges.reduce(
              (sum, charge) => sum + charge.value,
              0,
            ),
          },
        });

        throw new GenericThrow('Cessionário em atraso, bloqueado para vendas');
      }

      if (
        data[0].type === 'subscription' ||
        data[0].type === 'subscription_charge'
      ) {
        for await (const subscription of data) {
          if (subscription.identifiers.subscription_id) {
            try {
              await this.prismaService.paymentsGenerated.update({
                where: {
                  chargeId: subscription.identifiers.subscription_id.toString(),
                },
                data: {
                  status: this.resolve_status_carnet(
                    subscription.status.current,
                  ),
                },
              });

              await this.prismaService.subscriptionCharges.create({
                data: {
                  chargeId: subscription.identifiers.subscription_id,
                  status: subscription.status.current,
                  assignee: {
                    connect: { id: owner.assignee.id },
                  },
                  createdAt: new Date(subscription.created_at),
                  value: owner.amountValue / owner.amountInstallments,
                },
              });
            } catch (error) {
              console.error(
                `Erro ao atualizar a inscrição ${subscription.identifiers.subscription_id}:`,
                error,
              );
            }
          } else {
            console.log(
              'Inscrição sem subscriptionId, pulando...',
              subscription.id,
            );
          }
        }
      }

      if (data[0].type === 'carnet' || data[0].type === 'carnet_charge') {
        for await (const carnet of data) {
          if (carnet.identifiers.carnet_id) {
            try {
              await this.prismaService.paymentsGenerated.update({
                where: {
                  chargeId: carnet.identifiers?.carnet_id?.toString(),
                },
                data: {
                  status: this.resolve_status_carnet(carnet.status.current),
                },
              });

              console.log('CHARGE ATT', carnet.identifiers.carnet_id);
            } catch (error) {
              console.error(
                `Erro ao atualizar o carnê com chargeId ${carnet.identifiers.carnet_id}:`,
                error,
              );
            }
          } else {
            console.log('Carnê sem chargeId, pulando...', carnet.id);
          }
        }
      }

      if (data[0].type === 'charge' || data[1].type === 'charge') {
        for await (const charge of data) {
          if (charge.identifiers.charge_id) {
            try {
              await this.prismaService.paymentsGenerated.update({
                where: {
                  chargeId: charge.identifiers.charge_id.toString(),
                },
                data: {
                  status: this.resolve_status_charge(charge.status.current),
                },
              });

              console.log('CHARGE ATT CHARGE', charge.identifiers.charge_id);
            } catch (error) {
              console.error(
                `Erro ao atualizar o charge com chargeId ${
                  charge.identifiers.charge_id ?? charge.id
                }:`,
                error,
              );
            }
          } else {
            console.log('Charge sem chargeId, pulando...', charge.id);
          }
        }
      }
    } catch (error) {
      console.log(error);
      throw new GenericThrow('Erro ao atualizar status dos pagamentos');
    }
  }
}
