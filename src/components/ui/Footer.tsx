import { Link } from 'react-router-dom';

interface FooterProps {
  email?: string;
  phone?: string;
  instagram?: string;
  pinterest?: string;
}

export default function Footer({
  email = 'hola@anacastellano.com',
  phone = '+34 600 000 000',
  instagram = 'https://instagram.com/anacastellano',
  pinterest = 'https://pinterest.com/anacastellano',
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal-900 text-ivory-100">
      <div className="max-w-section mx-auto px-6 py-16 grid gap-12 md:grid-cols-3">
        {/* Brand */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl text-ivory-50">Ana Castellano</span>
            <span className="text-xs uppercase tracking-[0.25em] text-gold-300">
              Florista
            </span>
          </div>
          <p className="mt-4 text-sm text-ivory-200/80 leading-relaxed max-w-xs">
            Diseño floral artesanal para bodas, eventos y momentos que merecen ser
            recordados.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="font-serif text-lg text-ivory-50 mb-4">Navegación</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-gold-300 transition">Inicio</Link></li>
            <li><Link to="/about" className="hover:text-gold-300 transition">Sobre Mí</Link></li>
            <li><Link to="/services" className="hover:text-gold-300 transition">Servicios</Link></li>
            <li><Link to="/contact" className="hover:text-gold-300 transition">Contacto</Link></li>
            <li><Link to="/reservations" className="hover:text-gold-300 transition">Reservar</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-serif text-lg text-ivory-50 mb-4">Contacto</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`mailto:${email}`} className="hover:text-gold-300 transition">
                {email}
              </a>
            </li>
            <li>
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-gold-300 transition">
                {phone}
              </a>
            </li>
          </ul>
          <div className="mt-6 flex gap-4 text-sm">
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold-300 transition"
            >
              Instagram
            </a>
            <a
              href={pinterest}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold-300 transition"
            >
              Pinterest
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-charcoal-800">
        <div className="max-w-section mx-auto px-6 py-6 text-center text-xs text-ivory-200/60">
          &copy; {year} Ana Castellano Florista. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
