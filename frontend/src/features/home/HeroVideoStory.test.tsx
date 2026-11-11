import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HeroVideoStory } from './HeroVideoStory';
import { siteConfig } from '@/config/site';
import { vibeCards } from '@/data/vibes';

function renderHero() {
  return render(
    <BrowserRouter>
      <HeroVideoStory />
    </BrowserRouter>,
  );
}

describe('HeroVideoStory component', () => {
  it('renders the brand name, quote, and address from siteConfig', () => {
    renderHero();
    expect(
      screen.getByRole('heading', { name: siteConfig.brandName, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(siteConfig.heroQuote)).toBeInTheDocument();
    expect(screen.getByText(siteConfig.address)).toBeInTheDocument();
  });

  it('renders Order Now button linking to /menu', () => {
    renderHero();
    const orderBtn = screen.getByRole('button', { name: /order now/i });
    expect(orderBtn).toBeInTheDocument();
    const link = orderBtn.closest('a');
    expect(link).toHaveAttribute('href', '/menu');
  });

  it('renders all six vibe cards from vibes data', () => {
    renderHero();
    vibeCards.forEach((card) => {
      expect(screen.getByText(card.title)).toBeInTheDocument();
      expect(screen.getByText(card.description)).toBeInTheDocument();
    });
  });

  it('contains the #about section anchor for navigation', () => {
    const { container } = renderHero();
    const aboutSection = container.querySelector('#about');
    expect(aboutSection).toBeInTheDocument();
  });
});
