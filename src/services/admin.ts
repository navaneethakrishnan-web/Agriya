import { collection, getCountFromServer, getDocs, query, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase/config';
import { COLLECTIONS } from './firebase/collections';
import type { UserProfile, UserRole } from '@/types';

export async function getPlatformCounts() {
  const [users, posts, questions] = await Promise.all([
    safeCount(COLLECTIONS.users),
    safeCount(COLLECTIONS.communityPosts),
    safeCount(COLLECTIONS.chatHistory),
  ]);
  return { users, posts, questions };
}

async function safeCount(collectionName: string) {
  try {
    const snap = await getCountFromServer(collection(db, collectionName));
    return snap.data().count;
  } catch {
    return 0;
  }
}

export async function listUsers(take = 50): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, COLLECTIONS.users), orderBy('createdAt', 'desc'), limit(take));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as UserProfile);
  } catch {
    return [];
  }
}

export async function setUserRole(uid: string, role: UserRole) {
  await updateDoc(doc(db, COLLECTIONS.users, uid), { role });
}

// Mock analytics that would normally come from a proper aggregation
// pipeline (BigQuery export, scheduled Cloud Function, etc).
export const POPULAR_CROPS = [
  { name: 'Rice', value: 32 },
  { name: 'Cotton', value: 18 },
  { name: 'Wheat', value: 15 },
  { name: 'Sugarcane', value: 12 },
  { name: 'Vegetables', value: 23 },
];

export const POPULAR_ISSUES = [
  { name: 'Rice Blast', value: 24 },
  { name: 'Aphid Infestation', value: 19 },
  { name: 'Yellow Rust', value: 14 },
  { name: 'Nutrient Deficiency', value: 21 },
  { name: 'Irrigation Scheduling', value: 16 },
];

export const DAU_TREND = [
  { day: 'Mon', users: 120 },
  { day: 'Tue', users: 148 },
  { day: 'Wed', users: 132 },
  { day: 'Thu', users: 171 },
  { day: 'Fri', users: 190 },
  { day: 'Sat', users: 165 },
  { day: 'Sun', users: 142 },
];
