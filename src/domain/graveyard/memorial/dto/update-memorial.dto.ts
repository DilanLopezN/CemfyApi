import { PartialType } from '@nestjs/mapped-types';
import { CreateMemorialDto } from './create-memorial.dto';

export class UpdateMemorialDto extends PartialType(CreateMemorialDto) {}
