import { Suspense, use } from 'react';
import { notFound } from 'next/navigation';
import RoleDashboardClient from '@/lib/components/RoleDashboardClient';

interface PageProps {
  params: Promise<{ role: string }>;
}

function RoleDashboardContainer({ params }: PageProps) {
  const { role } = use(params);
  if (role === 'hr') {
    notFound();
  }
  return <RoleDashboardClient role={role} />;
}

export default function RoleDashboardPage({ params }: PageProps) {
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
            Loading Tulja Motors Workspace...
          </div>
        </div>
      }
    >
      <RoleDashboardContainer params={params} />
    </Suspense>
  );
}
