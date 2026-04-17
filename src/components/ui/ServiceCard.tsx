import { Link } from 'react-router-dom';

interface ServiceBlock {
  titulo: string;
  descripcion: string;
  imagenes?: string[];
}

export interface ServiceCardData {
  id: string;
  titulo: string;
  descripcion: string;
  bloques?: ServiceBlock[];
  imagenUrl?: string;
}

interface ServiceCardProps {
  servicio: ServiceCardData;
  ctaLabel?: string;
}

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23F5EFE6"/><text x="50%25" y="50%25" font-family="serif" font-size="22" fill="%23A8BAA0" text-anchor="middle" dominant-baseline="middle">Ana Castellano</text></svg>';

function truncate(text: string, max = 140) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export default function ServiceCard({
  servicio,
  ctaLabel = 'Solicitar servicio',
}: ServiceCardProps) {
  // Usamos ?. para que no explote si servicio es undefined
  const firstImage =
    servicio?.imagenUrl ||
    servicio?.bloques?.[0]?.imagenes?.[0] ||
    PLACEHOLDER;

  // Si por algún motivo no hay servicio, no renderizamos nada
  if (!servicio) return null;

  return (
    <article className="card-service flex flex-col h-full">
      <div className="card-service__image">
        <img src={firstImage} alt={servicio?.titulo || 'Servicio'} loading="lazy" />
      </div>
      <div className="card-service__body flex flex-col flex-1">
        <h3 className="card-service__title">{servicio?.titulo || 'Cargando...'}</h3>
        <p className="card-service__description flex-1">
          {truncate(servicio?.descripcion || '')}
        </p>
        <Link
          to={`/reservations?service=${encodeURIComponent(servicio?.id || '')}`}
          className="mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-sage-600 hover:text-sage-700 transition"
        >
          {ctaLabel}
          <span aria-hidden>&rarr;</span>
        </Link>
      </div>
    </article>
  );
}
