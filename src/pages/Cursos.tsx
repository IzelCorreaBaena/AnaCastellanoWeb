import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cursosApi } from '@services/cursos.api';
import type { Curso } from '@app-types/models';
import SectionHeader from '../components/ui/SectionHeader';
import CursoDetailModal from '../components/ui/CursoDetailModal';
import { resolveImg as resolveImageSrc, isVideoUrl } from '../utils/image';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const formatPrecio = (precio: number): string =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(precio);

// ─── Skeleton card — displayed during loading ──────────────────────────────────

function CursoCardSkeleton() {
  return (
    <div className="card-curso" aria-hidden="true">
      <div className="card-curso__image skeleton" />
      <div className="card-curso__body">
        <div className="skeleton skeleton-text-sm" style={{ width: '40%' }} />
        <div className="skeleton skeleton-text-lg mt-2" style={{ width: '80%' }} />
        <div className="skeleton skeleton-text-lg" style={{ width: '60%' }} />
        <div className="mt-3 space-y-2">
          <div className="skeleton skeleton-text" style={{ width: '100%' }} />
          <div className="skeleton skeleton-text" style={{ width: '90%' }} />
          <div className="skeleton skeleton-text" style={{ width: '70%' }} />
        </div>
        <div className="card-curso__badges mt-4">
          <div className="skeleton" style={{ width: 72, height: 24, borderRadius: 9999 }} />
          <div className="skeleton" style={{ width: 88, height: 24, borderRadius: 9999 }} />
        </div>
        <div className="skeleton mt-5" style={{ height: 44, borderRadius: 2 }} />
      </div>
    </div>
  );
}

// ─── Individual course card ───────────────────────────────────────────────────

interface CursoCardProps {
  curso: Curso;
  onClick: () => void;
}

function CursoCard({ curso, onClick }: CursoCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <article
      className="card-curso cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Image/video — aspect ratio with graceful fallback */}
      <div className="card-curso__image">
        {curso.imagen && !imgError ? (
          isVideoUrl(curso.imagen) ? (
            <video
              src={resolveImageSrc(curso.imagen)}
              className="card-curso__img"
              muted
              loop
              autoPlay
              playsInline
              onError={() => setImgError(true)}
            />
          ) : (
            <img
              src={resolveImageSrc(curso.imagen)}
              alt={curso.titulo}
              className="card-curso__img"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )
        ) : (
          <div className="card-curso__placeholder" aria-hidden="true">
            {/* Floral placeholder — botanical leaf motif */}
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="card-curso__placeholder-icon"
              aria-hidden="true"
            >
              <path
                d="M32 56C32 56 14 44 14 28C14 18.06 22.06 10 32 10C41.94 10 50 18.06 50 28C50 44 32 56 32 56Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M32 10V56"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M32 32C32 32 22 26 18 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M32 38C32 38 42 32 46 24"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="card-curso__placeholder-initial">AC</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="card-curso__body">
        {/* Numbered overline label */}
        <span className="card-curso__overline">
          {String(curso.orden).padStart(2, '0')}
        </span>

        {/* Title */}
        <h2 className="card-curso__title">{curso.titulo}</h2>

        {/* Gold ornament line */}
        <div className="card-curso__ornament" aria-hidden="true" />

        {/* Description — clamped to 3 lines */}
        <p className="card-curso__description line-clamp-3">
          {curso.descripcion}
        </p>

        {/* Metadata badges */}
        {(curso.precio != null || curso.duracion || curso.modalidad) && (
          <ul className="card-curso__badges" aria-label="Detalles del curso">
            {curso.precio != null && (
              <li className="card-curso__badge card-curso__badge--price">
                {/* Euro / price icon */}
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 5.5A3 3 0 006 8a3 3 0 004 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M5 7.5h4M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {formatPrecio(curso.precio)}
              </li>
            )}
            {curso.duracion && (
              <li className="card-curso__badge card-curso__badge--duration">
                {/* Clock icon */}
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 4.5v4l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {curso.duracion}
              </li>
            )}
            {curso.modalidad && (
              <li className="card-curso__badge card-curso__badge--mode">
                {/* Location / video icon — adapts to "presencial" vs "online" feel */}
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1.5C5.52 1.5 3.5 3.52 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.48-2.02-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {curso.modalidad}
              </li>
            )}
          </ul>
        )}

        {/* CTA */}
        <Link
          to="/contact"
          className="card-curso__cta btn btn-secondary"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Solicitar información sobre ${curso.titulo}`}
        >
          Solicitar información
        </Link>
      </div>
    </article>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="cursos-empty">
      <div className="cursos-empty__icon" aria-hidden="true">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="39" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <path
            d="M40 55C40 55 26 46 26 36C26 28.27 32.27 22 40 22C47.73 22 54 28.27 54 36C54 46 40 55 40 55Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M40 22V55" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M40 38C40 38 33 33 30 27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M40 43C40 43 47 38 50 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="cursos-empty__title">Próximamente</h3>
      <p className="cursos-empty__text">
        Estamos preparando una nueva oferta formativa. Escríbeme si te interesa
        una formación a medida o quieres ser la primera en enterarte.
      </p>
      <Link to="/contact" className="btn btn-secondary cursos-empty__cta">
        Contactar
      </Link>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Cursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [selected, setCurso] = useState<Curso | null>(null);

  useEffect(() => {
    cursosApi
      .list()
      .then((data) => setCursos(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="cursos-hero" aria-label="Cursos y Talleres">
        {/* Gradient overlay */}
        <div className="cursos-hero__overlay" aria-hidden="true" />

        {/* Decorative botanical background pattern */}
        <div className="cursos-hero__pattern" aria-hidden="true">
          <svg
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="cursos-hero__pattern-svg"
          >
            <path
              d="M200 380C200 380 80 300 80 180C80 103.1 140.8 40 200 40C259.2 40 320 103.1 320 180C320 300 200 380 200 380Z"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.15"
            />
            <path d="M200 40V380" stroke="white" strokeWidth="0.5" opacity="0.1" />
            <path d="M200 200C200 200 140 165 120 120" stroke="white" strokeWidth="0.5" opacity="0.12" />
            <path d="M200 240C200 240 260 205 280 160" stroke="white" strokeWidth="0.5" opacity="0.12" />
            <circle cx="200" cy="180" r="60" stroke="white" strokeWidth="0.5" opacity="0.08" />
          </svg>
        </div>

        <div className="cursos-hero__content container-page">
          <div className="cursos-hero__inner">
            <p className="cursos-hero__overline">Formación floral</p>
            <div className="cursos-hero__ornament" aria-hidden="true" />
            <h1 className="cursos-hero__title">
              Cursos &amp; <em>Talleres</em>
            </h1>
            <p className="cursos-hero__subtitle">
              Aprende el arte floral con Ana Castellano. Talleres prácticos y
              formativos para todos los niveles.
            </p>
            <div className="cursos-hero__actions">
              <a href="#cursos-grid" className="btn btn-gold">
                Ver cursos
              </a>
              <Link to="/contact" className="btn btn-ghost-inverse">
                Formación a medida
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="hero-scroll-indicator" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ── COURSES GRID ─────────────────────────────────────────────────────── */}
      <section
        id="cursos-grid"
        className="section bg-ivory-50"
        aria-label="Listado de cursos"
      >
        <div className="container-page">
          {/* Error notice — non-blocking, shows below header */}
          {error && (
            <div className="mb-10 px-5 py-4 rounded-sm bg-blush-50 border border-blush-200 text-sm font-sans text-charcoal-700" role="alert">
              No ha sido posible cargar los cursos. Inténtalo de nuevo más
              tarde o{' '}
              <Link
                to="/contact"
                className="underline underline-offset-2"
              >
                escríbeme directamente
              </Link>
              .
            </div>
          )}

          <SectionHeader
            eyebrow="Cursos"
            title="Aprende el arte floral conmigo"
            subtitle="Formaciones diseñadas para quienes quieren descubrir, perfeccionar o profesionalizar su mirada floral."
            centered
          />

          {/* Loading skeletons — 4 cards matching the 2-column desktop grid */}
          {loading && (
            <div className="cursos-grid mt-16" aria-busy="true" aria-label="Cargando cursos">
              <CursoCardSkeleton />
              <CursoCardSkeleton />
              <CursoCardSkeleton />
              <CursoCardSkeleton />
            </div>
          )}

          {/* Empty state */}
          {!loading && cursos.length === 0 && <EmptyState />}

          {/* Courses grid */}
          {!loading && cursos.length > 0 && (
            <div className="cursos-grid mt-16">
              {cursos.map((curso) => (
                <CursoCard key={curso.id} curso={curso} onClick={() => setCurso(curso)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────────────────────── */}
      <section
        className="relative bg-charcoal-900 overflow-hidden text-center"
        aria-label="Contacto para formaciones a medida"
      >
        <div className="absolute inset-0 opacity-5" aria-hidden>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-ivory-100" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-ivory-100" />
        </div>
        <div className="relative container-page">
          <div className="cursos-cta py-24 lg:py-32">
            <div className="ornament-line mb-8" aria-hidden="true" />
            <span className="section-header__eyebrow !text-gold-300">¿Buscas algo a medida?</span>
            <h2 className="font-serif text-4xl lg:text-5xl text-ivory-50 mt-4 mb-4">
              Formaciones personalizadas
            </h2>
            <p className="text-ivory-200/70 text-lg font-light max-w-prose mx-auto">
              Cuéntame qué te gustaría aprender y diseñamos juntas un curso adaptado a ti, tu nivel y tus objetivos.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link to="/contact" className="btn btn-gold btn-lg">
                Hablar con Ana
              </Link>
              <Link to="/services" className="btn btn-ghost-inverse btn-lg">
                Ver servicios
              </Link>
            </div>
          </div>
        </div>
      </section>
      <CursoDetailModal curso={selected} onClose={() => setCurso(null)} />
    </main>
  );
}
