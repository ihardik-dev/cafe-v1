import React, { forwardRef, useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      rightAction,
      className = '',
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold tracking-wide text-content-primary select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-content-tertiary">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`w-full min-h-[44px] rounded-lg border bg-surface-primary px-3.5 text-sm text-content-primary placeholder:text-content-tertiary transition-all outline-none disabled:bg-surface-secondary disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : ''
            } ${rightAction || rightIcon ? 'pr-11' : ''} ${
              error
                ? 'border-destructive focus:ring-2 focus:ring-destructive/30'
                : 'border-border-normal hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'
            } ${className}`}
            {...props}
          />

          {rightAction ? (
            <div className="absolute right-2 flex items-center">{rightAction}</div>
          ) : rightIcon ? (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-content-tertiary">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-content-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
