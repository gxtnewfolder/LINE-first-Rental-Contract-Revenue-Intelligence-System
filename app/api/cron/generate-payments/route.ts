// Cron endpoint for generating monthly payments
import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { paymentService } from '@/services/payment.service';

export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = config.security.cronSecret;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    // Use search params to override month/year if needed (for backfilling)
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || String(now.getFullYear()));
    const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1));

    const result = await paymentService.generateMonthlyPayments(year, month);
    const overdueCount = await paymentService.autoMarkOverdue();

    return NextResponse.json({
      success: true,
      generated: result.created,
      skipped: result.skipped,
      autoMarkedOverdue: overdueCount,
      period: `${year}-${String(month).padStart(2, '0')}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('POST /api/cron/generate-payments error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate payments', details: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'generate-payments',
    description: 'Auto-generate monthly rent payment records for all active contracts',
    method: 'POST',
    auth: 'Bearer token required',
  });
}
