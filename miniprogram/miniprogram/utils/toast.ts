export function showErrorToast(title: string): void {
  wx.showToast({
    title,
    icon: 'none',
    duration: 2200,
  });
}

export function showSuccessToast(title: string): void {
  wx.showToast({
    title,
    icon: 'success',
    duration: 1800,
  });
}
