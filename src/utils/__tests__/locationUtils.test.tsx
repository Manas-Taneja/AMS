import React from 'react';
import { render } from '@testing-library/react';
import { getStatusColor, getTypeIcon } from '../locationUtils';

describe('locationUtils', () => {
  describe('getStatusColor', () => {
    it('returns correct color for active status', () => {
      const color = getStatusColor('active');
      expect(color).toContain('bg-green-100');
      expect(color).toContain('text-green-800');
    });

    it('returns correct color for maintenance status', () => {
      const color = getStatusColor('maintenance');
      expect(color).toContain('bg-yellow-100');
      expect(color).toContain('text-yellow-800');
    });

    it('returns correct color for inactive status', () => {
      const color = getStatusColor('inactive');
      expect(color).toContain('bg-gray-100');
      expect(color).toContain('text-gray-800');
    });

    it('returns default color for unknown status', () => {
      const color = getStatusColor('unknown');
      expect(color).toContain('bg-gray-100');
    });
  });

  describe('getTypeIcon', () => {
    it('returns headquarters icon for headquarters type', () => {
      const icon = getTypeIcon('headquarters');
      const { container } = render(<>{icon}</>);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-blue-600');
    });

    it('returns branch icon for branch type', () => {
      const icon = getTypeIcon('branch');
      const { container } = render(<>{icon}</>);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-green-600');
    });

    it('returns training icon for training type', () => {
      const icon = getTypeIcon('training');
      const { container } = render(<>{icon}</>);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-purple-600');
    });

    it('returns default icon for unknown type', () => {
      const icon = getTypeIcon('unknown');
      const { container } = render(<>{icon}</>);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-gray-600');
    });

    it('renders correct icon size', () => {
      const icon = getTypeIcon('headquarters');
      const { container } = render(<>{icon}</>);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-4');
      expect(svg).toHaveClass('w-4');
    });
  });
});
