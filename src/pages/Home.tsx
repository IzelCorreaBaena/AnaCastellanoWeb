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
        subtitle="Diseño floral artístico para bodas, eventos y espacios únicos"
        ctaPrimary={{ label: 'Reserva tu cita', href: '/reservations' }}
        ctaSecondary={{ label: 'Ver servicios', href: '/services' }}
      />

      {/* Quién soy */}
      <section className="section bg-ivory-50">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="aspect-square w-full rounded-2xl bg-sage-100 shadow-sm" aria-hidden />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sage-600 mb-4">Quién soy</p>
            <h2 className="mb-6">Ana Castellano</h2>
            <p className="text-charcoal-700 mb-4">
              Soy florista por vocación y artesana del detalle. Llevo más de una década dando forma a
              historias a través de las flores: desde bodas íntimas en el campo hasta grandes
              celebraciones corporativas.
            </p>
            <p className="text-charcoal-700 mb-8">
              Cada proyecto comienza con una conversación. Escuchar lo que sueñas es el primer paso
              para componer algo que solo pueda ser tuyo.
            </p>
            <Link to="/about" className="btn-ghost">
              Conoce mi historia
            </Link>
          </div>
        </div>
      </section>

      {/* Servicios destacados */}
      <section className="section bg-ivory-100">
        <div className="container-page">
          <SectionHeader
            eyebrow="Mis Servicios"
            title="Arte floral para cada momento"
            centered
          />
          <div className="grid gap-6 sm:grid-cols-2 mt-12">
            {featuredServices.map((service, idx) => (
              <ServiceCard
                key={service.id || `fallback-${idx}`}
                servicio={service}
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/services" className="btn-primary">
              Ver todos los servicios
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="section bg-ivory-100">
        <div className="container-page">
          <SectionHeader
            eyebrow="Testimonios"
            title="Lo que dicen quienes ya confiaron en mí"
            centered
          />
          <div className="grid gap-6 md:grid-cols-3 mt-12">
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
