export function setStorage<T>(key: string, value: T): void {
  wx.setStorageSync(key, value);
}

export function getStorage<T>(key: string): T | null {
  try {
    const value = wx.getStorageSync(key);
    return value ? (value as T) : null;
  } catch {
    return null;
  }
}

export function removeStorage(key: string): void {
  wx.removeStorageSync(key);
}
