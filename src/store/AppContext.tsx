import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { AppState, CampUser, CheckIn, TeamId } from '@/types';
import {
  signInAnonymous,
  createUserProfile,
  getUserProfile,
  subscribeToAuthChanges,
} from '@/services/authService';
import { getUserCheckIns, performCheckIn } from '@/services/checkInService';
import { fetchDays } from '@/services/daysService';
import { calculateStreak } from '@/features/streak/streakUtils';
import { computeBadges } from '@/features/badges/badgeLogic';

// ─── State & Actions ──────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: CampUser | null }
  | { type: 'SET_CHECKINS'; payload: CheckIn[] }
  | { type: 'ADD_CHECKIN'; payload: CheckIn }
  | { type: 'SET_DAYS'; payload: AppState['days'] }
  | { type: 'RECOMPUTE_DERIVED' };

const initialState: AppState = {
  user: null,
  checkIns: [],
  streak: { current: 0, longest: 0, completedDays: [], totalCompleted: 0 },
  badges: [],
  days: [],
  loading: true,
  error: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_DAYS':
      return { ...state, days: action.payload };
    case 'SET_CHECKINS': {
      if (!state.user) return { ...state, checkIns: action.payload };
      const streak = calculateStreak(action.payload, state.days);
      const badges = computeBadges(action.payload, state.days, state.user);
      return { ...state, checkIns: action.payload, streak, badges };
    }
    case 'ADD_CHECKIN': {
      const updated = [...state.checkIns, action.payload];
      if (!state.user) return { ...state, checkIns: updated };
      const streak = calculateStreak(updated, state.days);
      const badges = computeBadges(updated, state.days, state.user);
      return { ...state, checkIns: updated, streak, badges };
    }
    case 'RECOMPUTE_DERIVED': {
      if (!state.user) return state;
      const streak = calculateStreak(state.checkIns, state.days);
      const badges = computeBadges(state.checkIns, state.days, state.user);
      return { ...state, streak, badges };
    }
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  actions: {
    onboard: (nickname: string, teamId: TeamId) => Promise<void>;
    checkIn: (
      dayId: string,
    ) => Promise<{ success: boolean; alreadyDone: boolean }>;
    refreshCheckIns: () => Promise<void>;
  };
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Bootstrap: listen to auth, load user + data
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const days = await fetchDays();
        dispatch({ type: 'SET_DAYS', payload: days });

        if (firebaseUser) {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            dispatch({ type: 'SET_USER', payload: profile });
            const checkIns = await getUserCheckIns(firebaseUser.uid);
            dispatch({ type: 'SET_CHECKINS', payload: checkIns });
          }
        } else {
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

    return unsubscribe;
  }, []);

  const onboard = useCallback(async (nickname: string, teamId: TeamId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const firebaseUser = await signInAnonymous();
      const profile = await createUserProfile(
        firebaseUser.uid,
        nickname,
        teamId,
      );
      dispatch({ type: 'SET_USER', payload: profile });
      dispatch({ type: 'SET_CHECKINS', payload: [] });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const checkIn = useCallback(
    async (dayId: string) => {
      if (!state.user) throw new Error('Not authenticated');
      const result = await performCheckIn(state.user.uid, dayId);
      if (result.success && result.checkIn) {
        dispatch({ type: 'ADD_CHECKIN', payload: result.checkIn });
      }
      return { success: result.success, alreadyDone: result.alreadyDone };
    },
    [state.user],
  );

  const refreshCheckIns = useCallback(async () => {
    if (!state.user) return;
    const checkIns = await getUserCheckIns(state.user.uid);
    dispatch({ type: 'SET_CHECKINS', payload: checkIns });
  }, [state.user]);

  return (
    <AppContext.Provider
      value={{ state, actions: { onboard, checkIn, refreshCheckIns } }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
