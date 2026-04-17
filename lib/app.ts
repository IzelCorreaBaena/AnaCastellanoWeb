import path from 'path';
import { fileURLToPath } from 'url';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

import authRoutes from './routes/auth.routes';
import servicesRoutes from './routes/services.routes';
import blocksRoutes from './routes/blocks.routes';
import reservationsRoutes from './routes/reservations.routes';
import calendarRoutes from './routes/calendar.routes';
import uploadsRoutes from './routes/uploads.routes';
import contactoRoutes from './routes/contacto.routes';
import presupuestosRoutes from './routes/presupuestos.routes';
import notificationsRoutes from './routes/notifications.routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'no-referrer' },
  }),
);

const allowedOrigins = env.ALLOWED_ORIGINS_LIST;
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, error: 'Demasiados intentos de inicio de sesión. Inténtalo de nuevo en 15 minutos.', code: 'TOO_MANY_LOGIN_ATTEMPTS' },
});

const reservationsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Demasiadas reservas enviadas desde esta IP. Inténtalo más tarde.', code: 'TOO_MANY_RESERVATIONS' },
});

app.use('/api/auth/login', loginLimiter);
app.post('/api/reservations', reservationsLimiter);
app.use('/api', globalLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve uploaded images — only works in non-serverless environments.
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/blocks', blocksRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/presupuestos', presupuestosRoutes);
app.use('/api/notifications', notificationsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
