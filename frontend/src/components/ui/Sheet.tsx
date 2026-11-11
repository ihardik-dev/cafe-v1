import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  side?: 'right' | 'bottom';
}

export function Sheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = 'right',
}: SheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sideClasses = {
    right: 'fixed inset-y-0 right-0 w-full sm:max-w-md border-l border-border-normal',
    bottom: 'fixed inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl border-t border-border-normal',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'sheet-title' : undefined}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      <div
        className={`${sideClasses[side]} z-10 flex flex-col bg-surface-primary shadow-beautiful-lg transition-transform duration-300 ease-out`}
      >
        <div className="flex items-center justify-between border-b border-border-subdued p-4 sm:p-5">
          <div>
            {title && (
              <h2 id="sheet-title" className="text-base font-bold text-content-primary">
                {title}
              </h2>
            )}
            {description && <p className="text-xs text-content-secondary mt-0.5">{description}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sheet"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-content-tertiary hover:text-content-primary hover:bg-surface-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

export default Sheet;
