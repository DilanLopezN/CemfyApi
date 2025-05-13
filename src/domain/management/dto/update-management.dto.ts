import { PartialType } from '@nestjs/mapped-types';
import { CreateFinancialManagementDto } from './create-management.dto';

export class UpdateFinancialManagementDto extends PartialType(
  CreateFinancialManagementDto,
) {}
