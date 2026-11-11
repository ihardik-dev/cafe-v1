import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button primitive', () => {
  it('renders with children and accessible role', () => {
    render(<Button>Order Coffee</Button>);
    const btn = screen.getByRole('button', { name: /order coffee/i });
    expect(btn).toBeInTheDocument();
  });

  it('enforces min-h-[44px] touch target class on standard size', () => {
    render(<Button size="md">Touch Target</Button>);
    const btn = screen.getByRole('button', { name: /touch target/i });
    expect(btn.className).toContain('min-h-[44px]');
  });

  it('handles click events when not disabled', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(btn);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('prevents clicks when disabled or loading', async () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );
    const btn = screen.getByRole('button', { name: /disabled/i });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading spinner and sets aria-busy', () => {
    render(<Button isLoading>Submitting</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  });
});
