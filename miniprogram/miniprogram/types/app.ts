import type { RuntimeConfig } from '../config/env';
import type { SessionInfo, UserProfile } from './user';

export interface AppState {
  launchTime: string;
  runtimeConfig: RuntimeConfig;
  systemInfo: WechatMiniprogram.SystemInfo;
  session: SessionInfo | null;
  userProfile: UserProfile | null;
}
