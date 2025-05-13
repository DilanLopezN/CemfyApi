import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RecurrenceService } from './recurrence.service';
import {
  CreatePlanDto,
  CreateSubscriptonDtO,
} from './dto/create-recurrence.dto';
import { UpdateRecurrenceDto } from './dto/update-recurrence.dto';

@Controller('recurrence')
export class RecurrenceController {
  constructor(private readonly recurrenceService: RecurrenceService) {}

  @Post('/subscription')
  async create_subscription(@Body() createSubscruption: CreateSubscriptonDtO) {
    return await this.recurrenceService.createSubscripton(createSubscruption);
  }

  @Post('/plan')
  async create_plan(@Body() createSubscruption: CreatePlanDto) {
    try {
      return await this.recurrenceService.createPlan(createSubscruption);
    } catch (error) {
      console.log(error)
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
   
  }

  @Get('/plan')
  async get_plans() {
    return await this.recurrenceService.findAllPlans();
  }
}
