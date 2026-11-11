import { Link } from 'react-router-dom';
import { Coffee, MapPin, Clock, Phone, Mail, ExternalLink, Instagram } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border-normal bg-surface-primary/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-content-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-lg"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white shadow-beautiful-sm">
                <Coffee className="h-5 w-5" />
              </span>
              <span className="font-bold tracking-tight text-lg">{siteConfig.brandName}</span>
            </Link>
            <p className="text-xs text-content-secondary leading-relaxed">{siteConfig.heroQuote}</p>
            <div className="pt-2">
              <span className="inline-block rounded-full bg-surface-secondary px-3 py-1 text-[11px] font-medium text-content-tertiary">
                Demo ordering, no real payment is taken
              </span>
            </div>
          </div>

          {/* Col 2: Visit & Address */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-content-primary">
              Visit Us
            </h3>
            <div className="flex items-start gap-2.5 text-xs text-content-secondary">
              <MapPin className="h-4 w-4 shrink-0 text-brand-primary mt-0.5" />
              <span>{siteConfig.address}</span>
            </div>
            {siteConfig.googleMapsUrl && siteConfig.googleMapsUrl !== '[URL]' && (
              <a
                href={siteConfig.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline"
              >
                <span>Get directions</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <div className="flex items-start gap-2.5 text-xs text-content-secondary pt-1">
              <Clock className="h-4 w-4 shrink-0 text-brand-primary mt-0.5" />
              <span>{siteConfig.openingHoursIST}</span>
            </div>
          </div>

          {/* Col 3: Contact & Hours */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-content-primary">
              Contact
            </h3>
            <div className="flex items-center gap-2.5 text-xs text-content-secondary">
              <Phone className="h-4 w-4 shrink-0 text-brand-primary" />
              <span>{siteConfig.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-content-secondary">
              <Mail className="h-4 w-4 shrink-0 text-brand-primary" />
              <span>{siteConfig.email}</span>
            </div>
            {/* Social links */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram profile"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-content-tertiary hover:text-brand-primary hover:bg-surface-secondary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Col 4: Quick Navigation Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-content-primary">
              Explore
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/"
                  className="text-content-secondary hover:text-brand-primary transition-colors py-1 inline-block"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/menu"
                  className="text-content-secondary hover:text-brand-primary transition-colors py-1 inline-block"
                >
                  Menu & Offerings
                </Link>
              </li>
              <li>
                <Link
                  to="/reservations"
                  className="text-content-secondary hover:text-brand-primary transition-colors py-1 inline-block"
                >
                  Table Reservations
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-content-secondary hover:text-brand-primary transition-colors py-1 inline-block"
                >
                  Your Cart
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-border-subdued pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs text-content-tertiary">
            &copy; {new Date().getFullYear()} {siteConfig.brandName}. All rights reserved.
          </p>
          <p className="text-xs text-content-tertiary">
            Crafted with Apple HIG & GSAP Motion System
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
