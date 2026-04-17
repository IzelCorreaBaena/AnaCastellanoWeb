import { env } from '../config/env';

// ─── Payload shape ─────────────────────────────────────────────────────────────

interface ReservaCalendarPayload {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
  fechaEvento: Date | null;
  servicioNombre?: string | null;
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Lazily resolve the `google` export from googleapis.
 * Returns null if the package is not installed or credentials are missing,
 * so the caller can degrade gracefully without crashing the process.
 */
async function getCalendarClient(): Promise<import('googleapis').calendar_v3.Calendar | null> {
  if (!env.GOOGLE_CLIENT_EMAIL || !env.GOOGLE_PRIVATE_KEY || !env.GOOGLE_CALENDAR_ID) {
    console.warn('[calendar] Google Calendar credentials not configured — skipping calendar integration');
    return null;
  }

  let google: typeof import('googleapis')['google'];
  try {
    // Dynamic import so the service starts even when googleapis is not yet installed
    const mod = await import('googleapis');
    google = mod.google;
  } catch {
    console.warn('[calendar] googleapis package not found — skipping calendar integration');
    return null;
  }

  const auth = new google.auth.JWT({
    email: env.GOOGLE_CLIENT_EMAIL,
    // Private key arrives as a single string; restore newlines escaped by env parsers
    key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return google.calendar({ version: 'v3', auth });
}

// ─── Public service ────────────────────────────────────────────────────────────

export const calendarService = {
  /**
   * Creates a Google Calendar event for an accepted reservation.
   * Returns the created event ID, or null if Google Calendar is not configured
   * or the call fails (non-blocking — the reservation is already saved).
   */
  async createEvent(reserva: ReservaCalendarPayload): Promise<string | null> {
    const calendar = await getCalendarClient();
    if (!calendar) return null;

    const calendarId = env.GOOGLE_CALENDAR_ID as string;

    // If no exact time is known, create an all-day event on the event date
    const fecha = reserva.fechaEvento ?? new Date();
    const startDate = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
    // Google Calendar all-day events require end.date to be the day *after* start (exclusive).
    const endDateObj = new Date(fecha);
    endDateObj.setUTCDate(endDateObj.getUTCDate() + 1);
    const endDate = endDateObj.toISOString().split('T')[0];

    const summary = reserva.servicioNombre
      ? `${reserva.servicioNombre} — ${reserva.nombre}`
      : `Evento floral — ${reserva.nombre}`;

    const description = [
      `Cliente: ${reserva.nombre}`,
      `Teléfono: ${reserva.telefono}`,
      `Email: ${reserva.email}`,
      reserva.mensaje ? `\nNotas: ${reserva.mensaje}` : '',
      `\nID reserva: ${reserva.id}`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const response = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary,
          description,
          start: reserva.fechaEvento
            ? { dateTime: reserva.fechaEvento.toISOString(), timeZone: 'Europe/Madrid' }
            : { date: startDate },
          end: reserva.fechaEvento
            ? {
                // Default duration: 2 hours when an exact time is provided
                dateTime: new Date(reserva.fechaEvento.getTime() + 2 * 60 * 60 * 1000).toISOString(),
                timeZone: 'Europe/Madrid',
              }
            : { date: endDate },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 60 * 24 * 7 },  // 1 week before
              { method: 'popup', minutes: 60 * 24 },       // 1 day before
            ],
          },
        },
      });

      const eventId = response.data.id ?? null;
      if (eventId) {
        console.log(`[calendar] event created: ${eventId}`);
      }
      return eventId;
    } catch (err) {
      console.error('[calendar] failed to create event', err);
      return null;
    }
  },

  async deleteEvent(eventId: string): Promise<void> {
    const calendar = await getCalendarClient();
    if (!calendar) return;
    const calendarId = env.GOOGLE_CALENDAR_ID as string;
    try {
      await calendar.events.delete({ calendarId, eventId });
      console.log(`[calendar] event deleted: ${eventId}`);
    } catch (err) {
      console.error('[calendar] failed to delete event', err);
    }
  },
};
