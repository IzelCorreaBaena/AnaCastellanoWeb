interface ReviewCardProps {
  nombre: string;
  texto: string;
  evento?: string;
  rating?: number;
}

export default function ReviewCard({
  nombre,
  texto,
  evento,
  rating,
}: ReviewCardProps) {
  return (
    <article className="card-review">
      <p className="card-review__text font-serif italic">{texto}</p>

      {typeof rating === 'number' && rating > 0 && (
        <div className="card-review__stars" aria-label={`Valoración: ${rating} de 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={i < Math.round(rating) ? 'text-gold-400' : 'text-ivory-300'}
              aria-hidden
            >
              ★
            </span>
          ))}
        </div>
      )}

      <div className="card-review__author">
        <span className="font-semibold text-charcoal-900">{nombre}</span>
        {evento && (
          <span className="block text-sm text-sage-600 mt-0.5">{evento}</span>
        )}
      </div>
    </article>
  );
}
