import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';

interface NavLinkItem {
  to: string;
  label: string;
}

const DEFAULT_LINKS: NavLinkItem[] = [
  { to: '/', label: 'Inicio' },
  { to: '/about', label: 'Sobre Mí' },
  { to: '/services', label: 'Servicios' },
  { to: '/cursos', label: 'Cursos' },
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

  // Bloquear scroll del body cuando el drawer móvil está abierto.
  // Esto evita que, al desplazarse con el menú abierto, el header cambie
  // de estado (transparente/sólido) y aparezcan glitches por el backdrop-filter.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const solid = forceSolid || scrolled || open;

  return (
    <>
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
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          className="nav__toggle md:hidden relative w-7 h-7 flex flex-col justify-center items-center"
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`block w-full h-px transition-all duration-300 ease-soft-out ${
              solid && !open ? 'bg-charcoal-900' : 'bg-white'
            } ${open ? 'rotate-45 translate-y-[3px] !bg-charcoal-900' : ''}`}
          />
          <span
            className={`block w-full h-px mt-[6px] transition-all duration-300 ease-soft-out ${
              solid && !open ? 'bg-charcoal-900' : 'bg-white'
            } ${open ? 'opacity-0' : ''}`}
          />
          <span
            className={`block w-full h-px mt-[6px] transition-all duration-300 ease-soft-out ${
              solid && !open ? 'bg-charcoal-900' : 'bg-white'
            } ${open ? '-rotate-45 -translate-y-[9px] !bg-charcoal-900' : ''}`}
          />
        </button>
      </div>

    </header>

    {/* Mobile drawer — rendered via portal so that the nav's backdrop-filter
        does not trap position:fixed children inside the header's bounding box. */}
    {createPortal(
      <div
        className={`fixed inset-0 z-[9000] md:hidden ${
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
          className={`absolute right-0 top-0 h-full w-72 max-w-[85%] shadow-xl flex flex-col transition-transform duration-slow ease-soft-out ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ backgroundColor: '#FDFCF9' }}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-8 pt-8 pb-4">
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-xl text-charcoal-900">Ana Castellano</span>
            </div>
            <button
              type="button"
              aria-label="Cerrar menú"
              className="w-8 h-8 rounded-full bg-ivory-200 hover:bg-ivory-300 flex items-center justify-center text-charcoal-600 transition-colors"
              onClick={() => setOpen(false)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>

          {/* Gold ornament */}
          <div className="mx-8 h-px bg-gradient-to-r from-gold-300 via-gold-200 to-transparent" />

          {/* Nav links */}
          <nav className="flex flex-col px-6 pt-6 gap-0.5 flex-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `py-3 px-3 rounded-md font-sans text-sm tracking-wide transition-colors duration-200 ${
                    isActive
                      ? 'text-sage-700 bg-sage-50 font-medium'
                      : 'text-charcoal-700 hover:text-charcoal-900 hover:bg-ivory-200'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* CTA */}
          <div className="px-6 pb-8 pt-4">
            <Link to={ctaHref} className="btn-primary btn-full">
              {ctaLabel}
            </Link>
          </div>
        </aside>
      </div>,
      document.body,
    )}
    </>
  );
}
