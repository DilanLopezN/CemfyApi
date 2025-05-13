import { Injectable } from '@nestjs/common';
import {
  CreatePlanDto,
  CreateSubscriptonDtO,
  TypePlans,
} from './dto/create-recurrence.dto';
import PaymentServices from '../payment';
import { makeManagementService } from 'src/core/factories/make.financial.service';
import { env } from 'src/core/env';
import { GenericThrow } from 'src/core/errors/GenericThrow';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { PlanType } from '@prisma/client';

@Injectable()
export class RecurrenceService {
  private efiService = new PaymentServices();
  private prismaService = new PrismaService();

  getTypePlan(type: string, repeats: number) {
    switch (true) {
      case type == 'MENSAL':
        return {
          interval: 1,
          repeats: null,
        };
      case type == 'TRIMESTRAL':
        return {
          interval: 3,
          repeats: repeats,
        };
      case type == 'SEMESTRAL':
        return {
          interval: 6,
          repeats: repeats,
        };
      default:
        throw new Error('Invalid plan type');
    }
  }

  async createPlan(createRecurrenceDto: CreatePlanDto) {
    try {
      const planData = this.getTypePlan(
        createRecurrenceDto.type,
        createRecurrenceDto.repeats,
      );
      const plan = await this.efiService.paymentService
        .createPlan(
          {},
          {
            name: createRecurrenceDto.name,
            interval: planData.interval,
            repeats: planData.repeats,
          },
        )
        .catch((err) => {
          throw err;
        });

      const planInDb = await this.prismaService.recurrencePlan.create({
        data: {
          plan_id: plan.data.plan_id,
          type: createRecurrenceDto.type as PlanType,
          plan_name: plan.data.name,
          isActive: true,
        },
      });

      return planInDb;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllPlans() {
    const plans = await this.prismaService.recurrencePlan.findMany({});
    return plans;
  }

  async createSubscripton(createSubscriptonDto: CreateSubscriptonDtO) {
    if (
      createSubscriptonDto.type == 'CREDIT' &&
      !(
        'credit_card' in createSubscriptonDto.payment &&
        createSubscriptonDto.payment.credit_card.payment_token
      )
    ) {
      throw new GenericThrow('Token de pagamento não enviado!');
    }

    const managementService = await makeManagementService();
    const activeFinancialManagement =
      await managementService.getActiveFinancialManagement();
    if (activeFinancialManagement != null) {
      if (
        !activeFinancialManagement.allowed_payment_methods.includes(
          'RECORRENCIA',
        )
      ) {
        throw new Error(
          'METODO DE PAGAMENTO NÃO PERMITIDO NA CONFIGURAÇÃO ATUAL',
        );
      }
    }

    const planId = activeFinancialManagement.activePlanId;
    console.log('PLANID', planId);
    if (!planId)
      throw new GenericThrow('NÃO EXISTE PLANO ATIVO PARA RECORRÊNCIA!');
    try {
      const subscription = await this.efiService.paymentService
        .createOneStepSubscription(
          { id: planId },
          {
            metadata: {
              notification_url: `${env.CHARGES_HOOK_URL}/charge`,
              custom_id: createSubscriptonDto.custom_id,
            },
            items: createSubscriptonDto.items,
            payment:
              createSubscriptonDto.type == 'BOLIX'
                ? {
                    banking_billet: {
                      discount: activeFinancialManagement.activePlanDiscount
                        ? {
                            type: 'percentage',
                            value:
                              Number(
                                activeFinancialManagement.activePlanDiscount,
                              ) * 100,
                          }
                        : undefined,
                      configurations: {
                        fine:
                          Number(activeFinancialManagement.penalty_rate) * 10,
                        interest: {
                          type: 'monthly',
                          value:
                            Number(activeFinancialManagement.interest_rate) *
                            10,
                        },
                      },
                      message: 'Pague pelo código de barras ou pelo QR Code',
                      expire_at:
                        'banking_billet' in createSubscriptonDto.payment
                          ? createSubscriptonDto.payment.banking_billet
                              .expire_at
                          : undefined,
                      customer:
                        'banking_billet' in createSubscriptonDto.payment
                          ? createSubscriptonDto.payment.banking_billet.customer
                          : undefined,
                    },
                  }
                : {
                    credit_card: {
                      customer:
                        'credit_card' in createSubscriptonDto.payment
                          ? createSubscriptonDto.payment.credit_card.customer
                          : undefined,
                      billing_address:
                        'credit_card' in createSubscriptonDto.payment
                          ? createSubscriptonDto.payment.credit_card.address
                          : undefined,
                      payment_token:
                        'credit_card' in createSubscriptonDto.payment
                          ? createSubscriptonDto.payment.credit_card
                              .payment_token
                          : undefined,
                      discount: activeFinancialManagement.activePlanDiscount
                        ? {
                            type: 'percentage',
                            value:
                              Number(
                                activeFinancialManagement.activePlanDiscount,
                              ) * 100,
                          }
                        : undefined,
                      message:
                        'Desconto recorrente referente compra efetuada no Cemfy',
                    },
                  },
          },
        )
        .catch((err) => {
          throw err;
        });
      return subscription;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
