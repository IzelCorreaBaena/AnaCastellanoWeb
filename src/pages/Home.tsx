import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/ui/HeroSection';
import SectionHeader from '../components/ui/SectionHeader';
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
        subtitle="Diseño floral artístico para bodas, eventos y espacios únicos. Cada creación es una obra de arte efímera, pensada para hacer inolvidable tu momento."
        eyebrow="Ana Castellano Florista"
        ctaPrimary={{ label: 'Reserva tu cita', href: '/reservations' }}
        ctaSecondary={{ label: 'Ver servicios', href: '/services' }}
      />

      {/* Quién soy */}
      <section className="section bg-ivory-50">
        <div className="container-page">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image area */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-sm bg-gradient-to-br from-sage-100 via-ivory-200 to-blush-100 shadow-md overflow-hidden flex items-center justify-center">
                <svg className="w-28 h-28 text-sage-300/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-3 -right-3 w-24 h-24 rounded-sm border border-gold-200 -z-10" />
              <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-sage-100 rounded-sm -z-10" />
            </div>

            <div className="space-y-6">
              <div>
                <span className="section-header__eyebrow">Quién soy</span>
                <span className="title-ornament" />
                <h2 className="font-serif text-4xl lg:text-5xl text-charcoal-900 leading-tight">
                  Ana Castellano
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-charcoal-600 leading-relaxed text-lg font-light">
                  Florista por vocación con más de una década creando historias únicas a través de flores artesanales.
                </p>
                <p className="text-charcoal-600 leading-relaxed">
                  Cada diseño comienza escuchando tus sueños para transformarlos en realidad floral. Mi filosofía es simple: escuchar primero, crear después.
                </p>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-8 py-4 border-t border-b border-ivory-300">
                <div>
                  <span className="font-serif text-3xl text-sage-500">15+</span>
                  <span className="block text-xs uppercase tracking-[0.15em] text-charcoal-400 font-sans mt-1">Años de experiencia</span>
                </div>
                <div>
                  <span className="font-serif text-3xl text-sage-500">500+</span>
                  <span className="block text-xs uppercase tracking-[0.15em] text-charcoal-400 font-sans mt-1">Eventos realizados</span>
                </div>
                <div>
                  <span className="font-serif text-3xl text-sage-500">100%</span>
                  <span className="block text-xs uppercase tracking-[0.15em] text-charcoal-400 font-sans mt-1">Diseño artesanal</span>
                </div>
              </div>

              <Link to="/about" className="btn-secondary inline-flex items-center gap-2">
                Conoce mi historia
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios destacados */}
      <section className="section bg-white">
        <div className="container-page">
          <SectionHeader
            eyebrow="Mis Servicios"
            title="Arte floral para cada momento"
            subtitle="Diseños únicos que transforman tus eventos en experiencias inolvidables."
            centered
          />

          <div className="grid-services mt-12">
            {featuredServices.map((service, idx) => (
              <ServiceCard
                key={service.id || `fallback-${idx}`}
                servicio={service}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services" className="btn-secondary">
              Explorar todos los servicios
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="section bg-ivory-50">
        <div className="container-page">
          <SectionHeader
            eyebrow="Testimonios"
            title="Historias de felicidad floral"
            subtitle="Las palabras de quienes confiaron en mi arte para sus momentos más especiales."
            centered
          />

          <div className="grid-reviews mt-12">
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
      <section className="relative bg-charcoal-900 overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-5" aria-hidden>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-ivory-100" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-ivory-100" />
        </div>

        <div className="relative container-page text-center py-24 lg:py-32">
          <div className="ornament-line mb-8" aria-hidden />
          <span className="section-header__eyebrow !text-gold-300">Tu evento merece lo mejor</span>
          <h2 className="font-serif text-4xl lg:text-5xl text-ivory-50 mt-4 mb-6">
            ¿Lista para crear algo único juntas?
          </h2>
          <p className="text-ivory-200/70 max-w-content mx-auto mb-10 text-lg font-light">
            Cuéntame tu idea y diseñemos juntas la propuesta floral que merece tu evento.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/reservations" className="btn-gold btn-lg">
              Reservar ahora
            </Link>
            <Link to="/contact" className="btn-ghost-inverse btn-lg">
              Hablar con Ana
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
