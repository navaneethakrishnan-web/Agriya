import {
  collection,
  addDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit as fbLimit,
  updateDoc,
  increment,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebase/config';
import { COLLECTIONS } from './firebase/collections';
import type { ForumPost, ForumReply, ForumCategory } from '@/types';

export async function createPost(post: Omit<ForumPost, 'id' | 'timestamp' | 'upvotes' | 'downvotes' | 'replyCount' | 'hasAcceptedAnswer'>) {
  const ref = await addDoc(collection(db, COLLECTIONS.communityPosts), {
    ...post,
    timestamp: Date.now(),
    upvotes: 0,
    downvotes: 0,
    replyCount: 0,
    hasAcceptedAnswer: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listPosts(opts?: {
  category?: ForumCategory;
  sort?: 'newest' | 'trending' | 'helpful';
  take?: number;
}): Promise<ForumPost[]> {
  const constraints = [];
  if (opts?.category) constraints.push(where('category', '==', opts.category));

  const sortField =
    opts?.sort === 'trending' ? 'upvotes' : opts?.sort === 'helpful' ? 'replyCount' : 'timestamp';
  constraints.push(orderBy(sortField, 'desc'));
  constraints.push(fbLimit(opts?.take ?? 30));

  const q = query(collection(db, COLLECTIONS.communityPosts), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ForumPost));
}

export async function getPost(postId: string): Promise<ForumPost | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.communityPosts, postId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ForumPost;
}

export async function listReplies(postId: string): Promise<ForumReply[]> {
  const q = query(
    collection(db, COLLECTIONS.comments),
    where('postId', '==', postId),
    orderBy('upvotes', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ForumReply));
}

export async function addReply(reply: Omit<ForumReply, 'id' | 'timestamp' | 'upvotes' | 'downvotes' | 'accepted'>) {
  const ref = await addDoc(collection(db, COLLECTIONS.comments), {
    ...reply,
    timestamp: Date.now(),
    upvotes: 0,
    downvotes: 0,
    accepted: false,
  });
  await updateDoc(doc(db, COLLECTIONS.communityPosts, reply.postId), {
    replyCount: increment(1),
  });
  return ref.id;
}

export async function vote(
  collectionName: 'community_posts' | 'comments',
  id: string,
  direction: 'up' | 'down'
) {
  await updateDoc(doc(db, collectionName, id), {
    [direction === 'up' ? 'upvotes' : 'downvotes']: increment(1),
  });
}

export async function acceptAnswer(postId: string, replyId: string) {
  await updateDoc(doc(db, COLLECTIONS.comments, replyId), { accepted: true });
  await updateDoc(doc(db, COLLECTIONS.communityPosts, postId), { hasAcceptedAnswer: true });
}

export const FORUM_CATEGORIES: ForumCategory[] = [
  'Crops',
  'Pests',
  'Diseases',
  'Weather',
  'Government Schemes',
  'Equipment',
  'Organic Farming',
];
