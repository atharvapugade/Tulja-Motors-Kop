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
  Grid,
  Car,
  FileText,
  Clock,
  CheckCircle2,
  Menu,
  X,
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
  const navKey = `${pathname}?${currentTab}`;
  const [drawerOpenForNav, setDrawerOpenForNav] = useState<string | null>(null);
  const mobileMenuOpen = drawerOpenForNav === navKey;
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

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('wms-mobile-menu-open', mobileMenuOpen);

    if (!mobileMenuOpen) {
      return () => {
        document.body.classList.remove('wms-mobile-menu-open');
      };
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpenForNav(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('wms-mobile-menu-open');
    };
  }, [mobileMenuOpen]);

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
          { name: 'Overview', href: base, icon: LayoutDashboard },
          { name: 'Employees', href: `${base}?tab=employees`, icon: Users },
          { name: 'Job Cards', href: `${base}?tab=jobs`, icon: ClipboardList },
          { name: 'Billing', href: `${base}?tab=finance`, icon: ReceiptIndianRupee },
          { name: 'Audit Logs', href: `${base}?tab=logs`, icon: ShieldAlert },
        ];
      case 'director':
        return [
          { name: 'Overview', href: base, icon: LayoutDashboard },
          { name: 'Throughput', href: `${base}?tab=throughput`, icon: Car },
          { name: 'Financials', href: `${base}?tab=financials`, icon: ReceiptIndianRupee },
          { name: 'KPIs', href: `${base}?tab=kpis`, icon: Building2 },
        ];
      case 'body-shop-manager':
        return [
          { name: 'Overview', href: base, icon: LayoutDashboard },
          { name: 'Active Jobs', href: `${base}?tab=jobs`, icon: Car },
          { name: 'Technicians', href: `${base}?tab=technicians`, icon: Hammer },
          { name: 'Delays & Issues', href: `${base}?tab=delays`, icon: Clock },
          { name: 'Billing & Invoices', href: `${base}?tab=billing`, icon: ReceiptIndianRupee },
        ];
      /*
      case 'hr':
        return [
          { name: 'Overview', href: base, icon: LayoutDashboard },
          { name: 'Staff', href: `${base}?tab=staff`, icon: Users },
          { name: 'Attendance', href: `${base}?tab=attendance`, icon: UserCheck },
          { name: 'Marketing', href: `${base}?tab=marketing`, icon: Megaphone },
          { name: 'Leaves', href: `${base}?tab=leaves`, icon: Clock },
        ];
      */
      case 'advisor':
        return [
          { name: 'Overview', href: base, icon: LayoutDashboard },
          { name: 'Customers', href: `${base}?tab=customers`, icon: Users },
          { name: 'Vehicles', href: `${base}?tab=vehicles`, icon: Car },
          { name: 'Job Cards', href: `${base}?tab=jobs`, icon: FileText },
          { name: 'Handovers', href: `${base}?tab=supervisors`, icon: ClipboardList },
        ];
      case 'supervisor':
        return [
          { name: 'Overview', href: base, icon: LayoutDashboard },
          { name: 'Repair Board', href: `${base}?tab=stages`, icon: ClipboardList },
          { name: 'Technicians', href: `${base}?tab=tasks`, icon: Hammer },
          { name: 'Quality Check', href: `${base}?tab=quality`, icon: CheckCircle2 },
        ];
      case 'accounts':
        return [
          { name: 'Overview', href: base, icon: LayoutDashboard },
          { name: 'Invoices', href: `${base}?tab=invoices`, icon: ReceiptIndianRupee },
          { name: 'Payments', href: `${base}?tab=payments`, icon: CheckCircle2 },
          { name: 'Expenses', href: `${base}?tab=expenses`, icon: FileText },
        ];
      case 'digital-marketing':
        return [
          { name: 'Overview', href: base, icon: LayoutDashboard },
          { name: 'Leads', href: `${base}?tab=leads`, icon: Megaphone },
          { name: 'Enquiries', href: `${base}?tab=enquiries`, icon: Users },
          { name: 'Follow-ups', href: `${base}?tab=followups`, icon: Clock },
        ];
      case 'spare-parts-manager':
        return [
          { name: 'Overview', href: base, icon: LayoutDashboard },
          { name: 'Parts Catalog', href: `${base}?tab=parts`, icon: Package },
          { name: 'Requisitions', href: `${base}?tab=requisitions`, icon: ClipboardList },
          { name: 'Orders', href: `${base}?tab=orders`, icon: ReceiptIndianRupee },
        ];
      case 'technician':
        return [
          { name: 'My Jobs', href: base, icon: Hammer },
          { name: 'Tasks', href: `${base}?tab=tasks`, icon: ClipboardList },
          { name: 'Notes', href: `${base}?tab=notes`, icon: FileText },
        ];
      default:
        return [{ name: 'Overview', href: base, icon: LayoutDashboard }];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="dashboard-layout">
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setDrawerOpenForNav(null)}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link
            href="/"
            className="portal-brand"
            style={{ gap: '10px', minWidth: 0 }}
            onClick={() => setDrawerOpenForNav(null)}
          >
            <Image
              src="/tulja-motors-logo.png"
              alt="Tulja Motors Logo"
              width={140}
              height={42}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Link>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setDrawerOpenForNav(null)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
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
                onClick={() => setDrawerOpenForNav(null)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
            <span className="sidebar-section-title">Portals Gateway</span>
            <Link
              href="/panels"
              className="sidebar-link"
              onClick={() => setDrawerOpenForNav(null)}
            >
              <Grid size={18} />
              <span>All Panels Gateway</span>
            </Link>
            <Link
              href="/"
              className="sidebar-link"
              onClick={() => setDrawerOpenForNav(null)}
            >
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
          <div className="sidebar-mobile-branch">
            <span /> Main Workshop (Kolhapur)
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
              onClick={() => setDrawerOpenForNav(mobileMenuOpen ? null : navKey)}
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="topbar-mobile-title">{roleTitle}</div>

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
              className="topbar-logout-btn"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut size={15} />
              <span className="topbar-logout-text">Logout</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}

