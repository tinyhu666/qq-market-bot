import { runtimeConfig } from '../config/env';
import { STORAGE_KEYS } from '../constants/storage';
import type { ApiEnvelope, RequestConfig } from '../types/network';
import { getStorage } from './storage';
import { showErrorToast } from './toast';

function isAbsoluteURL(url: string): boolean {
  return /^https?:\/\//.test(url);
}

function buildURL(url: string): string {
  if (isAbsoluteURL(url)) {
    return url;
  }

  if (!runtimeConfig.baseURL) {
    throw new Error('请先在 miniprogram/config/env.ts 中配置 baseURL。');
  }

  return `${runtimeConfig.baseURL}${url}`;
}

export function request<T>(config: RequestConfig): Promise<T> {
  const {
    url,
    method = 'GET',
    data,
    timeout = 10000,
    header = {},
    showErrorToast: shouldShowErrorToast = true,
    skipAuth = false,
  } = config;

  const session = getStorage<{ token: string }>(STORAGE_KEYS.session);
  const authHeader =
    !skipAuth && session?.token
      ? { Authorization: `Bearer ${session.token}` }
      : {};

  return new Promise((resolve, reject) => {
    let requestURL = '';

    try {
      requestURL = buildURL(url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '请求地址配置无效';
      if (shouldShowErrorToast) {
        showErrorToast(message);
      }
      reject(new Error(message));
      return;
    }

    wx.request({
      url: requestURL,
      method,
      data,
      timeout,
      header: {
        'content-type': 'application/json',
        ...authHeader,
        ...header,
      },
      success: (response) => {
        const { statusCode, data: responseData } = response;

        if (statusCode < 200 || statusCode >= 300) {
          const message = `请求失败，HTTP 状态码 ${statusCode}`;
          if (shouldShowErrorToast) {
            showErrorToast(message);
          }
          reject(new Error(message));
          return;
        }

        if (
          responseData &&
          typeof responseData === 'object' &&
          'code' in responseData &&
          'data' in responseData
        ) {
          const envelope = responseData as ApiEnvelope<T>;
          if (envelope.code !== 0) {
            if (shouldShowErrorToast) {
              showErrorToast(envelope.message || '接口返回异常');
            }
            reject(new Error(envelope.message || '接口返回异常'));
            return;
          }
          resolve(envelope.data);
          return;
        }

        resolve(responseData as T);
      },
      fail: (error) => {
        const message = error.errMsg || '网络请求失败';
        if (shouldShowErrorToast) {
          showErrorToast(message);
        }
        reject(new Error(message));
      },
    });
  });
}
