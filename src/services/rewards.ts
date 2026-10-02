import {
  collection,
  addDoc,
  doc,
  updateDoc,
  increment,
  query,
  orderBy,
  limit as fbLimit,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase/config';
import { COLLECTIONS } from './firebase/collections';
import type { RedeemableItem, UserProfile } from '@/types';

export const POINT_RULES = {
  helpfulAnswer: 5,
  acceptedAnswer: 15,
  dailyLogin: 2,
  reportFakeInfo: 3,
  helpingOthers: 5,
} as const;

export async function awardPoints(userId: string, points: number, reason: string) {
  await addDoc(collection(db, COLLECTIONS.rewards), {
    userId,
    points,
    reason,
    timestamp: Date.now(),
  });
  await updateDoc(doc(db, COLLECTIONS.users, userId), {
    rewardPoints: increment(points),
  });
}

export async function getLeaderboard(take = 10): Promise<Pick<UserProfile, 'uid' | 'name' | 'rewardPoints' | 'village'>[]> {
  const q = query(collection(db, COLLECTIONS.users), orderBy('rewardPoints', 'desc'), fbLimit(take));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as UserProfile;
    return { uid: data.uid, name: data.name, rewardPoints: data.rewardPoints, village: data.village };
  });
}

export const BADGES = [
  { id: 'expert-farmer', name: 'Expert Farmer', threshold: 500, icon: '🌾' },
  { id: 'crop-doctor', name: 'Crop Doctor', threshold: 300, icon: '🩺' },
  { id: 'helper', name: 'Helper', threshold: 100, icon: '🤝' },
  { id: 'community-star', name: 'Community Star', threshold: 50, icon: '⭐' },
] as const;

export function badgesEarned(points: number) {
  return BADGES.filter((b) => points >= b.threshold);
}

// Redeemable catalogue — placeholder partner inventory until wired to a
// real fulfilment/coupon backend.
export const REDEEMABLES: RedeemableItem[] = [
  { id: 'r1', name: 'Hybrid Paddy Seeds (5kg)', category: 'Seeds', pointsCost: 120, partner: 'TN Seed Corp', stock: 40 },
  { id: 'r2', name: 'Organic Vermicompost (25kg)', category: 'Fertilizers', pointsCost: 90, partner: 'AgroLife', stock: 60 },
  { id: 'r3', name: 'Battery Sprayer Pump', category: 'Equipment', pointsCost: 350, partner: 'KisanTools', stock: 15 },
  { id: 'r4', name: '₹200 Fertilizer Coupon', category: 'Coupons', pointsCost: 200, partner: 'IFFCO Bazaar', stock: 100 },
  { id: 'r5', name: 'NPK 19:19:19 (10kg)', category: 'Fertilizers', pointsCost: 150, partner: 'Coromandel', stock: 50 },
  { id: 'r6', name: 'Soil Testing Kit', category: 'Equipment', pointsCost: 220, partner: 'AgriLab', stock: 25 },
];
