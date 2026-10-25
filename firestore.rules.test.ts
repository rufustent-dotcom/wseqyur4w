/**
 * Firestore Security Rules Verification Specification (Dirty Dozen Test Suite)
 * Validates that all 12 adversarial payloads in security_spec.md return PERMISSION_DENIED.
 */

export interface DirtyDozenTestCase {
  id: string;
  description: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TEST_SUITE: DirtyDozenTestCase[] = [
  {
    id: 'DD-01',
    description: 'Unauthenticated user attempting to create a research brief',
    collectionPath: '/users/user_1/researchBriefs/brief_1',
    operation: 'create',
    auth: null,
    payload: { userId: 'user_1', mode: 'proposal', query: 'Test' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-02',
    description: 'Authenticated user with unverified email attempting write',
    collectionPath: '/users/user_1/researchBriefs/brief_1',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: false },
    payload: { userId: 'user_1', mode: 'proposal', query: 'Test' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-03',
    description: 'Cross-tenant identity spoofing where userId mismatches auth.uid',
    collectionPath: '/users/victim_1/researchBriefs/brief_1',
    operation: 'create',
    auth: { uid: 'attacker_1', email_verified: true },
    payload: { userId: 'victim_1', mode: 'proposal', query: 'Test' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-04',
    description: 'Shadow field injection (isAdmin: true) on researchBriefs create',
    collectionPath: '/users/user_1/researchBriefs/brief_1',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      userId: 'user_1',
      mode: 'proposal',
      query: 'Valid query',
      referenceVideo: '',
      markdown: 'Valid markdown',
      citationsCount: 2,
      pinned: false,
      groundingMode: 'live-web',
      createdAtLabel: '10/22 20:00',
      isAdmin: true,
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-05',
    description: 'Oversized markdown payload (>30,000 chars) Denial-of-Wallet attempt',
    collectionPath: '/users/user_1/researchBriefs/brief_1',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      userId: 'user_1',
      mode: 'proposal',
      query: 'Valid query',
      referenceVideo: '',
      markdown: 'x'.repeat(30500),
      citationsCount: 0,
      pinned: false,
      groundingMode: 'live-web',
      createdAtLabel: '10/22 20:00',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-06',
    description: 'Invalid groundingMode enum value injection',
    collectionPath: '/users/user_1/researchBriefs/brief_1',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      userId: 'user_1',
      mode: 'proposal',
      query: 'Valid query',
      referenceVideo: '',
      markdown: 'Valid markdown',
      citationsCount: 0,
      pinned: false,
      groundingMode: 'hacked-mode',
      createdAtLabel: '10/22 20:00',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-07',
    description: 'Forged client timestamp (createdAt != request.time)',
    collectionPath: '/users/user_1/researchBriefs/brief_1',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      userId: 'user_1',
      mode: 'proposal',
      query: 'Valid query',
      referenceVideo: '',
      markdown: 'Valid markdown',
      citationsCount: 0,
      pinned: false,
      groundingMode: 'live-web',
      createdAtLabel: '10/22 20:00',
      createdAt: '1999-01-01T00:00:00Z',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-08',
    description: 'Update-gap attack attempting to mutate immutable query field on researchBriefs',
    collectionPath: '/users/user_1/researchBriefs/brief_1',
    operation: 'update',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      query: 'Tampered query',
      pinned: true,
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-09',
    description: 'Path variable ID poisoning with invalid characters',
    collectionPath: '/users/user_1/pipelineAttempts/invalid$id!@#',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: { userId: 'user_1' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-10',
    description: 'Terminal state mutation attempt on recorded pipelineAttempt',
    collectionPath: '/users/user_1/pipelineAttempts/attempt_1',
    operation: 'update',
    auth: { uid: 'user_1', email_verified: true },
    payload: { status: 'completed', settledCost: '$0.00' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-11',
    description: 'Privilege escalation field injection in user settings',
    collectionPath: '/users/user_1/settings/global',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      userId: 'user_1',
      useGoogleSearch: true,
      lang: 'zh',
      role: 'admin',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-12',
    description: 'Cross-user list query scraping on researchBriefs',
    collectionPath: '/users/victim_1/researchBriefs',
    operation: 'list',
    auth: { uid: 'attacker_1', email_verified: true },
    expectedOutcome: 'PERMISSION_DENIED',
  },
];
