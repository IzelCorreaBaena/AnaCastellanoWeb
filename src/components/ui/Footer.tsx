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
      {/* Top gold ornament */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-300/40 to-transparent" />

      <div className="max-w-section mx-auto px-6 pt-20 pb-16">
        {/* Brand + tagline centered */}
        <div className="text-center mb-16">
          <div className="flex items-baseline justify-center gap-2 mb-4">
            <span className="font-serif text-4xl text-ivory-50 tracking-wide">Ana Castellano</span>
            <span className="text-xs uppercase tracking-[0.25em] text-gold-300 font-sans font-medium">
              Florista
            </span>
          </div>
          <p className="text-sm text-ivory-200/70 leading-relaxed max-w-md mx-auto font-light">
            Diseño floral artesanal para bodas, eventos y momentos que merecen ser
            recordados.
          </p>
        </div>

        {/* Three columns */}
        <div className="grid gap-12 md:grid-cols-3 text-center md:text-left">
          {/* Quick links */}
          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 mb-5">
              Navegación
            </h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="text-ivory-200/70 hover:text-gold-300 transition-colors duration-200">Inicio</Link></li>
              <li><Link to="/about" className="text-ivory-200/70 hover:text-gold-300 transition-colors duration-200">Sobre Mí</Link></li>
              <li><Link to="/services" className="text-ivory-200/70 hover:text-gold-300 transition-colors duration-200">Servicios</Link></li>
              <li><Link to="/cursos" className="text-ivory-200/70 hover:text-gold-300 transition-colors duration-200">Cursos</Link></li>
              <li><Link to="/contact" className="text-ivory-200/70 hover:text-gold-300 transition-colors duration-200">Contacto</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 mb-5">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`mailto:${email}`} className="text-ivory-200/70 hover:text-gold-300 transition-colors duration-200">
                  {email}
                </a>
              </li>
              <li>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-ivory-200/70 hover:text-gold-300 transition-colors duration-200">
                  {phone}
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 mb-5">
              Sígueme
            </h3>
            <div className="flex gap-4 justify-center md:justify-start">
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-ivory-200/20 flex items-center justify-center text-ivory-200/60 hover:text-gold-300 hover:border-gold-300/40 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href={pinterest}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="w-10 h-10 rounded-full border border-ivory-200/20 flex items-center justify-center text-ivory-200/60 hover:text-gold-300 hover:border-gold-300/40 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-charcoal-800/60">
        <div className="max-w-section mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ivory-200/40">
          <span>&copy; {year} Ana Castellano Florista</span>
          <span className="hidden sm:inline text-gold-300/30">&#9672;</span>
          <span>Todos los derechos reservados</span>
        </div>
      </div>
    </footer>
  );
}
