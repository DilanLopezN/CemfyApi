import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { env } from '../env';
import { Environment, Prisma } from '@prisma/client';

@Injectable()
export class ConfigService {
  private static nodeEnv: Environment;
  constructor(private prisma: PrismaService) {}

  /**
   * Retorna o ambiente atual e suas configurações
   */
  getAmbienteAtual() {
    return {
      environment: env.NODE_ENV,
      configuracoes: {
        front_env: env.FRONT_DOMAIN,
        webhook_env: env.CHARGES_HOOK_URL,
        db_env: env.DATABASE_URL,
        d4sign_env: env.D4SIGN_TOKEN,
        pixroute_env: env.PAYMENT_ROUTE_PIX,
        efiClienteId_env: env.EFIPAY_CLIENT_ID,
        efiClienteSecret_env: env.EFIPAY_CLIENT_SECRET && '***', // Ocultado por segurança
      },
    };
  }

  /**
   * Retorna uma configuração específica do ambiente atual
   * @param chave - O nome da configuração desejada
   * @returns O valor da configuração ou null se não existir
   */
  getConfig(chave: string) {
    return env[chave] || null;
  }

  getNodeEnv() {
    return ConfigService.nodeEnv;
  }
}

const prismaService = new PrismaService();
export const configService = new ConfigService(prismaService);
