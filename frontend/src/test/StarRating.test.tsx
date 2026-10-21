import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StarRating } from '../components/common/StarRating';

describe('StarRating Component', () => {
  it('renders correct number of stars', () => {
    const { container } = render(<StarRating rating={4} maxStars={5} />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(5);
  });

  it('renders rating text and review count when showText is true', () => {
    render(<StarRating rating={4.8} showText reviewCount={24} />);
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(24)')).toBeInTheDocument();
  });

  it('triggers onChange callback when clicked in interactive mode', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <StarRating rating={3} interactive onChange={handleChange} />
    );
    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[4]); // 5th star
    expect(handleChange).toHaveBeenCalledWith(5);
  });

  it('does not trigger onChange when not interactive', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <StarRating rating={3} interactive={false} onChange={handleChange} />
    );
    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[3]);
    expect(handleChange).not.toHaveBeenCalled();
  });
});
