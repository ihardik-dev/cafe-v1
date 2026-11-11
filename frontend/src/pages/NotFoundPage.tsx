import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Coffee, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full rounded-2xl border border-border-normal bg-surface-primary p-8 shadow-beautiful-md flex flex-col items-center">
        <div className="h-14 w-14 rounded-2xl bg-surface-secondary text-brand-primary flex items-center justify-center mb-4">
          <Coffee className="h-7 w-7" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-1">
          404 Error
        </span>
        <h1 className="text-2xl font-bold text-content-primary mb-2">Page Not Found</h1>
        <p className="text-sm text-content-secondary leading-relaxed mb-6">
          The cup you're looking for might have been moved, renamed, or perhaps never existed.
        </p>

        <Link to="/">
          <Button variant="primary" size="md" leftIcon={<Home className="h-4 w-4" />}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
