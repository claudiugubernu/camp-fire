import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Appreciation, TeamId } from '@/types';

const APPRECIATIONS_COLLECTION = 'appreciations';
const MAX_PER_DAY = 5;

function getTodayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function sendAppreciation(
  fromUserId: string,
  fromNickname: string,
  teamId: TeamId,
  message: string,
): Promise<{ success: boolean; reason?: string }> {
  const todayStart = getTodayStart();
  const q = query(
    collection(db, APPRECIATIONS_COLLECTION),
    where('fromUserId', '==', fromUserId),
    where('createdAt', '>=', todayStart),
  );
  const snap = await getDocs(q);
  if (snap.size >= MAX_PER_DAY) {
    return { success: false, reason: 'LIMIT_REACHED' };
  }

  const appreciation: Omit<Appreciation, 'id'> = {
    fromUserId,
    fromNickname,
    teamId,
    message: message.trim(),
    createdAt: Date.now(),
  };

  await addDoc(collection(db, APPRECIATIONS_COLLECTION), {
    ...appreciation,
    createdAtServer: serverTimestamp(),
  });

  return { success: true };
}

export async function getUserAppreciations(
  userId: string,
): Promise<Appreciation[]> {
  const q = query(
    collection(db, APPRECIATIONS_COLLECTION),
    where('fromUserId', '==', userId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Appreciation, 'id'>),
  }));
}

export async function getAllAppreciations(): Promise<Appreciation[]> {
  const snap = await getDocs(collection(db, APPRECIATIONS_COLLECTION));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Appreciation, 'id'>),
  }));
}

export async function getTodayCount(userId: string): Promise<number> {
  const todayStart = getTodayStart();
  const q = query(
    collection(db, APPRECIATIONS_COLLECTION),
    where('fromUserId', '==', userId),
    where('createdAt', '>=', todayStart),
  );
  const snap = await getDocs(q);
  return snap.size;
}
