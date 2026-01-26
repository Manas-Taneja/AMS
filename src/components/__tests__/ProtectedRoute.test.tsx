import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';
import { useRouter, usePathname } from 'next/navigation';

// Mock the AuthContext
const mockAuthContext = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  hasRole: jest.fn(),
  isAdmin: jest.fn(),
  isManager: jest.fn(),
  isCenterManager: jest.fn(),
  isSegmentManager: jest.fn(),
  isHQManager: jest.fn(),
  isStaff: jest.fn(),
  isPending: jest.fn(),
  isApproved: jest.fn(),
  getUserSegment: jest.fn(),
  getUserCenter: jest.fn(),
  getUserAccessLevel: jest.fn(),
};

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockPathname = '/dashboard';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    });
    (usePathname as jest.Mock).mockReturnValue(mockPathname);
  });

  it('shows loading spinner when loading is true', () => {
    mockAuthContext.loading = true;
    mockAuthContext.isAuthenticated = false;

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // Check for loading spinner by looking for the animated div
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', async () => {
    mockAuthContext.loading = false;
    mockAuthContext.isAuthenticated = false;

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects pending users to pending page', async () => {
    mockAuthContext.loading = false;
    mockAuthContext.isAuthenticated = true;
    mockAuthContext.isPending.mockReturnValue(true);
    (usePathname as jest.Mock).mockReturnValue('/dashboard');

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/pending');
    });
  });

  it('does not redirect pending users already on pending page', async () => {
    mockAuthContext.loading = false;
    mockAuthContext.isAuthenticated = true;
    mockAuthContext.isPending.mockReturnValue(true);
    (usePathname as jest.Mock).mockReturnValue('/pending');

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('renders children when authenticated and approved', () => {
    mockAuthContext.loading = false;
    mockAuthContext.isAuthenticated = true;
    mockAuthContext.isPending.mockReturnValue(false);

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('returns null when not authenticated and not loading', () => {
    mockAuthContext.loading = false;
    mockAuthContext.isAuthenticated = false;

    const { container } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // The component returns null after redirecting
    expect(container.firstChild).toBeNull();
  });
});
