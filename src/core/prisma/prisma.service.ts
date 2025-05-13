import { Global, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
@Global() // Making it globally available
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Get the correct DATABASE_URL based on the environment
    const dbUrl =
      process.env.NODE_ENV === 'dev'
        ? process.env.DATABASE_URL_DEV
        : process.env.DATABASE_URL_PROD;

    // Set the DATABASE_URL environment variable
    if (dbUrl) {
      process.env.DATABASE_URL = dbUrl;
      console.log(
        `Using DATABASE_URL for environment: ${process.env.NODE_ENV}`,
      );
    } else {
      console.warn(
        `No DATABASE_URL found for environment: ${process.env.NODE_ENV}`,
      );
    }

    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    console.log('Connecting to database with URL:', process.env.DATABASE_URL);
    try {
      await this.$connect();
      console.log('Database connection established successfully');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }
}
