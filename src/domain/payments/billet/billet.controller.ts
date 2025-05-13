import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
} from '@nestjs/common';
import { BilletService } from './billet.service';
import { CreateBilletDto } from './dto/create-billet.dto';
import { UpdateBilletDto } from './dto/update-billet.dto';

@Controller('billet')
export class BilletController {
  constructor(private readonly billetService: BilletService) {}

  @Post()
  async create(@Body() createBilletDto: CreateBilletDto) {
    try {
      return await this.billetService.create(createBilletDto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
