import { PartialType } from '@nestjs/mapped-types';
import { CreateGraveyardDto } from './create-graveyard.dto';

export class UpdateGraveyardDto extends PartialType(CreateGraveyardDto) {}
