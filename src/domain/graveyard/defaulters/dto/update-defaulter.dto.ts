import { PartialType } from '@nestjs/mapped-types';
import { CreateDefaulterDto } from './create-defaulter.dto';

export class UpdateDefaulterDto extends PartialType(CreateDefaulterDto) {}
