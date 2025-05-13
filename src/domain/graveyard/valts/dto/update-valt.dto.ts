import { PartialType } from '@nestjs/mapped-types';
import { CreateValtDto } from './create-valt.dto';

export class UpdateValtDto extends PartialType(CreateValtDto) {}
