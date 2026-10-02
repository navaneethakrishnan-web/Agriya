import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  updateProfile,
  type ConfirmationResult,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { COLLECTIONS } from './collections';
import type { UserProfile } from '@/types';

const googleProvider = new GoogleAuthProvider();

export async function registerWithEmail(
  name: string,
  email: string,
  password: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await createUserProfileIfMissing(cred.user.uid, {
    name,
    email,
  });
  return cred.user;
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  await createUserProfileIfMissing(cred.user.uid, {
    name: cred.user.displayName ?? 'Farmer',
    email: cred.user.email ?? '',
    photoURL: cred.user.photoURL ?? undefined,
  });
  return cred.user;
}

// --- Phone OTP (requires a visible/invisible reCAPTCHA container in the DOM
// with id="recaptcha-container", and Phone provider enabled in Firebase console) ---
export function setupRecaptcha(containerId = 'recaptcha-container') {
  return new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
}

export async function sendOtp(
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth, phoneNumber, verifier);
}

export async function confirmOtp(confirmation: ConfirmationResult, code: string) {
  const cred = await confirmation.confirm(code);
  await createUserProfileIfMissing(cred.user.uid, {
    name: 'Farmer',
    email: '',
    mobile: cred.user.phoneNumber ?? undefined,
  });
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

async function createUserProfileIfMissing(
  uid: string,
  partial: Partial<UserProfile>
) {
  const ref = doc(db, COLLECTIONS.users, uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const profile: UserProfile = {
    uid,
    name: partial.name ?? 'Farmer',
    email: partial.email ?? '',
    mobile: partial.mobile,
    village: '',
    district: '',
    state: '',
    preferredLanguage: 'en',
    crops: [],
    farmSize: '',
    photoURL: partial.photoURL,
    rewardPoints: 10, // welcome bonus
    role: 'farmer',
    createdAt: Date.now(),
  };

  await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, COLLECTIONS.users, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const ref = doc(db, COLLECTIONS.users, uid);
  await setDoc(ref, data, { merge: true });
}
