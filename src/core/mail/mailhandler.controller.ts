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
import { MailhandlerService } from './mailhandler.service';
import { SendMailHandlerDto } from './dto/create-mailhandler.dto';
import { UpdateMailhandlerDto } from './dto/update-mailhandler.dto';

@Controller('mailhandler')
export class MailhandlerController {
  constructor(private readonly mailhandlerService: MailhandlerService) {}

  @Post('/send')
  async sendMail(@Body() sendMailHandlerDto: SendMailHandlerDto) {
    try {
      // return await this.mailhandlerService.sendGenericMail(sendMailHandlerDto);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  findAll() {
    return this.mailhandlerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mailhandlerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMailhandlerDto: UpdateMailhandlerDto,
  ) {
    return this.mailhandlerService.update(+id, updateMailhandlerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mailhandlerService.remove(+id);
  }
}
