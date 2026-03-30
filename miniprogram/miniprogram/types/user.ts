export interface SessionInfo {
  token: string;
  expiresAt: string;
}

export interface UserProfile {
  nickname: string;
  avatarUrl: string;
  role: 'guest' | 'member';
  lastLoginAt: string;
}
