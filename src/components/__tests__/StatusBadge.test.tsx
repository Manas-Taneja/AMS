import React from 'react';
import { render, screen } from '@testing-library/react';
import { 
  StatusBadge, 
  ProjectStatusBadge, 
  StaffStatusBadge, 
  ComponentStatusBadge, 
  LocationStatusBadge 
} from '../StatusBadge';

// Mock the statusConfig
jest.mock('@/config/statusConfig', () => ({
  getStatusOption: jest.fn((type: string, value: string) => {
    const mockStatuses: Record<string, Record<string, any>> = {
      project: {
        active: {
          label: 'Active',
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          icon: () => <span>ActiveIcon</span>,
        },
        completed: {
          label: 'Completed',
          color: 'text-blue-700',
          bgColor: 'bg-blue-100',
          icon: () => <span>CompletedIcon</span>,
        },
      },
      staff: {
        active: {
          label: 'Active',
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          icon: () => <span>StaffActiveIcon</span>,
        },
      },
      component: {
        in_use: {
          label: 'In Use',
          color: 'text-blue-700',
          bgColor: 'bg-blue-100',
          icon: () => <span>InUseIcon</span>,
        },
      },
      location: {
        operational: {
          label: 'Operational',
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          icon: () => <span>OperationalIcon</span>,
        },
      },
    };

    return mockStatuses[type]?.[value] || null;
  }),
}));

describe('StatusBadge', () => {
  it('renders status badge with label and icon', () => {
    render(<StatusBadge type="project" value="active" />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('ActiveIcon')).toBeInTheDocument();
  });

  it('renders status badge without icon when showIcon is false', () => {
    render(<StatusBadge type="project" value="active" showIcon={false} />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.queryByText('ActiveIcon')).not.toBeInTheDocument();
  });

  it('renders fallback badge for unknown status', () => {
    render(<StatusBadge type="project" value="unknown_status" />);
    
    expect(screen.getByText('unknown_status')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatusBadge type="project" value="active" className="custom-class" />
    );
    
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeInTheDocument();
  });

  it('applies status-specific colors', () => {
    const { container } = render(<StatusBadge type="project" value="completed" />);
    
    const badge = container.querySelector('.bg-blue-100.text-blue-700');
    expect(badge).toBeInTheDocument();
  });
});

describe('ProjectStatusBadge', () => {
  it('renders project status badge', () => {
    render(<ProjectStatusBadge value="active" />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('passes through props correctly', () => {
    render(<ProjectStatusBadge value="completed" showIcon={false} />);
    
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.queryByText('CompletedIcon')).not.toBeInTheDocument();
  });
});

describe('StaffStatusBadge', () => {
  it('renders staff status badge', () => {
    render(<StaffStatusBadge value="active" />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('StaffActiveIcon')).toBeInTheDocument();
  });
});

describe('ComponentStatusBadge', () => {
  it('renders component status badge', () => {
    render(<ComponentStatusBadge value="in_use" />);
    
    expect(screen.getByText('In Use')).toBeInTheDocument();
    expect(screen.getByText('InUseIcon')).toBeInTheDocument();
  });
});

describe('LocationStatusBadge', () => {
  it('renders location status badge', () => {
    render(<LocationStatusBadge value="operational" />);
    
    expect(screen.getByText('Operational')).toBeInTheDocument();
    expect(screen.getByText('OperationalIcon')).toBeInTheDocument();
  });
});
