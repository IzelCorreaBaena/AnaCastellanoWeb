import SectionHeader from '../components/ui/SectionHeader';
import ContactForm from '../components/forms/ContactForm';

const contactInfo = [
  {
    label: 'Teléfono',
    value: '+34 612 345 678',
    href: 'tel:+34612345678',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    value: 'ana@anacastellano.com',
    href: 'mailto:ana@anacastellano.com',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    value: '@anacastellanoflorista',
    href: 'https://instagram.com/anacastellanoflorista',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: 'Pinterest',
    value: 'Ana Castellano Florista',
    href: 'https://pinterest.com/anacastellanoflorista',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
  },
];

export default function Contact() {
  return (
    <main>
      {/* Hero interior */}
      <section className="relative h-64 flex items-end bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/80 to-charcoal-900/40" />
        <div className="relative z-10 container-page pb-10">
          <p className="text-gold-400 font-sans text-sm uppercase tracking-widest mb-2">Hablemos</p>
          <h1 className="font-serif text-5xl text-white">Contacto</h1>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-content">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Info de contacto */}
            <div className="space-y-10">
              <SectionHeader
                eyebrow="Encuéntrame"
                title="Estoy aquí para escucharte"
                subtitle="Escríbeme, llámame o sígueme en redes. Respondo en menos de 24 horas."
              />

              <ul className="space-y-6">
                {contactInfo.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-4 group"
                    >
                      <span className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 group-hover:bg-sage-600 group-hover:text-white transition-colors duration-200">
                        {item.icon}
                      </span>
                      <div>
                        <p className="text-xs text-charcoal-400 uppercase tracking-wider font-sans">{item.label}</p>
                        <p className="text-charcoal-800 font-sans group-hover:text-sage-600 transition-colors">{item.value}</p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>

              <div className="border-t border-ivory-200 pt-8">
                <p className="text-xs text-charcoal-400 font-sans leading-relaxed">
                  <strong className="text-charcoal-600">Horario de atención:</strong><br />
                  Lunes a viernes, 9:00–18:00<br />
                  Sábados con cita previa
                </p>
              </div>
            </div>

            {/* Formulario */}
            <div className="bg-ivory-50 rounded-sm p-8 lg:p-10">
              <h2 className="font-serif text-2xl text-charcoal-800 mb-6">Envíame un mensaje</h2>
              <ContactForm />
              <p className="mt-6 text-xs text-charcoal-400 leading-relaxed">
                Al enviar este formulario aceptas nuestra política de privacidad. Tus datos se usarán
                exclusivamente para responder a tu consulta y nunca serán cedidos a terceros.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
