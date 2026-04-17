import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

interface NavLinkItem {
  to: string;
  label: string;
}

const DEFAULT_LINKS: NavLinkItem[] = [
  { to: '/', label: 'Inicio' },
  { to: '/about', label: 'Sobre Mí' },
  { to: '/services', label: 'Servicios' },
  { to: '/contact', label: 'Contacto' },
];

interface NavbarProps {
  links?: NavLinkItem[];
  ctaLabel?: string;
  ctaHref?: string;
  /** Forzar fondo sólido (útil en páginas sin hero) */
  forceSolid?: boolean;
}

export default function Navbar({
  links = DEFAULT_LINKS,
  ctaLabel = 'Reservar',
  ctaHref = '/reservations',
  forceSolid = false,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cerrar drawer al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const solid = forceSolid || scrolled;

  return (
    <header className={`nav ${solid ? 'nav-solid' : 'nav-transparent'}`}>
      <div className="nav__inner">
        <Link to="/" className="nav__logo flex items-baseline gap-2">
          <span className="font-serif text-2xl">Ana Castellano</span>
          <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-sans">
            Florista
          </span>
        </Link>

        <nav className="nav__links hidden md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to={ctaHref} className="btn-primary btn-sm">
            {ctaLabel}
          </Link>
        </div>

        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={open}
          className="nav__toggle md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav__toggle-line" />
          <span className="nav__toggle-line" />
          <span className="nav__toggle-line" />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-modal md:hidden ${
          open ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-charcoal-900/40 backdrop-blur-sm transition-opacity duration-slow ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-72 max-w-[85%] bg-ivory-50 shadow-xl p-8 flex flex-col gap-6 transition-transform duration-slow ease-soft-out ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-serif text-xl text-charcoal-900">Menú</span>
            <button
              type="button"
              aria-label="Cerrar menú"
              className="text-charcoal-700 hover:text-charcoal-900 text-2xl leading-none"
              onClick={() => setOpen(false)}
            >
              &times;
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `py-3 px-2 border-b border-ivory-300 font-sans text-charcoal-800 ${
                    isActive ? 'text-sage-600' : ''
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <Link to={ctaHref} className="btn-primary btn-full mt-auto">
            {ctaLabel}
          </Link>
        </aside>
      </div>
    </header>
  );
}
