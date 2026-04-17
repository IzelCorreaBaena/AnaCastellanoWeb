import { Reserva } from '@prisma/client';

export { EstadoReserva } from '@prisma/client';

// ─── JWT ─────────────────────────────────────────────────────────────────────

export interface AuthTokenPayload {
  sub: string;
  username?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

// ─── API response envelopes ───────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Domain helpers ───────────────────────────────────────────────────────────

/** Reserva shape returned to the admin panel — always includes servicio relation */
export type ReservaConServicio = Reserva & {
  servicio: {
    id: string;
    titulo: string;
  } | null;
};
