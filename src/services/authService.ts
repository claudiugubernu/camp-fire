import {
  signInAnonymously,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { CampUser, TeamId } from '@/types';

const USERS_COLLECTION = 'users';
const LOCAL_USER_KEY = 'campfire_user';

export async function signInAnonymous(): Promise<User> {
  const credential = await signInAnonymously(auth);
  return credential.user;
}

export async function createUserProfile(
  uid: string,
  nickname: string,
  teamId: TeamId,
): Promise<CampUser> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const profile: Omit<CampUser, 'uid'> = {
    nickname,
    teamId,
    createdAt: Date.now(),
    isAdmin: false,
  };

  await setDoc(userRef, {
    ...profile,
    createdAtServer: serverTimestamp(),
  });

  const campUser: CampUser = { uid, ...profile };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(campUser));
  return campUser;
}

export async function getUserProfile(uid: string): Promise<CampUser | null> {
  // Fast path: local cache
  const cached = localStorage.getItem(LOCAL_USER_KEY);
  if (cached) {
    const parsed = JSON.parse(cached) as CampUser;
    if (parsed.uid === uid) return parsed;
  }

  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;

  const data = snap.data();
  const campUser: CampUser = {
    uid,
    nickname: data.nickname as string,
    teamId: data.teamId as TeamId,
    createdAt: data.createdAt as number,
    isAdmin: (data.isAdmin as boolean) ?? false,
  };

  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(campUser));
  return campUser;
}

export function clearLocalUser(): void {
  localStorage.removeItem(LOCAL_USER_KEY);
}

export function subscribeToAuthChanges(
  callback: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}
