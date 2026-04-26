import { config } from '@/lib/config';
import { LineSetupClient } from './client';

export default function LineSettingsPage() {
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const webhookUrl = `${appUrl}/api/webhooks/line`;

  const status = {
    hasAccessToken: !!config.line.channelAccessToken,
    hasSecret:      !!config.line.channelSecret,
    hasOwnerIds:    config.line.ownerLineIds.length > 0,
    ownerCount:     config.line.ownerLineIds.length,
    webhookUrl,
    ready: !!config.line.channelAccessToken && !!config.line.channelSecret && config.line.ownerLineIds.length > 0,
  };

  return <LineSetupClient status={status} />;
}
