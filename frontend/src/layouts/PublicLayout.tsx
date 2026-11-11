import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HealthStatusBadge } from '@/components/dev/HealthStatusBadge';

export function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className={`flex-1 outline-none ${isHome ? '' : 'pt-16'}`}
      >
        <Outlet />
      </main>
      <Footer />
      <HealthStatusBadge />
    </div>
  );
}

export default PublicLayout;
