# OpenMontage Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Zero-Trust Default Deny**: All paths not explicitly matched under `/users/{userId}/...` are unconditionally denied (`allow read, write: if false;`).
2. **Strict Owner & Verified Email Invariant**: Only an authenticated user with `request.auth != null`, `request.auth.token.email_verified == true`, and `request.auth.uid == userId` may read, list, create, update, or delete documents in `/users/{userId}/researchBriefs/{briefId}`, `/users/{userId}/pipelineAttempts/{attemptId}`, and `/users/{userId}/settings/{settingId}`.
3. **Immutable Ownership & Creation Timestamps**: `userId` and `createdAt` can never be mutated on update (`incoming().userId == existing().userId && incoming().createdAt == existing().createdAt`).
4. **Temporal Integrity**: On `create`, `createdAt == request.time` (and `updatedAt == request.time` where present). On `update`, `updatedAt == request.time`.
5. **Path Variable & Volumetric Bounds**: Every document ID (`userId`, `briefId`, `attemptId`, `settingId`) is validated with `isValidId(id)` (`size() >= 1 && size() <= 128 && matches('^[a-zA-Z0-9_\\-]+$')`). Every string field has strict `minLength` / `maxLength` bounds matching `firebase-blueprint.json`.
6. **Terminal State Locking on Pipeline Attempts**: Once a `PipelineAttempt` document is created with a terminal status (`completed`, `fallback`, or `failed`), updates are forbidden (`allow update: if false;`), preserving an immutable audit trail.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 01 — Unauthenticated Write (`researchBriefs`)**: `auth = null` attempting to create a brief.
2. **Payload 02 — Unverified Email Spoof (`researchBriefs`)**: `auth.uid = "user_1"`, `email_verified = false` attempting to create a brief.
3. **Payload 03 — Cross-Tenant Identity Spoofing (`researchBriefs`)**: `auth.uid = "attacker_1"` writing to `/users/victim_1/researchBriefs/brief_1` or setting `data.userId = "victim_1"`.
4. **Payload 04 — Shadow / Ghost Field Injection (`researchBriefs`)**: Valid brief payload plus unauthorized key `"isAdmin": true`.
5. **Payload 05 — Value Poisoning / Oversized Markdown (`researchBriefs`)**: `markdown` string exceeding `30000` characters (`Denial of Wallet` attack).
6. **Payload 06 — Invalid Enum Injection (`researchBriefs`)**: `groundingMode: "untrusted-mode"` or `mode: "hacked"`.
7. **Payload 07 — Client Timestamp Forgery (`researchBriefs`)**: `createdAt` set to a past or future timestamp (`!= request.time`).
8. **Payload 08 — Immutable Field Mutation on Update (`researchBriefs`)**: Attempting to update `query` or `createdAt` when only `pinned` and `updatedAt` are allowed on `togglePin`.
9. **Payload 09 — Path ID Poisoning (`pipelineAttempts`)**: Document ID containing invalid characters or exceeding 128 bytes.
10. **Payload 10 — Terminal State Mutation (`pipelineAttempts`)**: Attempting to update an already recorded `PipelineAttempt` audit log to alter `settledCost` or `status`.
11. **Payload 11 — Unauthorized Settings Field (`settings`)**: Attempting to inject `"role": "superadmin"` into `/users/{userId}/settings/global`.
12. **Payload 12 — Cross-User List Scraping (`researchBriefs`)**: `auth.uid = "attacker_1"` attempting a `list` query on `/users/victim_1/researchBriefs`.
