import { Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { HooksService } from './hooks.service';
import { Request, Response } from 'express';
import EfiPay from 'sdk-node-apis-efi';
import PaymentServices from '../payment';

type NotificationDTO = {
  id: number;
  type: string;
  custom_id: string | null;
  status: {
    current: string;
    previous: string | null;
  };
  identifiers: {
    charge_id?: number;
    subscription_id?: number;
    carnet_id?: number;
  };
  created_at: string;
};
const paymentService = new PaymentServices();
@Controller('hooks')
export class HooksController {
  constructor(private readonly hooksService: HooksService) {}

  @Get('')
  async testRoute(@Res() res: Response) {
    return res.status(200).send({
      message: 'ON',
    });
  }

  @Post('/pix/:pix?')
  async createHook(@Req() req: Request, @Res() res: Response) {
    try {
      const data = req.body;

      const notification = await paymentService.paymentService.getNotification({
        token: data.id,
      });

      console.log('VIM DA EFI', notification);

      // const { status } = await this.hooksService.change_valt_status(
      //   data?.pix[0]?.txid,
      // );

      // console.log('STATUS ATUALIZADO', status);
      // await this.hooksService.change_valt_status()

      return res.status(201).send();
    } catch (error) {
      console.log(error);
    }
  }

  @Post('/charge')
  async getChargeChanges(@Req() req: Request, @Res() res: Response) {
    try {
      console.log(req.body);

      const notification = await paymentService.paymentService.getNotification({
        token: req.body.notification,
      });

      const notificationsInfos: NotificationDTO[] = notification.data;

      const lastNotification =
        notificationsInfos[notificationsInfos.length - 1];

      console.log(notificationsInfos);

      await this.hooksService.change_payments_status(
        notificationsInfos,
        notification.data[0].custom_id,
      );

      await this.hooksService.change_valt_status(
        lastNotification.custom_id,
        lastNotification.status.current,
      );

      return res.status(HttpStatus.OK).send();
    } catch (error) {
      console.log(error);
    }
  }

  @Get('/:pix?')
  findAllGet(@Req() req: Request, @Res() res: Response) {
    try {
      return res.json({
        message: 'aa',
      });
    } catch (error) {
      console.log(error);
    }
  }
}
