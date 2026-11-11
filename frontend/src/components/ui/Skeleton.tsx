import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  variant?: 'text' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  rounded = 'md',
  variant,
  width,
  height,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-xl',
    full: 'rounded-full',
  };

  const variantClass =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'text'
        ? 'rounded-md'
        : roundedClasses[rounded];

  const inlineStyle: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined
      ? { height: typeof height === 'number' ? `${height}px` : height }
      : {}),
  };

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-surface-secondary/80 ${variantClass} ${className}`}
      style={inlineStyle}
      {...props}
    />
  );
}

export default Skeleton;
