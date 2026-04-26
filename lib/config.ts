// Application configuration
// Centralizes environment variable access with type safety

export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://dev:dev@localhost:5433/rental_dev',
  },
  
  // LINE Messaging API
  line: {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
    ownerLineIds: (process.env.OWNER_LINE_IDS || '').split(',').filter(Boolean),
  },
  
  // Security
  security: {
    signingSecret: process.env.SIGNING_SECRET || '',
    cronSecret: process.env.CRON_SECRET || '',
  },
  
  // AI
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
  },
  
  // Application
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV !== 'production',
  },

  // LINE LIFF (for tenant self-registration)
  liff: {
    id: process.env.NEXT_PUBLIC_LIFF_ID || '',
  },

  // LINE Login channel (OAuth2 for web dashboard)
  lineLogin: {
    channelId: process.env.LINE_LOGIN_CHANNEL_ID || '',
    channelSecret: process.env.LINE_LOGIN_CHANNEL_SECRET || '',
    sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production',
  },

  // Owner info for PDF contract generation
  owner: {
    name: process.env.OWNER_NAME || 'เจ้าของตึก',
    address: process.env.OWNER_ADDRESS || 'กรุงเทพมหานคร',
    idCard: process.env.OWNER_ID_CARD || 'X-XXXX-XXXXX-XX-X',
  },
} as const;

export type Config = typeof config;
