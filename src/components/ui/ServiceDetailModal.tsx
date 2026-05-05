import { useState } from 'react';
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

  const handleThumbClick = (url: string) => {
    if (url !== currentMedia) {
      setActiveMedia(url);
      setMainError(false);
    }
  };

  return (
    <Modal isOpen size="lg" onClose={onClose} dismissOnBackdrop title={servicio.titulo}>
      {/* Main media area */}
      <div className="relative bg-gradient-to-br from-sage-50 to-ivory-100 rounded-sm overflow-hidden -mx-6 -mt-6 mb-4"
        style={{ aspectRatio: '4/3' }}
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
            <svg className="w-16 h-16 text-sage-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
            </svg>
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors text-charcoal-600 z-10"
        >
          ×
        </button>
      </div>

      {/* Thumbnail gallery — shown when there are multiple media items */}
      {gallery.length > 1 && (
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 mb-5">
          {gallery.map((url, i) => {
            const isThumbVideo = isVideoUrl(url);
            const isActive = url === currentMedia;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleThumbClick(url)}
                className={`relative aspect-square rounded-sm overflow-hidden border-2 transition-all ${
                  isActive
                    ? 'border-gold-400 ring-1 ring-gold-300'
                    : 'border-transparent hover:border-ivory-300'
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

      {/* Content */}
      <div className="space-y-4">
        <div>
          <span className="text-gold-500 font-sans text-xs uppercase tracking-widest">
            {String(servicio.orden).padStart(2, '0')}
          </span>
          <h2 className="font-serif text-2xl text-charcoal-800 mt-1">{servicio.titulo}</h2>
          <div className="divider-gold mt-3" />
        </div>

        <p className="text-charcoal-600 leading-relaxed">{servicio.descripcion}</p>

        {servicio.bloques.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-charcoal-400 font-sans mb-3">Incluye</p>
            <ul className="space-y-3">
              {servicio.bloques.map((b) => (
                <li key={b.id}>
                  <div className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage-400 mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-sans font-medium text-charcoal-700">{b.titulo}</span>
                      {b.descripcion && (
                        <span className="text-charcoal-500 text-sm"> — {b.descripcion}</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4 border-t border-ivory-100">
          <Link
            to={`/reservations?service=${servicio.id}`}
            onClick={onClose}
            className="btn-primary inline-block w-full text-center"
          >
            Solicitar este servicio
          </Link>
        </div>
      </div>
    </Modal>
  );
}
