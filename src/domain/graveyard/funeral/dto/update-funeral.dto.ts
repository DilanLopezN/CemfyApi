import { PartialType } from '@nestjs/mapped-types';
import { CreateFuneralDto } from './create-funeral.dto';

export class UpdateFuneralDto extends PartialType(CreateFuneralDto) {}
