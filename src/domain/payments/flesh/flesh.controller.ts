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
import { FleshService } from './flesh.service';
import { CreateFleshDto } from './dto/create-flesh.dto';

@Controller('flesh')
export class FleshController {
  constructor(private readonly fleshService: FleshService) {}

  @Post('/create')
  async create_flesh(@Body() createFleshDto: CreateFleshDto) {
    try {
      console.log('BATEU AQUI');
      return await this.fleshService.create_flesh(createFleshDto);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.error_description);
    }
  }
}
