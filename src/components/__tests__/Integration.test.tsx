import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { RoleBasedComponent } from '../RoleBasedComponent';
import { StatusBadge } from '../StatusBadge';
import StatsCard from '../StatsCard';

// Mock the AuthContext
const mockAuthContext = {
  user: {
    id: 1,
    email: 'admin@test.com',
    username: 'admin',
    full_name: 'Admin User',
    is_active: true,
    is_superuser: true,
    role: 'admin',
  },
  token: 'mock-token',
  isAuthenticated: true,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  hasRole: jest.fn((roles) => roles.includes('admin')),
  isAdmin: jest.fn(() => true),
  isManager: jest.fn(() => false),
  isCenterManager: jest.fn(() => false),
  isSegmentManager: jest.fn(() => false),
  isHQManager: jest.fn(() => false),
  isStaff: jest.fn(() => false),
  isPending: jest.fn(() => false),
  isApproved: jest.fn(() => true),
  getUserSegment: jest.fn(() => null),
  getUserCenter: jest.fn(() => null),
  getUserAccessLevel: jest.fn(() => null),
};

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock statusConfig
jest.mock('@/config/statusConfig', () => ({
  getStatusOption: jest.fn((type: string, value: string) => {
    if (type === 'project' && value === 'active') {
      return {
        label: 'Active',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: () => <span>ActiveIcon</span>,
      };
    }
    return null;
  }),
}));

describe('Integration: Dashboard Components', () => {
  it('renders admin dashboard with role-based content and stats', () => {
    const icon = <span data-testid="stats-icon">📊</span>;

    render(
      <div data-testid="dashboard">
        <RoleBasedComponent allowedRoles={['admin']}>
          <div data-testid="admin-section">
            <h2>Admin Dashboard</h2>
            <div data-testid="stats-container">
              <StatsCard
                icon={icon}
                label="Total Users"
                value={150}
                bgClass="bg-blue-100"
              />
              <StatsCard
                icon={icon}
                label="Active Projects"
                value={25}
                bgClass="bg-green-100"
              />
            </div>
            <div data-testid="status-badges">
              <StatusBadge type="project" value="active" />
            </div>
          </div>
        </RoleBasedComponent>
      </div>
    );

    // Verify admin section is visible
    expect(screen.getByTestId('admin-section')).toBeInTheDocument();
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();

    // Verify stats cards are rendered
    const statsContainer = screen.getByTestId('stats-container');
    expect(within(statsContainer).getByText('Total Users')).toBeInTheDocument();
    expect(within(statsContainer).getByText('150')).toBeInTheDocument();
    expect(within(statsContainer).getByText('Active Projects')).toBeInTheDocument();
    expect(within(statsContainer).getByText('25')).toBeInTheDocument();

    // Verify status badge is rendered
    const statusContainer = screen.getByTestId('status-badges');
    expect(within(statusContainer).getByText('Active')).toBeInTheDocument();
  });

  it('renders multiple components together with correct data flow', () => {
    const userStats = [
      { label: 'Total', value: 100, bgClass: 'bg-blue-100' },
      { label: 'Active', value: 85, bgClass: 'bg-green-100' },
      { label: 'Pending', value: 15, bgClass: 'bg-yellow-100' },
    ];

    render(
      <div>
        <RoleBasedComponent allowedRoles={['admin', 'manager']}>
          <div data-testid="user-management">
            <h3>User Management</h3>
            {userStats.map((stat, index) => (
              <StatsCard
                key={index}
                icon={<span>👤</span>}
                label={stat.label}
                value={stat.value}
                bgClass={stat.bgClass}
              />
            ))}
          </div>
        </RoleBasedComponent>
      </div>
    );

    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('conditionally renders content based on user role', () => {
    render(
      <div>
        <RoleBasedComponent allowedRoles={['admin']}>
          <div data-testid="admin-only">Admin Content</div>
        </RoleBasedComponent>
        <RoleBasedComponent allowedRoles={['user']}>
          <div data-testid="user-only">User Content</div>
        </RoleBasedComponent>
      </div>
    );

    // Admin content should be visible (user has admin role)
    expect(screen.getByTestId('admin-only')).toBeInTheDocument();
    expect(screen.getByText('Admin Content')).toBeInTheDocument();

    // User content should NOT be visible (user doesn't have user role)
    expect(screen.queryByTestId('user-only')).not.toBeInTheDocument();
    expect(screen.queryByText('User Content')).not.toBeInTheDocument();
  });

  it('renders complex nested component structure', () => {
    render(
      <RoleBasedComponent allowedRoles={['admin']}>
        <div data-testid="dashboard-layout">
          <header data-testid="header">
            <h1>Dashboard</h1>
          </header>
          <main data-testid="main-content">
            <section data-testid="stats-section">
              <StatsCard
                icon={<span>📈</span>}
                label="Revenue"
                value="$10,000"
                bgClass="bg-green-100"
              />
            </section>
            <section data-testid="status-section">
              <StatusBadge type="project" value="active" />
            </section>
          </main>
        </div>
      </RoleBasedComponent>
    );

    // Verify nested structure is rendered correctly
    const layout = screen.getByTestId('dashboard-layout');
    expect(layout).toBeInTheDocument();

    const header = within(layout).getByTestId('header');
    expect(within(header).getByText('Dashboard')).toBeInTheDocument();

    const mainContent = within(layout).getByTestId('main-content');
    
    const statsSection = within(mainContent).getByTestId('stats-section');
    expect(within(statsSection).getByText('Revenue')).toBeInTheDocument();
    expect(within(statsSection).getByText('$10,000')).toBeInTheDocument();

    const statusSection = within(mainContent).getByTestId('status-section');
    expect(within(statusSection).getByText('Active')).toBeInTheDocument();
  });
});
