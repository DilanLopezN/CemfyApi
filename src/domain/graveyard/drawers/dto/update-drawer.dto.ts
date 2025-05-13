import { PartialType } from '@nestjs/mapped-types';
import { CreateDrawerDto } from './create-drawer.dto';

export class UpdateDrawerDto extends PartialType(CreateDrawerDto) {}
