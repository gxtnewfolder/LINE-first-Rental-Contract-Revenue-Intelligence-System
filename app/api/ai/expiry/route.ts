// AI Expiry reminder API
import { NextResponse } from 'next/server';
import { aiService } from '@/ai';

export async function GET() {
  try {
    const result = await aiService.generateExpiryReminder();

    return NextResponse.json({
      success: result.success,
      reminder: result.content,
      fallback: result.fallback,
      error: result.error,
    });
  } catch (error) {
    console.error('GET /api/ai/expiry error:', error);
    return NextResponse.json(
      { error: 'Failed to generate expiry reminder' },
      { status: 500 }
    );
  }
}
