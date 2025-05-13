import { Global, Module } from '@nestjs/common';
import { MailhandlerService } from './mailhandler.service';
import { MailhandlerController } from './mailhandler.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Global()
@Module({
  imports: [
    MailerModule.forRoot({
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
          user: 'dilanlopez009@gmail.com',
          pass: 'torv pzkr iuoh msep',
        },
      },
      defaults: {
        from: 'dilanlopez009@gmail.com',
      },
    }),
  ],
  controllers: [MailhandlerController],
  providers: [MailhandlerService],
  exports: [MailhandlerService],
})
export class MailhandlerModule {}
