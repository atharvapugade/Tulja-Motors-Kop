import { Suspense, use } from 'react';
import { notFound } from 'next/navigation';
import LoginForm from '@/lib/components/LoginForm';

const roleMeta: Record<
  string,
  {
    roleTitle: string;
    departmentName: string;
    description: string;
    accentColor: string;
    accentBg: string;
    defaultEmail: string;
  }
> = {
  admin: {
    roleTitle: 'Super Admin / Managing Director',
    departmentName: 'Executive & System Administration',
    description: 'Sign in to access workshop governance, personnel records, system users, and security logs.',
    accentColor: '#045F60',
    accentBg: '#e8f3f1',
    defaultEmail: 'admin@tuljamotors.com',
  },
  director: {
    roleTitle: 'Board of Directors Portal',
    departmentName: 'Board of Directors',
    description: 'Sign in to review executive KPIs, financial profitability, workshop throughput, and business growth.',
    accentColor: '#045F60',
    accentBg: '#e8f3f1',
    defaultEmail: 'director.pratiksha@tuljamotors.com',
  },
  'body-shop-manager': {
    roleTitle: 'Body Shop Manager',
    departmentName: 'Workshop Floor Operations',
    description: 'Sign in to supervise active repairs, allocate technicians, monitor floor workload, and track repair delays.',
    accentColor: '#8A181A',
    accentBg: '#fbebed',
    defaultEmail: 'bodyshop@tuljamotors.com',
  },
  hr: {
    roleTitle: 'Human Resources (HR)',
    departmentName: 'HR & Personnel Records',
    description: 'Sign in to manage employee roster, track daily workshop attendance, approve leaves, and view staff profiles.',
    accentColor: '#045F60',
    accentBg: '#e8f3f1',
    defaultEmail: 'hr@tuljamotors.com',
  },
  advisor: {
    roleTitle: 'Service Advisor Desk',
    departmentName: 'Customer Advisory & Intake',
    description: 'Sign in to register incoming damaged vehicles, record customer complaints, upload accident notes, and generate job cards.',
    accentColor: '#045F60',
    accentBg: '#e8f3f1',
    defaultEmail: 'advisor@tuljamotors.com',
  },
  supervisor: {
    roleTitle: 'Workshop Supervisor',
    departmentName: 'Repair Floor Supervision',
    description: 'Sign in to advance 13-stage repair workflows, assign tasks to technicians, and inspect quality before paint/assembly.',
    accentColor: '#8A181A',
    accentBg: '#fbebed',
    defaultEmail: 'supervisor@tuljamotors.com',
  },
  accounts: {
    roleTitle: 'Accounts & Finance',
    departmentName: 'Billing & Ledger',
    description: 'Sign in to generate GST invoices, record customer payments (Cash/UPI/NEFT), log vendor expenses, and review margins.',
    accentColor: '#B45309',
    accentBg: '#fff8e6',
    defaultEmail: 'accounts@tuljamotors.com',
  },
  'digital-marketing': {
    roleTitle: 'Digital Marketing & CRM',
    departmentName: 'Marketing & Leads',
    description: 'Sign in to manage incoming customer enquiries, schedule customer follow-ups, and track repair lead conversions.',
    accentColor: '#045F60',
    accentBg: '#e8f3f1',
    defaultEmail: 'marketing@tuljamotors.com',
  },
  technician: {
    roleTitle: 'Technician Workspace',
    departmentName: 'Workshop Floor Techs',
    description: 'Mobile-ready workbench for denters, painters, and mechanics to view assigned jobs and log progress notes.',
    accentColor: '#8A181A',
    accentBg: '#fbebed',
    defaultEmail: 'technician@tuljamotors.com',
  },
};

interface PageProps {
  params: Promise<{ role: string }>;
}

function RoleLoginContainer({ params }: PageProps) {
  const { role } = use(params);
  const meta = roleMeta[role];

  if (!meta) {
    notFound();
  }

  return (
    <LoginForm
      roleSlug={role}
      roleTitle={meta.roleTitle}
      departmentName={meta.departmentName}
      description={meta.description}
      accentColor={meta.accentColor}
      accentBg={meta.accentBg}
      defaultEmail={meta.defaultEmail}
    />
  );
}

export default function RoleLoginPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            backgroundColor: '#f5f8f8',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ color: '#045F60', fontWeight: '700', fontSize: '15px' }}>
            Loading Workspace Portal...
          </div>
        </div>
      }
    >
      <RoleLoginContainer params={params} />
    </Suspense>
  );
}
