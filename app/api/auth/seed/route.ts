import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function POST() {
  try {
    await db.resetToSeed();
    return NextResponse.json({
      success: true,
      message: 'System seed data successfully provisioned and reset.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to seed database';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
