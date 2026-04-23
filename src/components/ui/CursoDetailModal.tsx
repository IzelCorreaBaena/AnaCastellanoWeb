import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import type { Curso } from '@app-types/models';

interface Props {
  curso: Curso | null;
  onClose: () => void;
}

const API_ORIGIN = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
  : 'http://localhost:4000';
const resolveImg = (src: string) =>
  src.startsWith('http') ? src : `${API_ORIGIN}${src}`;

const formatPrecio = (precio: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(precio);

export default function CursoDetailModal({ curso, onClose }: Props) {
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!curso) return;
    const imgs = curso.imagenes?.filter(Boolean) ?? [];
    setActiveImg(imgs[0] ?? curso.imagen ?? null);
    setImgError(false);
  }, [curso]);

  if (!curso) return null;

  const allImages = (curso.imagenes?.filter(Boolean) ?? []).length > 0
    ? curso.imagenes!.filter(Boolean)
    : curso.imagen ? [curso.imagen] : [];

  return (
    <Modal isOpen size="lg" onClose={onClose} dismissOnBackdrop>
      {/* Imagen principal */}
      <div className="relative aspect-video bg-gradient-to-br from-sage-50 to-ivory-100 rounded-sm overflow-hidden -mx-6 -mt-6 mb-4">
        {activeImg && !imgError ? (
          <img
            src={resolveImg(activeImg)}
            alt={curso.titulo}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-sage-200">
              <path d="M32 56C32 56 14 44 14 28C14 18.06 22.06 10 32 10C41.94 10 50 18.06 50 28C50 44 32 56 32 56Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M32 10V56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

      {/* Miniaturas si hay más de 1 imagen */}
      {allImages.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {allImages.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setActiveImg(url); setImgError(false); }}
              className={`w-14 h-14 flex-shrink-0 rounded-sm overflow-hidden border-2 transition-colors ${activeImg === url ? 'border-gold-400' : 'border-transparent'}`}
            >
              <img src={resolveImg(url)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Contenido */}
      <div className="space-y-4">
        <div>
          <span className="text-gold-500 font-sans text-xs uppercase tracking-widest">
            {String(curso.orden).padStart(2, '0')}
          </span>
          <h2 className="font-serif text-2xl text-charcoal-800 mt-1">{curso.titulo}</h2>
          <div className="divider-gold mt-3" />
        </div>

        <p className="text-charcoal-600 leading-relaxed">{curso.descripcion}</p>

        {(curso.precio != null || curso.duracion || curso.modalidad) && (
          <ul className="flex flex-wrap gap-2" aria-label="Detalles del curso">
            {curso.precio != null && (
              <li className="card-curso__badge card-curso__badge--price">{formatPrecio(curso.precio)}</li>
            )}
            {curso.duracion && (
              <li className="card-curso__badge card-curso__badge--duration">{curso.duracion}</li>
            )}
            {curso.modalidad && (
              <li className="card-curso__badge card-curso__badge--mode">{curso.modalidad}</li>
            )}
          </ul>
        )}

        <div className="pt-4 border-t border-ivory-100">
          <Link
            to="/contact"
            onClick={onClose}
            className="btn-primary inline-block w-full text-center"
          >
            Solicitar información
          </Link>
        </div>
      </div>
    </Modal>
  );
}
