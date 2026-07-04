import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { DayQuestion, QuestionAnswer, TeamId } from '@/types';
import { DEFAULT_QUESTIONS } from '@/features/questions/defaultQuestions';

const QUESTIONS_COLLECTION = 'questions';
const ANSWERS_COLLECTION = 'question_answers';

export async function fetchQuestions(): Promise<DayQuestion[]> {
  try {
    const snap = await getDocs(collection(db, QUESTIONS_COLLECTION));
    if (snap.empty) {
      return DEFAULT_QUESTIONS;
    }
    return snap.docs
      .map((d) => d.data() as DayQuestion)
      .sort((a, b) => a.dayId.localeCompare(b.dayId));
  } catch {
    return DEFAULT_QUESTIONS;
  }
}

export async function saveQuestion(question: DayQuestion): Promise<void> {
  await setDoc(doc(db, QUESTIONS_COLLECTION, question.dayId), question);
}

export async function submitAnswer(
  userId: string,
  teamId: TeamId,
  dayId: string,
  selectedOption: number,
  correctOption: number,
): Promise<{ correct: boolean; alreadyAnswered: boolean }> {
  const docId = `${userId}_${dayId}`;
  const ref = doc(db, ANSWERS_COLLECTION, docId);

  const existing = await getDoc(ref);
  if (existing.exists()) {
    return {
      correct: existing.data().correct as boolean,
      alreadyAnswered: true,
    };
  }

  const correct = selectedOption === correctOption;
  const answer: QuestionAnswer = {
    userId,
    teamId,
    dayId,
    selectedOption,
    correct,
    answeredAt: Date.now(),
  };

  await setDoc(ref, answer);
  return { correct, alreadyAnswered: false };
}

export async function seedDefaultQuestions(): Promise<void> {
  for (const question of DEFAULT_QUESTIONS) {
    await setDoc(doc(db, QUESTIONS_COLLECTION, question.dayId), question, {
      merge: true,
    });
  }
}

export async function getUserAnswers(
  userId: string,
): Promise<QuestionAnswer[]> {
  const q = query(
    collection(db, ANSWERS_COLLECTION),
    where('userId', '==', userId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as QuestionAnswer);
}

export async function getAllAnswers(): Promise<QuestionAnswer[]> {
  const snap = await getDocs(collection(db, ANSWERS_COLLECTION));
  return snap.docs.map((d) => d.data() as QuestionAnswer);
}
