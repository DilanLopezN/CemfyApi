import { PartialType } from '@nestjs/mapped-types';
import { SendMailHandlerDto } from './create-mailhandler.dto';

export class UpdateMailhandlerDto extends PartialType(SendMailHandlerDto) {}
