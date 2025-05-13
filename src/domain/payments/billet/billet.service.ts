import { Injectable } from '@nestjs/common';
import { CreateBilletDto } from './dto/create-billet.dto';
import PaymentServices from '../payment';
import { GenericThrow } from 'src/core/errors/GenericThrow';
import { env } from 'src/core/env';
import { makeManagementService } from 'src/core/factories/make.financial.service';

@Injectable()
export class BilletService {
  private efiService = new PaymentServices();
  private managamentService = makeManagementService();

  /**
   *
   * @param createBilletDto
   * @returns caso seja parcelado, retorna um array de objetos contendo os boletos referente o parcelamento,
   * @returns apenas um boleto, retorna apenas 1 objeto
   * caso installment seja TRUE, necessário enviar installmentQuantity com a quantidade de boletos
   * devido ser realizado operação por operação o número máximo de boletos 36 tem uma demora no retorno de aproximadamente 45 segundos de latência local, em produção aproximadamente 1 minuto e 30
   * @author Dilan Lopez
   */

  async create(createBilletDto: CreateBilletDto) {
    const managementService = await makeManagementService();
    const activeFinancialManagement =
      await managementService.getActiveFinancialManagement();

    if (activeFinancialManagement != null) {
      if (
        !activeFinancialManagement.allowed_payment_methods.includes('BOLETO')
      ) {
        throw new Error(
          'METODO DE PAGAMENTO NÃO PERMITIDO NA CONFIGURAÇÃO ATUAL',
        );
      }
    }

    this.efiService.setUseCertificate(false);
    try {
      const { installment, installmentQuantity, payment, items } =
        createBilletDto;

      const itemsWithInstallment = items.map((item) => {
        return {
          name: item.name,
          value: Math.floor(Number(item.value) / Number(installmentQuantity)),
          amount: item.amount,
        };
      });

      if (installment) {
        if (
          installmentQuantity > activeFinancialManagement.max_installments ||
          installmentQuantity < activeFinancialManagement.min_installments
        )
          throw new GenericThrow(
            'Numero de parcelas fora da regra configurada',
          );

        if (installmentQuantity > 36)
          throw new GenericThrow('Limite de apenas 36 parcelas');

        const firstDate = new Date(payment.banking_billet.expire_at);

        if (
          installmentQuantity <= 0 ||
          typeof installmentQuantity !== 'number'
        ) {
          throw new GenericThrow('Necessário informar quantidade de parcelas');
        }
        const billets = await Promise.all(
          Array.from({ length: installmentQuantity }, (_, index) => {
            const expire_at = new Date(firstDate);
            expire_at.setMonth(expire_at.getMonth() + index);

            // Handle edge cases where adding months causes the day to overflow
            if (expire_at.getDate() !== firstDate.getDate()) {
              expire_at.setDate(0); // Set to the last day of the previous month
            }

            return this.efiService.paymentService
              .createOneStepCharge(
                {},
                {
                  metadata: {
                    notification_url: `${env.CHARGES_HOOK_URL}/charge`,
                    custom_id: createBilletDto.customId,
                  },
                  items: itemsWithInstallment,
                  payment: {
                    banking_billet: {
                      customer: { ...payment.banking_billet.customer },
                      expire_at: new Date(expire_at)
                        .toISOString()
                        .split('T')[0],
                      discount: payment.banking_billet.discountValue
                        ? {
                            type: 'percentage',
                            value: payment.banking_billet.discountValue * 100,
                          }
                        : undefined,

                      configurations: {
                        days_to_write_off:
                          activeFinancialManagement.payment_deadline_days ??
                          undefined,
                        interest: activeFinancialManagement.interest_rate
                          ? {
                              type: 'monthly',
                              value:
                                Number(
                                  activeFinancialManagement.interest_rate,
                                ) * 10,
                            }
                          : undefined,
                      },
                    },
                  },
                },
              )
              .then((response) => {
                return {
                  pixQrCode: response.data.pix?.qrcode,
                  paymentLink: response.data.link,
                  billetLink: response.data.billet_link,
                  pdfLink: response.data.pdf.charge,
                  expireDate: response.data.expire_at,
                  chargeId: response.data.charge_id,
                  status: response.data.status,
                  value: response.data.total,
                };
              });
          }),
        );

        return billets;
      }

      // Caso não seja parcelado, gera um único boleto
      const response = await this.efiService.paymentService.createOneStepCharge(
        {},
        {
          metadata: {
            notification_url: `${env.CHARGES_HOOK_URL}/charge`,
            custom_id: createBilletDto.customId,
          },
          items,
          payment: {
            banking_billet: {
              customer: { ...payment.banking_billet.customer },
              expire_at: payment.banking_billet.expire_at,
              discount: payment.banking_billet.discountValue
                ? {
                    type: 'percentage',
                    value: payment.banking_billet.discountValue * 100,
                  }
                : undefined,

              configurations: {
                days_to_write_off:
                  activeFinancialManagement.payment_deadline_days ?? undefined,
                interest: {
                  type: 'monthly',
                  value: Number(activeFinancialManagement.interest_rate) * 10,
                },
              },
            },
          },
        },
      );

      return {
        pixQrCode: response.data.pix.qrcode,
        paymentLink: response.data.link,
        billetLink: response.data.billet_link,
        pdfLink: response.data.pdf.charge,
        expireDate: response.data.expire_at,
        chargeId: response.data.charge_id,
        status: response.data.status,
        value: response.data.total,
      };
    } catch (error) {
      console.log(error);
      if (error.code == 3500034) {
        throw new Error(JSON.stringify(error));
      }

      throw error;
    }
  }
}
