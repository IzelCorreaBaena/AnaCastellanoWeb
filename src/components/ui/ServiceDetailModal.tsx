import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import type { Servicio } from '@app-types/models';
import { resolveImg as resolveMedia, isVideoUrl } from '../../utils/image';

interface Props {
  servicio: Servicio | null;
  onClose: () => void;
}

// ── Arrow button ──────────────────────────────────────────────────────────────
function ArrowBtn({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label={dir === 'prev' ? 'Imagen anterior' : 'Imagen siguiente'}
      className={`absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center
        w-9 h-9 rounded-full bg-black/30 hover:bg-black/55 text-white transition-colors
        ${dir === 'prev' ? 'left-2' : 'right-2'}`}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
        {dir === 'prev'
          ? <path d="M11 4L6 9L11 14" />
          : <path d="M7 4L12 9L7 14" />}
      </svg>
    </button>
  );
}

export default function ServiceDetailModal({ servicio, onClose }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mediaErrors, setMediaErrors] = useState<Set<number>>(new Set());
  const [thumbErrors, setThumbErrors] = useState<Record<number, boolean>>({});
  const touchStartX = useRef(0);

  // Reset when service changes
  useEffect(() => {
    setActiveIndex(0);
    setMediaErrors(new Set());
    setThumbErrors({});
  }, [servicio]);

  if (!servicio) return null;

  // Build gallery: service main image + service images array + all block images
  const gallery: string[] = [];
  if (servicio.imagen) gallery.push(servicio.imagen);
  if (servicio.imagenes && servicio.imagenes.length > 0) {
    servicio.imagenes.forEach((url) => {
      if (url !== servicio.imagen) gallery.push(url); // avoid duplicating main imagen
    });
  }
  servicio.bloques.forEach((b) => {
    if (b.imagenes) b.imagenes.forEach((url) => gallery.push(url));
  });

  const total      = gallery.length;
  const multiMedia = total > 1;

  const activeUrl = gallery[activeIndex] ?? null;
  const isVideo   = activeUrl ? isVideoUrl(activeUrl) : false;
  const hasError  = mediaErrors.has(activeIndex);

  const goPrev = () => setActiveIndex((i) => (i - 1 + total) % total);
  const goNext = () => setActiveIndex((i) => (i + 1) % total);
  const goTo   = (i: number) => { setActiveIndex(i); setMediaErrors(new Set()); };

  const markError = () => setMediaErrors((prev) => new Set(prev).add(activeIndex));

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) dx < 0 ? goNext() : goPrev();
  };

  return (
    <Modal isOpen size="xl" onClose={onClose} dismissOnBackdrop>
      {/*
        Desktop (sm+): two columns — media left 55%, info right 45%.
        Mobile: stacked — media top full-width, info below scrollable.
        Negative margins cancel modal__body padding (1.5rem 2rem).
      */}
      <div className="flex flex-col sm:flex-row -mx-8 -my-6">

        {/* ── LEFT / TOP: Media ─────────────────────────────────────── */}
        <div className="sm:w-[55%] flex-shrink-0 bg-gradient-to-br from-sage-50 to-ivory-200 flex flex-col">

          {/* Main image / video */}
          <div
            className="relative w-full select-none"
            style={{ aspectRatio: '4/3' }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {activeUrl && !hasError ? (
              isVideo ? (
                <video
                  key={activeUrl}
                  src={resolveMedia(activeUrl)}
                  className="w-full h-full object-cover animate-fade-in"
                  controls
                  playsInline
                  onError={markError}
                />
              ) : (
                <img
                  key={activeUrl}
                  src={resolveMedia(activeUrl)}
                  alt={servicio.titulo}
                  className="w-full h-full object-cover animate-fade-in"
                  draggable={false}
                  onError={markError}
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sage-200">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                </svg>
              </div>
            )}

            {/* Prev / Next arrows */}
            {multiMedia && !isVideo && (
              <>
                <ArrowBtn dir="prev" onClick={goPrev} />
                <ArrowBtn dir="next" onClick={goNext} />
              </>
            )}

            {/* Counter badge */}
            {multiMedia && (
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/35 text-white text-xs font-sans tabular-nums">
                {activeIndex + 1} / {total}
              </span>
            )}
          </div>

          {/* Dot indicators — mobile only */}
          {multiMedia && (
            <div className="flex justify-center gap-1.5 py-2.5 sm:hidden">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ir a imagen ${i + 1}`}
                  className={`rounded-full transition-all duration-200 ${
                    i === activeIndex
                      ? 'w-4 h-1.5 bg-gold-400'
                      : 'w-1.5 h-1.5 bg-charcoal-300'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Thumbnail strip — desktop only */}
          {multiMedia && (
            <div className="hidden sm:grid grid-cols-5 gap-1 p-2 border-t border-ivory-300 bg-ivory-50">
              {gallery.map((url, i) => {
                const isThumbVideo = isVideoUrl(url);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    className={`relative aspect-square overflow-hidden rounded-sm border-2 transition-all ${
                      i === activeIndex ? 'border-gold-400' : 'border-transparent hover:border-ivory-400'
                    }`}
                  >
                    {!thumbErrors[i] ? (
                      isThumbVideo ? (
                        <video src={resolveMedia(url)} className="w-full h-full object-cover" muted preload="metadata"
                          onError={() => setThumbErrors((p) => ({ ...p, [i]: true }))} />
                      ) : (
                        <img src={resolveMedia(url)} alt="" className="w-full h-full object-cover"
                          onError={() => setThumbErrors((p) => ({ ...p, [i]: true }))} />
                      )
                    ) : (
                      <div className="w-full h-full bg-ivory-200" />
                    )}
                    {isThumbVideo && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center">
                          <svg width="7" height="7" viewBox="0 0 10 10" fill="white"><path d="M2 1.5l7 3.5-7 3.5V1.5z" /></svg>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT / BOTTOM: Info ──────────────────────────────────── */}
        <div className="flex-1 flex flex-col p-6 sm:p-8 relative overflow-y-auto">

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-ivory-200 hover:bg-ivory-300 flex items-center justify-center text-charcoal-500 transition-colors text-xl leading-none flex-shrink-0"
          >
            ×
          </button>

          {/* Header */}
          <div className="pr-10 mb-4">
            <span className="text-gold-500 font-sans text-xs uppercase tracking-widest">
              {String(servicio.orden).padStart(2, '0')}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal-800 mt-1 leading-tight">
              {servicio.titulo}
            </h2>
            <div className="divider-gold mt-3" />
          </div>

          {/* Description */}
          <p className="text-charcoal-600 text-sm leading-relaxed">
            {servicio.descripcion}
          </p>

          {/* Bloques list */}
          {servicio.bloques.length > 0 && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-widest text-charcoal-400 font-sans mb-3">
                Incluye
              </p>
              <ul className="space-y-2 flex-1">
                {servicio.bloques.map((b) => (
                  <li key={b.id} className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="font-sans font-medium text-charcoal-700 text-sm">{b.titulo}</span>
                      {b.descripcion && (
                        <span className="text-charcoal-500 text-sm"> — {b.descripcion}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="mt-6 pt-4 border-t border-ivory-200">
            <Link
              to={`/reservations?service=${servicio.id}`}
              onClick={onClose}
              className="btn-primary block w-full text-center"
            >
              Solicitar este servicio
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
