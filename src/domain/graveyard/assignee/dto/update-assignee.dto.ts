import { PartialType } from '@nestjs/mapped-types';
import { CreateAssigneDto} from './create-assignee.dto';

export class UpdateAssigneeDto extends PartialType(CreateAssigneDto) {}