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
      <section className="relative h-72 md:h-96 flex items-end bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/80 to-charcoal-900/40" />
        <div className="relative z-10 container-page pb-12">
          <p className="text-gold-400 font-sans text-sm uppercase tracking-widest mb-2">Conóceme</p>
          <h1 className="font-serif text-5xl text-white">Mi historia</h1>
        </div>
      </section>

      {/* Historia */}
      <section className="section bg-white">
        <div className="container-content">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="aspect-[4/5] bg-sage-100 rounded-sm flex items-center justify-center">
              <svg className="w-20 h-20 text-sage-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="space-y-6">
              <SectionHeader eyebrow="Sobre mí" title="Veinte años rodeada de flores" />
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
              <div key={r.titulo} className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-sage-100 flex items-center justify-center text-sage-600">
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
              <div key={p.titulo} className="group cursor-default">
                <div className="aspect-square bg-sage-50 rounded-sm mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-sage-100 to-blush-100 group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h4 className="font-serif text-lg text-charcoal-800 mb-1">{p.titulo}</h4>
                <p className="text-charcoal-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="section bg-ivory-100">
        <div className="container-content">
          <SectionHeader eyebrow="Testimonios" title="Lo que dicen mis clientes" centered />
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <ReviewCard key={t.nombre} nombre={t.nombre} texto={t.texto} evento={t.evento} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-sage-600 text-white text-center">
        <div className="container-content max-w-2xl space-y-6">
          <h2 className="font-serif text-4xl">¿Empezamos a crear juntas?</h2>
          <p className="text-sage-100 text-lg">Cuéntame tu historia y hagamos que florezca.</p>
          <Link to="/reservations" className="btn-primary bg-white text-sage-700 hover:bg-ivory-100 inline-block">
            Reservar una consulta
          </Link>
        </div>
      </section>
    </main>
  );
}
