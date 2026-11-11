import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { comparePassword, signAuthToken } from '@/lib/auth/jwt';
import { canAccessPanel, getSlugByUserRole } from '@/lib/auth/rbac';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, panelSlug } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide both email/username and password.' },
        { status: 400 }
      );
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. User account not found.' },
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated. Please contact Administrator.' },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Incorrect password.' },
        { status: 401 }
      );
    }

    // If logging in from a specific panel, verify authorization
    if (panelSlug && !canAccessPanel(user.role, panelSlug)) {
      return NextResponse.json(
        {
          success: false,
          message: `Access denied. Your role (${user.role.replace('_', ' ')}) is not authorized to access the ${panelSlug} panel.`,
        },
        { status: 403 }
      );
    }

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    });

    const targetSlug = panelSlug || getSlugByUserRole(user.role);
    const redirectUrl = `/panels/${targetSlug}/dashboard`;

    await db.logActivity({
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      performedBy: user.name,
      userRole: user.role,
      details: `User logged into ${targetSlug} workspace successfully.`,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      token,
      redirectUrl,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set('tm_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
