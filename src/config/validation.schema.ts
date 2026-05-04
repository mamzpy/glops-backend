import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  PORT: Joi.number().default(3000),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),

  DATABASE_URL: Joi.string().required(),
  SHADOW_DATABASE_URL: Joi.string().required(),

  SESSION_INACTIVITY_TIMEOUT: Joi.number().integer().positive().default(120),
  SCAN_TIMEOUT: Joi.number().integer().positive().default(30),
  PAYMENT_WAIT_TIMEOUT: Joi.number().integer().positive().default(120),
  SUSPEND_RECOVERY_TIMEOUT: Joi.number().integer().positive().default(60),

  XIBO_API_URL: Joi.string().uri().allow('').optional(),
  XIBO_CLIENT_ID: Joi.string().allow('').optional(),
  XIBO_CLIENT_SECRET: Joi.string().allow('').optional(),
});
