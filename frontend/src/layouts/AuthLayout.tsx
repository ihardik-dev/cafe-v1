import { Outlet, Link } from 'react-router-dom';
import { Coffee, ArrowLeft } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Return to Home link */}
      <div className="w-full max-w-md mb-6">
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center gap-2 text-xs font-medium text-content-secondary hover:text-brand-primary transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary rounded-lg px-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {siteConfig.brandName}</span>
        </Link>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-beautiful-md mb-3"
            aria-label="Home"
          >
            <Coffee className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            {siteConfig.brandName}
          </h1>
          <p className="mt-1 text-xs text-content-secondary">{siteConfig.heroQuote}</p>
        </div>

        {/* Auth Content Card */}
        <div className="rounded-2xl border border-border-normal bg-surface-primary p-6 sm:p-8 shadow-beautiful-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
