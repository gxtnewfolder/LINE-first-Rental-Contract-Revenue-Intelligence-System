// AI Service wrapper - OpenAI integration with guardrails
import { config } from '@/lib/config';
import {
  SYSTEM_PROMPT,
  MONTHLY_SUMMARY_TEMPLATE,
  RENT_ADJUSTMENT_TEMPLATE,
  ANOMALY_DETECTION_TEMPLATE,
  EXPIRY_REMINDER_TEMPLATE,
  fillTemplate,
} from './prompts';
import { analyticsService } from '@/services/analytics.service';
import { inflationService } from '@/services/inflation.service';

interface AIResponse {
  success: boolean;
  content: string;
  fallback: boolean;
  error?: string;
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  const apiKey = config.ai.openaiApiKey;

  if (!apiKey) {
    return {
      success: false,
      content: '',
      fallback: true,
      error: 'OpenAI API key not configured',
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.3, // Low for consistent, factual output
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        content: '',
        fallback: true,
        error: `OpenAI API error: ${error}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Validate response - check for hallucination markers
    if (content.includes('ไม่มีข้อมูล') && content.length < 50) {
      return {
        success: true,
        content,
        fallback: false,
      };
    }

    return {
      success: true,
      content: content.trim(),
      fallback: false,
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate fallback summary without AI
 */
function generateFallbackSummary(data: {
  total: number;
  collectionRate: number;
  occupancyRate: number;
  overdueCount: number;
  expiringCount: number;
}): string {
  const parts: string[] = [];

  parts.push(`📊 รายได้เดือนนี้: ฿${data.total.toLocaleString()}`);
  parts.push(`💰 เก็บเงินได้ ${data.collectionRate}%`);
  parts.push(`🏠 Occupancy ${data.occupancyRate}%`);

  if (data.overdueCount > 0) {
    parts.push(`⚠️ ค้างชำระ ${data.overdueCount} ราย`);
  }

  if (data.expiringCount > 0) {
    parts.push(`📅 สัญญาใกล้หมด ${data.expiringCount} สัญญา`);
  }

  return parts.join('\n');
}

export const aiService = {
  /**
   * Generate monthly summary
   */
  async generateMonthlySummary(
    year?: number,
    month?: number
  ): Promise<AIResponse> {
    const now = new Date();
    const y = year || now.getFullYear();
    const m = month || now.getMonth() + 1;

    const thaiMonths = [
      '', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
    ];

    try {
      const snapshot = await analyticsService.getSnapshot(y, m);

      const buildingBreakdown = snapshot.income.byBuilding
        .map((b) => `${b.name}: ฿${b.amount.toLocaleString()}`)
        .join(', ');

      const overdueAmount = snapshot.collection.overdue.reduce(
        (sum, o) => sum + o.amount,
        0
      );

      const data = {
        month: thaiMonths[m],
        year: y + 543, // Buddhist year
        totalIncome: snapshot.income.total,
        buildingBreakdown,
        collectionRate: snapshot.collection.rate,
        overdueAmount,
        overdueCount: snapshot.collection.overdue.length,
        occupancyRate: snapshot.occupancy.current,
        vacantCount: snapshot.occupancy.vacant.length,
        expiringCount: snapshot.contracts.expiringSoon.length,
      };

      const userPrompt = fillTemplate(MONTHLY_SUMMARY_TEMPLATE, data);

      // Try AI first
      const aiResponse = await callOpenAI(SYSTEM_PROMPT, userPrompt);

      if (aiResponse.success && !aiResponse.fallback) {
        return aiResponse;
      }

      // Fallback to template
      return {
        success: true,
        content: generateFallbackSummary({
          total: snapshot.income.total,
          collectionRate: snapshot.collection.rate,
          occupancyRate: snapshot.occupancy.current,
          overdueCount: snapshot.collection.overdue.length,
          expiringCount: snapshot.contracts.expiringSoon.length,
        }),
        fallback: true,
      };
    } catch (error) {
      return {
        success: false,
        content: '❌ ไม่สามารถสร้างสรุปได้',
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Generate rent adjustment explanation
   */
  async generateRentAdvice(contractId: string): Promise<AIResponse> {
    try {
      const adjustments = await inflationService.getAllRentAdjustments();
      const contract = adjustments.find((a) => a.contractId === contractId);

      if (!contract) {
        return {
          success: false,
          content: '❌ ไม่พบข้อมูลสัญญา',
          fallback: true,
        };
      }

      const data = {
        room: contract.roomNumber,
        building: contract.buildingName,
        tenantName: contract.tenantName,
        tenantYears: Math.round(contract.adjustment.tenantFactor * 100),
        currentRent: contract.adjustment.currentRent,
        originalRent: contract.adjustment.minimumRent,
        inflationPct: contract.adjustment.inflationPct.toFixed(1),
        rentGrowthPct: contract.adjustment.rentGrowthPct.toFixed(1),
        gap: contract.adjustment.gap.toFixed(1),
        suggestedRent: contract.adjustment.suggestedRent,
      };

      const userPrompt = fillTemplate(RENT_ADJUSTMENT_TEMPLATE, data);

      // Try AI first
      const aiResponse = await callOpenAI(SYSTEM_PROMPT, userPrompt);

      if (aiResponse.success && !aiResponse.fallback) {
        return aiResponse;
      }

      // Fallback
      return {
        success: true,
        content: contract.adjustment.reasoning,
        fallback: true,
      };
    } catch (error) {
      return {
        success: false,
        content: '❌ ไม่สามารถวิเคราะห์ได้',
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Generate anomaly detection summary
   */
  async detectAnomalies(): Promise<AIResponse> {
    try {
      const trend = await analyticsService.getIncomeTrend(6);

      if (trend.length === 0) {
        return {
          success: true,
          content: '📊 ยังไม่มีข้อมูลเพียงพอสำหรับการวิเคราะห์',
          fallback: true,
        };
      }

      const thaiMonths = [
        '', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
      ];

      const incomeTrend = trend
        .map((t) => `${thaiMonths[t.month]}: ฿${t.total.toLocaleString()}`)
        .join('\n');

      const total = trend.reduce((sum, t) => sum + t.total, 0);
      const average = total / trend.length;
      const current = trend[trend.length - 1];
      const deviation = ((current.total - average) / average) * 100;

      const data = {
        incomeTrend,
        currentMonth: thaiMonths[current.month],
        currentIncome: current.total,
        averageIncome: Math.round(average),
        deviation: deviation.toFixed(1),
      };

      const userPrompt = fillTemplate(ANOMALY_DETECTION_TEMPLATE, data);

      // Try AI
      const aiResponse = await callOpenAI(SYSTEM_PROMPT, userPrompt);

      if (aiResponse.success && !aiResponse.fallback) {
        return aiResponse;
      }

      // Fallback
      const status =
        Math.abs(deviation) < 10
          ? '✅ รายได้ปกติ'
          : deviation > 0
            ? '📈 รายได้สูงกว่าปกติ'
            : '📉 รายได้ต่ำกว่าปกติ';

      return {
        success: true,
        content: `${status} (${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}% จากค่าเฉลี่ย)`,
        fallback: true,
      };
    } catch (error) {
      return {
        success: false,
        content: '❌ ไม่สามารถตรวจสอบได้',
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Generate expiry reminder summary
   */
  async generateExpiryReminder(): Promise<AIResponse> {
    try {
      const now = new Date();
      const snapshot = await analyticsService.getSnapshot(
        now.getFullYear(),
        now.getMonth() + 1
      );

      if (snapshot.contracts.expiringSoon.length === 0) {
        return {
          success: true,
          content: '✅ ไม่มีสัญญาที่จะหมดในเดือนหน้า',
          fallback: false,
        };
      }

      const expiringContracts = snapshot.contracts.expiringSoon
        .map(
          (c) =>
            `- ห้อง ${c.room}: ${c.tenant} (เหลือ ${c.daysRemaining} วัน)`
        )
        .join('\n');

      const userPrompt = fillTemplate(EXPIRY_REMINDER_TEMPLATE, {
        expiringContracts,
      });

      // Try AI
      const aiResponse = await callOpenAI(SYSTEM_PROMPT, userPrompt);

      if (aiResponse.success && !aiResponse.fallback) {
        return aiResponse;
      }

      // Fallback
      return {
        success: true,
        content: `⚠️ สัญญาใกล้หมด ${snapshot.contracts.expiringSoon.length} รายการ\n\n${expiringContracts}`,
        fallback: true,
      };
    } catch (error) {
      return {
        success: false,
        content: '❌ ไม่สามารถตรวจสอบได้',
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
