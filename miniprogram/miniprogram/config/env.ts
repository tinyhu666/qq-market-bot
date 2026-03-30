export type AppEnv = 'dev' | 'test' | 'prod';

export interface RuntimeConfig {
  env: AppEnv;
  appName: string;
  baseURL: string;
  enableMock: boolean;
}

const configMap: Record<AppEnv, RuntimeConfig> = {
  dev: {
    env: 'dev',
    appName: '微信小程序业务模板',
    baseURL: 'https://example.com/api',
    enableMock: true,
  },
  test: {
    env: 'test',
    appName: '微信小程序业务模板',
    baseURL: 'https://test.example.com/api',
    enableMock: false,
  },
  prod: {
    env: 'prod',
    appName: '微信小程序业务模板',
    baseURL: 'https://example.com/api',
    enableMock: false,
  },
};

export const APP_ENV: AppEnv = 'dev';

export const runtimeConfig = configMap[APP_ENV];
