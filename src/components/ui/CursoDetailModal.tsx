import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import type { Curso } from '@app-types/models';

interface Props {
  curso: Curso | null;
  onClose: () => void;
}

import { resolveImg as resolveMedia, isVideoUrl } from '../../utils/image';

const formatPrecio = (precio: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(precio);

export default function CursoDetailModal({ curso, onClose }: Props) {
  const [activeMedia, setActiveMedia] = useState<string | null>(null);
  const [mainError, setMainError] = useState(false);
  const [thumbErrors, setThumbErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!curso) return;
    const first = curso.imagenes?.filter(Boolean)[0] ?? curso.imagen ?? null;
    setActiveMedia(first);
    setMainError(false);
    setThumbErrors({});
  }, [curso]);

  if (!curso) return null;

  const allMedia =
    (curso.imagenes?.filter(Boolean) ?? []).length > 0
      ? curso.imagenes!.filter(Boolean)
      : curso.imagen
      ? [curso.imagen]
      : [];

  const isCurrentVideo = activeMedia ? isVideoUrl(activeMedia) : false;

  return (
    <Modal isOpen size="xl" onClose={onClose} dismissOnBackdrop>
      {/*
        Two-column layout: media left (55%), info right (45%).
        On mobile (< sm) stacks vertically.
        Negative margins cancel the modal__body padding so the image
        bleeds to the modal edges.
      */}
      <div className="flex flex-col sm:flex-row -mx-8 -my-6">

        {/* ── LEFT: Media ─────────────────────────────────────────── */}
        <div className="sm:w-[55%] flex-shrink-0 bg-gradient-to-br from-sage-50 to-ivory-200 flex flex-col overflow-hidden">

          {/* Main image / video */}
          <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
            {activeMedia && !mainError ? (
              isCurrentVideo ? (
                <video
                  key={activeMedia}
                  src={resolveMedia(activeMedia)}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  onError={() => setMainError(true)}
                />
              ) : (
                <img
                  key={activeMedia}
                  src={resolveMedia(activeMedia)}
                  alt={curso.titulo}
                  className="w-full h-full object-cover"
                  onError={() => setMainError(true)}
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-16 h-16 text-sage-200"
                >
                  <path
                    d="M32 56C32 56 14 44 14 28C14 18.06 22.06 10 32 10C41.94 10 50 18.06 50 28C50 44 32 56 32 56Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M32 10V56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {allMedia.length > 1 && (
            <div className="grid grid-cols-5 gap-1 p-2 border-t border-ivory-300 bg-ivory-50">
              {allMedia.map((url, i) => {
                const isThumbVideo = isVideoUrl(url);
                const isActive = url === activeMedia;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (url !== activeMedia) {
                        setActiveMedia(url);
                        setMainError(false);
                      }
                    }}
                    className={`relative aspect-square overflow-hidden rounded-sm border-2 transition-all ${
                      isActive
                        ? 'border-gold-400'
                        : 'border-transparent hover:border-ivory-400'
                    }`}
                  >
                    {!thumbErrors[i] ? (
                      isThumbVideo ? (
                        <video
                          src={resolveMedia(url)}
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                          onError={() => setThumbErrors((p) => ({ ...p, [i]: true }))}
                        />
                      ) : (
                        <img
                          src={resolveMedia(url)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={() => setThumbErrors((p) => ({ ...p, [i]: true }))}
                        />
                      )
                    ) : (
                      <div className="w-full h-full bg-ivory-200" />
                    )}
                    {isThumbVideo && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center">
                          <svg width="8" height="8" viewBox="0 0 10 10" fill="white">
                            <path d="M2 1.5l7 3.5-7 3.5V1.5z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Content ──────────────────────────────────────── */}
        <div className="flex-1 flex flex-col p-6 sm:p-8 relative min-h-0">

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-ivory-200 hover:bg-ivory-300 flex items-center justify-center text-charcoal-500 transition-colors text-lg leading-none"
          >
            ×
          </button>

          {/* Header */}
          <div className="pr-10 mb-4">
            <span className="text-gold-500 font-sans text-xs uppercase tracking-widest">
              {String(curso.orden).padStart(2, '0')}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal-800 mt-1 leading-tight">
              {curso.titulo}
            </h2>
            <div className="divider-gold mt-3" />
          </div>

          {/* Description */}
          <p className="text-charcoal-600 text-sm leading-relaxed flex-1">
            {curso.descripcion}
          </p>

          {/* Metadata badges */}
          {(curso.precio != null || curso.duracion || curso.modalidad) && (
            <ul className="flex flex-wrap gap-2 mt-5" aria-label="Detalles del curso">
              {curso.precio != null && (
                <li className="card-curso__badge card-curso__badge--price">
                  {formatPrecio(curso.precio)}
                </li>
              )}
              {curso.duracion && (
                <li className="card-curso__badge card-curso__badge--duration">
                  {curso.duracion}
                </li>
              )}
              {curso.modalidad && (
                <li className="card-curso__badge card-curso__badge--mode">
                  {curso.modalidad}
                </li>
              )}
            </ul>
          )}

          {/* CTA */}
          <div className="mt-6 pt-4 border-t border-ivory-200">
            <Link
              to="/contact"
              onClick={onClose}
              className="btn-primary block w-full text-center"
            >
              Solicitar información
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
