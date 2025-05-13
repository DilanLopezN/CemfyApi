import {
  Controller,
  Post,
  Body,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreditService } from './credit.service';
import { CreateCreditDto } from './dto/create-credit.dto';

@Controller('credit')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Post()
  async create(@Body() createCreditDto: CreateCreditDto) {
    try {
      return await this.creditService.create(createCreditDto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
