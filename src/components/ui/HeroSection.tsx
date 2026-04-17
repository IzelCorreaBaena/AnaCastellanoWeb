import { Link } from 'react-router-dom';

interface CTA {
  label: string;
  href: string;
}

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  ctaPrimary: CTA;
  ctaSecondary?: CTA;
  imageSrc?: string;
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=1920&q=80';

export default function HeroSection({
  title,
  subtitle,
  eyebrow,
  ctaPrimary,
  ctaSecondary,
  imageSrc = DEFAULT_IMAGE,
}: HeroSectionProps) {
  return (
    <section className="hero min-h-screen">
      <div className="hero__bg">
        <img src={imageSrc} alt="" aria-hidden />
      </div>
      <div className="hero__overlay" />

      <div className="hero__content animate-fade-in-up">
        {eyebrow && <span className="hero__eyebrow">{eyebrow}</span>}
        <h1 className="hero__title">{title}</h1>
        {subtitle && <p className="hero__subtitle">{subtitle}</p>}

        <div className="hero__actions">
          {ctaPrimary && (
            <Link to={ctaPrimary.href || '#'} className="btn-primary btn-lg">
              {ctaPrimary.label || 'Continuar'}
            </Link>
          )}
          
          {ctaSecondary && ctaSecondary.href && (
            <Link
              to={ctaSecondary.href}
              className="btn-ghost btn-lg text-ivory-50 border border-ivory-50/40 hover:bg-ivory-50/10 hover:text-ivory-50"
            >
              {ctaSecondary.label}
            </Link>
          )}
        </div>
      </div>

      <div className="hero__scroll-indicator" aria-hidden>
        <span className="block w-2 h-2 rounded-full bg-ivory-50 animate-float mx-auto" />
        <span className="hero__scroll-line" />
      </div>
    </section>
  );
}
