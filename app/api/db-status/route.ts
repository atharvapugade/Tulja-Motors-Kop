import { NextResponse, connection } from 'next/server';
import { connectToDatabase, getDbConnectionStatus } from '@/lib/db/connect';

export async function GET() {
  await connection();
  try {
    const connResult = await connectToDatabase();
    const status = await getDbConnectionStatus();

    return NextResponse.json({
      success: connResult.isConnected,
      ...status,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database check failed';
    return NextResponse.json(
      {
        success: false,
        isConnected: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

