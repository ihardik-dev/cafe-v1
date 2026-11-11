import { Minus, Plus } from 'lucide-react';

export interface StepperProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 10,
  ariaLabel = 'Quantity',
  size = 'md',
  className = '',
}: StepperProps) {
  const isAtMin = value <= min;
  const isAtMax = value >= max;

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAtMin) {
      onChange(Math.max(min, value - 1));
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAtMax) {
      onChange(Math.min(max, value + 1));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (!isAtMax) onChange(Math.min(max, value + 1));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (!isAtMin) onChange(Math.max(min, value - 1));
    }
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`inline-flex items-center rounded-full border border-border-normal bg-surface-primary shadow-beautiful-sm p-0.5 select-none ${className}`}
    >
      {/* Decrement Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isAtMin}
        aria-label="Decrease quantity"
        className={`flex items-center justify-center rounded-full text-content-primary transition-all
          min-h-touch min-w-touch sm:min-h-[36px] sm:min-w-[36px]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary
          ${
            isAtMin
              ? 'opacity-30 cursor-not-allowed text-content-tertiary'
              : 'hover:bg-surface-secondary active:scale-95'
          }
          ${size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'}
        `}
      >
        <Minus className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </button>

      {/* Numerical display */}
      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="spinbutton"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={ariaLabel}
        className={`flex items-center justify-center font-mono font-bold text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded
          ${size === 'sm' ? 'w-8 text-xs' : 'w-10 text-sm'}
        `}
      >
        {value}
      </div>

      {/* Increment Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={isAtMax}
        aria-label="Increase quantity"
        className={`flex items-center justify-center rounded-full text-content-primary transition-all
          min-h-touch min-w-touch sm:min-h-[36px] sm:min-w-[36px]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary
          ${
            isAtMax
              ? 'opacity-30 cursor-not-allowed text-content-tertiary'
              : 'hover:bg-surface-secondary active:scale-95'
          }
          ${size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'}
        `}
      >
        <Plus className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </button>
    </div>
  );
}

export default Stepper;
