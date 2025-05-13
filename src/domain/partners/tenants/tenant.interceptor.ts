import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantService } from './tenant.service';
import { PrismaService } from 'src/core/prisma/prisma.service';

// Interceptor para validar se o usuário é um parceiro cadastrado
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(
    private tenantService: TenantService, // Serviço para gerenciar inquilinos
    private prismaService: PrismaService, // Serviço para interações com o banco de dados
  ) {}

  // Método que intercepta a requisição
  async intercept(
    context: ExecutionContext, // Contexto da execução da requisição
    next: CallHandler, // Manipulador para continuar o fluxo
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest(); // Obtém a requisição HTTP
    const user = request.user; // Obtém o usuário da requisição

    // Busca o parceiro associado ao usuário
    const partnerUser = await this.prismaService.partnerUser.findFirst({
      where: { userId: user.id },
      include: { Partner: true }, // Inclui informações do parceiro
    });

    // Lança erro se o usuário não for um parceiro cadastrado
    if (!partnerUser) {
      throw new Error('Usuário não é um parceiro cadastrado!');
    }

    // Define o inquilino com base nas informações do parceiro
    this.tenantService.setTenant(partnerUser.Partner);

    // Continua o fluxo da requisição
    return next.handle();
  }
}
