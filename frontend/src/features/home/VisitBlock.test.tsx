import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { VisitBlock } from './VisitBlock';
import { siteConfig } from '@/config/site';

function renderVisitBlock() {
  return render(
    <BrowserRouter>
      <VisitBlock />
    </BrowserRouter>,
  );
}

describe('VisitBlock component', () => {
  it('renders section with id="visit" for in-page anchor navigation', () => {
    const { container } = renderVisitBlock();
    const visitSection = container.querySelector('#visit');
    expect(visitSection).toBeInTheDocument();
  });

  it('renders location address, opening hours, and contact phone from siteConfig', () => {
    renderVisitBlock();
    expect(screen.getByText(siteConfig.address)).toBeInTheDocument();
    expect(screen.getByText(siteConfig.openingHoursIST)).toBeInTheDocument();
    expect(screen.getByText(siteConfig.phone)).toBeInTheDocument();
  });

  it('renders "Reserve a Table" button linking to /reservations/new', () => {
    renderVisitBlock();
    const reserveBtn = screen.getByRole('button', { name: /reserve a table/i });
    expect(reserveBtn).toBeInTheDocument();
    const link = reserveBtn.closest('a');
    expect(link).toHaveAttribute('href', '/reservations/new');
  });
});
