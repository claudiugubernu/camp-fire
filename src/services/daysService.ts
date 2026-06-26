import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { DayConfig } from "@/types";
import { DEFAULT_DAYS } from "@/features/verses/defaultDays";

const DAYS_COLLECTION = "days";

export async function fetchDays(): Promise<DayConfig[]> {
  try {
    const snap = await getDocs(collection(db, DAYS_COLLECTION));
    if (snap.empty) {
      return DEFAULT_DAYS;
    }
    return snap.docs
      .map((d) => d.data() as DayConfig)
      .sort((a, b) => a.dayNumber - b.dayNumber);
  } catch {
    // Offline fallback
    return DEFAULT_DAYS;
  }
}

export async function saveDay(day: DayConfig): Promise<void> {
  const ref = doc(db, DAYS_COLLECTION, day.id);
  await setDoc(ref, day);
}

export async function deleteDay(dayId: string): Promise<void> {
  await deleteDoc(doc(db, DAYS_COLLECTION, dayId));
}

export async function seedDefaultDays(): Promise<void> {
  for (const day of DEFAULT_DAYS) {
    const ref = doc(db, DAYS_COLLECTION, day.id);
    await setDoc(ref, day, { merge: true });
  }
}
