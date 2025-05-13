import { Injectable } from '@nestjs/common';
import { SendMailHandlerDto } from './dto/create-mailhandler.dto';
import { UpdateMailhandlerDto } from './dto/update-mailhandler.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailhandlerService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPixMail(sendMailHandlerDto: SendMailHandlerDto) {
    try {
      console.log('MAIL DATA', sendMailHandlerDto);
      const response = await this.mailerService.sendMail({
        to: sendMailHandlerDto.email,
        subject: sendMailHandlerDto.subject,
        context: {
          pixCode: sendMailHandlerDto.text,
          imageUrl: sendMailHandlerDto.image,

          // Mensagem personalizada
        },
        template: 'confirmation', // Arquivo HTML/Pug/Handlebars (opcional)
      });
      return response;
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  findAll() {
    return `This action returns all mailhandler`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mailhandler`;
  }

  update(id: number, updateMailhandlerDto: UpdateMailhandlerDto) {
    return `This action updates a #${id} mailhandler`;
  }

  remove(id: number) {
    return `This action removes a #${id} mailhandler`;
  }
}
