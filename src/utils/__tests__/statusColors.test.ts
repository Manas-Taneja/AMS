import { 
  getUserStatusColor, 
  getUserRoleColor,
  getProjectStatusColor,
  getProjectPriorityColor,
  getStaffStatusColor,
  getStaffDepartmentColor,
  getComponentStatusColor,
  getLocationStatusColor,
  getLocationTypeColor
} from '../statusColors';

describe('statusColors utilities', () => {
  describe('getUserStatusColor', () => {
    it('returns correct color for active status', () => {
      const color = getUserStatusColor('active');
      expect(color).toContain('bg-green-100');
      expect(color).toContain('text-green-800');
    });

    it('returns correct color for inactive status', () => {
      const color = getUserStatusColor('inactive');
      expect(color).toContain('bg-gray-100');
      expect(color).toContain('text-gray-800');
    });

    it('returns correct color for pending status', () => {
      const color = getUserStatusColor('pending');
      expect(color).toContain('bg-yellow-100');
      expect(color).toContain('text-yellow-800');
    });

    it('returns default color for unknown status', () => {
      const color = getUserStatusColor('unknown');
      expect(color).toContain('bg-gray-100');
    });
  });

  describe('getUserRoleColor', () => {
    it('returns correct color for admin role', () => {
      const color = getUserRoleColor('admin');
      expect(color).toContain('bg-red-50');
      expect(color).toContain('text-red-700');
    });

    it('returns correct color for manager role', () => {
      const color = getUserRoleColor('manager');
      expect(color).toContain('bg-blue-50');
      expect(color).toContain('text-blue-700');
    });

    it('returns correct color for staff role', () => {
      const color = getUserRoleColor('staff');
      expect(color).toContain('bg-green-50');
      expect(color).toContain('text-green-700');
    });

    it('returns default color for unknown role', () => {
      const color = getUserRoleColor('unknown');
      expect(color).toContain('bg-gray-50');
    });
  });

  describe('getProjectStatusColor', () => {
    it('returns correct color for Active status', () => {
      const color = getProjectStatusColor('Active');
      expect(color).toContain('bg-emerald-100');
      expect(color).toContain('text-emerald-800');
    });

    it('returns correct color for Paused status', () => {
      const color = getProjectStatusColor('Paused');
      expect(color).toContain('bg-amber-100');
      expect(color).toContain('text-amber-800');
    });

    it('returns default color for unknown status', () => {
      const color = getProjectStatusColor('Unknown');
      expect(color).toContain('bg-gray-100');
    });
  });

  describe('getProjectPriorityColor', () => {
    it('returns correct color for High priority', () => {
      const color = getProjectPriorityColor('High');
      expect(color).toContain('bg-red-100');
      expect(color).toContain('text-red-800');
    });

    it('returns correct color for Medium priority', () => {
      const color = getProjectPriorityColor('Medium');
      expect(color).toContain('bg-yellow-100');
      expect(color).toContain('text-yellow-800');
    });

    it('returns correct color for Low priority', () => {
      const color = getProjectPriorityColor('Low');
      expect(color).toContain('bg-blue-100');
      expect(color).toContain('text-blue-800');
    });
  });

  describe('getStaffStatusColor', () => {
    it('returns correct color for active status', () => {
      const color = getStaffStatusColor('active');
      expect(color).toContain('bg-green-100');
    });

    it('returns correct color for on-leave status', () => {
      const color = getStaffStatusColor('on-leave');
      expect(color).toContain('bg-yellow-100');
    });

    it('returns correct color for inactive status', () => {
      const color = getStaffStatusColor('inactive');
      expect(color).toContain('bg-gray-100');
    });
  });

  describe('getStaffDepartmentColor', () => {
    it('returns correct color for Operations department', () => {
      const color = getStaffDepartmentColor('Operations');
      expect(color).toContain('bg-blue-100');
    });

    it('returns correct color for Technical department', () => {
      const color = getStaffDepartmentColor('Technical');
      expect(color).toContain('bg-green-100');
    });

    it('returns default color for unknown department', () => {
      const color = getStaffDepartmentColor('Unknown');
      expect(color).toContain('bg-gray-100');
    });
  });

  describe('getComponentStatusColor', () => {
    it('returns correct color for Active status', () => {
      const color = getComponentStatusColor('Active');
      expect(color).toContain('bg-green-100');
    });

    it('returns correct color for Idle status', () => {
      const color = getComponentStatusColor('Idle');
      expect(color).toContain('bg-yellow-100');
    });

    it('returns correct color for Maintenance status', () => {
      const color = getComponentStatusColor('Maintenance');
      expect(color).toContain('bg-red-100');
    });
  });

  describe('getLocationStatusColor', () => {
    it('returns correct color for active status', () => {
      const color = getLocationStatusColor('active');
      expect(color).toContain('bg-green-100');
    });

    it('returns correct color for maintenance status', () => {
      const color = getLocationStatusColor('maintenance');
      expect(color).toContain('bg-yellow-100');
    });

    it('returns correct color for inactive status', () => {
      const color = getLocationStatusColor('inactive');
      expect(color).toContain('bg-gray-100');
    });
  });

  describe('getLocationTypeColor', () => {
    it('returns correct color for headquarters type', () => {
      const color = getLocationTypeColor('headquarters');
      expect(color).toContain('bg-blue-100');
    });

    it('returns correct color for branch type', () => {
      const color = getLocationTypeColor('branch');
      expect(color).toContain('bg-green-100');
    });

    it('returns default color for unknown type', () => {
      const color = getLocationTypeColor('unknown');
      expect(color).toContain('bg-gray-100');
    });
  });
});
