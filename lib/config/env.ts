import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for cryptographic safety'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  // Comma-separated list of allowed origins. Wildcard ("*") is rejected in production.
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  ALLOWED_ORIGINS: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  // Google Calendar integration — all three must be set to enable it
  GOOGLE_CLIENT_EMAIL: z.string().email().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_CALENDAR_ID: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // IMPORTANT: do not log the raw env object — only the field-level error keys.
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;

// Resolve allowed origins (ALLOWED_ORIGINS takes precedence over CORS_ORIGIN).
const rawOrigins = (data.ALLOWED_ORIGINS ?? data.CORS_ORIGIN)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

if (data.NODE_ENV === 'production' && rawOrigins.includes('*')) {
  console.error('Refusing to start: CORS wildcard ("*") is not allowed in production.');
  process.exit(1);
}

export const env = {
  ...data,
  ALLOWED_ORIGINS_LIST: rawOrigins,
};
