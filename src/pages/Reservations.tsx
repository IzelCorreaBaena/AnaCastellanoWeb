import { useSearchParams } from 'react-router-dom';
import SectionHeader from '../components/ui/SectionHeader';
import ReservationForm from '../components/forms/ReservationForm';

const steps = [
  { n: '01', titulo: 'Solicita tu cita', desc: 'Rellena el formulario con los detalles de tu evento.' },
  { n: '02', titulo: 'Te contactamos', desc: 'En menos de 24 h Ana se pondrá en contacto contigo.' },
  { n: '03', titulo: 'Confirmamos', desc: 'Acordamos los detalles y confirmamos la reserva.' },
];

export default function Reservations() {
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get('service') ?? undefined;

  return (
    <main>
      {/* Hero interior */}
      <section className="relative min-h-[280px] md:min-h-[340px] flex items-end bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/60 via-charcoal-900/70 to-charcoal-900/90" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-300/30 to-transparent" aria-hidden />
        <div className="relative z-10 container-page pb-12 pt-28">
          <span className="section-header__eyebrow !text-gold-300 !mb-3 block">Empecemos</span>
          <h1 className="font-serif text-5xl lg:text-6xl text-white">Solicita tu reserva</h1>
          <div className="mt-4 w-12 h-px bg-gold-300" aria-hidden />
        </div>
      </section>

      {/* Pasos del proceso */}
      <section className="section bg-ivory-50">
        <div className="container-content">
          <SectionHeader eyebrow="Proceso" title="Así de sencillo" centered />
          <div className="mt-12 grid sm:grid-cols-3 gap-10">
            {steps.map((s, idx) => (
              <div key={s.n} className="text-center relative">
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-7 left-[60%] w-full h-px bg-gradient-to-r from-gold-300 to-gold-200/30" />
                )}
                <div className="w-14 h-14 rounded-full bg-charcoal-900 text-gold-300 font-serif text-lg flex items-center justify-center mx-auto mb-5 relative z-10 ring-4 ring-ivory-50">
                  {s.n}
                </div>
                <h3 className="font-serif text-xl text-charcoal-800 mb-2">{s.titulo}</h3>
                <p className="text-charcoal-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section className="section bg-white">
        <div className="container-content max-w-2xl">
          <SectionHeader
            eyebrow="Formulario"
            title="Cuéntame tu proyecto"
            subtitle="Completa los datos y te respondo en menos de 24 horas."
            centered
          />
          <div className="mt-10 bg-ivory-50 border border-ivory-300 rounded-sm p-8 lg:p-12 shadow-sm">
            <ReservationForm initialServiceId={initialServiceId} />
          </div>
        </div>
      </section>
    </main>
  );
}
