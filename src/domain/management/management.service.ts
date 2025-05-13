import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateFinancialManagementDto } from './dto/create-management.dto';
import { UpdateFinancialManagementDto } from './dto/update-management.dto';
import { GenericThrow } from 'src/core/errors/GenericThrow';
import { FinancialManagement } from '@prisma/client';

@Injectable()
export class ManagementService implements OnModuleInit {
  private static activeFinancialManagement: FinancialManagement | null = null;

  constructor(private prismaService: PrismaService) {}

  async onModuleInit() {
    await this.loadActiveFinancialManagement();
  }

  async getActiveFinancialManagement(): Promise<FinancialManagement | null> {
    return ManagementService.activeFinancialManagement;
  }

  private async loadActiveFinancialManagement() {
    const activeManagement =
      await this.prismaService.financialManagement.findFirst({
        where: { status: true },
      });

    if (!activeManagement) {
      ManagementService.activeFinancialManagement = null;
    }

    ManagementService.activeFinancialManagement = activeManagement;
  }

  async create_financial_control(
    createFinancialManagementDto: CreateFinancialManagementDto,
  ) {
    if (!createFinancialManagementDto.config_name) {
      throw new GenericThrow('Necessário nome para essa tabela de controle');
    }

    if (createFinancialManagementDto.status) {
      await this.deactivateAllFinancialManagements();
    }

    const financialManagementControl =
      await this.prismaService.financialManagement.create({
        data: {
          name: createFinancialManagementDto.config_name,
          status: createFinancialManagementDto.status,
          allowed_payment_methods:
            createFinancialManagementDto.allowed_payment_methods,
          description: createFinancialManagementDto.description,
          discount_rate: createFinancialManagementDto.discount_rate,
          interest_rate: createFinancialManagementDto.interest_rate,
          max_installments: createFinancialManagementDto.max_installments,
          min_installments: createFinancialManagementDto.min_installments,
          payment_deadline_days:
            createFinancialManagementDto.payment_deadline_days,
          penalty_rate: createFinancialManagementDto.penalty_rate,
          minRentValue: createFinancialManagementDto.minRentValue,
          requireApprovalMinRentValue:
            createFinancialManagementDto.requireApprovalMinRentValue,
          discountAutonomySellers:
            createFinancialManagementDto.discountAutonomySellers,
        },
      });

    if (financialManagementControl.status) {
      ManagementService.activeFinancialManagement = financialManagementControl;
    }

    return financialManagementControl;
  }

  async findAll() {
    return await this.prismaService.financialManagement.findMany();
  }

  async findOne(id: number) {
    const management = await this.prismaService.financialManagement.findUnique({
      where: { id },
    });

    if (!management) {
      throw new GenericThrow('Gerenciamento financeiro não encontrado');
    }

    return management;
  }

  async update(id: number, updateDto: UpdateFinancialManagementDto) {
    await this.findOne(id);

    if (updateDto.status) {
      await this.deactivateAllFinancialManagements();
    }

    const updatedManagement =
      await this.prismaService.financialManagement.update({
        where: { id },
        data: {
          name: updateDto.config_name,
          status: updateDto.status,
          allowed_payment_methods: updateDto.allowed_payment_methods,
          description: updateDto.description,
          discount_rate: updateDto.discount_rate,
          interest_rate: updateDto.interest_rate,
          max_installments: updateDto.max_installments,
          min_installments: updateDto.min_installments,
          payment_deadline_days: updateDto.payment_deadline_days,
          penalty_rate: updateDto.penalty_rate,
          minRentValue: updateDto.minRentValue,
          requireApprovalMinRentValue: updateDto.requireApprovalMinRentValue,
          discountAutonomySellers: updateDto.discountAutonomySellers,
        },
      });

    if (updatedManagement.status) {
      ManagementService.activeFinancialManagement = updatedManagement;
    }

    return updatedManagement;
  }

  async remove(id: number) {
    await this.findOne(id);

    const management = await this.prismaService.financialManagement.findUnique({
      where: { id },
    });

    if (management?.status) {
      throw new GenericThrow(
        'Não é possível remover o gerenciamento financeiro ativo',
      );
    }

    return await this.prismaService.financialManagement.delete({
      where: { id },
    });
  }

  private async deactivateAllFinancialManagements() {
    await this.prismaService.financialManagement.updateMany({
      where: { status: true },
      data: { status: false },
    });
  }
}
