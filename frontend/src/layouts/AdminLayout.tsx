import { Outlet, Link, NavLink } from 'react-router-dom';
import { Coffee, LayoutDashboard, FolderTree, UtensilsCrossed, ArrowLeft } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function AdminLayout() {
  const adminLinks = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard },
    { label: 'Categories', to: '/admin/categories', icon: FolderTree },
    { label: 'Menu Items', to: '/admin/menu-items', icon: UtensilsCrossed },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-surface-secondary/30">
      {/* Admin Top Header */}
      <header className="border-b border-border-normal bg-surface-primary shadow-beautiful-sm sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white">
              <Coffee className="h-5 w-5" />
            </span>
            <div>
              <span className="text-sm font-bold text-content-primary">
                {siteConfig.brandName} Admin
              </span>
              <span className="ml-2 rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand-primary">
                Management
              </span>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-medium text-content-secondary hover:text-content-primary px-3 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Storefront</span>
          </Link>
        </div>
      </header>

      {/* Main Admin Body with Navigation */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row gap-6 p-4 sm:p-6 lg:p-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="w-full md:w-60 shrink-0">
          <nav
            aria-label="Admin navigation"
            className="flex md:flex-col gap-1.5 rounded-2xl border border-border-normal bg-surface-primary p-3 shadow-beautiful-sm"
          >
            {adminLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) =>
                    `flex min-h-[44px] items-center gap-2.5 rounded-xl px-3.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-primary text-white font-semibold shadow-beautiful-sm'
                        : 'text-content-secondary hover:bg-surface-secondary hover:text-content-primary'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Content Outlet */}
        <main className="flex-1 rounded-2xl border border-border-normal bg-surface-primary p-6 shadow-beautiful-sm min-h-[400px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
