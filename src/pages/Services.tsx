import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesApi } from '@services/services.api';
import type { Servicio } from '@app-types/models';
import SectionHeader from '../components/ui/SectionHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { resolveImg, isVideoUrl } from '../utils/image';

const FALLBACK_DATE = '2024-01-01T00:00:00.000Z';

const fallbackServices: Servicio[] = [
  {
    id: '1', orden: 1, activo: true, createdAt: FALLBACK_DATE, updatedAt: FALLBACK_DATE,
    titulo: 'Diseño Floral Personalizado',
    descripcion: 'Creaciones únicas adaptadas a tu estilo y personalidad. Desde ramos de novia hasta centros de mesa exclusivos.',
    bloques: [
      { id: 'b1', titulo: 'Ramos de novia', descripcion: 'Diseñados a medida para el día más especial.', imagenes: [], orden: 1, activo: true, servicioId: '1' },
      { id: 'b2', titulo: 'Centros de mesa', descripcion: 'Composiciones que marcan la diferencia en cada celebración.', imagenes: [], orden: 2, activo: true, servicioId: '1' },
    ],
  },
  {
    id: '2', orden: 2, activo: true, createdAt: FALLBACK_DATE, updatedAt: FALLBACK_DATE,
    titulo: 'Decoración Integral de Eventos',
    descripcion: 'Transformamos cualquier espacio en un escenario floral único. Bodas, galas, inauguraciones y más.',
    bloques: [
      { id: 'b3', titulo: 'Decoración ceremonias', descripcion: 'Altares, pasillos y arcos florales de ensueño.', imagenes: [], orden: 1, activo: true, servicioId: '2' },
      { id: 'b4', titulo: 'Instalaciones florales', descripcion: 'Estructuras artísticas que sorprenden a tus invitados.', imagenes: [], orden: 2, activo: true, servicioId: '2' },
      { id: 'b5', titulo: 'Dirección visual', descripcion: 'Coordinación estética integral del evento.', imagenes: [], orden: 3, activo: true, servicioId: '2' },
    ],
  },
  {
    id: '3', orden: 3, activo: true, createdAt: FALLBACK_DATE, updatedAt: FALLBACK_DATE,
    titulo: 'Asesoramiento Estético 360º',
    descripcion: 'Te acompaño desde la primera idea hasta el último detalle. Paletas de color, tendencias y propuestas visuales.',
    bloques: [
      { id: 'b6', titulo: 'Consultoría floral', descripcion: 'Sesiones de asesoramiento para definir tu estilo.', imagenes: [], orden: 1, activo: true, servicioId: '3' },
      { id: 'b7', titulo: 'Moodboard y paletas', descripcion: 'Propuestas visuales para que imagines el resultado.', imagenes: [], orden: 2, activo: true, servicioId: '3' },
    ],
  },
  {
    id: '4', orden: 4, activo: true, createdAt: FALLBACK_DATE, updatedAt: FALLBACK_DATE,
    titulo: 'Coordinación con Proveedores',
    descripcion: 'Gestiono la relación con productores florales locales para garantizar frescura y sostenibilidad.',
    bloques: [
      { id: 'b8', titulo: 'Flores de temporada', descripcion: 'Selección basada en disponibilidad y máxima calidad.', imagenes: [], orden: 1, activo: true, servicioId: '4' },
    ],
  },
];

// ── Inline image carousel ─────────────────────────────────────────────────────
function ServiceCarousel({ servicio }: { servicio: Servicio }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mediaErrors, setMediaErrors] = useState<Set<number>>(new Set());
  const touchStartX = useRef(0);

  // Build gallery: main image + imagenes array + block images
  const gallery: string[] = [];
  if (servicio.imagen) gallery.push(servicio.imagen);
  (servicio.imagenes ?? []).forEach((url) => {
    if (url !== servicio.imagen) gallery.push(url);
  });
  servicio.bloques.forEach((b) =>
    (b.imagenes ?? []).forEach((url) => gallery.push(url))
  );

  const total      = gallery.length;
  const multiMedia = total > 1;
  const activeUrl  = gallery[activeIndex] ?? null;
  const isVideo    = activeUrl ? isVideoUrl(activeUrl) : false;
  const hasError   = mediaErrors.has(activeIndex);

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((i) => (i - 1 + total) % total);
  };
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((i) => (i + 1) % total);
  };
  const goTo = (e: React.MouseEvent, i: number) => {
    e.stopPropagation();
    setActiveIndex(i);
    setMediaErrors(new Set());
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      dx < 0
        ? setActiveIndex((i) => (i + 1) % total)
        : setActiveIndex((i) => (i - 1 + total) % total);
    }
  };

  const markError = () => setMediaErrors((prev) => new Set(prev).add(activeIndex));

  return (
    <div
      className="aspect-[4/3] bg-gradient-to-br from-sage-50 to-ivory-100 rounded-sm overflow-hidden relative select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {activeUrl && !hasError ? (
        isVideo ? (
          <video
            key={activeUrl}
            src={resolveImg(activeUrl)}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            autoPlay
            playsInline
            onError={markError}
          />
        ) : (
          <img
            key={activeUrl}
            src={resolveImg(activeUrl)}
            alt={servicio.titulo}
            className="absolute inset-0 w-full h-full object-cover animate-fade-in"
            draggable={false}
            onError={markError}
          />
        )
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-16 h-16 text-sage-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
          </svg>
        </div>
      )}

      {/* Prev / Next arrows */}
      {multiMedia && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Imagen anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 hover:bg-black/55 flex items-center justify-center text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4L6 9L11 14" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Imagen siguiente"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 hover:bg-black/55 flex items-center justify-center text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 4L12 9L7 14" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {multiMedia && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {gallery.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => goTo(e, i)}
              aria-label={`Imagen ${i + 1}`}
              className={`rounded-full transition-all duration-200 ${
                i === activeIndex
                  ? 'w-4 h-1.5 bg-white'
                  : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Services() {
  const [services, setServices] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    servicesApi.list()
      .then((data) => {
        setServices(data.length ? data : fallbackServices);
      })
      .catch(() => {
        setServices(fallbackServices);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      {/* Hero interior */}
      <section className="relative min-h-[280px] md:min-h-[340px] flex items-end bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/60 via-charcoal-900/70 to-charcoal-900/90" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-300/30 to-transparent" aria-hidden />
        <div className="relative z-10 container-page pb-12 pt-28">
          <span className="section-header__eyebrow !text-gold-300 !mb-3 block">Lo que ofrezco</span>
          <h1 className="font-serif text-5xl lg:text-6xl text-white">Servicios</h1>
          <div className="mt-4 w-12 h-px bg-gold-300" aria-hidden />
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-content">
          {error && (
            <div className="mb-8 p-4 bg-blush-50 border border-blush-200 rounded text-sm text-charcoal-600">
              Mostrando servicios de ejemplo. Conecta el backend para ver los datos reales.
            </div>
          )}

          <SectionHeader
            eyebrow="Servicios"
            title="Arte floral para cada momento"
            subtitle="Cada servicio está pensado para acompañarte desde la primera idea hasta el último detalle."
            centered
          />

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="mt-16 space-y-24">
              {services.map((servicio, idx) => (
                <div
                  key={servicio.id}
                  className={`grid lg:grid-cols-2 gap-12 items-start ${
                    idx % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  {/* Carrusel de imágenes inline */}
                  <ServiceCarousel servicio={servicio} />

                  {/* Contenido */}
                  <div className="space-y-6">
                    <div>
                      <span className="text-gold-500 font-sans text-sm uppercase tracking-widest">
                        {String(servicio.orden).padStart(2, '0')}
                      </span>
                      <h2 className="font-serif text-3xl text-charcoal-800 mt-1">{servicio.titulo}</h2>
                      <div className="divider-gold mt-3" />
                    </div>
                    <p className="text-charcoal-600 leading-relaxed">{servicio.descripcion}</p>

                    {servicio.bloques.length > 0 && (
                      <ul className="space-y-3">
                        {servicio.bloques.map((bloque) => (
                          <li key={bloque.id} className="flex gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-sage-400 mt-2 flex-shrink-0" />
                            <div>
                              <span className="font-sans font-medium text-charcoal-700">{bloque.titulo}</span>
                              {bloque.descripcion && (
                                <span className="text-charcoal-500 text-sm"> — {bloque.descripcion}</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <Link
                      to={`/reservations?service=${servicio.id}`}
                      className="btn-primary inline-block"
                    >
                      Solicitar este servicio
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-ivory-100 text-center">
        <div className="container-page max-w-2xl mx-auto space-y-6">
          <div className="ornament-line mb-6" aria-hidden />
          <SectionHeader
            eyebrow="¿Tienes dudas?"
            title="Hablemos sin compromiso"
            subtitle="Cuéntame tu proyecto y te preparo una propuesta personalizada."
            centered
          />
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="btn-primary">
              Contactar ahora
            </Link>
            <Link to="/reservations" className="btn-secondary">
              Reservar cita
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
