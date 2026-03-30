export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

export interface RequestConfig {
  url: string;
  method?: WechatMiniprogram.RequestOption['method'];
  data?: WechatMiniprogram.IAnyObject | string | ArrayBuffer;
  header?: WechatMiniprogram.IAnyObject;
  timeout?: number;
  showErrorToast?: boolean;
  skipAuth?: boolean;
}
