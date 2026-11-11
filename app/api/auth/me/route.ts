import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth/jwt';
import { db } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const cookie = req.cookies.get('tm_auth_token');
      if (cookie) {
        token = cookie.value;
      }
    }

    if (!token) {
      return NextResponse.json({ authenticated: false, message: 'No active session' }, { status: 401 });
    }

    const payload = verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, message: 'Invalid or expired token' }, { status: 401 });
    }

    const user = await db.getUserById(payload.userId);
    if (!user || user.status !== 'active') {
      return NextResponse.json({ authenticated: false, message: 'User not found or inactive' }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        phone: user.phone,
        reportingManager: user.reportingManager,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ authenticated: false, message }, { status: 500 });
  }
}
