import React from 'react';
import { render, screen } from '@testing-library/react';
import StatsCard from '../StatsCard';

describe('StatsCard', () => {
  const mockIcon = <span data-testid="test-icon">📊</span>;

  it('renders with all props', () => {
    render(
      <StatsCard
        icon={mockIcon}
        label="Total Users"
        value={150}
        bgClass="bg-blue-100"
      />
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders with string value', () => {
    render(
      <StatsCard
        icon={mockIcon}
        label="Status"
        value="Active"
        bgClass="bg-green-100"
      />
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with numeric value', () => {
    render(
      <StatsCard
        icon={mockIcon}
        label="Count"
        value={42}
        bgClass="bg-purple-100"
      />
    );

    expect(screen.getByText('Count')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('applies custom background class to icon container', () => {
    const { container } = render(
      <StatsCard
        icon={mockIcon}
        label="Test"
        value={100}
        bgClass="bg-red-500"
      />
    );

    const iconContainer = container.querySelector('.bg-red-500');
    expect(iconContainer).toBeInTheDocument();
  });

  it('renders with zero value', () => {
    render(
      <StatsCard
        icon={mockIcon}
        label="Empty Count"
        value={0}
        bgClass="bg-gray-100"
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders with large numbers', () => {
    render(
      <StatsCard
        icon={mockIcon}
        label="Large Number"
        value={1000000}
        bgClass="bg-blue-100"
      />
    );

    expect(screen.getByText('1000000')).toBeInTheDocument();
  });

  it('renders with negative numbers', () => {
    render(
      <StatsCard
        icon={mockIcon}
        label="Negative"
        value={-50}
        bgClass="bg-red-100"
      />
    );

    expect(screen.getByText('-50')).toBeInTheDocument();
  });

  it('has correct structure with Card component', () => {
    const { container } = render(
      <StatsCard
        icon={mockIcon}
        label="Structure Test"
        value={123}
        bgClass="bg-blue-100"
      />
    );

    // Check that it's wrapped in Card/CardContent
    const cardContent = container.querySelector('.py-4');
    expect(cardContent).toBeInTheDocument();
  });
});
