import { UserRole } from '../models/types';

export interface RoleConfig {
  slug: string;
  role: UserRole;
  title: string;
  departmentName: string;
  description: string;
  dashboardPath: string;
  badgeColor: string;
  accentBg: string;
  allowedRoles: UserRole[]; // Which actual system roles can access this panel
}

export const ROLE_CONFIGS: Record<string, RoleConfig> = {
  admin: {
    slug: 'admin',
    role: 'super_admin',
    title: 'Super Admin / Managing Director',
    departmentName: 'Executive & System Administration',
    description: 'Complete workshop governance, organizational structure, user access & system logs.',
    dashboardPath: '/panels/admin/dashboard',
    badgeColor: '#086565',
    accentBg: '#e8f3f1',
    allowedRoles: ['super_admin', 'admin'],
  },
  director: {
    slug: 'director',
    role: 'director',
    title: 'Director Portal',
    departmentName: 'Board of Directors',
    description: 'Executive overview, business growth analytics, financial health, and strategic KPIs.',
    dashboardPath: '/panels/director/dashboard',
    badgeColor: '#086565',
    accentBg: '#e8f3f1',
    allowedRoles: ['director', 'super_admin'],
  },
  'body-shop-manager': {
    slug: 'body-shop-manager',
    role: 'body_shop_manager',
    title: 'Body Shop Manager',
    departmentName: 'Workshop Operations',
    description: 'Daily repair operations, supervisor tracking, workshop load & repair quality control.',
    dashboardPath: '/panels/body-shop-manager/dashboard',
    badgeColor: '#941b20',
    accentBg: '#fbebed',
    allowedRoles: ['body_shop_manager', 'super_admin'],
  },
  /*
  hr: {
    slug: 'hr',
    role: 'hr',
    title: 'Human Resources',
    departmentName: 'HR & Personnel',
    description: 'Staff directory, attendance monitoring, daily presence, and leaves management.',
    dashboardPath: '/panels/hr/dashboard',
    badgeColor: '#086565',
    accentBg: '#e8f3f1',
    allowedRoles: ['hr', 'super_admin'],
  },
  */
  advisor: {
    slug: 'advisor',
    role: 'advisor',
    title: 'Service Advisor',
    departmentName: 'Customer Advisory & Intake',
    description: 'Customer intake, vehicle registration, damage inspection, and job card creation.',
    dashboardPath: '/panels/advisor/dashboard',
    badgeColor: '#086565',
    accentBg: '#e8f3f1',
    allowedRoles: ['advisor', 'super_admin', 'body_shop_manager'],
  },
  supervisor: {
    slug: 'supervisor',
    role: 'supervisor',
    title: 'Workshop Supervisor',
    departmentName: 'Floor Supervision',
    description: 'Task assignment, technician tracking, repair stage progression & inspection checks.',
    dashboardPath: '/panels/supervisor/dashboard',
    badgeColor: '#941b20',
    accentBg: '#fbebed',
    allowedRoles: ['supervisor', 'super_admin', 'body_shop_manager'],
  },
  accounts: {
    slug: 'accounts',
    role: 'accounts',
    title: 'Accounts & Finance',
    departmentName: 'Finance & Billing',
    description: 'GST invoice generation, payment collections, workshop expenses, and ledger.',
    dashboardPath: '/panels/accounts/dashboard',
    badgeColor: '#ffc21b',
    accentBg: '#fff9e6',
    allowedRoles: ['accounts', 'super_admin', 'director'],
  },
  'digital-marketing': {
    slug: 'digital-marketing',
    role: 'digital_marketing',
    title: 'Digital Marketing & CRM',
    departmentName: 'Marketing & Leads',
    description: 'Enquiries pipeline, customer leads, campaigns performance, and conversion tracking.',
    dashboardPath: '/panels/digital-marketing/dashboard',
    badgeColor: '#086565',
    accentBg: '#e8f3f1',
    allowedRoles: ['digital_marketing', 'super_admin'],
  },
  technician: {
    slug: 'technician',
    role: 'technician',
    title: 'Technician Workspace',
    departmentName: 'Workshop Floor Techs',
    description: 'Assigned repair tasks, job status updates, repair progress, and checklist completion.',
    dashboardPath: '/panels/technician/dashboard',
    badgeColor: '#941b20',
    accentBg: '#fbebed',
    allowedRoles: ['technician', 'supervisor', 'super_admin'],
  },
  'spare-parts-manager': {
    slug: 'spare-parts-manager',
    role: 'spare_parts_manager',
    title: 'Spare Parts & Inventory Manager',
    departmentName: 'Parts & Inventory',
    description: 'Workshop spare parts inventory, stock tracking, parts issuance for job cards & procurement.',
    dashboardPath: '/panels/spare-parts-manager/dashboard',
    badgeColor: '#D97706',
    accentBg: '#fffbeb',
    allowedRoles: ['spare_parts_manager', 'super_admin', 'body_shop_manager'],
  },
};

export function getRoleConfigBySlug(slug: string): RoleConfig | undefined {
  return ROLE_CONFIGS[slug];
}

export function getSlugByUserRole(role: UserRole): string {
  switch (role) {
    case 'super_admin':
    case 'admin':
      return 'admin';
    case 'director':
      return 'director';
    case 'body_shop_manager':
      return 'body-shop-manager';
    /*
    case 'hr':
      return 'hr';
    */
    case 'advisor':
      return 'advisor';
    case 'supervisor':
      return 'supervisor';
    case 'accounts':
      return 'accounts';
    case 'digital_marketing':
      return 'digital-marketing';
    case 'technician':
      return 'technician';
    case 'spare_parts_manager':
      return 'spare-parts-manager';
    default:
      return 'admin';
  }
}

export function canAccessPanel(userRole: UserRole, panelSlug: string): boolean {
  const config = ROLE_CONFIGS[panelSlug];
  if (!config) return false;
  return config.allowedRoles.includes(userRole);
}

