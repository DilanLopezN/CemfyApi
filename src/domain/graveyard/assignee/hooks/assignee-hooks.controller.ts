import { Controller, Post, Req, Res, HttpStatus, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { AssigneeHooksService } from './assignee-hooks.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

@Controller('hooks/assignee')
export class AssigneeHooksController {
  constructor(private readonly assigneeHooksService: AssigneeHooksService) {}

  @Post('/d4sign')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async handleD4SignWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const data = req.body;
      console.log('Body:', data);
      console.log('Headers:', req.headers);

      // Processar o evento recebido
      const documentUuid = data.uuid;
      const message = data.message;

      if (message === 'Signed') {
        console.log(`Documento ${documentUuid} foi assinado.`);
        await this.assigneeHooksService.updateDocumentStatus(
          documentUuid,
          'ASSINADO',
        );
      } else if (message === 'Rejected') {
        console.log(`Documento ${documentUuid} foi rejeitado.`);
        await this.assigneeHooksService.updateDocumentStatus(
          documentUuid,
          'REJEITADO',
        );
      }

      return res.status(HttpStatus.OK).send({ status: 'success' });
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: 'Erro ao processar webhook' });
    }
  }
}