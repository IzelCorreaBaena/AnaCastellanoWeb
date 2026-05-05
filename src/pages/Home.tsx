import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/ui/HeroSection';
import ServiceCard, { type ServiceCardData } from '../components/ui/ServiceCard';
import ReviewCard from '../components/ui/ReviewCard';
import { servicesApi } from '@services/services.api';

interface PreviewReview {
  id: string;
  nombre: string;
  evento: string;
  texto: string;
}

const fallbackServices: readonly ServiceCardData[] = [
  {
    id: '',
    titulo: 'Bodas',
    descripcion: 'Diseño floral integral para el día más importante: ramos de novia, ceremonia y banquete.',
  },
  {
    id: '',
    titulo: 'Eventos privados',
    descripcion: 'Ambientación floral para celebraciones íntimas, cumpleaños y aniversarios memorables.',
  },
  {
    id: '',
    titulo: 'Eventos corporativos',
    descripcion: 'Decoración floral profesional para presentaciones, galas e inauguraciones.',
  },
];

const testimonials: readonly PreviewReview[] = [
  {
    id: 't1',
    nombre: 'Lucía & Mario',
    evento: 'Boda en Finca El Mirador',
    texto: 'Ana entendió nuestra visión desde el primer encuentro. Cada arreglo era una pequeña obra de arte, y los invitados aún hablan del ramo de novia.',
  },
  {
    id: 't2',
    nombre: 'Carolina Méndez',
    evento: 'Aniversario familiar',
    texto: 'Trabajar con Ana es trabajar con una verdadera artista. Cuidó cada detalle y consiguió un ambiente cálido, sofisticado y muy personal.',
  },
  {
    id: 't3',
    nombre: 'Hotel Casa Botánica',
    evento: 'Decoración semanal',
    texto: 'Llevamos más de dos años confiando en Ana para las flores del lobby. Su sensibilidad estética y su compromiso son excepcionales.',
  },
];

export default function Home(): JSX.Element {
  const [featuredServices, setFeaturedServices] = useState<readonly ServiceCardData[]>(fallbackServices);

  useEffect(() => {
    let active = true;
    servicesApi
      .list()
      .then((data) => {
        if (!active || data.length === 0) return;
        setFeaturedServices(
          data.slice(0, 3).map((s) => ({
            id: s.id,
            titulo: s.titulo,
            descripcion: s.descripcion,
            bloques: s.bloques,
          })),
        );
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <HeroSection
        title="Flores que cuentan tu historia"
        subtitle="Diseño floral artístico para bodas, eventos y espacios únicos"
        ctaPrimary={{ label: 'Reserva tu cita', href: '/reservations' }}
        ctaSecondary={{ label: 'Ver servicios', href: '/services' }}
      />

      {/* Quién soy - más visual y compacto */}
      <section className="section bg-ivory-50">
        <div className="container-page">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-sage-200 to-ivory-200 shadow-lg flex items-center justify-center">
                <svg className="w-24 h-24 text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              {/* Elementos decorativos */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gold-200 rounded-full opacity-50" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blush-200 rounded-full opacity-50" />
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="inline-block px-3 py-1 bg-sage-100 text-sage-700 text-xs font-medium rounded-full mb-3">
                  Quién soy
                </span>
                <h2 className="font-serif text-3xl text-charcoal-800">Ana Castellano</h2>
              </div>
              
              <div className="space-y-3">
                <p className="text-charcoal-600 leading-relaxed">
                  Florista por vocación con más de una década creando historias únicas a través de flores artesanales.
                </p>
                <p className="text-charcoal-600 leading-relaxed">
                  Cada diseño comienza escuchando tus sueños para transformarlos en realidad floral.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-charcoal-700">10+ años</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-sage-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm font-medium text-charcoal-700">Arte floral</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-blush-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm font-medium text-charcoal-700">Diseño único</span>
                </div>
              </div>

              <Link to="/about" className="btn-primary inline-flex items-center gap-2">
                Conoce mi historia
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios destacados - más compacto */}
      <section className="section bg-white">
        <div className="container-page">
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 bg-gold-100 text-gold-700 text-xs font-medium rounded-full mb-3">
              Mis Servicios
            </span>
            <h2 className="font-serif text-3xl text-charcoal-800 mb-3">Arte floral para cada momento</h2>
            <p className="text-charcoal-600 max-w-2xl mx-auto">
              Diseños únicos que transforman tus eventos en experiencias inolvidables
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {featuredServices.map((service, idx) => (
              <ServiceCard
                key={service.id || `fallback-${idx}`}
                servicio={service}
              />
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/services" className="btn-primary">
              Explorar todos los servicios
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonios - más compacto */}
      <section className="section bg-ivory-50">
        <div className="container-page">
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 bg-sage-100 text-sage-700 text-xs font-medium rounded-full mb-3">
              Testimonios
            </span>
            <h2 className="font-serif text-3xl text-charcoal-800 mb-3">Historias de felicidad floral</h2>
            <p className="text-charcoal-600 max-w-2xl mx-auto">
              Las palabras de quienes confiaron en mi arte para sus momentos más especiales
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {testimonials.map((review) => (
              <ReviewCard
                key={review.id}
                nombre={review.nombre}
                texto={review.texto}
                evento={review.evento}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-sage-600 py-20">
        <div className="container-page text-center text-ivory-50">
          <h2 className="text-ivory-50 mb-6">¿Lista para crear algo único juntas?</h2>
          <p className="text-ivory-100 max-w-content mx-auto mb-8">
            Cuéntame tu idea y diseñemos juntas la propuesta floral que merece tu evento.
          </p>
          <Link to="/reservations" className="btn-gold">
            Reservar ahora
          </Link>
        </div>
      </section>
    </>
  );
}
