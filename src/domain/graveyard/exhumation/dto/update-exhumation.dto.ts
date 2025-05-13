import { PartialType } from '@nestjs/mapped-types';
import { CreateExhumationDto } from './create-exhumation.dto';

export class UpdateExhumationDto extends PartialType(CreateExhumationDto) {}
