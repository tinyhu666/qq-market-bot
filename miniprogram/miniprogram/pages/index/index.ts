import { runtimeConfig } from '../../config/env';

interface StatusItem {
  label: string;
  value: string;
}

interface ActionItem {
  title: string;
  description: string;
}

interface IndexPageData {
  title: string;
  subtitle: string;
  envBadge: string;
  baseURL: string;
  statusItems: StatusItem[];
  actionItems: ActionItem[];
  checklist: string[];
}

interface IndexPageCustom {
  goProfileCenter(): void;
  copyBaseURL(): void;
  showSessionInfo(): void;
}

const app = getApp<IAppOption>();

function buildPageData(): Partial<IndexPageData> {
  const { session, userProfile } = app.globalData;

  return {
    envBadge: runtimeConfig.env.toUpperCase(),
    baseURL: runtimeConfig.baseURL,
    statusItems: [
      {
        label: '运行环境',
        value: runtimeConfig.env,
      },
      {
        label: '接口地址',
        value: runtimeConfig.baseURL || '未配置',
      },
      {
        label: '分包页面',
        value: 'packageUser/pages/profile/index',
      },
      {
        label: '登录状态',
        value: session && userProfile ? '已初始化' : '等待初始化',
      },
    ],
    actionItems: [
      {
        title: '个人中心分包',
        description: '演示登录态读取、缓存清理和业务扩展入口。',
      },
      {
        title: 'request.ts',
        description: '封装了 baseURL、token 注入和统一错误提示。',
      },
      {
        title: 'config/env.ts',
        description: '集中管理开发、测试、生产环境配置。',
      },
    ],
  };
}

function formatSessionSummary(): string {
  const { session, userProfile } = app.globalData;

  if (!session || !userProfile) {
    return '当前还没有可用登录态，可以稍后重试或进入个人中心页手动初始化。';
  }

  return [
    `昵称：${userProfile.nickname}`,
    `角色：${userProfile.role}`,
    `Token：${session.token}`,
    `过期时间：${session.expiresAt}`,
  ].join('\n');
}

Page<IndexPageData, IndexPageCustom>({
  data: {
    title: '业务开发模板已就绪',
    subtitle:
      '这个首页现在同时承担项目导航和工程状态面板，方便后续继续扩展页面、接口和登录流程。',
    envBadge: runtimeConfig.env.toUpperCase(),
    baseURL: runtimeConfig.baseURL,
    statusItems: [],
    actionItems: [],
    checklist: [
      '把 miniprogram/config/env.ts 中的 baseURL 改成真实后端地址',
      '把 mock 登录替换成服务端 code2Session 交换流程',
      '按业务模块继续新增分包、页面和组件',
    ],
  },
  onShow() {
    this.setData(buildPageData());
  },
  goProfileCenter() {
    wx.navigateTo({
      url: '/packageUser/pages/profile/index',
    });
  },
  copyBaseURL() {
    wx.setClipboardData({
      data: runtimeConfig.baseURL,
    });
  },
  showSessionInfo() {
    wx.showModal({
      title: '本地登录态',
      content: formatSessionSummary(),
      showCancel: false,
    });
  },
});
