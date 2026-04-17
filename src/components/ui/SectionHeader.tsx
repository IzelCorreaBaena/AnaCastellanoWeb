interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  centered = false,
}: SectionHeaderProps) {
  return (
    <div className={`section-header ${centered ? 'text-center mx-auto' : ''}`}>
      {eyebrow && (
        <span className="section-header__eyebrow">
          {eyebrow}
          <span className={`title-ornament ${centered ? 'title-ornament--center' : ''}`} />
        </span>
      )}
      <h2 className="section-header__title">{title}</h2>
      {subtitle && <p className="section-header__subtitle">{subtitle}</p>}
    </div>
  );
}
