import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Wrench,
  Users,
  Headset,
  ClipboardList,
  Package,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Lock,
  Hammer,
  /*
  TrendingUp,
  ReceiptIndianRupee,
  Megaphone,
  */
} from 'lucide-react';

const departments = [
  // 1. Super Admin / Managing Director
  {
    slug: 'admin',
    name: 'Super Admin / Managing Director',
    badge: 'Owner & Full Access',
    description: 'Overall access to all workshop panels, operational workflows, personnel, and financial data as the business owner (Ranjeet B. Patil).',
    icon: ShieldCheck,
    color: '#045F60',
    bg: '#e8f3f1',
    demoUser: 'admin@tuljamotors.com',
  },

  // 2. Body Shop Manager
  {
    slug: 'body-shop-manager',
    name: 'Body Shop Manager',
    badge: 'Workshop Operations',
    description: 'Coordinates central workshop operations, vehicle repair flow, departmental coordination, and workshop performance.',
    icon: Wrench,
    color: '#8A181A',
    bg: '#fbebed',
    demoUser: 'bodyshop@tuljamotors.com',
  },

  /*
  // 3. Human Resources (HR) - commented out
  {
    slug: 'hr',
    name: 'Human Resources (HR)',
    badge: 'Personnel & Digital Marketing',
    description: 'Manages all employees, personnel records, daily attendance, staff profiles, as well as digital marketing operations and leads.',
    icon: Users,
    color: '#045F60',
    bg: '#e8f3f1',
    demoUser: 'hr@tuljamotors.com',
  },
  */

  // 3. Service Advisor - handles customer intake and coordinates with supervisor team
  {
    slug: 'advisor',
    name: 'Service Advisor',
    badge: 'Intake & Supervisor Team',
    description: 'Handles customer intake consultations, accidental damage inspection, estimates, job cards, and coordinates directly with the supervisor team.',
    icon: Headset,
    color: '#045F60',
    bg: '#e8f3f1',
    demoUser: 'advisor@tuljamotors.com',
  },

  // 5. Workshop Supervisor - handles all technician teams
  {
    slug: 'supervisor',
    name: 'Workshop Supervisor',
    badge: 'Technicians Team & Execution',
    description: 'Directly manages and supervises all technician teams, repair task allocation, 13-stage workflow execution, and quality control.',
    icon: ClipboardList,
    color: '#8A181A',
    bg: '#fbebed',
    demoUser: 'supervisor@tuljamotors.com',
  },

  // 6. Spare Parts & Inventory Manager
  {
    slug: 'spare-parts-manager',
    name: 'Spare Parts & Inventory Manager',
    badge: 'Parts & Procurement',
    description: 'Manages workshop spare parts catalog, stock levels, parts requisition for active job cards, vendor procurement, and purchase orders.',
    icon: Package,
    color: '#D97706',
    bg: '#fffbeb',
    demoUser: 'parts@tuljamotors.com',
  },

  // 7. Workshop Floor Technician
  {
    slug: 'technician',
    name: 'Technician Workspace',
    badge: 'Mobile-Optimized Floor',
    description: 'Assigned vehicle repair tasks, start/complete execution status, floor observations, and damage inspection references.',
    icon: Hammer,
    color: '#8A181A',
    bg: '#fbebed',
    demoUser: 'technician@tuljamotors.com',
  },

  /*
  // OTHER PANELS (COMMENTED OUT AS PER OPERATIONAL REORGANIZATION)
  {
    slug: 'director',
    name: 'Board of Directors',
    badge: 'Management Overview',
    description: 'Executive KPI dashboards, business revenue analytics, department performance, and strategic profitability reports.',
    icon: TrendingUp,
    color: '#045F60',
    bg: '#e8f3f1',
    demoUser: 'director.pratiksha@tuljamotors.com',
  },
  {
    slug: 'accounts',
    name: 'Accounts & Finance',
    badge: 'Billing & Ledger',
    description: 'GST invoice generation, labour and parts billing, cash/UPI payment collection receipts, and expense ledger.',
    icon: ReceiptIndianRupee,
    color: '#B45309',
    bg: '#fff8e6',
    demoUser: 'accounts@tuljamotors.com',
  },
  {
    slug: 'digital-marketing',
    name: 'Digital Marketing & CRM',
    badge: 'Leads & Enquiries',
    description: 'Customer inquiries pipeline, campaign lead tracking, service conversions, and customer follow-up tracking.',
    icon: Megaphone,
    color: '#045F60',
    bg: '#e8f3f1',
    demoUser: 'marketing@tuljamotors.com',
  },
  */
];

export default function PanelsLandingPage() {
  return (
    <div className="wms-root">
      {/* TOP HEADER */}
      <header className="portal-hero">
        <div className="wms-container">
          <div className="portal-nav-top">
            <Link href="/" className="portal-brand">
              <Image
                src="/tulja-motors-logo.png"
                alt="Tulja Motors Logo"
                width={180}
                height={55}
                className="portal-brand-logo"
                priority
              />
              <div className="portal-brand-text">
                <strong>TULJA MOTORS</strong>
                <span>WORKSHOP MANAGEMENT SYSTEM</span>
              </div>
            </Link>

            <Link href="/" className="portal-back-btn">
              <ArrowLeft size={16} /> Back to Public Website
            </Link>
          </div>

          <div className="portal-hero-text">
            <span className="portal-badge">
              <Lock size={12} /> ENTERPRISE OPERATIONAL GATEWAY
            </span>
            <h1>
              Automobile Workshop <span>Management System</span>
            </h1>
            <p>
              Integrated operational suite for Tulja Motors. Select your department workspace below
              to sign in and manage repairs, work orders, personnel, or financial records.
            </p>
          </div>
        </div>
      </header>

      {/* DEPARTMENT CARDS GRID */}
      <main className="portal-roles-section">
        <div className="wms-container">
          <div className="portal-roles-grid">
            {departments.map((dept) => {
              const Icon = dept.icon;
              return (
                <Link
                  key={dept.slug}
                  href={`/panels/${dept.slug}`}
                  className="role-card"
                >
                  <div className="role-card-header">
                    <div
                      className="role-icon-box"
                      style={{ background: dept.bg, color: dept.color }}
                    >
                      <Icon size={26} strokeWidth={2.2} />
                    </div>
                    <span
                      className="role-badge-tag"
                      style={{ background: dept.bg, color: dept.color }}
                    >
                      {dept.badge}
                    </span>
                  </div>

                  <h3>{dept.name}</h3>
                  <span className="role-card-dept">Workspace Route: /panels/{dept.slug}</span>
                  <p>{dept.description}</p>

                  <div className="role-card-footer">
                    <span>Login to Workspace</span>
                    <ArrowRight size={17} />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* DEMO ACCOUNTS HELPER BOX */}
          <div className="demo-creds-banner">
            <h4>
              <KeyRound size={17} color="#045F60" /> Active Workspace Credentials
            </h4>
            <p>
              All department accounts are pre-seeded in the system with the default password{' '}
              <code>Password@123</code>. You can also use the one-click quick-fill button on any login screen.
            </p>
            <div className="demo-creds-grid">
              {departments.map((d) => (
                <div key={d.slug} className="demo-cred-item">
                  <strong>{d.name.split('/')[0].trim()}</strong>
                  <code>{d.demoUser}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
