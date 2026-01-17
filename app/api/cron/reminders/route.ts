// Cron endpoint for sending reminders
import { NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { notificationService } from '@/services/notification.service';

export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = config.security.cronSecret;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Send notifications
    const [expiringCount, overdueCount] = await Promise.all([
      notificationService.notifyExpiringContracts(30),
      notificationService.notifyOverduePayments(),
    ]);

    return NextResponse.json({
      success: true,
      notifications: {
        expiringContracts: expiringCount,
        overduePayments: overdueCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron reminders error:', error);
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'reminders',
    description: 'Send contract expiry and overdue payment reminders',
    method: 'POST',
    auth: 'Bearer token required',
  });
}
