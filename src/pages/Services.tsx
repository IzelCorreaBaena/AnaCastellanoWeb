import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesApi } from '@services/services.api';
import type { Servicio } from '@app-types/models';
import ServiceDetailModal from '../components/ui/ServiceDetailModal';
import SectionHeader from '../components/ui/SectionHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const FALLBACK_DATE = '2024-01-01T00:00:00.000Z';

import { resolveImg, isVideoUrl } from '../utils/image';

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

export default function Services() {
  const [services, setServices] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<Servicio | null>(null);

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
      <section className="relative h-64 flex items-end bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/80 to-charcoal-900/40" />
        <div className="relative z-10 container-page pb-10">
          <p className="text-gold-400 font-sans text-sm uppercase tracking-widest mb-2">Lo que ofrezco</p>
          <h1 className="font-serif text-5xl text-white">Servicios</h1>
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
            <div className="mt-8">
              {/* Grid visual de servicios */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((servicio) => (
                  <div
                    key={servicio.id}
                    className="group cursor-pointer bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                    onClick={() => setSelected(servicio)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelected(servicio)}
                    aria-label={`Ver detalle de ${servicio.titulo}`}
                  >
                    {/* Imagen principal */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-sage-50 to-ivory-100 overflow-hidden relative">
                      {(() => {
                        const imageSource = servicio.imagen || servicio.imagenes?.[0];
                        if (!imageSource) {
                          return (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-12 h-12 text-sage-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                              </svg>
                            </div>
                          );
                        }
                        
                        if (isVideoUrl(imageSource)) {
                          return (
                            <video
                              src={resolveImg(imageSource)}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              autoPlay
                              playsInline
                              onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none'; }}
                            />
                          );
                        }
                        
                        return (
                          <img
                            src={resolveImg(imageSource)}
                            alt={servicio.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        );
                      })()}

                      {/* Indicador de múltiples imágenes */}
                      {servicio.imagenes && servicio.imagenes.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          +{servicio.imagenes.length - 1}
                        </div>
                      )}

                      {/* Overlay en hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Contenido compacto */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="text-gold-500 font-sans text-xs uppercase tracking-widest block">
                            {String(servicio.orden).padStart(2, '0')}
                          </span>
                          <h3 className="font-serif text-lg text-charcoal-800 mt-1 truncate">{servicio.titulo}</h3>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-sage-100 text-sage-700 rounded-full">
                            {servicio.bloques.length} {servicio.bloques.length === 1 ? 'bloque' : 'bloques'}
                          </span>
                        </div>
                      </div>

                      {/* Tags visuales de los bloques */}
                      {servicio.bloques.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {servicio.bloques.slice(0, 3).map((bloque) => (
                            <span key={bloque.id} className="inline-block px-2 py-1 text-xs bg-ivory-100 text-charcoal-600 rounded">
                              {bloque.titulo}
                            </span>
                          ))}
                          {servicio.bloques.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs bg-charcoal-100 text-charcoal-500 rounded">
                              +{servicio.bloques.length - 3} más
                            </span>
                          )}
                        </div>
                      )}

                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(servicio); }}
                        className="w-full btn-primary text-sm py-2"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sección de características visuales */}
              <div className="mt-16 bg-ivory-50 rounded-xl p-8">
                <div className="text-center mb-8">
                  <h2 className="font-serif text-2xl text-charcoal-800 mb-2">Servicios Florales Premium</h2>
                  <p className="text-charcoal-600">Diseño único para cada momento especial</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <h3 className="font-serif text-lg text-charcoal-800 mb-2">Personalización</h3>
                    <p className="text-charcoal-600 text-sm">Cada diseño adaptado a tu estilo y visión única</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-serif text-lg text-charcoal-800 mb-2">Calidad</h3>
                    <p className="text-charcoal-600 text-sm">Flores frescas seleccionadas con esmero</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blush-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blush-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="font-serif text-lg text-charcoal-800 mb-2">Pasión</h3>
                    <p className="text-charcoal-600 text-sm">Dedicación y amor en cada detalle floral</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-ivory-100 text-center">
        <div className="container-content max-w-2xl space-y-6">
          <SectionHeader
            eyebrow="¿Tienes dudas?"
            title="Hablemos sin compromiso"
            subtitle="Cuéntame tu proyecto y te preparo una propuesta personalizada."
            centered
          />
          <Link to="/contact" className="btn-secondary inline-block">
            Contactar ahora
          </Link>
        </div>
      </section>

      <ServiceDetailModal servicio={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
