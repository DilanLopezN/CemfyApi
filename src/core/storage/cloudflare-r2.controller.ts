import {
  Controller,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from './cloudflare-r2.service';
import * as multer from 'multer';

import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './multer-config';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly r2Service: R2Service,
    private readonly prisma: PrismaService,
  ) {}

  @Patch('/valt/:id')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadValtImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    try {
      // Upload para o Cloudflare R2
      const fileUrl = await this.r2Service.uploadFile(file);

      // Salvar o URL no banco de dados
      const valt = await this.prisma.valts.update({
        where: { id: +id },
        data: {
          imageUrl: fileUrl,
        },
      });

      return {
        message: 'Upload realizado com sucesso!',
        data: valt,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao realizar o upload.');
    }
  }

  @Patch('/user/avatar/:id')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadUserAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    try {
      // Upload para o Cloudflare R2
      const fileUrl = await this.r2Service.uploadFile(file);

      // Salvar o URL no banco de dados
      const valt = await this.prisma.user.update({
        where: { id: +id },
        data: {
          avatar: fileUrl,
        },
      });

      return {
        message: 'Upload realizado com sucesso!',
        data: valt,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao realizar o upload.');
    }
  }

  @Patch('/deceased/homage/:id')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadDeceasedHomage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    try {
      // Upload para o Cloudflare R2
      const fileUrl = await this.r2Service.uploadFile(file);

      // Salvar o URL no banco de dados
      const valt = await this.prisma.homage.update({
        where: { id: +id },
        data: {
          imageUrl: fileUrl,
        },
      });

      return {
        message: 'Upload realizado com sucesso!',
        data: valt,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Erro ao realizar o upload.');
    }
  }
}
