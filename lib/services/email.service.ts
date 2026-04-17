import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';

// ─── HTML escape helper ───────────────────────────────────────────────────────
function escHtml(s: string | null | undefined): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Shared design tokens (inline styles for email client compatibility) ───────
const COLOR = {
  ivory: '#FAF7F2',
  sage: '#7D9B76',
  charcoal: '#2C2C2C',
  gold: '#C9A96E',
  white: '#FFFFFF',
  lightGray: '#F0EDE8',
} as const;

// ─── Reusable layout wrapper ──────────────────────────────────────────────────
function emailWrapper(content: string): string {
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
                Ana Castellano Florista &nbsp;·&nbsp; anacastellano.com<br>
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

/** Formats a Date for display in Spanish locale, or returns a fallback string. */
function formatFecha(fecha: Date | null | undefined): string {
  if (!fecha) return 'por confirmar';
  return fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── Transporter (singleton) ──────────────────────────────────────────────────
let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  if (!env.SMTP_HOST || !env.SMTP_PORT) {
    console.warn('[email] SMTP not configured — emails will be logged only');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  return transporter;
}

// ─── Shared payload shapes ────────────────────────────────────────────────────

interface ReservaEmailPayload {
  email: string;
  nombre: string;
  fechaEvento: Date | null;
  servicioNombre?: string | null;
  mensaje?: string;
}

// ─── Public service ───────────────────────────────────────────────────────────

export const emailService = {
  async send(to: string, subject: string, html: string): Promise<void> {
    const t = getTransporter();
    const from = env.SMTP_FROM || 'no-reply@anacastellano.com';
    if (!t) {
      console.log(`[email:mock] to=${to} subject=${subject}`);
      return;
    }
    await t.sendMail({ from, to, subject, html });
  },

  /** Sent immediately after the client submits a reservation request. */
  async sendReservationConfirmation(reserva: ReservaEmailPayload): Promise<void> {
    const subject = 'Reserva recibida — Ana Castellano Florista';
    const fecha = formatFecha(reserva.fechaEvento);
    const servicio = reserva.servicioNombre
      ? `<p style="margin:16px 0 0;"><strong>Servicio solicitado:</strong> ${reserva.servicioNombre}</p>`
      : '';
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
      <p style="margin:24px 0 0;color:${COLOR.sage};font-style:italic;">Con cariño,<br><strong style="font-style:normal;color:${COLOR.charcoal};">Ana Castellano</strong></p>
    `);
    await this.send(reserva.email, subject, html);
  },

  /** Sent when the admin accepts a reservation (estado → ACEPTADA). */
  async sendAcceptedEmail(reserva: ReservaEmailPayload): Promise<void> {
    const subject = '¡Tu reserva ha sido confirmada! — Ana Castellano Florista';
    const fecha = formatFecha(reserva.fechaEvento);
    const servicio = reserva.servicioNombre
      ? `<p style="margin:8px 0 0;"><strong>Servicio:</strong> ${reserva.servicioNombre}</p>`
      : '';
    const html = emailWrapper(`
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:normal;color:${COLOR.charcoal};letter-spacing:0.5px;">¡Hola, ${escHtml(reserva.nombre)}!</h2>
      <p style="margin:0 0 24px;font-size:16px;color:${COLOR.sage};font-style:italic;">Tenemos una noticia estupenda para ti.</p>
      <p style="margin:0 0 16px;">Me complace confirmar que tu reserva ha sido <strong style="color:${COLOR.sage};">aceptada</strong>. Será un placer acompañarte en este momento tan especial.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background-color:${COLOR.ivory};border-left:3px solid ${COLOR.gold};">
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${COLOR.gold};">Detalles de tu evento</p>
            <p style="margin:12px 0 0;"><strong>Fecha:</strong> ${escHtml(fecha)}</p>
            ${servicio}
          </td>
        </tr>
      </table>
      <p style="margin:0 0 16px;">En los próximos días me pondré en contacto contigo para ultimar todos los detalles y asegurarnos de que todo sea exactamente como lo imaginas.</p>
      <p style="margin:0 0 8px;">Si mientras tanto tienes alguna pregunta o idea, no dudes en escribirme:</p>
      <p style="margin:0 0 24px;">
        <a href="mailto:hola@anacastellano.com" style="color:${COLOR.sage};text-decoration:none;font-weight:bold;">hola@anacastellano.com</a>
      </p>
      <p style="margin:24px 0 0;color:${COLOR.sage};font-style:italic;">Con mucha ilusión,<br><strong style="font-style:normal;color:${COLOR.charcoal};">Ana Castellano</strong></p>
    `);
    await this.send(reserva.email, subject, html);
  },

  /** Sent to the admin when a new reservation is submitted by a client. */
  async sendAdminNewReservation(reserva: ReservaEmailPayload & { telefono?: string; mensaje?: string }): Promise<void> {
    const adminEmail = env.ADMIN_EMAIL || 'hola@anacastellano.com';
    const subject = `Nueva reserva — ${escHtml(reserva.nombre)}`;
    const fecha = formatFecha(reserva.fechaEvento);
    const html = emailWrapper(`
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:normal;color:${COLOR.charcoal};">Nueva solicitud de reserva</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background-color:${COLOR.ivory};border-left:3px solid ${COLOR.gold};padding:20px 24px;">
        <tr><td>
          <p style="margin:0 0 8px;"><strong>Nombre:</strong> ${escHtml(reserva.nombre)}</p>
          <p style="margin:0 0 8px;"><strong>Email:</strong> ${escHtml(reserva.email)}</p>
          ${reserva.telefono ? `<p style="margin:0 0 8px;"><strong>Teléfono:</strong> ${escHtml(reserva.telefono)}</p>` : ''}
          <p style="margin:0 0 8px;"><strong>Fecha del evento:</strong> ${escHtml(fecha)}</p>
          ${reserva.servicioNombre ? `<p style="margin:0 0 8px;"><strong>Servicio:</strong> ${escHtml(reserva.servicioNombre)}</p>` : ''}
          ${reserva.mensaje ? `<p style="margin:0;"><strong>Mensaje:</strong> ${escHtml(reserva.mensaje)}</p>` : ''}
        </td></tr>
      </table>
      <p style="margin:0;font-size:13px;color:#888;">Accede al panel de administración para gestionar esta reserva.</p>
    `);
    await this.send(adminEmail, subject, html);
  },

  /** Sent to the admin when a new contact message is submitted. */
  async sendAdminNewMensaje(msg: { nombre: string; email: string; telefono?: string | null; mensaje: string }): Promise<void> {
    const adminEmail = env.ADMIN_EMAIL || 'hola@anacastellano.com';
    const subject = `Nuevo mensaje de contacto — ${escHtml(msg.nombre)}`;
    const html = emailWrapper(`
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:normal;color:${COLOR.charcoal};">Nuevo mensaje de contacto</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background-color:${COLOR.ivory};border-left:3px solid ${COLOR.gold};padding:20px 24px;">
        <tr><td>
          <p style="margin:0 0 8px;"><strong>Nombre:</strong> ${escHtml(msg.nombre)}</p>
          <p style="margin:0 0 8px;"><strong>Email:</strong> ${escHtml(msg.email)}</p>
          ${msg.telefono ? `<p style="margin:0 0 8px;"><strong>Teléfono:</strong> ${escHtml(msg.telefono)}</p>` : ''}
          <p style="margin:0;"><strong>Mensaje:</strong> ${escHtml(msg.mensaje)}</p>
        </td></tr>
      </table>
      <p style="margin:0;font-size:13px;color:#888;">Accede al panel de administración para ver todos los mensajes.</p>
    `);
    await this.send(adminEmail, subject, html);
  },

  /** Sent when the admin rejects a reservation (estado → RECHAZADA). */
  async sendRejectedEmail(reserva: ReservaEmailPayload, motivo?: string | null): Promise<void> {
    const subject = 'Sobre tu solicitud de reserva — Ana Castellano Florista';
    const fecha = formatFecha(reserva.fechaEvento);
    const motivoBlock = motivo
      ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background-color:${COLOR.ivory};border-left:3px solid ${COLOR.lightGray};">
           <tr><td style="padding:16px 24px;">
             <p style="margin:0;font-size:13px;color:#888;">${escHtml(motivo)}</p>
           </td></tr>
         </table>`
      : '';
    const html = emailWrapper(`
      <h2 style="margin:0 0 24px;font-size:22px;font-weight:normal;color:${COLOR.charcoal};letter-spacing:0.5px;">Hola, ${escHtml(reserva.nombre)}</h2>
      <p style="margin:0 0 16px;">Gracias por tu interés y por considerar a Ana Castellano Florista para tu evento del <strong>${escHtml(fecha)}</strong>.</p>
      <p style="margin:0 0 16px;">Lamentablemente, en esta ocasión no me es posible atenderte en esa fecha. Te pido disculpas por los inconvenientes que esto pueda ocasionarte.</p>
      ${motivoBlock}
      <p style="margin:0 0 16px;">Si deseas encontrar una fecha alternativa o necesitas ayuda con otra propuesta, estaré encantada de explorar opciones contigo. No dudes en contactarme directamente:</p>
      <p style="margin:0 0 4px;">
        <a href="mailto:hola@anacastellano.com" style="color:${COLOR.sage};text-decoration:none;font-weight:bold;">hola@anacastellano.com</a>
      </p>
      <p style="margin:0 0 24px;">Espero poder acompañarte en una próxima ocasión.</p>
      <p style="margin:24px 0 0;color:${COLOR.sage};font-style:italic;">Con todo mi cariño,<br><strong style="font-style:normal;color:${COLOR.charcoal};">Ana Castellano</strong></p>
    `);
    await this.send(reserva.email, subject, html);
  },
};
