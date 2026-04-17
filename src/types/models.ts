// ---------------------------------------------------------------------------
// Canonical backend types — field names match Prisma schema exactly.
// ---------------------------------------------------------------------------

export interface Bloque {
  readonly id: string;
  readonly titulo: string;
  readonly descripcion: string;
  readonly imagenes: string[];
  readonly orden: number;
  readonly activo: boolean;
  readonly servicioId: string;
}

export interface Servicio {
  readonly id: string;
  readonly titulo: string;
  readonly descripcion: string;
  readonly imagen?: string | null;
  readonly orden: number;
  readonly activo: boolean;
  readonly bloques: Bloque[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type EstadoReserva = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';

export interface Reserva {
  readonly id: string;
  readonly nombre: string;
  readonly telefono: string;
  readonly email: string;
  readonly mensaje?: string;
  readonly estado: EstadoReserva;
  readonly fechaEvento?: string;
  readonly notas?: string;
  readonly googleEventId?: string;
  readonly servicioId?: string;
  readonly servicioNombre?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Admin {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly createdAt: string;
}

// ---------------------------------------------------------------------------
// Payload types for write operations.
// ---------------------------------------------------------------------------

export interface CreateServicioPayload {
  titulo: string;
  descripcion: string;
  imagen?: string | null;
}

export interface UpdateServicioPayload {
  titulo?: string;
  descripcion?: string;
  imagen?: string | null;
  orden?: number;
  activo?: boolean;
}

export interface CreateReservaPayload {
  nombre: string;
  telefono: string;
  email: string;
  mensaje: string;
  servicioId?: string;
  fechaEvento?: string;
}

export interface UpdateReservaPayload {
  estado: 'ACEPTADA' | 'RECHAZADA';
  notas?: string;
}

export interface CreateBloquePayload {
  servicioId: string;
  titulo: string;
  descripcion: string;
  imagenes?: string[];
  orden?: number;
}

export interface UpdateBloquePayload {
  titulo?: string;
  descripcion?: string;
  imagenes?: string[];
  orden?: number;
  activo?: boolean;
}

// ---------------------------------------------------------------------------
// Pagination wrapper — matches the backend envelope for paginated list endpoints.
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

export interface PaginatedResponse<T> {
  readonly data: T[];
  readonly pagination: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Compatibility aliases — preserve old names so any unedited page that
// still references them (via `as unknown as`) continues to compile.
// ---------------------------------------------------------------------------

/** @deprecated Use Servicio */
export type Service = Servicio;

/** @deprecated Use Reserva */
export type Reservation = Reserva;

/** @deprecated Use Bloque */
export type Block = Bloque;

/** @deprecated Use Admin */
export type User = Admin;

// ---------------------------------------------------------------------------
// Contacto (public messages)
// ---------------------------------------------------------------------------

export interface Mensaje {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  mensaje: string;
  leido: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Presupuestos
// ---------------------------------------------------------------------------

export interface PresupuestoItem {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Presupuesto {
  id: string;
  numero: number;
  clienteNombre: string;
  clienteEmail?: string | null;
  clienteTelefono?: string | null;
  items: PresupuestoItem[];
  subtotal: number;
  igicPorcentaje: number;
  igicImporte: number;
  total: number;
  notas?: string | null;
  createdAt: string;
}

export interface PresupuestoListItem {
  id: string;
  numero: number;
  clienteNombre: string;
  clienteEmail?: string | null;
  total: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Notifications summary
// ---------------------------------------------------------------------------

export interface NotificationsSummary {
  pendingReservations: number;
  unreadMessages: number;
  total: number;
}
