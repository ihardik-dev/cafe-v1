/**
 * Site configuration and brand constants.
 * As defined in AGENT_CONTEXT section 0.
 * Components must import from this configuration and never hardcode these values.
 */

export interface SiteConfig {
  brandName: string;
  heroQuote: string;
  address: string;
  openingHoursIST: string;
  phone: string;
  email: string;
  googleMapsUrl: string;
  socialLinks: {
    instagram: string;
    facebook?: string;
    twitter?: string;
  };
}

export const siteConfig: SiteConfig = {
  brandName: '[YOUR CAFE NAME]',
  heroQuote: 'Life is short. Enjoy your coffee.',
  address: '[STREET, AREA, CITY, PIN]',
  openingHoursIST: '[e.g. Mon–Sun, 8:00 AM – 11:00 PM]',
  phone: '[PHONE]',
  email: '[EMAIL]',
  googleMapsUrl: '[URL]',
  socialLinks: {
    instagram: '[INSTAGRAM, etc.]',
  },
};
