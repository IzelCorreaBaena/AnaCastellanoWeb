import { Link } from 'react-router-dom';
import SectionHeader from '../components/ui/SectionHeader';
import ReviewCard from '../components/ui/ReviewCard';

const reasons = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    titulo: 'Diseño personalizado',
    texto: 'Cada proyecto nace de una conversación. Escucho tu historia y creo algo único para ti.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    titulo: 'Atención al detalle',
    texto: 'La perfección está en los pequeños gestos: la curva de un tallo, el tono exacto del pétalo.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    titulo: 'Compromiso total',
    texto: 'Me implico en cada evento como si fuera el mío. Tu tranquilidad es mi prioridad.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    titulo: 'Experiencia probada',
    texto: 'Más de 15 años y centenares de eventos avalan cada decisión creativa que tomo.',
  },
];

const projects = [
  { titulo: 'Boda en Finca La Serena', desc: 'Decoración floral integral: altar, centro de mesa y ramo de novia en tonos melocotón y champán.' },
  { titulo: 'Gala Benéfica Palacio Real', desc: 'Instalación artística con 2.000 flores suspendidas sobre el salón principal.' },
  { titulo: 'Exposición Flores & Arte', desc: 'Esculturas florales efímeras que combinaron arte contemporáneo y botánica.' },
  { titulo: 'Inauguración Boutique Luxury', desc: 'Diseño de escaparates y ambientación floral para apertura de tienda premium en el centro.' },
];

const testimonials = [
  { nombre: 'María L.', texto: 'Ana transformó nuestra boda en un cuento de hadas. Cada rincón olía y se veía increíble. Superó todas nuestras expectativas.', evento: 'Boda, junio 2024' },
  { nombre: 'Carlos M.', texto: 'Contratar a Ana para la gala fue la mejor decisión. Profesionalidad, creatividad y puntualidad absoluta.', evento: 'Gala benéfica, noviembre 2023' },
  { nombre: 'Sofía R.', texto: 'Mi ramo de novia era exactamente lo que había soñado. Ana me escuchó y lo hizo realidad con flores preciosas.', evento: 'Boda, abril 2024' },
  { nombre: 'Elena P.', texto: 'La inauguración de nuestra boutique fue perfecta gracias a la ambientación floral. Todos los clientes preguntaban por el nombre de la florista.', evento: 'Apertura boutique, enero 2024' },
];

export default function About() {
  return (
    <main>
      {/* Hero interior */}
      <section className="relative min-h-[320px] md:min-h-[400px] flex items-end bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/60 via-charcoal-900/70 to-charcoal-900/90" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-300/30 to-transparent" aria-hidden />
        <div className="relative z-10 container-page pb-14 pt-28">
          <span className="section-header__eyebrow !text-gold-300 !mb-3 block">Conóceme</span>
          <h1 className="font-serif text-5xl lg:text-6xl text-white">Mi historia</h1>
          <div className="mt-4 w-12 h-px bg-gold-300" aria-hidden />
        </div>
      </section>

      {/* Historia */}
      <section className="section bg-white">
        <div className="container-content">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="aspect-floral bg-sage-100 rounded-sm overflow-hidden flex items-center justify-center">
                <svg className="w-20 h-20 text-sage-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="absolute -top-3 -right-3 w-24 h-24 rounded-sm border border-gold-200 -z-10" aria-hidden />
              <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-ivory-200 rounded-sm -z-10" aria-hidden />
            </div>
            <div className="space-y-6">
              <div>
                <span className="section-header__eyebrow">Sobre mí</span>
                <span className="title-ornament" />
                <h2 className="font-serif text-4xl lg:text-5xl text-charcoal-900 leading-tight">
                  Veinte años rodeada de flores
                </h2>
              </div>
              <p className="text-charcoal-700 leading-relaxed">
                Crecí entre jardines y mercados de flores. Mi abuela me enseñó que cada flor tiene una historia
                que contar, y desde entonces no he parado de escucharlas. Estudié diseño floral en Madrid y me
                formé durante tres años en talleres de Francia e Italia.
              </p>
              <p className="text-charcoal-700 leading-relaxed">
                Hoy, después de más de 15 años y centenares de eventos, sigo sintiendo la misma emoción al
                abrir una caja de flores frescas. Trabajo con productores locales y de temporada porque creo que
                la belleza sostenible es la única que perdura.
              </p>
              <p className="text-charcoal-700 leading-relaxed">
                Mi filosofía es sencilla: escuchar primero, crear después. Cada cliente me trae una historia
                diferente, y mi trabajo es traducirla en flores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Por qué elegirme */}
      <section className="section bg-ivory-50">
        <div className="container-content">
          <SectionHeader
            eyebrow="Por qué elegirme"
            title="Lo que me hace diferente"
            centered
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {reasons.map((r) => (
              <div key={r.titulo} className="text-center space-y-4 group">
                <div className="w-16 h-16 mx-auto bg-ivory-50 rounded-sm border border-ivory-300 flex items-center justify-center text-sage-500 shadow-sm group-hover:bg-sage-50 group-hover:border-sage-200 transition-colors duration-300">
                  {r.icon}
                </div>
                <h3 className="font-serif text-xl text-charcoal-800">{r.titulo}</h3>
                <p className="text-charcoal-600 text-sm leading-relaxed">{r.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proyectos destacados */}
      <section className="section bg-white">
        <div className="container-content">
          <SectionHeader eyebrow="Portfolio" title="Proyectos que me enorgullecen" centered />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((p) => (
              <div key={p.titulo} className="card-gallery group cursor-default">
                <div className="w-full h-full bg-gradient-to-br from-sage-100 to-blush-100" />
                <div className="gallery-overlay">
                  <span className="gallery-label">{p.titulo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="section bg-ivory-50">
        <div className="container-content">
          <SectionHeader eyebrow="Testimonios" title="Lo que dicen mis clientes" centered />
          <div className="grid-reviews mt-12">
            {testimonials.map((t) => (
              <ReviewCard key={t.nombre} nombre={t.nombre} texto={t.texto} evento={t.evento} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-charcoal-900 overflow-hidden text-center">
        <div className="absolute inset-0 opacity-5" aria-hidden>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-ivory-100" />
        </div>
        <div className="relative container-page py-24 lg:py-32 max-w-2xl mx-auto space-y-6">
          <div className="ornament-line mb-6" aria-hidden />
          <h2 className="font-serif text-4xl lg:text-5xl text-ivory-50">¿Empezamos a crear juntas?</h2>
          <p className="text-ivory-200/70 text-lg font-light">Cuéntame tu historia y hagamos que florezca.</p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link to="/reservations" className="btn-gold btn-lg">
              Reservar una consulta
            </Link>
            <Link to="/contact" className="btn-ghost-inverse">
              Contactar
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
