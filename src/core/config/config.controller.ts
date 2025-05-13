import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ConfigService } from './config.service';

// DTO para alteração de ambiente
class ChangeEnvironmentDto {
  environment: string;
}

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('environment')
  getAmbienteAtual() {
    return this.configService.getAmbienteAtual();
  }

  /**
   * Verifica status do servidor e ambiente atual
   */
  @Get('status')
  getStatus() {
    const ambiente = this.configService.getAmbienteAtual();
    const memoryUsage = process.memoryUsage();

    return {
      status: 'online',
      uptime: process.uptime(),
      ambiente: ambiente,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      },
      data: new Date().toISOString(),
    };
  }
}
