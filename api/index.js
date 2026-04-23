// api/_entry.ts
import "dotenv/config";

// lib/app.ts
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit2 from "express-rate-limit";

// lib/config/env.ts
import { z } from "zod";
var schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4e3),
  POSTGRES_PRISMA_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters for cryptographic safety"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  // Comma-separated list of allowed origins. Wildcard ("*") is rejected in production.
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
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
  // Cloudinary — required for image uploads in production
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional()
});
var parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}
var data = parsed.data;
var rawOrigins = (data.ALLOWED_ORIGINS ?? data.CORS_ORIGIN).split(",").map((o) => o.trim()).filter(Boolean);
if (data.NODE_ENV === "production" && rawOrigins.includes("*")) {
  console.error('Refusing to start: CORS wildcard ("*") is not allowed in production.');
  process.exit(1);
}
var env = {
  ...data,
  ALLOWED_ORIGINS_LIST: rawOrigins
};

// lib/middleware/errorHandler.ts
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import multer from "multer";
var AppError = class _AppError extends Error {
  statusCode;
  code;
  constructor(message, statusCode = 400, code) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, _AppError.prototype);
  }
};
function handlePrismaError(err) {
  switch (err.code) {
    case "P2025":
      return { status: 404, message: "Recurso no encontrado", code: "NOT_FOUND" };
    case "P2002": {
      const fields = err.meta?.target?.join(", ") ?? "campo";
      return {
        status: 409,
        message: `Ya existe un registro con ese valor en: ${fields}`,
        code: "CONFLICT"
      };
    }
    case "P2003":
      return {
        status: 400,
        message: "Referencia a un recurso que no existe",
        code: "INVALID_REFERENCE"
      };
    case "P2014":
      return {
        status: 400,
        message: "La operaci\xF3n viola una restricci\xF3n de relaci\xF3n",
        code: "RELATION_VIOLATION"
      };
    default:
      return { status: 500, message: "Error de base de datos", code: "DB_ERROR" };
  }
}
var errorHandler = (err, req, res, _next) => {
  if (res.headersSent) return _next(err);
  const isProd = env.NODE_ENV === "production";
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "El archivo supera el tama\xF1o m\xE1ximo permitido (5 MB)" : `Error al subir el archivo: ${err.message}`;
    return res.status(400).json({ success: false, error: message, code: "UPLOAD_ERROR" });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Error de validaci\xF3n",
      code: "VALIDATION_ERROR",
      issues: err.flatten().fieldErrors
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...err.code ? { code: err.code } : {}
    });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const { status, message, code } = handlePrismaError(err);
    if (!isProd) {
      console.error(`[prisma:${err.code}]`, err.meta, err.message);
    }
    return res.status(status).json({ success: false, error: message, code });
  }
  if (err instanceof Prisma.PrismaClientValidationError) {
    console.error("[prisma:validation]", err.message);
    return res.status(400).json({
      success: false,
      error: "Solicitud malformada",
      code: "BAD_REQUEST"
    });
  }
  const safeName = err instanceof Error ? err.name : "UnknownError";
  const safeMessage = err instanceof Error ? err.message : String(err);
  if (isProd) {
    console.error(`[error] ${req.method} ${req.path} :: ${safeName}`);
  } else {
    console.error(`[error] ${req.method} ${req.path} :: ${safeName}: ${safeMessage}`);
  }
  return res.status(500).json({
    success: false,
    error: "Error interno del servidor",
    code: "INTERNAL_ERROR",
    // Never expose error details (message or stack) in production.
    ...isProd ? {} : { detail: safeMessage }
  });
};

// lib/middleware/notFoundHandler.ts
var notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found`, code: "NOT_FOUND" });
};

// lib/routes/auth.routes.ts
import { Router } from "express";

// lib/controllers/auth.controller.ts
import { z as z2 } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// lib/db.ts
import { PrismaClient } from "@prisma/client";
var globalForPrisma = global;
var prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// lib/controllers/auth.controller.ts
var loginSchema = z2.object({
  email: z2.string().trim().toLowerCase().email().max(254),
  password: z2.string().min(6).max(128)
});
var authController = {
  login: async (req, res, next) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const admin = await prisma.admin.findUnique({ where: { email } });
      const dummyHash = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8./uQnQOQxvM9zFrR/pr6s0vJh8e8K";
      const valid = await bcrypt.compare(password, admin?.passwordHash ?? dummyHash);
      if (!admin || !valid) {
        throw new AppError("Credenciales inv\xE1lidas", 401, "INVALID_CREDENTIALS");
      }
      const token = jwt.sign({ sub: admin.id }, env.JWT_SECRET, {
        expiresIn: "7d"
      });
      res.json({
        token,
        admin: { id: admin.id, username: admin.username, email: admin.email }
      });
    } catch (err) {
      next(err);
    }
  },
  me: async (req, res, next) => {
    try {
      if (!req.admin) throw new AppError("Unauthorized", 401);
      const admin = await prisma.admin.findUnique({
        where: { id: req.admin.sub },
        select: { id: true, username: true, email: true, createdAt: true }
      });
      if (!admin) throw new AppError("Admin no encontrado", 404, "NOT_FOUND");
      res.json(admin);
    } catch (err) {
      next(err);
    }
  }
};

// lib/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var authenticate = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Token de autenticaci\xF3n requerido", 401, "MISSING_TOKEN"));
  }
  const token = header.slice(7);
  try {
    const payload = jwt2.verify(token, env.JWT_SECRET);
    req.admin = payload;
    return next();
  } catch (err) {
    if (err instanceof jwt2.TokenExpiredError) {
      return next(new AppError("Token expirado, inicia sesi\xF3n nuevamente", 401, "TOKEN_EXPIRED"));
    }
    return next(new AppError("Token inv\xE1lido", 401, "INVALID_TOKEN"));
  }
};
var softAuthenticate = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next();
  try {
    const payload = jwt2.verify(header.slice(7), env.JWT_SECRET);
    req.admin = payload;
  } catch {
  }
  return next();
};

// lib/routes/auth.routes.ts
var router = Router();
router.post("/login", authController.login);
router.get("/me", authenticate, authController.me);
var auth_routes_default = router;

// lib/routes/services.routes.ts
import { Router as Router2 } from "express";

// lib/controllers/services.controller.ts
import { z as z3 } from "zod";
var listQuerySchema = z3.object({
  all: z3.coerce.boolean().optional()
});
var servicioSchema = z3.object({
  titulo: z3.string().trim().min(1).max(150),
  descripcion: z3.string().trim().max(5e3).optional().default(""),
  imagen: z3.string().max(500).optional().nullable(),
  orden: z3.number().int().min(0).max(1e4).optional(),
  activo: z3.boolean().optional()
});
var idParamSchema = z3.object({ id: z3.string().uuid() });
var servicesController = {
  list: async (req, res, next) => {
    try {
      const { all } = listQuerySchema.parse(req.query);
      const isAdmin = Boolean(req.admin);
      const showAll = all === true && isAdmin;
      const servicios = await prisma.servicio.findMany({
        where: showAll ? void 0 : { activo: true },
        include: {
          bloques: {
            where: showAll ? void 0 : { activo: true },
            orderBy: { orden: "asc" }
          }
        },
        orderBy: { orden: "asc" }
      });
      res.json(servicios);
    } catch (e) {
      next(e);
    }
  },
  get: async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const servicio = await prisma.servicio.findUnique({
        where: { id },
        include: { bloques: { orderBy: { orden: "asc" } } }
      });
      if (!servicio) throw new AppError("Servicio no encontrado", 404);
      res.json(servicio);
    } catch (e) {
      next(e);
    }
  },
  create: async (req, res, next) => {
    try {
      const data2 = servicioSchema.parse(req.body);
      const servicio = await prisma.servicio.create({ data: data2, include: { bloques: true } });
      res.status(201).json(servicio);
    } catch (e) {
      next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data2 = servicioSchema.partial().parse(req.body);
      const servicio = await prisma.servicio.update({ where: { id }, data: data2 });
      res.json(servicio);
    } catch (e) {
      next(e);
    }
  },
  remove: async (req, res, next) => {
    try {
      const { id } = idParamSchema.parse(req.params);
      await prisma.servicio.delete({ where: { id } });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
};

// lib/routes/services.routes.ts
var router2 = Router2();
router2.get("/", servicesController.list);
router2.get("/:id", servicesController.get);
router2.post("/", authenticate, servicesController.create);
router2.put("/:id", authenticate, servicesController.update);
router2.delete("/:id", authenticate, servicesController.remove);
var services_routes_default = router2;

// lib/routes/blocks.routes.ts
import { Router as Router3 } from "express";

// lib/controllers/blocks.controller.ts
import { z as z4 } from "zod";
var idParamSchema2 = z4.object({ id: z4.string().uuid() });
var bloqueSchema = z4.object({
  titulo: z4.string().trim().min(1).max(150),
  descripcion: z4.string().trim().max(5e3).optional().default(""),
  // Accept any non-empty string: full URLs (Cloudinary, etc.) and relative paths
  // like /uploads/<filename> produced by the local upload endpoint.
  imagenes: z4.array(z4.string().min(1)).default([]),
  orden: z4.number().int().optional(),
  activo: z4.boolean().optional(),
  servicioId: z4.string().uuid()
});
var blocksController = {
  list: async (req, res, next) => {
    try {
      const servicioId = req.query.servicioId ? z4.string().uuid().parse(req.query.servicioId) : void 0;
      const bloques = await prisma.bloque.findMany({
        where: servicioId ? { servicioId } : void 0,
        orderBy: [{ servicioId: "asc" }, { orden: "asc" }]
      });
      res.json(bloques);
    } catch (e) {
      next(e);
    }
  },
  get: async (req, res, next) => {
    try {
      const { id } = idParamSchema2.parse(req.params);
      const bloque = await prisma.bloque.findUnique({ where: { id } });
      if (!bloque) throw new AppError("Bloque no encontrado", 404);
      res.json(bloque);
    } catch (e) {
      next(e);
    }
  },
  create: async (req, res, next) => {
    try {
      const data2 = bloqueSchema.parse(req.body);
      const bloque = await prisma.$transaction(async (tx) => {
        const orden = data2.orden !== void 0 ? data2.orden : await tx.bloque.count({ where: { servicioId: data2.servicioId } }) + 1;
        return tx.bloque.create({ data: { ...data2, orden } });
      });
      res.status(201).json(bloque);
    } catch (e) {
      next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = idParamSchema2.parse(req.params);
      const data2 = bloqueSchema.partial().parse(req.body);
      const bloque = await prisma.bloque.update({ where: { id }, data: data2 });
      res.json(bloque);
    } catch (e) {
      next(e);
    }
  },
  remove: async (req, res, next) => {
    try {
      const { id } = idParamSchema2.parse(req.params);
      await prisma.bloque.delete({ where: { id } });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
};

// lib/routes/blocks.routes.ts
var router3 = Router3();
router3.get("/", blocksController.list);
router3.get("/:id", blocksController.get);
router3.post("/", authenticate, blocksController.create);
router3.put("/:id", authenticate, blocksController.update);
router3.delete("/:id", authenticate, blocksController.remove);
var blocks_routes_default = router3;

// lib/routes/reservations.routes.ts
import { Router as Router4 } from "express";

// lib/controllers/reservations.controller.ts
import { z as z5 } from "zod";
import { EstadoReserva } from "@prisma/client";

// lib/services/email.service.ts
import nodemailer from "nodemailer";
function escHtml(s) {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
var COLOR = {
  ivory: "#FAF7F2",
  sage: "#7D9B76",
  charcoal: "#2C2C2C",
  gold: "#C9A96E",
  white: "#FFFFFF",
  lightGray: "#F0EDE8"
};
function emailWrapper(content) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${COLOR.ivory};font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLOR.ivory};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${COLOR.white};border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color:${COLOR.charcoal};padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${COLOR.gold};font-family:Georgia,serif;">Ana Castellano</p>
              <p style="margin:4px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${COLOR.sage};font-family:Georgia,serif;">Florista</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;color:${COLOR.charcoal};font-size:15px;line-height:1.7;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:${COLOR.lightGray};padding:24px 40px;border-top:1px solid #E8E4DE;">
              <p style="margin:0;font-size:12px;color:#888;text-align:center;letter-spacing:0.5px;">
                Ana Castellano Florista &nbsp;\xB7&nbsp; anacastellano.com<br>
                <a href="mailto:hola@anacastellano.com" style="color:${COLOR.sage};text-decoration:none;">hola@anacastellano.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
function formatFecha(fecha) {
  if (!fecha) return "por confirmar";
  return fecha.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
var transporter = null;
var transporterInitialised = false;
async function getTransporter() {
  if (transporter) return transporter;
  if (transporterInitialised) return null;
  transporterInitialised = true;
  if (!env.SMTP_HOST || !env.SMTP_PORT) {
    console.warn("[email] SMTP not configured \u2014 email skipped");
    return null;
  }
  const t = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : void 0
  });
  try {
    await t.verify();
    console.log("[email] SMTP connection verified OK");
  } catch (err) {
    console.error("[email] SMTP connection FAILED:", err.message);
  }
  transporter = t;
  return transporter;
}
var emailService = {
  async send(to, subject, html) {
    const t = await getTransporter();
    if (!t) {
      console.warn("[email] SMTP not configured \u2014 skipping email send");
      return;
    }
    await t.sendMail({ from: env.SMTP_FROM, to, subject, html });
  },
  /** Sent immediately after the client submits a reservation request. */
  async sendReservationConfirmation(reserva) {
    const subject = "Reserva recibida \u2014 Ana Castellano Florista";
    const fecha = formatFecha(reserva.fechaEvento);
    const servicio = reserva.servicioNombre ? `<p style="margin:16px 0 0;"><strong>Servicio solicitado:</strong> ${reserva.servicioNombre}</p>` : "";
    const html = emailWrapper(`
      <h2 style="margin:0 0 24px;font-size:22px;font-weight:normal;color:${COLOR.charcoal};letter-spacing:0.5px;">Hola, ${escHtml(reserva.nombre)}</h2>
      <p style="margin:0 0 16px;">Hemos recibido tu solicitud de reserva. Nos pondremos en contacto contigo a la mayor brevedad para confirmar los detalles.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background-color:${COLOR.ivory};border-left:3px solid ${COLOR.gold};padding:20px 24px;">
        <tr><td>
          <p style="margin:0;"><strong>Fecha del evento:</strong> ${escHtml(fecha)}</p>
          ${servicio}
        </td></tr>
      </table>
      <p style="margin:0 0 16px;">Gracias por confiar en Ana Castellano Florista.</p>
      <p style="margin:24px 0 0;color:${COLOR.sage};font-style:italic;">Con cari\xF1o,<br><strong style="font-style:normal;color:${COLOR.charcoal};">Ana Castellano</strong></p>
    `);
    await this.send(reserva.email, subject, html);
  },
  /** Sent when the admin accepts a reservation (estado → ACEPTADA). */
  async sendAcceptedEmail(reserva) {
    const subject = "\xA1Tu reserva ha sido confirmada! \u2014 Ana Castellano Florista";
    const fecha = formatFecha(reserva.fechaEvento);
    const servicio = reserva.servicioNombre ? `<p style="margin:8px 0 0;"><strong>Servicio:</strong> ${reserva.servicioNombre}</p>` : "";
    const html = emailWrapper(`
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:normal;color:${COLOR.charcoal};letter-spacing:0.5px;">\xA1Hola, ${escHtml(reserva.nombre)}!</h2>
      <p style="margin:0 0 24px;font-size:16px;color:${COLOR.sage};font-style:italic;">Tenemos una noticia estupenda para ti.</p>
      <p style="margin:0 0 16px;">Me complace confirmar que tu reserva ha sido <strong style="color:${COLOR.sage};">aceptada</strong>. Ser\xE1 un placer acompa\xF1arte en este momento tan especial.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background-color:${COLOR.ivory};border-left:3px solid ${COLOR.gold};">
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${COLOR.gold};">Detalles de tu evento</p>
            <p style="margin:12px 0 0;"><strong>Fecha:</strong> ${escHtml(fecha)}</p>
            ${servicio}
          </td>
        </tr>
      </table>
      <p style="margin:0 0 16px;">En los pr\xF3ximos d\xEDas me pondr\xE9 en contacto contigo para ultimar todos los detalles y asegurarnos de que todo sea exactamente como lo imaginas.</p>
      <p style="margin:0 0 8px;">Si mientras tanto tienes alguna pregunta o idea, no dudes en escribirme:</p>
      <p style="margin:0 0 24px;">
        <a href="mailto:hola@anacastellano.com" style="color:${COLOR.sage};text-decoration:none;font-weight:bold;">hola@anacastellano.com</a>
      </p>
      <p style="margin:24px 0 0;color:${COLOR.sage};font-style:italic;">Con mucha ilusi\xF3n,<br><strong style="font-style:normal;color:${COLOR.charcoal};">Ana Castellano</strong></p>
    `);
    await this.send(reserva.email, subject, html);
  },
  /** Sent to the admin when a new reservation is submitted by a client. */
  async sendAdminNewReservation(reserva) {
    const adminEmail = env.ADMIN_EMAIL || "hola@anacastellano.com";
    const subject = `Nueva reserva \u2014 ${escHtml(reserva.nombre)}`;
    const fecha = formatFecha(reserva.fechaEvento);
    const html = emailWrapper(`
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:normal;color:${COLOR.charcoal};">Nueva solicitud de reserva</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background-color:${COLOR.ivory};border-left:3px solid ${COLOR.gold};padding:20px 24px;">
        <tr><td>
          <p style="margin:0 0 8px;"><strong>Nombre:</strong> ${escHtml(reserva.nombre)}</p>
          <p style="margin:0 0 8px;"><strong>Email:</strong> ${escHtml(reserva.email)}</p>
          ${reserva.telefono ? `<p style="margin:0 0 8px;"><strong>Tel\xE9fono:</strong> ${escHtml(reserva.telefono)}</p>` : ""}
          <p style="margin:0 0 8px;"><strong>Fecha del evento:</strong> ${escHtml(fecha)}</p>
          ${reserva.servicioNombre ? `<p style="margin:0 0 8px;"><strong>Servicio:</strong> ${escHtml(reserva.servicioNombre)}</p>` : ""}
          ${reserva.mensaje ? `<p style="margin:0;"><strong>Mensaje:</strong> ${escHtml(reserva.mensaje)}</p>` : ""}
        </td></tr>
      </table>
      <p style="margin:0;font-size:13px;color:#888;">Accede al panel de administraci\xF3n para gestionar esta reserva.</p>
    `);
    await this.send(adminEmail, subject, html);
  },
  /** Sent to the admin when a new contact message is submitted. */
  async sendAdminNewMensaje(msg) {
    const adminEmail = env.ADMIN_EMAIL || "hola@anacastellano.com";
    const subject = `Nuevo mensaje de contacto \u2014 ${escHtml(msg.nombre)}`;
    const html = emailWrapper(`
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:normal;color:${COLOR.charcoal};">Nuevo mensaje de contacto</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background-color:${COLOR.ivory};border-left:3px solid ${COLOR.gold};padding:20px 24px;">
        <tr><td>
          <p style="margin:0 0 8px;"><strong>Nombre:</strong> ${escHtml(msg.nombre)}</p>
          <p style="margin:0 0 8px;"><strong>Email:</strong> ${escHtml(msg.email)}</p>
          ${msg.telefono ? `<p style="margin:0 0 8px;"><strong>Tel\xE9fono:</strong> ${escHtml(msg.telefono)}</p>` : ""}
          <p style="margin:0;"><strong>Mensaje:</strong> ${escHtml(msg.mensaje)}</p>
        </td></tr>
      </table>
      <p style="margin:0;font-size:13px;color:#888;">Accede al panel de administraci\xF3n para ver todos los mensajes.</p>
    `);
    await this.send(adminEmail, subject, html);
  },
  /** Sent when the admin rejects a reservation (estado → RECHAZADA). */
  async sendRejectedEmail(reserva, motivo) {
    const subject = "Sobre tu solicitud de reserva \u2014 Ana Castellano Florista";
    const fecha = formatFecha(reserva.fechaEvento);
    const motivoBlock = motivo ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background-color:${COLOR.ivory};border-left:3px solid ${COLOR.lightGray};">
           <tr><td style="padding:16px 24px;">
             <p style="margin:0;font-size:13px;color:#888;">${escHtml(motivo)}</p>
           </td></tr>
         </table>` : "";
    const html = emailWrapper(`
      <h2 style="margin:0 0 24px;font-size:22px;font-weight:normal;color:${COLOR.charcoal};letter-spacing:0.5px;">Hola, ${escHtml(reserva.nombre)}</h2>
      <p style="margin:0 0 16px;">Gracias por tu inter\xE9s y por considerar a Ana Castellano Florista para tu evento del <strong>${escHtml(fecha)}</strong>.</p>
      <p style="margin:0 0 16px;">Lamentablemente, en esta ocasi\xF3n no me es posible atenderte en esa fecha. Te pido disculpas por los inconvenientes que esto pueda ocasionarte.</p>
      ${motivoBlock}
      <p style="margin:0 0 16px;">Si deseas encontrar una fecha alternativa o necesitas ayuda con otra propuesta, estar\xE9 encantada de explorar opciones contigo. No dudes en contactarme directamente:</p>
      <p style="margin:0 0 4px;">
        <a href="mailto:hola@anacastellano.com" style="color:${COLOR.sage};text-decoration:none;font-weight:bold;">hola@anacastellano.com</a>
      </p>
      <p style="margin:0 0 24px;">Espero poder acompa\xF1arte en una pr\xF3xima ocasi\xF3n.</p>
      <p style="margin:24px 0 0;color:${COLOR.sage};font-style:italic;">Con todo mi cari\xF1o,<br><strong style="font-style:normal;color:${COLOR.charcoal};">Ana Castellano</strong></p>
    `);
    await this.send(reserva.email, subject, html);
  }
};

// lib/services/calendar.service.ts
async function getCalendarClient() {
  if (!env.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY || !env.GOOGLE_CALENDAR_ID) {
    console.warn("[calendar] Google Calendar credentials not configured \u2014 skipping calendar integration");
    return null;
  }
  let google;
  try {
    const mod = await import("googleapis");
    google = mod.google;
  } catch {
    console.warn("[calendar] googleapis package not found \u2014 skipping calendar integration");
    return null;
  }
  const auth = new google.auth.JWT({
    email: env.GOOGLE_CLIENT_EMAIL,
    // Private key arrives as a single string; restore newlines escaped by env parsers
    key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"]
  });
  return google.calendar({ version: "v3", auth });
}
var calendarService = {
  /**
   * Creates a Google Calendar event for an accepted reservation.
   * Returns the created event ID, or null if Google Calendar is not configured
   * or the call fails (non-blocking — the reservation is already saved).
   */
  async createEvent(reserva) {
    const calendar = await getCalendarClient();
    if (!calendar) return null;
    const calendarId = env.GOOGLE_CALENDAR_ID;
    const fecha = reserva.fechaEvento ?? /* @__PURE__ */ new Date();
    const startDate = fecha.toISOString().split("T")[0];
    const endDateObj = new Date(fecha);
    endDateObj.setUTCDate(endDateObj.getUTCDate() + 1);
    const endDate = endDateObj.toISOString().split("T")[0];
    const summary = reserva.servicioNombre ? `${reserva.servicioNombre} \u2014 ${reserva.nombre}` : `Evento floral \u2014 ${reserva.nombre}`;
    const description = [
      `Cliente: ${reserva.nombre}`,
      `Tel\xE9fono: ${reserva.telefono}`,
      `Email: ${reserva.email}`,
      reserva.mensaje ? `
Notas: ${reserva.mensaje}` : "",
      `
ID reserva: ${reserva.id}`
    ].filter(Boolean).join("\n");
    try {
      const response = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary,
          description,
          start: reserva.fechaEvento ? { dateTime: reserva.fechaEvento.toISOString(), timeZone: "Europe/Madrid" } : { date: startDate },
          end: reserva.fechaEvento ? {
            // Default duration: 2 hours when an exact time is provided
            dateTime: new Date(reserva.fechaEvento.getTime() + 2 * 60 * 60 * 1e3).toISOString(),
            timeZone: "Europe/Madrid"
          } : { date: endDate },
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email", minutes: 60 * 24 * 7 },
              // 1 week before
              { method: "popup", minutes: 60 * 24 }
              // 1 day before
            ]
          }
        }
      });
      const eventId = response.data.id ?? null;
      if (eventId) {
        console.log(`[calendar] event created: ${eventId}`);
      }
      return eventId;
    } catch (err) {
      console.error("[calendar] failed to create event", err);
      return null;
    }
  },
  async deleteEvent(eventId) {
    const calendar = await getCalendarClient();
    if (!calendar) return;
    const calendarId = env.GOOGLE_CALENDAR_ID;
    try {
      await calendar.events.delete({ calendarId, eventId });
      console.log(`[calendar] event deleted: ${eventId}`);
    } catch (err) {
      console.error("[calendar] failed to delete event", err);
    }
  }
};

// lib/controllers/reservations.controller.ts
var phoneRegex = /^[+]?[\d\s\-().]{6,25}$/;
var reservaSchema = z5.object({
  nombre: z5.string().trim().min(1).max(150),
  telefono: z5.string().trim().min(6).max(25).regex(phoneRegex, "Tel\xE9fono con formato inv\xE1lido"),
  email: z5.string().trim().toLowerCase().email().max(254),
  mensaje: z5.string().trim().min(1).max(2e3),
  fechaEvento: z5.string().datetime().refine((v) => new Date(v).getTime() > Date.now(), {
    message: "La fecha del evento debe estar en el futuro"
  }).optional(),
  servicioId: z5.string().uuid().optional()
});
var updateSchema = z5.object({
  estado: z5.nativeEnum(EstadoReserva).optional(),
  notas: z5.string().max(2e3).optional(),
  fechaEvento: z5.string().datetime().refine((v) => new Date(v).getTime() > Date.now(), {
    message: "La fecha del evento debe estar en el futuro"
  }).optional()
});
var idParamSchema3 = z5.object({ id: z5.string().uuid() });
var listQuerySchema2 = z5.object({
  estado: z5.nativeEnum(EstadoReserva).optional(),
  page: z5.coerce.number().int().min(1).default(1),
  limit: z5.coerce.number().int().min(1).max(100).default(50)
});
var reservationsController = {
  list: async (req, res, next) => {
    try {
      const { estado, page, limit } = listQuerySchema2.parse(req.query);
      const where = estado ? { estado } : void 0;
      const skip = (page - 1) * limit;
      const [reservas, total] = await Promise.all([
        prisma.reserva.findMany({
          where,
          include: { servicio: true },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit
        }),
        prisma.reserva.count({ where })
      ]);
      res.json({ data: reservas, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (e) {
      next(e);
    }
  },
  get: async (req, res, next) => {
    try {
      const { id } = idParamSchema3.parse(req.params);
      const reserva = await prisma.reserva.findUnique({
        where: { id },
        include: { servicio: true }
      });
      if (!reserva) throw new AppError("Reserva no encontrada", 404);
      res.json(reserva);
    } catch (e) {
      next(e);
    }
  },
  create: async (req, res, next) => {
    try {
      const data2 = reservaSchema.parse(req.body);
      let servicioNombre;
      if (data2.servicioId) {
        const servicio = await prisma.servicio.findUnique({ where: { id: data2.servicioId } });
        if (!servicio) throw new AppError("Servicio no encontrado", 404);
        servicioNombre = servicio.titulo;
      }
      const reserva = await prisma.reserva.create({
        data: {
          ...data2,
          fechaEvento: data2.fechaEvento ? new Date(data2.fechaEvento) : null,
          servicioNombre,
          estado: EstadoReserva.PENDIENTE
        }
      });
      emailService.sendReservationConfirmation(reserva).catch((err) => {
        console.error("[email] failed to send confirmation", err);
      });
      emailService.sendAdminNewReservation({ ...reserva, telefono: reserva.telefono, mensaje: reserva.mensaje }).catch((err) => {
        console.error("[email] failed to send admin notification", err);
      });
      res.status(201).json(reserva);
    } catch (e) {
      next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = idParamSchema3.parse(req.params);
      const data2 = updateSchema.parse(req.body);
      const current = await prisma.reserva.findUnique({ where: { id } });
      if (!current) throw new AppError("Reserva no encontrada", 404);
      const reserva = await prisma.reserva.update({
        where: { id },
        data: {
          ...data2,
          fechaEvento: data2.fechaEvento ? new Date(data2.fechaEvento) : void 0
        },
        include: { servicio: true }
      });
      const isTransitionTo = (estado) => data2.estado === estado && current.estado !== estado;
      if (isTransitionTo(EstadoReserva.ACEPTADA)) {
        emailService.sendAcceptedEmail(reserva).catch((err) => {
          console.error("[email] failed to send accepted notification", err);
        });
        if (!current.googleEventId) {
          calendarService.createEvent(reserva).then(async (eventId) => {
            if (eventId) {
              await prisma.reserva.update({
                where: { id: reserva.id },
                data: { googleEventId: eventId }
              }).catch((err) => {
                console.error("[calendar] failed to persist googleEventId", err);
              });
            }
          }).catch((err) => {
            console.error("[calendar] createEvent threw unexpectedly", err);
          });
        }
      } else if (isTransitionTo(EstadoReserva.RECHAZADA)) {
        emailService.sendRejectedEmail(reserva, data2.notas).catch((err) => {
          console.error("[email] failed to send rejected notification", err);
        });
      }
      res.json(reserva);
    } catch (e) {
      next(e);
    }
  },
  remove: async (req, res, next) => {
    try {
      const { id } = idParamSchema3.parse(req.params);
      const reserva = await prisma.reserva.findUnique({ where: { id } });
      if (!reserva) throw new AppError("Reserva no encontrada", 404);
      if (reserva.googleEventId) {
        calendarService.deleteEvent(reserva.googleEventId).catch((err) => {
          console.error("[calendar] failed to delete event on reservation remove", err);
        });
      }
      await prisma.reserva.delete({ where: { id } });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
};

// lib/routes/reservations.routes.ts
var router4 = Router4();
router4.post("/", reservationsController.create);
router4.get("/", authenticate, reservationsController.list);
router4.get("/:id", authenticate, reservationsController.get);
router4.put("/:id", authenticate, reservationsController.update);
router4.delete("/:id", authenticate, reservationsController.remove);
var reservations_routes_default = router4;

// lib/routes/calendar.routes.ts
import { Router as Router5 } from "express";

// lib/controllers/calendar.controller.ts
import { z as z6 } from "zod";
import { EstadoReserva as EstadoReserva2 } from "@prisma/client";
var availabilityQuerySchema = z6.object({
  from: z6.string().datetime().optional(),
  to: z6.string().datetime().optional()
});
var calendarController = {
  availability: async (req, res, next) => {
    try {
      const query = availabilityQuerySchema.parse(req.query);
      const from = query.from ? new Date(query.from) : /* @__PURE__ */ new Date();
      const to = query.to ? new Date(query.to) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1e3);
      if (from > to) throw new AppError('El par\xE1metro "from" debe ser anterior a "to"', 400, "INVALID_RANGE");
      const reservas = await prisma.reserva.findMany({
        where: {
          fechaEvento: { gte: from, lte: to },
          estado: { in: [EstadoReserva2.PENDIENTE, EstadoReserva2.ACEPTADA] }
        },
        select: { id: true, fechaEvento: true, estado: true, servicioNombre: true }
      });
      res.json({ reservas });
    } catch (e) {
      next(e);
    }
  }
};

// lib/routes/calendar.routes.ts
var router5 = Router5();
router5.get("/availability", calendarController.availability);
var calendar_routes_default = router5;

// lib/routes/uploads.routes.ts
import { Router as Router6 } from "express";

// lib/controllers/uploads.controller.ts
import { v2 as cloudinary } from "cloudinary";
import multer2 from "multer";
var ALLOWED_MIME_TYPES = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp"]);
var MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});
var fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.", 400, "INVALID_FILE_TYPE"));
  }
};
var upload = multer2({
  storage: multer2.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES }
});
var uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("No se recibi\xF3 ning\xFAn archivo", 400, "MISSING_FILE"));
    }
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "anacastellano", resource_type: "image" },
        (error, result2) => {
          if (error || !result2) return reject(error ?? new Error("Cloudinary upload failed"));
          resolve(result2);
        }
      );
      stream.end(req.file.buffer);
    });
    res.status(201).json({ url: result.secure_url });
  } catch (err) {
    next(err);
  }
};

// lib/routes/uploads.routes.ts
var router6 = Router6();
router6.post("/image", authenticate, upload.single("image"), uploadImage);
var uploads_routes_default = router6;

// lib/routes/contacto.routes.ts
import { Router as Router7 } from "express";
import rateLimit from "express-rate-limit";

// lib/controllers/contacto.controller.ts
import { z as z7 } from "zod";
var phoneRegex2 = /^[+]?[\d\s\-().]{6,25}$/;
var mensajeSchema = z7.object({
  nombre: z7.string().trim().min(1).max(150),
  email: z7.string().trim().toLowerCase().email().max(254),
  telefono: z7.string().trim().regex(phoneRegex2, "Tel\xE9fono con formato inv\xE1lido").optional(),
  mensaje: z7.string().trim().min(1).max(2e3)
});
var idParamSchema4 = z7.object({ id: z7.string().uuid() });
var contactoController = {
  create: async (req, res, next) => {
    try {
      const data2 = mensajeSchema.parse(req.body);
      const msg = await prisma.mensaje.create({ data: data2 });
      emailService.sendAdminNewMensaje(msg).catch((err) => {
        console.error("[email] failed to send admin contact notification", err);
      });
      res.status(201).json({ success: true });
    } catch (e) {
      next(e);
    }
  },
  list: async (_req, res, next) => {
    try {
      const mensajes = await prisma.mensaje.findMany({
        orderBy: { createdAt: "desc" },
        take: 100
      });
      res.json(mensajes);
    } catch (e) {
      next(e);
    }
  },
  markRead: async (req, res, next) => {
    try {
      const { id } = idParamSchema4.parse(req.params);
      const exists = await prisma.mensaje.findUnique({ where: { id } });
      if (!exists) throw new AppError("Mensaje no encontrado", 404);
      await prisma.mensaje.update({ where: { id }, data: { leido: true } });
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  }
};

// lib/routes/contacto.routes.ts
var contactoLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Demasiados mensajes enviados. Int\xE9ntalo m\xE1s tarde.",
    code: "TOO_MANY_REQUESTS"
  }
});
var router7 = Router7();
router7.post("/", contactoLimiter, contactoController.create);
router7.get("/", authenticate, contactoController.list);
router7.put("/:id/read", authenticate, contactoController.markRead);
var contacto_routes_default = router7;

// lib/routes/presupuestos.routes.ts
import { Router as Router8 } from "express";

// lib/controllers/presupuestos.controller.ts
import { z as z8 } from "zod";
import PDFDocument from "pdfkit";
var itemSchema = z8.object({
  descripcion: z8.string().trim().min(1).max(300),
  cantidad: z8.number().positive(),
  precioUnitario: z8.number().nonnegative()
});
var presupuestoSchema = z8.object({
  clienteNombre: z8.string().trim().min(1).max(150),
  clienteEmail: z8.string().trim().toLowerCase().email().max(254).optional(),
  clienteTelefono: z8.string().trim().optional(),
  items: z8.array(itemSchema).min(1),
  igicPorcentaje: z8.number().min(0).max(100).default(7),
  notas: z8.string().trim().max(1e3).optional()
});
var presupuestosController = {
  list: async (_req, res, next) => {
    try {
      const presupuestos = await prisma.presupuesto.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          numero: true,
          clienteNombre: true,
          clienteEmail: true,
          total: true,
          createdAt: true
        }
      });
      res.json(presupuestos);
    } catch (e) {
      next(e);
    }
  },
  create: async (req, res, next) => {
    try {
      const data2 = presupuestoSchema.parse(req.body);
      const subtotal = data2.items.reduce(
        (sum, item) => sum + item.cantidad * item.precioUnitario,
        0
      );
      const igicImporte = subtotal * (data2.igicPorcentaje / 100);
      const total = subtotal + igicImporte;
      const presupuesto = await prisma.presupuesto.create({
        data: {
          clienteNombre: data2.clienteNombre,
          clienteEmail: data2.clienteEmail,
          clienteTelefono: data2.clienteTelefono,
          items: data2.items,
          subtotal,
          igicPorcentaje: data2.igicPorcentaje,
          igicImporte,
          total,
          notas: data2.notas
        }
      });
      res.status(201).json(presupuesto);
    } catch (e) {
      next(e);
    }
  },
  pdf: async (req, res, next) => {
    try {
      const presupuesto = await prisma.presupuesto.findUnique({
        where: { id: req.params.id }
      });
      if (!presupuesto) {
        res.status(404).json({ success: false, error: "Presupuesto no encontrado" });
        return;
      }
      const items = presupuesto.items;
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="presupuesto-${presupuesto.numero}.pdf"`
      );
      doc.pipe(res);
      doc.fontSize(20).fillColor("#2C2C2C").text("Ana Castellano Florista", { align: "center" });
      doc.fontSize(10).fillColor("#888888").text("anacastellano.com  \xB7  hola@anacastellano.com", { align: "center" });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#cccccc").stroke();
      doc.moveDown();
      doc.fillColor("#2C2C2C").fontSize(14).text(`PRESUPUESTO N\xBA ${presupuesto.numero}`);
      doc.fontSize(10).fillColor("#555555").text(
        `Fecha: ${presupuesto.createdAt.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`
      );
      doc.moveDown();
      doc.fillColor("#2C2C2C").fontSize(12).text("Datos del cliente");
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor("#333333").text(`Nombre: ${presupuesto.clienteNombre}`);
      if (presupuesto.clienteEmail) doc.text(`Email: ${presupuesto.clienteEmail}`);
      if (presupuesto.clienteTelefono) doc.text(`Tel\xE9fono: ${presupuesto.clienteTelefono}`);
      doc.moveDown();
      doc.fillColor("#2C2C2C").fontSize(12).text("Detalle del presupuesto");
      doc.moveDown(0.5);
      const tableLeft = 50;
      const tableWidth = 495;
      const rowHeight = 20;
      let y = doc.y;
      doc.rect(tableLeft, y, tableWidth, rowHeight).fill("#2C2C2C");
      doc.fillColor("#ffffff").fontSize(9).text("Descripci\xF3n", tableLeft + 5, y + 5, { width: 250, lineBreak: false }).text("Cant.", tableLeft + 260, y + 5, { width: 50, align: "right", lineBreak: false }).text("Precio unit.", tableLeft + 315, y + 5, { width: 80, align: "right", lineBreak: false }).text("Importe", tableLeft + 400, y + 5, { width: 90, align: "right", lineBreak: false });
      y += rowHeight;
      items.forEach((item, i) => {
        const importe = item.cantidad * item.precioUnitario;
        doc.rect(tableLeft, y, tableWidth, rowHeight).fill(i % 2 === 0 ? "#FAF7F2" : "#FFFFFF");
        doc.fillColor("#333333").fontSize(9).text(item.descripcion, tableLeft + 5, y + 5, { width: 250, lineBreak: false }).text(String(item.cantidad), tableLeft + 260, y + 5, { width: 50, align: "right", lineBreak: false }).text(`${item.precioUnitario.toFixed(2)} \u20AC`, tableLeft + 315, y + 5, { width: 80, align: "right", lineBreak: false }).text(`${importe.toFixed(2)} \u20AC`, tableLeft + 400, y + 5, { width: 90, align: "right", lineBreak: false });
        y += rowHeight;
      });
      doc.y = y + 10;
      doc.moveDown(0.5);
      const labelX = 370;
      const valueX = 460;
      const valueW = 85;
      const printTotal = (label, value, bold = false) => {
        const ty = doc.y;
        doc.fontSize(bold ? 11 : 10).fillColor(bold ? "#000000" : "#333333").text(label, labelX, ty, { width: 85, align: "right", lineBreak: false }).text(value, valueX, ty, { width: valueW, align: "right", lineBreak: false });
        doc.moveDown(0.4);
      };
      printTotal("Subtotal:", `${Number(presupuesto.subtotal).toFixed(2)} \u20AC`);
      printTotal(`IGIC (${presupuesto.igicPorcentaje}%):`, `${Number(presupuesto.igicImporte).toFixed(2)} \u20AC`);
      printTotal("TOTAL:", `${Number(presupuesto.total).toFixed(2)} \u20AC`, true);
      if (presupuesto.notas) {
        doc.moveDown();
        doc.fontSize(10).fillColor("#555555").text(`Notas: ${presupuesto.notas}`, { width: 495 });
      }
      doc.moveDown(2);
      doc.fontSize(9).fillColor("#999999").text("Presupuesto v\xE1lido por 30 d\xEDas desde la fecha de emisi\xF3n.", { align: "center" });
      doc.end();
    } catch (e) {
      next(e);
    }
  }
};

// lib/routes/presupuestos.routes.ts
var router8 = Router8();
router8.get("/", authenticate, presupuestosController.list);
router8.post("/", authenticate, presupuestosController.create);
router8.get("/:id/pdf", authenticate, presupuestosController.pdf);
var presupuestos_routes_default = router8;

// lib/routes/notifications.routes.ts
import { Router as Router9 } from "express";

// lib/controllers/notifications.controller.ts
import { EstadoReserva as EstadoReserva3 } from "@prisma/client";
var notificationsController = {
  summary: async (_req, res, next) => {
    try {
      const [pendingReservations, unreadMessages] = await Promise.all([
        prisma.reserva.count({ where: { estado: EstadoReserva3.PENDIENTE } }),
        prisma.mensaje.count({ where: { leido: false } })
      ]);
      res.json({
        pendingReservations,
        unreadMessages,
        total: pendingReservations + unreadMessages
      });
    } catch (e) {
      next(e);
    }
  }
};

// lib/routes/notifications.routes.ts
var router9 = Router9();
router9.get("/", authenticate, notificationsController.summary);
var notifications_routes_default = router9;

// lib/routes/cursos.routes.ts
import { Router as Router10 } from "express";

// lib/controllers/cursos.controller.ts
import { z as z9 } from "zod";
import { Prisma as Prisma2 } from "@prisma/client";
var serializeCurso = (c) => ({
  ...c,
  precio: c.precio instanceof Prisma2.Decimal ? c.precio.toNumber() : c.precio
});
var listQuerySchema3 = z9.object({
  all: z9.coerce.boolean().optional()
});
var cursoSchema = z9.object({
  titulo: z9.string().trim().min(1).max(150),
  descripcion: z9.string().trim().max(5e3).optional().default(""),
  imagen: z9.string().url().max(500).optional().nullable(),
  precio: z9.number().nonnegative().optional().nullable(),
  duracion: z9.string().trim().max(100).optional().nullable(),
  modalidad: z9.string().trim().max(100).optional().nullable(),
  orden: z9.number().int().min(0).max(1e4).optional(),
  activo: z9.boolean().optional()
});
var idParamSchema5 = z9.object({ id: z9.string().uuid() });
var cursosController = {
  list: async (req, res, next) => {
    try {
      const { all } = listQuerySchema3.parse(req.query);
      const isAdmin = Boolean(req.admin);
      const showAll = all === true && isAdmin;
      const cursos = await prisma.curso.findMany({
        where: showAll ? void 0 : { activo: true },
        orderBy: { orden: "asc" }
      });
      res.json(cursos.map(serializeCurso));
    } catch (e) {
      next(e);
    }
  },
  get: async (req, res, next) => {
    try {
      const { id } = idParamSchema5.parse(req.params);
      const curso = await prisma.curso.findUnique({ where: { id } });
      if (!curso) throw new AppError("Curso no encontrado", 404);
      res.json(serializeCurso(curso));
    } catch (e) {
      next(e);
    }
  },
  create: async (req, res, next) => {
    try {
      const data2 = cursoSchema.parse(req.body);
      const curso = await prisma.curso.create({ data: data2 });
      res.status(201).json(serializeCurso(curso));
    } catch (e) {
      next(e);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = idParamSchema5.parse(req.params);
      const data2 = cursoSchema.partial().parse(req.body);
      const curso = await prisma.curso.update({ where: { id }, data: data2 });
      res.json(serializeCurso(curso));
    } catch (e) {
      next(e);
    }
  },
  remove: async (req, res, next) => {
    try {
      const { id } = idParamSchema5.parse(req.params);
      await prisma.curso.delete({ where: { id } });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
};

// lib/routes/cursos.routes.ts
var router10 = Router10();
router10.get("/", softAuthenticate, cursosController.list);
router10.get("/:id", cursosController.get);
router10.post("/", authenticate, cursosController.create);
router10.put("/:id", authenticate, cursosController.update);
router10.delete("/:id", authenticate, cursosController.remove);
var cursos_routes_default = router10;

// lib/app.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"]
      }
    },
    crossOriginResourcePolicy: { policy: "same-site" },
    referrerPolicy: { policy: "no-referrer" }
  })
);
var allowedOrigins = env.ALLOWED_ORIGINS_LIST;
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
var globalLimiter = rateLimit2({ windowMs: 15 * 60 * 1e3, max: 300, standardHeaders: true, legacyHeaders: false });
var loginLimiter = rateLimit2({
  windowMs: 15 * 60 * 1e3,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, error: "Demasiados intentos de inicio de sesi\xF3n. Int\xE9ntalo de nuevo en 15 minutos.", code: "TOO_MANY_LOGIN_ATTEMPTS" }
});
var reservationsLimiter = rateLimit2({
  windowMs: 60 * 60 * 1e3,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Demasiadas reservas enviadas desde esta IP. Int\xE9ntalo m\xE1s tarde.", code: "TOO_MANY_RESERVATIONS" }
});
app.use("/api/auth/login", loginLimiter);
app.post("/api/reservations", reservationsLimiter);
app.use("/api", globalLimiter);
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/auth", auth_routes_default);
app.use("/api/services", services_routes_default);
app.use("/api/blocks", blocks_routes_default);
app.use("/api/reservations", reservations_routes_default);
app.use("/api/calendar", calendar_routes_default);
app.use("/api/uploads", uploads_routes_default);
app.use("/api/contacto", contacto_routes_default);
app.use("/api/presupuestos", presupuestos_routes_default);
app.use("/api/notifications", notifications_routes_default);
app.use("/api/cursos", cursos_routes_default);
app.use(notFoundHandler);
app.use(errorHandler);
var app_default = app;

// api/_entry.ts
var entry_default = app_default;
export {
  entry_default as default
};
