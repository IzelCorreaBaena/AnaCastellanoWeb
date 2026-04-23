import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import type { Servicio } from '@app-types/models';

interface Props {
  servicio: Servicio | null;
  onClose: () => void;
}

const API_ORIGIN = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
  : 'http://localhost:4000';
const resolveImg = (src: string) =>
  src.startsWith('http') ? src : `${API_ORIGIN}${src}`;

export default function ServiceDetailModal({ servicio, onClose }: Props) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  if (!servicio) return null;

  const bloqueImages = servicio.bloques.flatMap((b) => b.imagenes ?? []).slice(0, 6);

  return (
    <Modal isOpen size="lg" onClose={onClose} dismissOnBackdrop>
      {/* Image area */}
      <div className="relative aspect-video bg-gradient-to-br from-sage-50 to-ivory-100 rounded-sm overflow-hidden -mx-6 -mt-6 mb-6">
        {servicio.imagen && !imgErrors['main'] ? (
          <img
            src={resolveImg(servicio.imagen)}
            alt={servicio.titulo}
            className="w-full h-full object-cover"
            onError={() => setImgErrors((p) => ({ ...p, main: true }))}
          />
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
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors text-charcoal-600"
        >
          ×
        </button>
      </div>

      {/* Bloque image thumbnails */}
      {bloqueImages.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {bloqueImages.map((url, i) => (
            <div key={i} className="w-16 h-16 flex-shrink-0 rounded-sm overflow-hidden bg-ivory-100">
              {!imgErrors[`b${i}`] ? (
                <img
                  src={resolveImg(url)}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={() => setImgErrors((p) => ({ ...p, [`b${i}`]: true }))}
                />
              ) : (
                <div className="w-full h-full bg-ivory-200" />
              )}
            </div>
          ))}
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
                      {b.imagenes && b.imagenes.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {b.imagenes.map((url, i) => (
                            <div key={i} className="w-14 h-14 rounded-sm overflow-hidden bg-ivory-100">
                              <img src={resolveImg(url)} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
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
