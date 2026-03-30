import { runtimeConfig } from './config/env';
import {
  ensureDemoLogin,
  getLocalProfile,
  getLocalSession,
} from './services/auth';
import type { SessionInfo, UserProfile } from './types/user';

App<IAppOption>({
  globalData: {
    launchTime: '',
    runtimeConfig,
    systemInfo: wx.getSystemInfoSync(),
    session: getLocalSession(),
    userProfile: getLocalProfile(),
  },
  onLaunch() {
    this.globalData.launchTime = new Date().toLocaleString();
    void this.bootstrap();
  },
  async bootstrap() {
    try {
      const { session, profile } = await ensureDemoLogin();
      this.updateSession(session);
      this.updateUserProfile(profile);
    } catch (error) {
      console.warn('初始化登录态失败', error);
    }
  },
  updateSession(session: SessionInfo | null) {
    this.globalData.session = session;
  },
  updateUserProfile(profile: UserProfile | null) {
    this.globalData.userProfile = profile;
  },
});
