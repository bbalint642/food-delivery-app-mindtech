import * as Joi from 'joi';

export interface Env {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  /** Comma-separated list of allowed origins. */
  CORS_ORIGINS: string;
}

/**
 * Validates environment variables at startup so the app fails fast
 * with a descriptive error instead of misbehaving at runtime.
 */
export const envValidationSchema = Joi.object<Env, true>({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3001),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .default('1h'),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
});
