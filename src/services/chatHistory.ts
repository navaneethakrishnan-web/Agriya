import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase/config';
import { COLLECTIONS } from './firebase/collections';
import type { ChatThread } from '@/types';

export async function saveThread(userId: string, thread: ChatThread) {
  const ref = doc(db, COLLECTIONS.chatHistory, `${userId}_${thread.id}`);
  await setDoc(ref, { userId, ...thread });
}

export async function listThreads(userId: string): Promise<ChatThread[]> {
  const q = query(
    collection(db, COLLECTIONS.chatHistory),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: data.id, title: data.title, updatedAt: data.updatedAt, messages: data.messages } as ChatThread;
  });
}
