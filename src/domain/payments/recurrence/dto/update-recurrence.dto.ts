import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanDto } from './create-recurrence.dto';

export class UpdateRecurrenceDto extends PartialType(CreatePlanDto) {}
