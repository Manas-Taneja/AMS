import React from 'react';
import { render, screen } from '@testing-library/react';
import { RoleBasedComponent, AdminOnly, ManagerOrAdmin, StaffOrAbove } from '../RoleBasedComponent';

// Mock the AuthContext
const mockAuthContext = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  hasRole: jest.fn(),
};

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('RoleBasedComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when user has required role', () => {
    mockAuthContext.hasRole.mockReturnValue(true);

    render(
      <RoleBasedComponent allowedRoles={['admin']}>
        <div>Admin Content</div>
      </RoleBasedComponent>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('renders fallback when user does not have required role', () => {
    mockAuthContext.hasRole.mockReturnValue(false);

    render(
      <RoleBasedComponent allowedRoles={['admin']} fallback={<div>Access Denied</div>}>
        <div>Admin Content</div>
      </RoleBasedComponent>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('renders nothing when no fallback is provided and user lacks role', () => {
    mockAuthContext.hasRole.mockReturnValue(false);

    const { container } = render(
      <RoleBasedComponent allowedRoles={['admin']}>
        <div>Admin Content</div>
      </RoleBasedComponent>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it('calls hasRole with correct roles', () => {
    mockAuthContext.hasRole.mockReturnValue(true);

    render(
      <RoleBasedComponent allowedRoles={['admin', 'manager']}>
        <div>Content</div>
      </RoleBasedComponent>
    );

    expect(mockAuthContext.hasRole).toHaveBeenCalledWith(['admin', 'manager']);
  });
});

describe('AdminOnly', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when user is admin', () => {
    mockAuthContext.hasRole.mockReturnValue(true);

    render(
      <AdminOnly>
        <div>Admin Only Content</div>
      </AdminOnly>
    );

    expect(screen.getByText('Admin Only Content')).toBeInTheDocument();
    expect(mockAuthContext.hasRole).toHaveBeenCalledWith(['admin']);
  });
});

describe('ManagerOrAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when user is manager or admin', () => {
    mockAuthContext.hasRole.mockReturnValue(true);

    render(
      <ManagerOrAdmin>
        <div>Manager/Admin Content</div>
      </ManagerOrAdmin>
    );

    expect(screen.getByText('Manager/Admin Content')).toBeInTheDocument();
    expect(mockAuthContext.hasRole).toHaveBeenCalledWith(['manager', 'admin']);
  });
});

describe('StaffOrAbove', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when user is staff, manager, or admin', () => {
    mockAuthContext.hasRole.mockReturnValue(true);

    render(
      <StaffOrAbove>
        <div>Staff+ Content</div>
      </StaffOrAbove>
    );

    expect(screen.getByText('Staff+ Content')).toBeInTheDocument();
    expect(mockAuthContext.hasRole).toHaveBeenCalledWith(['staff', 'manager', 'admin']);
  });
});

