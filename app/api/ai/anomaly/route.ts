// AI Anomaly detection API
import { NextResponse } from 'next/server';
import { aiService } from '@/ai';

export async function GET() {
  try {
    const result = await aiService.detectAnomalies();

    return NextResponse.json({
      success: result.success,
      analysis: result.content,
      fallback: result.fallback,
      error: result.error,
    });
  } catch (error) {
    console.error('GET /api/ai/anomaly error:', error);
    return NextResponse.json(
      { error: 'Failed to detect anomalies' },
      { status: 500 }
    );
  }
}
