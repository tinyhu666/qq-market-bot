import { runtimeConfig } from '../../../config/env';
import { clearLocalAuth, ensureDemoLogin } from '../../../services/auth';

interface ProfilePageData {
  envLabel: string;
  nickname: string;
  role: string;
  token: string;
  expiresAt: string;
  launchTime: string;
  system: string;
  tips: string[];
}

interface ProfilePageCustom {
  simulateLogin(): Promise<void>;
  resetLocalSession(): void;
}

const app = getApp<IAppOption>();

function buildProfileState(): ProfilePageData {
  const { userProfile, session, systemInfo, launchTime } = app.globalData;

  return {
    envLabel: runtimeConfig.env.toUpperCase(),
    nickname: userProfile?.nickname ?? '尚未初始化',
    role: userProfile?.role ?? 'unknown',
    token: session?.token ?? '暂无 token',
    expiresAt: session?.expiresAt ?? '暂无过期时间',
    launchTime: launchTime || '暂无记录',
    system: `${systemInfo.brand} ${systemInfo.model} / ${systemInfo.system}`,
    tips: [
      '真实业务里，把 ensureDemoLogin 替换成服务端登录接口。',
      '如果接口需要签名、刷新 token，可以继续扩展 utils/request.ts。',
      '这个页面已经放在分包里，后续适合承接用户中心、设置页等模块。',
    ],
  };
}

Page<ProfilePageData, ProfilePageCustom>({
  data: buildProfileState(),
  onShow() {
    this.setData(buildProfileState());
  },
  onPullDownRefresh() {
    this.setData(buildProfileState());
    wx.stopPullDownRefresh();
  },
  async simulateLogin() {
    try {
      const { session, profile } = await ensureDemoLogin();
      app.updateSession(session);
      app.updateUserProfile(profile);
      this.setData(buildProfileState());
      wx.showToast({
        title: '登录态已刷新',
        icon: 'success',
      });
    } catch (error) {
      wx.showToast({
        title: error instanceof Error ? error.message : '登录初始化失败',
        icon: 'none',
      });
    }
  },
  resetLocalSession() {
    clearLocalAuth();
    app.updateSession(null);
    app.updateUserProfile(null);
    this.setData(buildProfileState());
    wx.showToast({
      title: '本地缓存已清理',
      icon: 'none',
    });
  },
});
