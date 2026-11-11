export interface VibeCard {
  number: string;
  title: string;
  description: string;
  needsConfirmation?: boolean;
}

export const vibeCards: VibeCard[] = [
  {
    number: '01',
    title: 'Classic',
    description: 'Timeless interiors, warm wood, and familiar flavours that welcome you home.',
  },
  {
    number: '02',
    title: 'Hygienic',
    description: 'Spotless counters, sanitised surfaces, and clean cups, always.',
    needsConfirmation: true, // Cafe owner must confirm before launch
  },
  {
    number: '03',
    title: 'Cozy and Warm',
    description: 'Soft lighting and comfortable seats that make you stay longer.',
  },
  {
    number: '04',
    title: 'Freshly Roasted',
    description: 'Beans roasted in small batches for a fragrant, full-bodied cup.',
    needsConfirmation: true, // Cafe owner must confirm before launch
  },
  {
    number: '05',
    title: 'Handcrafted',
    description: 'Every cup poured and finished by hand, latte art included.',
  },
  {
    number: '06',
    title: 'Made for Moments',
    description: 'A calm place for catch-ups, quiet work, and slow mornings.',
  },
];
