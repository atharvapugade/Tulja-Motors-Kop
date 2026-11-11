'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Wrench,
  Users,
  Headset,
  ClipboardList,
  ReceiptIndianRupee,
  Megaphone,
  Hammer,
  Package,
} from 'lucide-react';

const roleIcons: Record<string, typeof ShieldCheck> = {
  admin: ShieldCheck,
  director: TrendingUp,
  'body-shop-manager': Wrench,
  hr: Users,
  advisor: Headset,
  supervisor: ClipboardList,
  accounts: ReceiptIndianRupee,
  'digital-marketing': Megaphone,
  technician: Hammer,
  'spare-parts-manager': Package,
};

interface LoginFormProps {
  roleSlug: string;
  roleTitle: string;
  departmentName: string;
  description: string;
  accentColor?: string;
  accentBg?: string;
  defaultEmail?: string;
}

export default function LoginForm({
  roleSlug,
  roleTitle,
  departmentName,
  description,
  accentColor = '#045F60',
  accentBg = '#e8f3f1',
  defaultEmail = 'admin@tuljamotors.com',
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const Icon = roleIcons[roleSlug] || ShieldCheck;

  const handleQuickFill = () => {
    setEmail(defaultEmail);
    setPassword('Password@123');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          panelSlug: roleSlug,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Login failed. Please verify your credentials.');
        setLoading(false);
        return;
      }

      // Store token in localStorage for client-side API requests
      if (typeof window !== 'undefined' && data.token) {
        localStorage.setItem('tm_auth_token', data.token);
        localStorage.setItem('tm_user', JSON.stringify(data.user));
      }

      // Navigate to destination dashboard
      router.push(data.redirectUrl || `/panels/${roleSlug}/dashboard`);
    } catch {
      setErrorMessage('Network connection error. Please ensure the server is running.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        {/* HEADER */}
        <div className="auth-header">
          <div
            className="auth-role-tag"
            style={{ background: accentBg, color: accentColor }}
          >
            <Icon size={14} />
            <span>{departmentName}</span>
          </div>

          <h2>{roleTitle}</h2>
          <p>{description}</p>
        </div>

        {/* FORM BODY */}
        <div className="auth-body">
          {errorMessage && (
            <div className="auth-error-alert" role="alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="user-email">
                Work Email / Username
              </label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" size={17} />
                <input
                  id="user-email"
                  type="email"
                  className="auth-input"
                  placeholder="name@tuljamotors.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="user-password">
                Password
              </label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={17} />
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              style={{ background: accentColor }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In to Workspace <ArrowRight size={17} />
                </>
              )}
            </button>

            {/* QUICK-FILL TEST HELPER */}
            <button
              type="button"
              className="auth-quick-fill-btn"
              onClick={handleQuickFill}
            >
              <Sparkles size={14} /> Quick-Fill Demo Credentials ({defaultEmail})
            </button>
          </form>
        </div>

        {/* FOOTER */}
        <div className="auth-footer">
          <Link href="/panels">
            <ArrowLeft size={14} /> All Department Panels
          </Link>

          <Link href="/">
            Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
