import { Controller, Get, Post, Body } from '@nestjs/common';
import { PixService } from './pix.service';
import { CreatePixDto } from './dto/create-pix.dto';

@Controller('pix')
export class PixController {
  constructor(private readonly pixService: PixService) {}

  @Post('charge')
  create_charge(@Body() createPixDto: CreatePixDto) {
    return this.pixService.create_charge(createPixDto);
  }

  @Get('hook')
  create_webhook() {
    return this.pixService.create_webhook();
  }
}
