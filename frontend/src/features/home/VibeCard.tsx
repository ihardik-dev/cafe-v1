import type { VibeCard as VibeCardType } from '@/data/vibes';

export interface VibeCardProps {
  card: VibeCardType;
  totalCards?: number;
  className?: string;
}

export function VibeCard({ card, totalCards = 6, className = '' }: VibeCardProps) {
  return (
    <article
      aria-label={`${card.title} - ${card.number} of ${totalCards}`}
      className={`relative w-full rounded-3xl border border-border-normal/70 bg-surface-primary/90 backdrop-blur-md p-7 sm:p-9 shadow-beautiful-sm transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-4 mb-3.5">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-primary bg-brand-light/90 px-3 py-1 rounded-full">
          {card.number} / {String(totalCards).padStart(2, '0')}
        </span>
        <span className="h-2 w-2 rounded-full bg-brand-primary/80" aria-hidden="true" />
      </div>

      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-content-primary mb-3">
        {card.title}
      </h3>

      <p className="text-sm sm:text-base text-content-secondary leading-relaxed">
        {card.description}
      </p>

      {card.needsConfirmation && <span className="sr-only">Owner verification pending</span>}
    </article>
  );
}

export default VibeCard;
