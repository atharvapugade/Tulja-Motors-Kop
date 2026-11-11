'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Wrench,
  Headset,
  ClipboardList,
  ReceiptIndianRupee,
  Megaphone,
  Hammer,
  LogOut,
  Bell,
  Grid,
  Car,
  FileText,
  Clock,
  CheckCircle2,
  Menu,
  X,
  RefreshCw,
  Building2,
  UserCheck,
  Package,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
}

interface DashboardLayoutProps {
  roleSlug: string;
  roleTitle: string;
  departmentName: string;
  children: React.ReactNode;
}

export default function DashboardLayout({
  roleSlug,
  roleTitle,
  departmentName,
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Staff User');
  const [userRole, setUserRole] = useState(roleTitle);

  useEffect(() => {
    // Check if token exists in localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tm_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.name) setUserName(parsed.name);
          if (parsed.role) setUserRole(parsed.role.replace('_', ' ').toUpperCase());
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tm_auth_token');
      localStorage.removeItem('tm_user');
    }
    router.push(`/panels/${roleSlug}`);
  };

  // Dynamic Navigation Items tailored per role
  const getNavLinks = (): NavItem[] => {
    const base = `/panels/${roleSlug}/dashboard`;
    switch (roleSlug) {
      case 'admin':
        return [
          { name: 'System Overview', href: base, icon: LayoutDashboard },
          { name: 'Employees Directory', href: `${base}?tab=employees`, icon: Users },
          { name: 'Job Cards Master', href: `${base}?tab=jobs`, icon: ClipboardList },
          { name: 'Billing & Invoices', href: `${base}?tab=finance`, icon: ReceiptIndianRupee },
          { name: 'System Audit Logs', href: `${base}?tab=logs`, icon: ShieldAlert },
        ];
      case 'director':
        return [
          { name: 'Executive Overview', href: base, icon: LayoutDashboard },
          { name: 'Workshop Throughput', href: `${base}?tab=throughput`, icon: Car },
          { name: 'Financial Health', href: `${base}?tab=financials`, icon: ReceiptIndianRupee },
          { name: 'Department KPI', href: `${base}?tab=kpis`, icon: Building2 },
        ];
      case 'body-shop-manager':
        return [
          { name: 'Floor Operations', href: base, icon: LayoutDashboard },
          { name: 'Active Repair Jobs', href: `${base}?tab=jobs`, icon: Car },
          { name: 'Technician Allocation', href: `${base}?tab=technicians`, icon: Hammer },
          { name: 'Floor Delays & Bottlenecks', href: `${base}?tab=delays`, icon: Clock },
        ];
      case 'hr':
        return [
          { name: 'HR Overview', href: base, icon: LayoutDashboard },
          { name: 'Staff Directory', href: `${base}?tab=staff`, icon: Users },
          { name: 'Attendance Roster', href: `${base}?tab=attendance`, icon: UserCheck },
          { name: 'Digital Marketing & Leads', href: `${base}?tab=marketing`, icon: Megaphone },
          { name: 'Leave Records', href: `${base}?tab=leaves`, icon: Clock },
        ];
      case 'advisor':
        return [
          { name: 'Intake Desk', href: base, icon: LayoutDashboard },
          { name: 'Customer Records', href: `${base}?tab=customers`, icon: Users },
          { name: 'Vehicle Intake', href: `${base}?tab=vehicles`, icon: Car },
          { name: 'Job Cards & Estimates', href: `${base}?tab=jobs`, icon: FileText },
          { name: 'Supervisor Coordination', href: `${base}?tab=supervisors`, icon: ClipboardList },
        ];
      case 'supervisor':
        return [
          { name: 'Floor Supervision', href: base, icon: LayoutDashboard },
          { name: '13-Stage Repair Board', href: `${base}?tab=stages`, icon: ClipboardList },
          { name: 'Technicians Team Allocation', href: `${base}?tab=tasks`, icon: Hammer },
          { name: 'Quality Inspection', href: `${base}?tab=quality`, icon: CheckCircle2 },
        ];
      case 'accounts':
        return [
          { name: 'Accounts Overview', href: base, icon: LayoutDashboard },
          { name: 'Invoices & Billing', href: `${base}?tab=invoices`, icon: ReceiptIndianRupee },
          { name: 'Payments Collection', href: `${base}?tab=payments`, icon: CheckCircle2 },
          { name: 'Workshop Expenses', href: `${base}?tab=expenses`, icon: FileText },
        ];
      case 'digital-marketing':
        return [
          { name: 'Marketing Funnel', href: base, icon: LayoutDashboard },
          { name: 'Customer Leads', href: `${base}?tab=leads`, icon: Megaphone },
          { name: 'Enquiry Pipeline', href: `${base}?tab=enquiries`, icon: Users },
          { name: 'Follow-up Schedule', href: `${base}?tab=followups`, icon: Clock },
        ];
      case 'spare-parts-manager':
        return [
          { name: 'Inventory Overview', href: base, icon: LayoutDashboard },
          { name: 'Spare Parts Catalog', href: `${base}?tab=parts`, icon: Package },
          { name: 'Job Requisitions', href: `${base}?tab=requisitions`, icon: ClipboardList },
          { name: 'Purchase Orders', href: `${base}?tab=orders`, icon: ReceiptIndianRupee },
        ];
      case 'technician':
        return [
          { name: 'My Active Repairs', href: base, icon: Hammer },
          { name: 'Today\'s Task Checklist', href: `${base}?tab=tasks`, icon: ClipboardList },
          { name: 'Work Progress Notes', href: `${base}?tab=notes`, icon: FileText },
        ];
      default:
        return [{ name: 'Overview', href: base, icon: LayoutDashboard }];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR NAVIGATION */}
      <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/" className="portal-brand" style={{ gap: '10px' }}>
            <Image
              src="/tulja-motors-logo.png"
              alt="Tulja Motors Logo"
              width={140}
              height={42}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Link>
        </div>

        <div className="sidebar-nav-container">
          <span className="sidebar-section-title">Workspace Navigation</span>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const hasTab = item.href.includes('?tab=');
            const itemTab = hasTab ? item.href.split('?tab=')[1] : '';
            const isPathMatch = pathname === item.href.split('?')[0];
            const isActive =
              isPathMatch &&
              (hasTab
                ? currentTab === itemTab
                : !currentTab || currentTab === 'overview');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
            <span className="sidebar-section-title">Portals Gateway</span>
            <Link href="/panels" className="sidebar-link">
              <Grid size={18} />
              <span>All Panels Gateway</span>
            </Link>
            <Link href="/" className="sidebar-link">
              <Car size={18} />
              <span>Public Website</span>
            </Link>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <strong>{userName}</strong>
              <span>{departmentName}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEW CONTENT */}
      <div className="dashboard-main">
        {/* TOPBAR */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="topbar-action-btn mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="topbar-breadcrumbs">
              <span>Tulja Motors</span>
              <span>/</span>
              <span>Workspaces</span>
              <span>/</span>
              <strong>{roleTitle}</strong>
            </div>

            <div className="topbar-branch-pill">
              <span /> Main Workshop (Kolhapur)
            </div>
          </div>

          <div className="topbar-right">
            <button
              type="button"
              className="topbar-action-btn"
              onClick={() => window.location.reload()}
              title="Refresh Workspace"
            >
              <RefreshCw size={17} />
            </button>

            <button
              type="button"
              className="topbar-action-btn"
              title="Notifications"
            >
              <Bell size={17} />
            </button>

            <button
              type="button"
              className="topbar-logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}

