import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Coffee,
  ShoppingBag,
  Menu,
  X,
  User,
  ChevronDown,
  LogOut,
  Calendar,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/config/site';
import { useCartStore } from '@/features/cart/cartStore';
import { useAuthStore } from '@/features/auth/authStore';
import { logoutUser } from '@/api/auth';
import { useToast } from '@/components/ui/ToastContext';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const itemCount = useCartStore((state) => state.itemCount);
  const { isAuthenticated, isAdmin, user, clearAuth } = useAuthStore();

  const sheetRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Monitor scroll to switch from transparent to translucent material with hairline border
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname, location.hash]);

  // Click outside listener for account dropdown menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAccountMenuOpen(false);
      }
    };

    if (accountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountMenuOpen]);

  // Lock body scroll and trap focus when mobile sheet is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }

        // Focus trap
        if (e.key === 'Tab' && sheetRef.current) {
          const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          if (focusable.length === 0) return;

          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    await logoutUser();
    clearAuth();
    showToast('You have been logged out.', 'info');
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Menu', to: '/menu' },
    { label: 'About', to: '/#about' },
    { label: 'Reservations', to: '/reservations/new' },
    { label: 'Contact', to: '/#visit' },
  ];

  return (
    <>
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'border-b border-border-hairline bg-surface-primary/80 backdrop-blur-md shadow-beautiful-sm py-2.5'
            : 'border-b border-transparent bg-transparent py-4'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Brand Logo & Title */}
          <Link
            to="/"
            className="group flex min-h-[44px] items-center gap-2.5 rounded-lg px-2 text-content-primary outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label={`${siteConfig.brandName} home`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white shadow-beautiful-sm transition-transform group-hover:scale-105">
              <Coffee className="h-5 w-5" />
            </span>
            <span className="font-bold tracking-tight text-base sm:text-lg">
              {siteConfig.brandName}
            </span>
          </Link>

          {/* Center Links (Desktop) */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-1 rounded-full border border-border-subdued bg-surface-primary/60 px-3 py-1 shadow-beautiful-sm backdrop-blur-sm"
          >
            {navLinks.map((link) => {
              const isHash = link.to.includes('#');

              if (isHash) {
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="min-h-[40px] flex items-center px-3.5 py-1.5 text-sm font-medium rounded-full text-content-secondary hover:text-content-primary hover:bg-surface-secondary/70 transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary outline-none"
                  >
                    {link.label}
                  </Link>
                );
              }

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `min-h-[40px] flex items-center px-3.5 py-1.5 text-sm font-medium rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary outline-none ${
                      isActive
                        ? 'bg-brand-primary text-white shadow-beautiful-sm font-semibold'
                        : 'text-content-secondary hover:text-content-primary hover:bg-surface-secondary/70'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Icon with Item-Count Badge */}
            <Link
              to="/cart"
              className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-content-primary hover:bg-surface-secondary/80 transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary outline-none"
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-primary px-1 text-[11px] font-bold text-white shadow-beautiful-sm"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Order Now CTA (goes to /menu) */}
            <Link to="/menu" className="hidden sm:inline-flex">
              <Button variant="primary" size="md">
                Order Now
              </Button>
            </Link>

            {/* Desktop Auth Section */}
            {isAuthenticated ? (
              <div className="relative hidden sm:block" ref={accountMenuRef}>
                <button
                  type="button"
                  id="account-menu-button"
                  aria-haspopup="menu"
                  aria-expanded={accountMenuOpen}
                  aria-controls="account-dropdown-menu"
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  className="flex min-h-[44px] items-center gap-2 rounded-full border border-border-normal bg-surface-primary px-3.5 py-1.5 text-xs font-semibold text-content-primary shadow-beautiful-sm hover:bg-surface-secondary/80 transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary outline-none"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-light text-brand-primary font-bold">
                    {user?.name?.[0]?.toUpperCase() || <User className="h-3.5 w-3.5" />}
                  </span>
                  <span className="max-w-[120px] truncate">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-content-tertiary transition-transform duration-200 ${
                      accountMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Account Dropdown Menu */}
                {accountMenuOpen && (
                  <div
                    id="account-dropdown-menu"
                    role="menu"
                    aria-labelledby="account-menu-button"
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-border-hairline bg-surface-primary/95 backdrop-blur-md p-1.5 shadow-beautiful-lg z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-2.5 border-b border-border-subdued mb-1">
                      <p className="text-xs font-bold text-content-primary truncate">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-content-secondary truncate">{user?.email}</p>
                      {isAdmin && (
                        <span className="mt-1 inline-flex items-center rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-bold text-brand-primary">
                          Admin
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        role="menuitem"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-brand-primary hover:bg-brand-light/50 transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4 shrink-0" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to="/orders"
                      role="menuitem"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-content-primary hover:bg-surface-secondary transition-colors"
                    >
                      <Package className="h-4 w-4 shrink-0 text-content-secondary" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      to="/reservations"
                      role="menuitem"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-content-primary hover:bg-surface-secondary transition-colors"
                    >
                      <Calendar className="h-4 w-4 shrink-0 text-content-secondary" />
                      <span>My Reservations</span>
                    </Link>

                    <Link
                      to="/profile"
                      role="menuitem"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-content-primary hover:bg-surface-secondary transition-colors"
                    >
                      <User className="h-4 w-4 shrink-0 text-content-secondary" />
                      <span>Profile</span>
                    </Link>

                    <div className="border-t border-border-subdued my-1" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex">
                <Button variant="plain" size="md">
                  Log in
                </Button>
              </Link>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
              aria-expanded={mobileMenuOpen}
              className="flex md:hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-content-primary hover:bg-surface-secondary transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Height Mobile Navigation Sheet */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 z-50 md:hidden"
        >
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div
            ref={sheetRef}
            className="fixed inset-y-0 right-0 z-10 flex w-full max-w-sm flex-col bg-surface-primary shadow-beautiful-lg transition-transform duration-300 overflow-y-auto"
          >
            {/* Sheet Header */}
            <div className="flex h-16 items-center justify-between border-b border-border-subdued px-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary text-white">
                  <Coffee className="h-4 w-4" />
                </span>
                <span className="font-bold text-content-primary">{siteConfig.brandName}</span>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close mobile navigation menu"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-content-secondary hover:text-content-primary focus-visible:ring-2 focus-visible:ring-brand-primary outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Session Banner (Mobile) */}
            {isAuthenticated && user && (
              <div className="border-b border-border-subdued bg-surface-secondary/50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light font-bold text-brand-primary text-sm">
                    {user.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-content-primary">{user.name}</p>
                    <p className="truncate text-xs text-content-secondary">{user.email}</p>
                  </div>
                  {isAdmin && (
                    <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-[10px] font-bold text-brand-primary">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1 p-5">
              {navLinks.map((link) => {
                const isHash = link.to.includes('#');

                if (isHash) {
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex min-h-[44px] items-center rounded-xl px-4 text-base font-medium text-content-secondary hover:bg-surface-secondary hover:text-content-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  );
                }

                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex min-h-[44px] items-center rounded-xl px-4 text-base transition-colors ${
                        isActive
                          ? 'bg-brand-light font-semibold text-brand-primary'
                          : 'text-content-secondary hover:bg-surface-secondary hover:text-content-primary'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                );
              })}

              {/* Authenticated Links in Drawer */}
              {isAuthenticated && (
                <div className="pt-4 border-t border-border-subdued space-y-1">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex min-h-[44px] items-center gap-3 rounded-xl px-4 text-base font-semibold text-brand-primary hover:bg-brand-light/50 transition-colors"
                    >
                      <ShieldCheck className="h-5 w-5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-[44px] items-center gap-3 rounded-xl px-4 text-base font-medium text-content-secondary hover:bg-surface-secondary hover:text-content-primary transition-colors"
                  >
                    <Package className="h-5 w-5" />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    to="/reservations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-[44px] items-center gap-3 rounded-xl px-4 text-base font-medium text-content-secondary hover:bg-surface-secondary hover:text-content-primary transition-colors"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>My Reservations</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-[44px] items-center gap-3 rounded-xl px-4 text-base font-medium text-content-secondary hover:bg-surface-secondary hover:text-content-primary transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </div>
              )}
            </nav>

            {/* Sheet Bottom CTAs */}
            <div className="border-t border-border-subdued p-5 space-y-3 bg-surface-secondary/40">
              <Link
                to="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-block"
              >
                <Button variant="primary" size="md" className="w-full">
                  Order Now
                </Button>
              </Link>

              {isAuthenticated ? (
                <Button
                  variant="destructive"
                  size="md"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="h-4 w-4" />}
                  className="w-full"
                >
                  Log out
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full inline-block"
                  >
                    <Button variant="secondary" size="md" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full inline-block"
                  >
                    <Button
                      variant="plain"
                      size="md"
                      className="w-full border border-border-normal"
                    >
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
