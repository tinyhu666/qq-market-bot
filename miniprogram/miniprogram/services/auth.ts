import { STORAGE_KEYS } from '../constants/storage';
import type { SessionInfo, UserProfile } from '../types/user';
import { getStorage, removeStorage, setStorage } from '../utils/storage';

function nextExpiryDate(hours = 12): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function createGuestProfile(): UserProfile {
  return {
    nickname: '开发体验账号',
    avatarUrl: '',
    role: 'guest',
    lastLoginAt: new Date().toLocaleString(),
  };
}

export function getLocalSession(): SessionInfo | null {
  return getStorage<SessionInfo>(STORAGE_KEYS.session);
}

export function getLocalProfile(): UserProfile | null {
  return getStorage<UserProfile>(STORAGE_KEYS.userProfile);
}

export function clearLocalAuth(): void {
  removeStorage(STORAGE_KEYS.session);
  removeStorage(STORAGE_KEYS.userProfile);
}

async function getLoginCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.login({
      success: ({ code }) => {
        if (code) {
          resolve(code);
          return;
        }
        reject(new Error('wx.login 未返回 code'));
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
}

export async function ensureDemoLogin(): Promise<{
  session: SessionInfo;
  profile: UserProfile;
}> {
  const cachedSession = getLocalSession();
  const cachedProfile = getLocalProfile();

  if (cachedSession && cachedProfile) {
    return {
      session: cachedSession,
      profile: cachedProfile,
    };
  }

  const code = await getLoginCode();
  const session: SessionInfo = {
    token: `mock_${code}`,
    expiresAt: nextExpiryDate(),
  };
  const profile = createGuestProfile();

  setStorage(STORAGE_KEYS.session, session);
  setStorage(STORAGE_KEYS.userProfile, profile);

  return {
    session,
    profile,
  };
}
