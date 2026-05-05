import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import type { Servicio } from '@app-types/models';

interface Props {
  servicio: Servicio | null;
  onClose: () => void;
}

import { resolveImg as resolveMedia, isVideoUrl } from '../../utils/image';

export default function ServiceDetailModal({ servicio, onClose }: Props) {
  const [activeMedia, setActiveMedia] = useState<string | null>(null);
  const [mainError, setMainError] = useState(false);
  const [thumbErrors, setThumbErrors] = useState<Record<number, boolean>>({});

  if (!servicio) return null;

  // Build gallery: service main image + service images + all block images
  const gallery: string[] = [];
  if (servicio.imagen) gallery.push(servicio.imagen);
  if (servicio.imagenes && servicio.imagenes.length > 0) {
    servicio.imagenes.forEach((url) => gallery.push(url));
  }
  servicio.bloques.forEach((b) => {
    if (b.imagenes) b.imagenes.forEach((url) => gallery.push(url));
  });

  const currentMedia = activeMedia ?? gallery[0] ?? null;
  const isCurrentVideo = currentMedia ? isVideoUrl(currentMedia) : false;
  const currentIndex = gallery.indexOf(currentMedia || '');

  const handleThumbClick = (url: string) => {
    if (url !== currentMedia) {
      setActiveMedia(url);
      setMainError(false);
    }
  };

  const navigateMedia = (direction: 'prev' | 'next') => {
    if (gallery.length <= 1) return;
    
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + gallery.length) % gallery.length
      : (currentIndex + 1) % gallery.length;
    
    setActiveMedia(gallery[newIndex]);
    setMainError(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigateMedia('prev');
      if (e.key === 'ArrowRight') navigateMedia('next');
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, gallery.length]);

  return (
    <Modal isOpen size="xl" onClose={onClose} dismissOnBackdrop title={servicio.titulo}>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Media Gallery */}
        <div className="space-y-4">
          {/* Main media area with better proportions */}
          <div className="relative bg-gradient-to-br from-sage-50 to-ivory-100 rounded-lg overflow-hidden shadow-lg"
            style={{ aspectRatio: '16/12' }}
          >
            {currentMedia && !mainError ? (
              isCurrentVideo ? (
                <video
                  key={currentMedia}
                  src={resolveMedia(currentMedia)}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  onError={() => setMainError(true)}
                />
              ) : (
                <img
                  key={currentMedia}
                  src={resolveMedia(currentMedia)}
                  alt={servicio.titulo}
                  className="w-full h-full object-cover"
                  onError={() => setMainError(true)}
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-20 h-20 text-sage-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                </svg>
              </div>
            )}

            {/* Navigation arrows */}
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => navigateMedia('prev')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all text-charcoal-700 z-10"
                  aria-label="Imagen anterior"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => navigateMedia('next')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all text-charcoal-700 z-10"
                  aria-label="Siguiente imagen"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all text-charcoal-700 z-10"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Media counter */}
            {gallery.length > 1 && (
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">
                {currentIndex + 1} / {gallery.length}
              </div>
            )}
          </div>

          {/* Thumbnail gallery - improved layout */}
          {gallery.length > 1 && (
            <div className="grid grid-cols-6 gap-2">
              {gallery.map((url, i) => {
                const isThumbVideo = isVideoUrl(url);
                const isActive = url === currentMedia;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleThumbClick(url)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      isActive
                        ? 'border-gold-400 ring-2 ring-gold-300 scale-105'
                        : 'border-ivory-200 hover:border-sage-300 hover:scale-105'
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
                        <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
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

        {/* Right: Content */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <span className="text-gold-500 font-sans text-sm uppercase tracking-widest">
              Servicio {String(servicio.orden).padStart(2, '0')}
            </span>
            <h2 className="font-serif text-3xl text-charcoal-800 mt-2 leading-tight">{servicio.titulo}</h2>
            <div className="divider-gold mt-4" />
          </div>

          {/* Description */}
          <div className="prose prose-sage">
            <p className="text-charcoal-600 leading-relaxed text-lg">{servicio.descripcion}</p>
          </div>

          {/* Blocks/Features */}
          {servicio.bloques.length > 0 && (
            <div className="bg-ivory-50 rounded-lg p-6">
              <h3 className="font-serif text-xl text-charcoal-800 mb-4">¿Qué incluye?</h3>
              <ul className="space-y-4">
                {servicio.bloques.map((b) => (
                  <li key={b.id} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-gold-400 mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-sans font-semibold text-charcoal-700 text-lg">{b.titulo}</span>
                      {b.descripcion && (
                        <p className="text-charcoal-500 text-base mt-1">{b.descripcion}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="pt-6">
            <Link
              to={`/reservations?service=${servicio.id}`}
              onClick={onClose}
              className="btn-primary w-full text-center py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Solicitar este servicio
            </Link>
            <p className="text-center text-charcoal-500 text-sm mt-3">
              Sin compromiso • Te responderé lo antes posible
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
