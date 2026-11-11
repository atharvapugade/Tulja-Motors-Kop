import React from 'react';

export const metadata = {
  title: 'Management Portals | Tulja Motors Workshop Management System',
  description: 'Enterprise Workshop Management System for Tulja Motors automobile repair, denting, painting, and mechanical restoration operations.',
};

export default function PanelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="wms-root">{children}</div>;
}
