import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { FeaturedProductsShowcase } from './FeaturedProductsShowcase';
import { featuredProducts } from '@/data/featuredProducts';

function renderShowcase() {
  return render(
    <BrowserRouter>
      <FeaturedProductsShowcase />
    </BrowserRouter>,
  );
}

describe('FeaturedProductsShowcase component', () => {
  it('renders all 5 featured products with title, description, and counter', () => {
    renderShowcase();

    expect(featuredProducts).toHaveLength(5);

    featuredProducts.forEach((product) => {
      expect(screen.getByText(product.title)).toBeInTheDocument();
      expect(screen.getByText(product.description)).toBeInTheDocument();
      expect(screen.getByText(`${product.number} / 05`)).toBeInTheDocument();
    });
  });

  it('renders "View in menu" links and "View all products" button linking to /menu', () => {
    renderShowcase();

    const viewAllLinks = screen.getAllByRole('link', { name: /view all products/i });
    expect(viewAllLinks.length).toBeGreaterThan(0);
    viewAllLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/menu');
    });

    const menuLinks = screen.getAllByRole('link', { name: /view in menu/i });
    expect(menuLinks.length).toBeGreaterThan(0);
    menuLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/menu');
    });
  });

  it('renders product images with explicit dimensions and accessible alt text', () => {
    renderShowcase();

    featuredProducts.forEach((product) => {
      const img = screen.getByAltText(product.alt);
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('width', '1024');
      expect(img).toHaveAttribute('height', '572');
    });
  });
});
