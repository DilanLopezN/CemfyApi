import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/prisma/prisma.module';
import { AuthModule } from './core/auth/auth.module';
import { UsersModule } from './domain/admin/users/users.module';
import { GraveyardsModule } from './domain/admin/graveyards/graveyards.module';
import { TenantModule } from './domain/partners/tenants/tenant.module';
import { SquaresModule } from './domain/graveyard/squares/squares.module';
import { DrawersModule } from './domain/graveyard/drawers/drawers.module';
import { ValtsModule } from './domain/graveyard/valts/valts.module';
import { AssigneeModule } from './domain/graveyard/assignee/assignee.module'; // Adicione esta linha
import { StorageModule } from './core/storage/cloudflare-r2.module';
import { DeceasedsModule } from './domain/graveyard/deceaseds/deceaseds.module';
import { FuneralModule } from './domain/graveyard/funeral/funeral.module';
import { MemorialModule } from './domain/graveyard/memorial/memorial.module';
import { PixModule } from './domain/payments/pix/pix.module';
import { HttpModule } from '@nestjs/axios';
import { HooksModule } from './domain/payments/hooks/hooks.module';
import { SectorsModule } from './domain/graveyard/sectors/sectors.module';

import { FleshModule } from './domain/payments/flesh/flesh.module';
import { BilletModule } from './domain/payments/billet/billet.module';
import { CreditModule } from './domain/payments/credit/credit.module';
import { ServicesModule } from './domain/graveyard/services/services.module';
import { ExhumationModule } from './domain/graveyard/exhumation/exhumation.module';
import { PromotionsModule } from './domain/graveyard/promotions/promotions.module';
import { ManagementModule } from './domain/management/management.module';
import { RecurrenceModule } from './domain/payments/recurrence/recurrence.module';
import { MailhandlerModule } from './core/mail/mailhandler.module';
import { DefaultersModule } from './domain/graveyard/defaulters/defaulters.module';
import { RabbitModule } from './core/rabbitmq/rabbit.module';
import { ConfigModule } from './core/config/config.module';
@Module({
  imports: [
    RabbitModule, // MODULO MENSAGERIA
    ConfigModule, // MODULO CONFIGURAÇÕES DO SISTEMA
    StorageModule, // CLOUDFLARE R2 BUCKET PARA SALVAR IMAGENS
    PrismaModule, // PRISMA -> MODULO GLOBAL FUNCIONA NA APLICAÇÃO TODA
    AuthModule, // AUTENTICAÇÃO
    ManagementModule, // GERENCIAMENTO DO SISTEMA
    HooksModule, // WEBHOOKS
    UsersModule, // USUÁRIOS
    TenantModule, // PARCEIROS
    GraveyardsModule, // CEMITÉRIOS
    ExhumationModule, // EXUMAÇÃO
    ServicesModule, // SERVIÇOS DO CEMITÉRIO
    SquaresModule, // QUADRAS
    ValtsModule, // JAZIGOS
    DrawersModule, // GAVETAS
    AssigneeModule, // CONCESSIONÁRIO
    DeceasedsModule, // FALECIDOS
    FuneralModule, // VELORIOS
    MemorialModule, // MEMORIAL
    SectorsModule, // SETORES GENERICO!
    HooksModule, // WEBHOOKS
    HttpModule, // HTTP MODULE DO NESTJS // MODULO DE EMAIL
    PixModule, // MODULO DE PAGAMENTOS PIX
    RecurrenceModule, // RECORRENCIA
    FleshModule, // MODULO DE PAGAMENTOS CARNE
    BilletModule, // MODULO PAGAMENTOS BOLETO
    CreditModule, // MODULO DE PAGAMENTOS CRÉDITO.
    PromotionsModule, // MODULO DE PROMOÇÕES,
    DefaultersModule, // INADIMPLENTES
    MailhandlerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
