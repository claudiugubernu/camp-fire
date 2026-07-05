import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
  useRef,
} from 'react';
import type {
  AppState,
  CampUser,
  CheckIn,
  QuestionAnswer,
  TeamId,
} from '@/types';
import {
  signInAnonymous,
  createUserProfile,
  getUserProfile,
  subscribeToAuthChanges,
} from '@/services/authService';
import {
  getUserCheckIns,
  performCheckIn,
  getAllCheckIns,
} from '@/services/checkInService';
import { getUserAppreciations } from '@/services/appreciationService';
import { fetchDays } from '@/services/daysService';
import { calculateStreak } from '@/features/streak/streakUtils';
import { computeBadges } from '@/features/badges/badgeLogic';
import { getUserAnswers, getAllAnswers } from '@/services/questionService';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

// ─── State & Actions ──────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: CampUser | null }
  | { type: 'SET_CHECKINS'; payload: CheckIn[] }
  | { type: 'ADD_CHECKIN'; payload: CheckIn }
  | { type: 'SET_DAYS'; payload: AppState['days'] }
  | { type: 'RECOMPUTE_DERIVED' }
  | { type: 'SET_ALL_CHECKINS'; payload: CheckIn[] }
  | { type: 'SET_USER_TEAM_MAP'; payload: Record<string, TeamId> }
  | { type: 'SET_APPRECIATION_COUNT'; payload: number }
  | { type: 'INCREMENT_APPRECIATION_COUNT' }
  | { type: 'SET_MY_ANSWERS'; payload: QuestionAnswer[] }
  | { type: 'SET_ALL_ANSWERS'; payload: QuestionAnswer[] }
  | { type: 'ADD_ANSWER'; payload: QuestionAnswer }
  | { type: 'SET_USER_NICKNAME_MAP'; payload: Record<string, string> };

const initialState: AppState = {
  user: null,
  checkIns: [],
  allCheckIns: [],
  userTeamMap: {},
  streak: { current: 0, longest: 0, completedDays: [], totalCompleted: 0 },
  badges: [],
  days: [],
  loading: true,
  error: null,
  appreciationCount: 0,
  myAnswers: [],
  allAnswers: [],
  userNicknameMap: {},
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
      const badges = computeBadges(
        action.payload,
        state.days,
        state.user,
        state.allCheckIns,
        state.userTeamMap,
        state.appreciationCount,
      );
      return { ...state, checkIns: action.payload, streak, badges };
    }
    case 'SET_ALL_CHECKINS': {
      if (!state.user) return { ...state, allCheckIns: action.payload };
      const badges = computeBadges(
        state.checkIns,
        state.days,
        state.user,
        action.payload,
        state.userTeamMap,
        state.appreciationCount,
      );
      return { ...state, allCheckIns: action.payload, badges };
    }
    case 'ADD_CHECKIN': {
      const updated = [...state.checkIns, action.payload];
      if (!state.user) return { ...state, checkIns: updated };
      const streak = calculateStreak(updated, state.days);
      const badges = computeBadges(
        updated,
        state.days,
        state.user,
        state.allCheckIns,
        state.userTeamMap,
        state.appreciationCount,
      );
      return { ...state, checkIns: updated, streak, badges };
    }
    case 'RECOMPUTE_DERIVED': {
      if (!state.user) return state;
      const streak = calculateStreak(state.checkIns, state.days);
      const badges = computeBadges(
        state.checkIns,
        state.days,
        state.user,
        state.allCheckIns,
        state.userTeamMap,
        state.appreciationCount,
      );
      return { ...state, streak, badges };
    }
    case 'SET_USER_TEAM_MAP': {
      if (!state.user) return { ...state, userTeamMap: action.payload };
      const badges = computeBadges(
        state.checkIns,
        state.days,
        state.user,
        state.allCheckIns,
        action.payload,
        state.appreciationCount,
      );
      return { ...state, userTeamMap: action.payload, badges };
    }
    case 'SET_APPRECIATION_COUNT': {
      if (!state.user) return { ...state, appreciationCount: action.payload };
      const badges = computeBadges(
        state.checkIns,
        state.days,
        state.user,
        state.allCheckIns,
        state.userTeamMap,
        action.payload,
      );
      return { ...state, appreciationCount: action.payload, badges };
    }
    case 'INCREMENT_APPRECIATION_COUNT': {
      const newCount = state.appreciationCount + 1;
      if (!state.user) return { ...state, appreciationCount: newCount };
      const badges = computeBadges(
        state.checkIns,
        state.days,
        state.user,
        state.allCheckIns,
        state.userTeamMap,
        newCount,
      );
      return { ...state, appreciationCount: newCount, badges };
    }
    case 'SET_MY_ANSWERS':
      return { ...state, myAnswers: action.payload };

    case 'SET_ALL_ANSWERS':
      return { ...state, allAnswers: action.payload };

    case 'ADD_ANSWER': {
      const updatedMyAnswers = [...state.myAnswers, action.payload];
      const updatedAllAnswers = [...state.allAnswers, action.payload];
      if (!state.user)
        return {
          ...state,
          myAnswers: updatedMyAnswers,
          allAnswers: updatedAllAnswers,
        };
      const badges = computeBadges(
        state.checkIns,
        state.days,
        state.user,
        state.allCheckIns,
        state.userTeamMap,
        state.appreciationCount,
        updatedMyAnswers,
        updatedAllAnswers,
      );
      return {
        ...state,
        myAnswers: updatedMyAnswers,
        allAnswers: updatedAllAnswers,
        badges,
      };
    }
    case 'SET_USER_NICKNAME_MAP':
      return { ...state, userNicknameMap: action.payload };
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
    incrementAppreciationCount: () => void;
    addAnswer: (answer: QuestionAnswer) => void;
  };
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const onboardingInProgressRef = useRef(false);

  const incrementAppreciationCount = useCallback(() => {
    dispatch({ type: 'INCREMENT_APPRECIATION_COUNT' });
  }, []);

  // Bootstrap: listen to auth, load user + data
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const days = await fetchDays();
        dispatch({ type: 'SET_DAYS', payload: days });

        if (firebaseUser) {
          if (onboardingInProgressRef.current) {
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
          }

          const profile = await getUserProfile(firebaseUser.uid);

          if (profile) {
            const days = await fetchDays();
            dispatch({ type: 'SET_DAYS', payload: days });

            dispatch({ type: 'SET_USER', payload: profile });

            const [
              checkIns,
              allCheckIns,
              usersSnap,
              appreciations,
              myAnswers,
              allAnswers,
            ] = await Promise.all([
              getUserCheckIns(firebaseUser.uid),
              getAllCheckIns(),
              getDocs(collection(db, 'users')),
              getUserAppreciations(firebaseUser.uid),
              getUserAnswers(firebaseUser.uid),
              getAllAnswers(),
            ]);

            const userTeamMap: Record<string, TeamId> = {};
            const userNicknameMap: Record<string, string> = {};

            usersSnap.docs.forEach((d) => {
              userTeamMap[d.id] = d.data().teamId as TeamId;
              userNicknameMap[d.id] = d.data().nickname as string;
            });

            dispatch({ type: 'SET_CHECKINS', payload: checkIns });
            dispatch({ type: 'SET_ALL_CHECKINS', payload: allCheckIns });
            dispatch({ type: 'SET_USER_TEAM_MAP', payload: userTeamMap });
            dispatch({
              type: 'SET_USER_NICKNAME_MAP',
              payload: userNicknameMap,
            });
            dispatch({
              type: 'SET_APPRECIATION_COUNT',
              payload: appreciations.length,
            });
            dispatch({ type: 'SET_MY_ANSWERS', payload: myAnswers });
            dispatch({ type: 'SET_ALL_ANSWERS', payload: allAnswers });
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
    onboardingInProgressRef.current = true;
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
      onboardingInProgressRef.current = false;
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

  const addAnswer = useCallback((answer: QuestionAnswer) => {
    dispatch({ type: 'ADD_ANSWER', payload: answer });
  }, []);

  const refreshCheckIns = useCallback(async () => {
    if (!state.user) return;
    const checkIns = await getUserCheckIns(state.user.uid);
    dispatch({ type: 'SET_CHECKINS', payload: checkIns });
  }, [state.user]);

  return (
    <AppContext.Provider
      value={{
        state,
        actions: {
          onboard,
          checkIn,
          refreshCheckIns,
          incrementAppreciationCount,
          addAnswer,
        },
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
