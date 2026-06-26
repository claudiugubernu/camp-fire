import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { CheckIn } from '@/types';

const CHECKINS_COLLECTION = 'checkins';
const EARLY_BIRD_HOUR = 9; // before 9 AM local time

function makeDocId(userId: string, dayId: string): string {
  return `${userId}_${dayId}`;
}

function isEarlyBird(): boolean {
  return new Date().getHours() < EARLY_BIRD_HOUR;
}

export async function performCheckIn(
  userId: string,
  dayId: string,
): Promise<{
  success: boolean;
  alreadyDone: boolean;
  checkIn: CheckIn | null;
}> {
  const docId = makeDocId(userId, dayId);
  const ref = doc(db, CHECKINS_COLLECTION, docId);

  const existing = await getDoc(ref);
  if (existing.exists()) {
    const data = existing.data();
    return {
      success: false,
      alreadyDone: true,
      checkIn: {
        userId: data.userId as string,
        dayId: data.dayId as string,
        completedAt: data.completedAt as number,
        earlyBird: data.earlyBird as boolean,
      },
    };
  }

  const checkIn: CheckIn = {
    userId,
    dayId,
    completedAt: Date.now(),
    earlyBird: isEarlyBird(),
  };

  await setDoc(ref, {
    ...checkIn,
    completedAtServer: serverTimestamp(),
  });

  return { success: true, alreadyDone: false, checkIn };
}

export async function getUserCheckIns(userId: string): Promise<CheckIn[]> {
  const q = query(
    collection(db, CHECKINS_COLLECTION),
    where('userId', '==', userId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      userId: data.userId as string,
      dayId: data.dayId as string,
      completedAt: data.completedAt as number,
      earlyBird: data.earlyBird as boolean,
    };
  });
}

export async function getAllCheckIns(): Promise<CheckIn[]> {
  const snap = await getDocs(collection(db, CHECKINS_COLLECTION));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      userId: data.userId as string,
      dayId: data.dayId as string,
      completedAt: data.completedAt as number,
      earlyBird: data.earlyBird as boolean,
    };
  });
}
