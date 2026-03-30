import type { AppState } from '../miniprogram/types/app';
import type { SessionInfo, UserProfile } from '../miniprogram/types/user';

declare global {
  interface IAppOption {
    globalData: AppState;
    bootstrap(): Promise<void>;
    updateSession(session: SessionInfo | null): void;
    updateUserProfile(profile: UserProfile | null): void;
  }
}

export {};
