// Sample data for AssetCategoryChart component

export interface Category {
  name: string;
  count: number;
  value: number;
}

export interface Subcategory {
  name: string;
  count: number;
  value: number;
  category: string;
}

// Drones by Project Category
export const droneCategories: Category[] = [
  { name: 'Aerial Photography', count: 45, value: 45 },
  { name: 'Surveying & Mapping', count: 32, value: 32 },
  { name: 'Search & Rescue', count: 28, value: 28 },
  { name: 'Agricultural Monitoring', count: 22, value: 22 },
  { name: 'Infrastructure Inspection', count: 18, value: 18 },
  { name: 'Security & Surveillance', count: 15, value: 15 },
];

export const droneSubcategories: Subcategory[] = [
  // Aerial Photography subcategories
  { name: 'Real Estate Photography', count: 20, value: 20, category: 'Aerial Photography' },
  { name: 'Event Coverage', count: 15, value: 15, category: 'Aerial Photography' },
  { name: 'Tourism & Travel', count: 10, value: 10, category: 'Aerial Photography' },
  
  // Surveying & Mapping subcategories
  { name: 'Land Surveying', count: 18, value: 18, category: 'Surveying & Mapping' },
  { name: 'Construction Site Mapping', count: 8, value: 8, category: 'Surveying & Mapping' },
  { name: 'Environmental Assessment', count: 6, value: 6, category: 'Surveying & Mapping' },
  
  // Search & Rescue subcategories
  { name: 'Emergency Response', count: 12, value: 12, category: 'Search & Rescue' },
  { name: 'Wilderness Search', count: 10, value: 10, category: 'Search & Rescue' },
  { name: 'Disaster Assessment', count: 6, value: 6, category: 'Search & Rescue' },
  
  // Agricultural Monitoring subcategories
  { name: 'Crop Monitoring', count: 12, value: 12, category: 'Agricultural Monitoring' },
  { name: 'Livestock Tracking', count: 6, value: 6, category: 'Agricultural Monitoring' },
  { name: 'Irrigation Management', count: 4, value: 4, category: 'Agricultural Monitoring' },
  
  // Infrastructure Inspection subcategories
  { name: 'Power Line Inspection', count: 8, value: 8, category: 'Infrastructure Inspection' },
  { name: 'Bridge & Road Inspection', count: 6, value: 6, category: 'Infrastructure Inspection' },
  { name: 'Building Inspection', count: 4, value: 4, category: 'Infrastructure Inspection' },
  
  // Security & Surveillance subcategories
  { name: 'Perimeter Security', count: 8, value: 8, category: 'Security & Surveillance' },
  { name: 'Event Security', count: 5, value: 5, category: 'Security & Surveillance' },
  { name: 'Traffic Monitoring', count: 2, value: 2, category: 'Security & Surveillance' },
];

// Staff by Job Title Category
export const staffCategories: Category[] = [
  { name: 'Management', count: 25, value: 25 },
  { name: 'Technical Staff', count: 68, value: 68 },
  { name: 'Administrative', count: 42, value: 42 },
  { name: 'Sales & Marketing', count: 35, value: 35 },
  { name: 'Support Staff', count: 28, value: 28 },
  { name: 'Research & Development', count: 22, value: 22 },
];

export const staffSubcategories: Subcategory[] = [
  // Management subcategories
  { name: 'Senior Management', count: 8, value: 8, category: 'Management' },
  { name: 'Department Heads', count: 12, value: 12, category: 'Management' },
  { name: 'Project Managers', count: 5, value: 5, category: 'Management' },
  
  // Technical Staff subcategories
  { name: 'Software Engineers', count: 25, value: 25, category: 'Technical Staff' },
  { name: 'System Administrators', count: 15, value: 15, category: 'Technical Staff' },
  { name: 'Network Engineers', count: 12, value: 12, category: 'Technical Staff' },
  { name: 'Data Analysts', count: 10, value: 10, category: 'Technical Staff' },
  { name: 'DevOps Engineers', count: 6, value: 6, category: 'Technical Staff' },
  
  // Administrative subcategories
  { name: 'HR Personnel', count: 15, value: 15, category: 'Administrative' },
  { name: 'Finance Staff', count: 12, value: 12, category: 'Administrative' },
  { name: 'Office Administrators', count: 10, value: 10, category: 'Administrative' },
  { name: 'Legal Team', count: 5, value: 5, category: 'Administrative' },
  
  // Sales & Marketing subcategories
  { name: 'Sales Representatives', count: 20, value: 20, category: 'Sales & Marketing' },
  { name: 'Marketing Specialists', count: 10, value: 10, category: 'Sales & Marketing' },
  { name: 'Customer Success', count: 5, value: 5, category: 'Sales & Marketing' },
  
  // Support Staff subcategories
  { name: 'IT Support', count: 15, value: 15, category: 'Support Staff' },
  { name: 'Facilities Maintenance', count: 8, value: 8, category: 'Support Staff' },
  { name: 'Security Personnel', count: 5, value: 5, category: 'Support Staff' },
  
  // Research & Development subcategories
  { name: 'Research Scientists', count: 12, value: 12, category: 'Research & Development' },
  { name: 'Product Developers', count: 8, value: 8, category: 'Research & Development' },
  { name: 'Quality Assurance', count: 2, value: 2, category: 'Research & Development' },
];

// Training Distribution Category
export const trainingCategories: Category[] = [
  { name: 'Instructors', count: 35, value: 35 },
  { name: 'Teachers', count: 28, value: 28 },
  { name: 'Students', count: 156, value: 156 },
  { name: 'Training Coordinators', count: 12, value: 12 },
  { name: 'Curriculum Developers', count: 8, value: 8 },
];

export const trainingSubcategories: Subcategory[] = [
  // Instructors subcategories
  { name: 'Senior Instructors', count: 15, value: 15, category: 'Instructors' },
  { name: 'Technical Instructors', count: 12, value: 12, category: 'Instructors' },
  { name: 'Guest Instructors', count: 8, value: 8, category: 'Instructors' },
  
  // Teachers subcategories
  { name: 'Subject Matter Experts', count: 18, value: 18, category: 'Teachers' },
  { name: 'Assistant Teachers', count: 10, value: 10, category: 'Teachers' },
  
  // Students subcategories
  { name: 'Undergraduate Students', count: 85, value: 85, category: 'Students' },
  { name: 'Graduate Students', count: 45, value: 45, category: 'Students' },
  { name: 'Professional Development', count: 26, value: 26, category: 'Students' },
  
  // Training Coordinators subcategories
  { name: 'Program Coordinators', count: 8, value: 8, category: 'Training Coordinators' },
  { name: 'Scheduling Coordinators', count: 4, value: 4, category: 'Training Coordinators' },
  
  // Curriculum Developers subcategories
  { name: 'Content Developers', count: 5, value: 5, category: 'Curriculum Developers' },
  { name: 'Instructional Designers', count: 3, value: 3, category: 'Curriculum Developers' },
];

// IT Components by Type Category
export const itComponentCategories: Category[] = [
  { name: 'Servers', count: 45, value: 45 },
  { name: 'Network Equipment', count: 38, value: 38 },
  { name: 'Workstations', count: 125, value: 125 },
  { name: 'Storage Devices', count: 32, value: 32 },
  { name: 'Security Equipment', count: 28, value: 28 },
  { name: 'Peripherals', count: 85, value: 85 },
];

export const itComponentSubcategories: Subcategory[] = [
  // Servers subcategories
  { name: 'Application Servers', count: 20, value: 20, category: 'Servers' },
  { name: 'Database Servers', count: 12, value: 12, category: 'Servers' },
  { name: 'File Servers', count: 8, value: 8, category: 'Servers' },
  { name: 'Web Servers', count: 5, value: 5, category: 'Servers' },
  
  // Network Equipment subcategories
  { name: 'Switches', count: 18, value: 18, category: 'Network Equipment' },
  { name: 'Routers', count: 12, value: 12, category: 'Network Equipment' },
  { name: 'Firewalls', count: 5, value: 5, category: 'Network Equipment' },
  { name: 'Wireless Access Points', count: 3, value: 3, category: 'Network Equipment' },
  
  // Workstations subcategories
  { name: 'Developer Workstations', count: 45, value: 45, category: 'Workstations' },
  { name: 'Administrative Workstations', count: 35, value: 35, category: 'Workstations' },
  { name: 'Design Workstations', count: 25, value: 25, category: 'Workstations' },
  { name: 'Testing Workstations', count: 20, value: 20, category: 'Workstations' },
  
  // Storage Devices subcategories
  { name: 'NAS Systems', count: 15, value: 15, category: 'Storage Devices' },
  { name: 'SAN Arrays', count: 8, value: 8, category: 'Storage Devices' },
  { name: 'Backup Systems', count: 6, value: 6, category: 'Storage Devices' },
  { name: 'External Drives', count: 3, value: 3, category: 'Storage Devices' },
  
  // Security Equipment subcategories
  { name: 'CCTV Cameras', count: 12, value: 12, category: 'Security Equipment' },
  { name: 'Access Control Systems', count: 8, value: 8, category: 'Security Equipment' },
  { name: 'Biometric Devices', count: 5, value: 5, category: 'Security Equipment' },
  { name: 'Security Servers', count: 3, value: 3, category: 'Security Equipment' },
  
  // Peripherals subcategories
  { name: 'Monitors', count: 35, value: 35, category: 'Peripherals' },
  { name: 'Printers', count: 20, value: 20, category: 'Peripherals' },
  { name: 'Scanners', count: 15, value: 15, category: 'Peripherals' },
  { name: 'Input Devices', count: 15, value: 15, category: 'Peripherals' },
];

// Export all data as a single object for easy access
export const sampleChartData = {
  drones: {
    categories: droneCategories,
    subcategories: droneSubcategories,
    title: 'Drones by Project Type',
    description: 'Distribution of drones based on the projects they are used in'
  },
  staff: {
    categories: staffCategories,
    subcategories: staffSubcategories,
    title: 'Staff by Job Title',
    description: 'Distribution of staff based on their job titles and roles'
  },
  training: {
    categories: trainingCategories,
    subcategories: trainingSubcategories,
    title: 'Training Personnel Distribution',
    description: 'Distribution of trainers, instructors, teachers, and students'
  },
  itComponents: {
    categories: itComponentCategories,
    subcategories: itComponentSubcategories,
    title: 'IT Components by Type',
    description: 'Distribution of IT components based on their type and function'
  }
}; 