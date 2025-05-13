import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/exception.filter';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerHandler } from './core/logger';
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const allowedOrigins = [
  'http://localhost:3001/',
  'https://localhost:3001/',
  'http://localhost:3001',
  'https://localhost:3001',
  'https://cemiterio.ossbrasil.com',
  'http://cemiterio.ossbrasil.com',
  'http://34.29.234.168/',
  'http://34.29.234.168',
  'https://cemiterio.ossbrasil.com/',
  'http://cemiterio.ossbrasil.com/',
  'http://34.151.209.158',
  'http://34.151.209.158/',
  'https://34.151.209.158',
  'https://34.151.209.158/',
  '34.193.116.226',
  'http://34.193.116.226/',
  'https://34.193.116.226/',
  'http://34.193.116.226',
  'https://34.193.116.226',
  'http://52.67.22.130',
  'http://52.67.22.130/',
  'https://52.67.22.130',
  'https://52.67.22.130/',
  'http://52.67.133.213',
  'http://52.67.133.213/',
  'https://52.67.133.213',
  'https://52.67.133.213/',
  'http://52.67.128.220',
  'http://52.67.128.220/',
  'https://52.67.128.220',
  'https://52.67.128.220/',
  'http://52.67.210.55',
  'http://52.67.210.55/',
  'https://52.67.210.55',
  'https://52.67.210.55/',
  'http://52.67.87.232',
  'http://52.67.87.232/',
  'https://52.67.87.232',
  'https://52.67.87.232/',
  'http://52.67.201.12',
  'http://52.67.201.12/',
  'https://52.67.201.12',
  'https://52.67.201.12/',
  'http://52.67.90.164',
  'http://52.67.90.164/',
  'https://52.67.90.164',
  'https://52.67.90.164/',
  'http://52.67.189.75',
  'http://52.67.189.75/',
  'https://52.67.189.75',
  'https://52.67.189.75/',
  'http://52.67.35.112',
  'http://52.67.35.112/',
  'https://52.67.35.112',
  'https://52.67.35.112/',
  'http://52.67.188.36',
  'http://52.67.188.36/',
  'https://52.67.188.36',
  'https://52.67.188.36/',
  'http://52.67.196.17',
  'http://52.67.196.17/',
  'https://52.67.196.17',
  'https://52.67.196.17/',
  'http://52.67.183.243',
  'http://52.67.183.243/',
  'https://52.67.183.243',
  'https://52.67.183.243/',
  'http://52.67.169.217',
  'http://52.67.169.217/',
  'https://52.67.169.217',
  'https://52.67.169.217/',
  'http://52.67.182.245',
  'http://52.67.182.245/',
  'https://52.67.182.245',
  'https://52.67.182.245/',
  'http://52.67.79.91',
  'http://52.67.79.91/',
  'https://52.67.79.91',
  'https://52.67.79.91/',
  'http://34.199.187.141',
  'http://34.199.187.141/',
  'https://34.199.187.141',
  'https://34.199.187.141/',
  'http://34.199.194.54',
  'http://34.199.194.54/',
  'https://34.199.194.54',
  'https://34.199.194.54/',
  'http://34.192.27.251',
  'http://34.192.27.251/',
  'https://34.192.27.251',
  'https://34.192.27.251/',
  'http://34.199.165.182',
  'http://34.199.165.182/',
  'https://34.199.165.182',
  'https://34.199.165.182/',
  'http://34.192.243.178',
  'http://34.192.243.178/',
  'https://34.192.243.178',
  'https://34.192.243.178/',
  'http://34.199.226.208',
  'http://34.199.226.208/',
  'https://34.199.226.208',
  'https://34.199.226.208/',
  'http://34.193.116.226',
  'http://34.193.116.226/',
  'https://34.193.116.226',
  'https://34.193.116.226/',
  'http://34.199.226.102',
  'http://34.199.226.102/',
  'https://34.199.226.102',
  'https://34.199.226.102/',
  'http://34.199.188.192',
  'http://34.199.188.192/',
  'https://34.199.188.192',
  'https://34.199.188.192/',
  'http://34.199.214.108',
  'http://34.199.214.108/',
  'https://34.199.214.108',
  'https://34.199.214.108/',
  'http://34.199.222.108',
  'http://34.199.222.108/',
  'https://34.199.222.108',
  'https://34.199.222.108/',
  'http://34.199.188.181',
  'http://34.199.188.181/',
  'https://34.199.188.181',
  'https://34.199.188.181/',
  'http://34.199.219.73',
  'http://34.199.219.73/',
  'https://34.199.219.73',
  'https://34.199.219.73/',
  'http://34.196.63.100',
  'http://34.196.63.100/',
  'https://34.196.63.100',
  'https://34.196.63.100/',
];

export let app: INestApplication<any>;

export const corsOptions = {
  origin: allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: false,
  allowedHeaders: '*',
};

const createApp = async () => {
  app = await NestFactory.create(AppModule, {
    logger: new LoggerHandler(), // Ensure LoggerHandler is an instance implementing LoggerService
  });

  const config = new DocumentBuilder()
    .setTitle('Cemfy API')
    .setDescription('Back-end do cemfy')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  app.enableCors(corsOptions);

  app.use(cookieParser());

  app.useGlobalFilters(new HttpExceptionFilter());

  return app;
};
async function bootstrap() {
  const existingSystem = await prisma.system.findFirst({
    where: {
      environment: 'DEV',
    },
  });

  if (existingSystem) {
    await prisma.system.update({
      where: {
        id: existingSystem.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });
  } else {
    await prisma.system.create({
      data: {
        environment: 'DEV',
      },
    });
  }

  const app = await createApp();
  await app.listen(8080, '0.0.0.0');
}

bootstrap().then(async () => {
  await prisma.$disconnect();
  console.log('SERVIDOR INICIADO');
});
