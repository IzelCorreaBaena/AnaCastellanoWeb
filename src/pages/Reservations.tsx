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
      <section className="relative h-64 flex items-end bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/80 to-charcoal-900/40" />
        <div className="relative z-10 container-page pb-10">
          <p className="text-gold-400 font-sans text-sm uppercase tracking-widest mb-2">Empecemos</p>
          <h1 className="font-serif text-5xl text-white">Solicita tu reserva</h1>
        </div>
      </section>

      {/* Pasos del proceso */}
      <section className="section bg-ivory-50">
        <div className="container-content">
          <SectionHeader eyebrow="Proceso" title="Así de sencillo" centered />
          <div className="mt-10 grid sm:grid-cols-3 gap-8">
            {steps.map((s, idx) => (
              <div key={s.n} className="text-center relative">
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-[60%] w-full h-px bg-gold-200" />
                )}
                <div className="w-12 h-12 rounded-full bg-sage-600 text-white font-serif text-lg flex items-center justify-center mx-auto mb-4 relative z-10">
                  {s.n}
                </div>
                <h3 className="font-serif text-xl text-charcoal-800 mb-2">{s.titulo}</h3>
                <p className="text-charcoal-500 text-sm">{s.desc}</p>
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
          <div className="mt-10 bg-ivory-50 rounded-sm p-8 lg:p-12">
            <ReservationForm initialServiceId={initialServiceId} />
          </div>
        </div>
      </section>
    </main>
  );
}
