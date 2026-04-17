import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesApi } from '@services/services.api';
import type { Servicio } from '@app-types/models';
import SectionHeader from '../components/ui/SectionHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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
            <div className="mt-16 space-y-24">
              {services.map((servicio, idx) => (
                <div key={servicio.id} className={`grid lg:grid-cols-2 gap-12 items-start ${idx % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                  {/* Imagen/visual */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-sage-50 to-ivory-100 rounded-sm flex items-center justify-center overflow-hidden relative">
                    
                    {/* Si HAY imagen, muestra la foto */}
                    {servicio.imagen && (
                      <img
                        src={servicio.imagen?.startsWith('http') ? servicio.imagen : `http://localhost:4000${servicio.imagen}`}
                        alt={servicio.titulo}
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}

                    {/* Si NO hay imagen, muestra la montañita */}
                    {!servicio.imagen && (
                      <svg className="w-16 h-16 text-sage-200 relative z-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
                      </svg>
                    )}
                    
                  </div>

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
    </main>
  );
}
