import { PartialType } from '@nestjs/mapped-types';
import { CreateFleshDto } from './create-flesh.dto';

export class UpdateFleshDto extends PartialType(CreateFleshDto) {}
