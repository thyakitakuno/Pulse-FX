import { render, screen } from '@testing-library/react';
import { VariationBadge } from './VariationBadge';

describe('VariationBadge', () => {
  it('renders an upward arrow and the emerald tone for positive variation', () => {
    render(<VariationBadge variationPercent={1.85} />);

    const badge = screen.getByTestId('variation-badge');
    expect(badge).toHaveTextContent('▲+1.85%');
    expect(badge.className).toContain('text-emerald-700');
  });

  it('renders a downward arrow and the red tone for negative variation', () => {
    render(<VariationBadge variationPercent={-0.47} />);

    const badge = screen.getByTestId('variation-badge');
    expect(badge).toHaveTextContent('▼-0.47%');
    expect(badge.className).toContain('text-red-700');
  });

  it('renders a neutral dash and slate tone for zero variation', () => {
    render(<VariationBadge variationPercent={0} />);

    const badge = screen.getByTestId('variation-badge');
    expect(badge).toHaveTextContent('–0.00%');
    expect(badge.className).toContain('text-slate-500');
  });
});
