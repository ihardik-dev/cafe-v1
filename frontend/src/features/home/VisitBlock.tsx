import { Link } from 'react-router-dom';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { MapPin, Clock, Phone, ExternalLink, CalendarDays, Coffee } from 'lucide-react';

export function VisitBlock() {
  const hasMapsUrl = siteConfig.googleMapsUrl && siteConfig.googleMapsUrl !== '[URL]';

  return (
    <section
      id="visit"
      className="scroll-mt-20 py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border-normal bg-surface-primary p-8 sm:p-12 md:p-16 shadow-beautiful-md">
        {/* Ambient warmth decorative accent */}
        <div
          className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-primary/5 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand-primary mb-4">
            <Coffee className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
            Plan Your Visit
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-content-primary">
            Visit Our Roastery
          </h2>
          <p className="mt-3 text-base text-content-secondary leading-relaxed">
            A quiet sanctuary for freshly roasted coffee, house-baked pastries, and slow mornings.
            Walk-ins are always welcome, or reserve a table in advance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 border-y border-border-subdued py-8">
          {/* Address */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-surface-secondary/50 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand-primary mb-3">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-content-primary mb-1">Location</h3>
            <p className="text-xs text-content-secondary leading-relaxed max-w-xs">
              {siteConfig.address}
            </p>
            {hasMapsUrl ? (
              <a
                href={siteConfig.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline min-h-touch"
              >
                <span>Get directions</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="mt-2 text-xs font-medium text-content-tertiary">
                Map directions available soon
              </span>
            )}
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-surface-secondary/50 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand-primary mb-3">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-content-primary mb-1">Opening Hours</h3>
            <p className="text-xs text-content-secondary leading-relaxed max-w-xs">
              {siteConfig.openingHoursIST}
            </p>
            <span className="mt-2 text-xs font-medium text-brand-accent">
              Fresh bakes every morning at 8:30 AM
            </span>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-surface-secondary/50 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand-primary mb-3">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-content-primary mb-1">Inquiries</h3>
            <p className="text-xs text-content-secondary leading-relaxed">{siteConfig.phone}</p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="mt-2 text-xs font-medium text-content-secondary hover:text-brand-primary hover:underline min-h-touch flex items-center"
            >
              {siteConfig.email}
            </a>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/reservations/new">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<CalendarDays className="h-4 w-4" />}
              className="shadow-beautiful-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Reserve a Table
            </Button>
          </Link>
          <Link to="/menu">
            <Button variant="secondary" size="lg">
              Explore Menu
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default VisitBlock;
