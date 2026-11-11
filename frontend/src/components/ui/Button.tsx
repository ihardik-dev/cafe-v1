import React, { forwardRef } from 'react';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'plain' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className = '',
      type = 'button',
      ...props
    },
    ref,
  ) => {
    // 44px min touch target on all default/standard buttons to satisfy Apple HIG
    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-md gap-1.5',
      md: 'min-h-[44px] min-w-[44px] px-5 py-2.5 text-sm font-semibold rounded-lg gap-2',
      lg: 'min-h-[48px] px-6 py-3 text-base font-semibold rounded-xl gap-2.5',
    };

    const variantClasses: Record<ButtonVariant, string> = {
      // Primary: Rich warm espresso-amber meeting 5.5:1 contrast against light backgrounds
      primary:
        'bg-brand-primary text-white hover:bg-brand-hover active:scale-[0.98] shadow-beautiful-sm focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
      // Secondary: Solid cream surface with clear border and deep espresso text (> 12:1)
      secondary:
        'bg-surface-primary text-content-primary border border-border-normal hover:bg-surface-secondary active:scale-[0.98] shadow-beautiful-sm focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
      // Plain: Ghost/text button with visible hover and focus ring
      plain:
        'bg-transparent text-content-primary hover:bg-surface-secondary/70 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
      // Destructive: Apple HIG refined ruby red (> 4.6:1 contrast)
      destructive:
        'bg-destructive text-white hover:bg-destructive-hover active:scale-[0.98] shadow-beautiful-sm focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2',
    };

    const activeLoading = isLoading || loading;
    const isDisabled = disabled || activeLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={activeLoading}
        className={`inline-flex items-center justify-center font-medium transition-all duration-150 outline-none select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {activeLoading ? (
          <Spinner size="sm" className="text-current" />
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
