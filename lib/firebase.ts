'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let connectionTested = false;

export async function testFirestoreConnection(): Promise<void> {
  if (connectionTested) return;
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

export function sanitizeId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return cleaned.length > 0 ? cleaned : 'default_id';
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleAuthProvider);
}

export async function signOutUser() {
  return signOut(auth);
}

export async function saveUserPreferencesToCloud(params: {
  userId: string;
  useGoogleSearch: boolean;
  lang: 'zh' | 'en';
  isExisting: boolean;
}) {
  const safeUserId = sanitizeId(params.userId);
  const path = `users/${safeUserId}/settings/global`;
  const ref = doc(db, 'users', safeUserId, 'settings', 'global');
  try {
    if (params.isExisting) {
      await updateDoc(ref, {
        useGoogleSearch: Boolean(params.useGoogleSearch),
        lang: params.lang === 'en' ? 'en' : 'zh',
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        userId: safeUserId,
        useGoogleSearch: Boolean(params.useGoogleSearch),
        lang: params.lang === 'en' ? 'en' : 'zh',
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      params.isExisting ? OperationType.UPDATE : OperationType.CREATE,
      path
    );
  }
}

export async function saveResearchBriefToCloud(params: {
  userId: string;
  briefId: string;
  mode: 'proposal' | 'fact-check' | 'news-agent';
  query: string;
  referenceVideo?: string;
  markdown: string;
  citationsCount: number;
  pinned: boolean;
  groundingMode: 'live-web' | 'static-training';
  createdAtLabel: string;
}) {
  const safeUserId = sanitizeId(params.userId);
  const safeBriefId = sanitizeId(params.briefId);
  const path = `users/${safeUserId}/researchBriefs/${safeBriefId}`;
  const ref = doc(db, 'users', safeUserId, 'researchBriefs', safeBriefId);
  try {
    await setDoc(ref, {
      userId: safeUserId,
      mode: params.mode,
      query: params.query.slice(0, 2000) || 'Untitled Query',
      referenceVideo: (params.referenceVideo || '').slice(0, 1000),
      markdown: params.markdown.slice(0, 30000) || 'Empty brief',
      citationsCount: Math.max(0, Math.min(100, Math.floor(params.citationsCount))),
      pinned: Boolean(params.pinned),
      groundingMode:
        params.groundingMode === 'static-training' ? 'static-training' : 'live-web',
      createdAtLabel: params.createdAtLabel.slice(0, 64) || 'now',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateResearchBriefPinInCloud(params: {
  userId: string;
  briefId: string;
  pinned: boolean;
}) {
  const safeUserId = sanitizeId(params.userId);
  const safeBriefId = sanitizeId(params.briefId);
  const path = `users/${safeUserId}/researchBriefs/${safeBriefId}`;
  const ref = doc(db, 'users', safeUserId, 'researchBriefs', safeBriefId);
  try {
    await updateDoc(ref, {
      pinned: Boolean(params.pinned),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteResearchBriefFromCloud(params: {
  userId: string;
  briefId: string;
}) {
  const safeUserId = sanitizeId(params.userId);
  const safeBriefId = sanitizeId(params.briefId);
  const path = `users/${safeUserId}/researchBriefs/${safeBriefId}`;
  const ref = doc(db, 'users', safeUserId, 'researchBriefs', safeBriefId);
  try {
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function savePipelineAttemptToCloud(params: {
  userId: string;
  attemptId: string;
  runCode: string;
  pipelineId: string;
  pipelineNameZh: string;
  pipelineNameEn: string;
  prompt: string;
  runtime: 'Remotion' | 'HyperFrames' | 'FFmpeg';
  status: 'completed' | 'fallback' | 'failed';
  statusLabelZh: string;
  statusLabelEn: string;
  durationSec: number;
  estimatedCost: string;
  settledCost: string;
  groundedSummary: string;
  startedAtLabel: string;
}) {
  const safeUserId = sanitizeId(params.userId);
  const safeAttemptId = sanitizeId(params.attemptId);
  const path = `users/${safeUserId}/pipelineAttempts/${safeAttemptId}`;
  const ref = doc(db, 'users', safeUserId, 'pipelineAttempts', safeAttemptId);
  try {
    await setDoc(ref, {
      userId: safeUserId,
      runCode: sanitizeId(params.runCode).slice(0, 64),
      pipelineId: sanitizeId(params.pipelineId).slice(0, 64),
      pipelineNameZh: params.pipelineNameZh.slice(0, 128) || 'Pipeline',
      pipelineNameEn: params.pipelineNameEn.slice(0, 128) || 'Pipeline',
      prompt: params.prompt.slice(0, 2000) || 'Prompt',
      runtime: params.runtime,
      status: params.status,
      statusLabelZh: params.statusLabelZh.slice(0, 128) || 'Status',
      statusLabelEn: params.statusLabelEn.slice(0, 128) || 'Status',
      durationSec: Math.max(1, Math.min(7200, Math.floor(params.durationSec))),
      estimatedCost: params.estimatedCost.slice(0, 32) || '$0.00',
      settledCost: params.settledCost.slice(0, 32) || '$0.00',
      groundedSummary: params.groundedSummary.slice(0, 5000) || 'Summary',
      startedAtLabel: params.startedAtLabel.slice(0, 64) || 'now',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
