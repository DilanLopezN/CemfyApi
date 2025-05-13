import 'dotenv/config';
import z from 'zod';

const nodeEnv = process.env.NODE_ENV;
// schema de validações para as variavéis de ambiente em desenvolvimento
const systemEnvSchema = z
  .object({
    NODE_ENV: z.enum(['dev', 'test', 'production']),
    DATABASE_URL: z.string(),
    PIX_KEY: z.string().default('6af1a126-7751-471f-892f-a1b78e73ce52'),
    PORT: z.coerce.number().default(3000),
    JWT_SECRET: z.string(),
    MAIL_SEND: z.string(),
    SMS_TOKEN: z.string().default('3f7ffd14ca9d557167bcde45d18a5b9f'),
    SMS_ACC_ID: z.string().default('ACbda8a6dbcdb3e2c0b00e2b0406fc6581'),
    PAYMENT_ROUTE_PIX: z.string(),
    D4SIGN_TOKEN: z.string(),
    D4SIGN_CRYPT: z.string(),
    EFIPAY_CLIENT_ID: z.string(),
    EFIPAY_CLIENT_SECRET: z.string(),
    CHARGES_HOOK_URL: z.string(),
    FRONT_DOMAIN: z.string(),
  })
  .transform((env) => ({
    ...env,
    DATABASE_URL:
      nodeEnv === 'dev'
        ? process.env.DATABASE_URL_DEV
        : process.env.DATABASE_URL_PROD,
    PAYMENT_ROUTE_PIX:
      nodeEnv === 'dev'
        ? process.env.PAYMENT_ROUTE_PIX_DEV
        : process.env.PAYMENT_ROUTE_PIX_PROD,
    D4SIGN_CRYPT:
      nodeEnv === 'dev'
        ? process.env.D4SIGN_CRYPT_DEV
        : process.env.D4SIGN_CRYPT_PROD,
    D4SIGN_TOKEN:
      nodeEnv === 'dev'
        ? process.env.D4SIGN_TOKEN_DEV
        : process.env.D4SIGN_TOKEN_PROD,
    EFIPAY_CLIENT_ID:
      nodeEnv === 'dev'
        ? process.env.EFIPAY_CLIENT_ID_DEV
        : process.env.EFIPAY_CLIENT_ID_PROD,
    EFIPAY_CLIENT_SECRET:
      nodeEnv === 'dev'
        ? process.env.EFIPAY_CLIENT_SECRET_DEV
        : process.env.EFIPAY_CLIENT_SECRET_PROD,
    CHARGES_HOOK_URL:
      nodeEnv === 'dev'
        ? process.env.CHARGES_HOOK_URL_DEV
        : process.env.CHARGES_HOOK_URL_PROD,
    FRONT_DOMAIN:
      nodeEnv === 'dev'
        ? process.env.FRONT_DOMAIN_DEV
        : process.env.FRONT_DOMAIN_PROD,
  }));

const envSchema = systemEnvSchema;

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error('Invalid enviroment variable', _env.error.format());
  throw new Error('Invalid enviroment variable');
}

export const env = _env.data;
