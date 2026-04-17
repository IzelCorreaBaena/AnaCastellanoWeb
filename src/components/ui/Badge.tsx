export type EstadoReserva = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';

interface BadgeProps {
  estado: EstadoReserva;
  className?: string;
}

const LABELS: Record<EstadoReserva, string> = {
  PENDIENTE: 'Pendiente',
  ACEPTADA: 'Aceptada',
  RECHAZADA: 'Rechazada',
};

const CLASSES: Record<EstadoReserva, string> = {
  PENDIENTE: 'badge-pendiente',
  ACEPTADA: 'badge-aceptada',
  RECHAZADA: 'badge-rechazada',
};

export default function Badge({ estado, className = '' }: BadgeProps) {
  return (
    <span className={`${CLASSES[estado]} ${className}`}>{LABELS[estado]}</span>
  );
}
