/**
 * @file firestore.rules.test.ts
 * Security Rule Verification and Test Scenarios for Dirty Dozen Payloads
 * Asserting that unauthorized access and invalid mutations yield PERMISSION_DENIED.
 */

export interface TestPayloadViolation {
  name: string;
  operation: 'create' | 'update' | 'delete' | 'get' | 'list';
  path: string;
  authUid?: string;
  emailVerified?: boolean;
  payload?: Record<string, unknown>;
  expectedRuleOutcome: 'PERMISSION_DENIED';
  reason: string;
}

export const DIRTY_DOZEN_SECURITY_TESTS: TestPayloadViolation[] = [
  {
    name: '1. Identity Spoofing (Foreign ownerId on task creation)',
    operation: 'create',
    path: '/tasks/task_evil_1',
    authUid: 'legit_user_1',
    emailVerified: true,
    payload: {
      ownerId: 'victim_user_2', // Spoofed owner
      title: 'Hacked task',
      completed: false,
      priority: 'high',
      createdAt: 'REQUEST_TIME',
      updatedAt: 'REQUEST_TIME',
    },
    expectedRuleOutcome: 'PERMISSION_DENIED',
    reason: 'Rule requires incoming().ownerId == request.auth.uid',
  },
  {
    name: '2. Cross-User Read Attack (Get another user document)',
    operation: 'get',
    path: '/tasks/victim_task_1',
    authUid: 'attacker_user_3',
    emailVerified: true,
    expectedRuleOutcome: 'PERMISSION_DENIED',
    reason: 'Rule enforces existing().ownerId == request.auth.uid on get',
  },
  {
    name: '3. Cross-User List Attack (Querying without matching owner)',
    operation: 'list',
    path: '/tasks',
    authUid: 'attacker_user_3',
    emailVerified: true,
    payload: { queryWhereOwnerId: 'victim_user_2' },
    expectedRuleOutcome: 'PERMISSION_DENIED',
    reason: 'Rule enforces resource.data.ownerId == request.auth.uid for all listed docs',
  },
  {
    name: '4. Cross-User Update / Hijack',
    operation: 'update',
    path: '/tasks/victim_task_1',
    authUid: 'attacker_user_3',
    emailVerified: true,
    payload: { completed: true, updatedAt: 'REQUEST_TIME' },
    expectedRuleOutcome: 'PERMISSION_DENIED',
    reason: 'Rule enforces existing().ownerId == request.auth.uid on update',
  },
  {
    name: '5. Cross-User Deletion',
    operation: 'delete',
    path: '/tasks/victim_task_1',
    authUid: 'attacker_user_3',
    emailVerified: true,
    expectedRuleOutcome: 'PERMISSION_DENIED',
    reason: 'Rule enforces existing().ownerId == request.auth.uid on delete',
  },
  {
    name: '6. Shadow Field Injection on Create',
    operation: 'create',
    path: '/tasks/task_shadow_1',
    authUid: 'legit_user_1',
    emailVerified: true,
    payload: {
      ownerId: 'legit_user_1',
      title: 'Valid title',
      completed: false,
      priority: 'medium',
      createdAt: 'REQUEST_TIME',
      updatedAt: 'REQUEST_TIME',
      isAdmin: true, // Ghost field
    },
    expectedRuleOutcome: 'PERMISSION_DENIED',
    reason: 'Rule enforces keys().hasOnly(...) strictly denying shadow properties',
  },
  {
    name: '7. Denial of Wallet (Oversized title payload)',
    operation: 'create',
    path: '/tasks/task_oversized',
    authUid: 'legit_user_1',
    emailVerified: true,
    payload: {
      ownerId: 'legit_user_1',
      title: 'A'.repeat(500), // Exceeds maxLength of 200
      completed: false,
      priority: 'medium',
      createdAt: 'REQUEST_TIME',
      updatedAt: 'REQUEST_TIME',
    },
    expectedRuleOutcome: 'PERMISSION_DENIED',
    reason: 'Rule restricts data.title.size() <= 200',
  },
  {
    name: '8. Value Poisoning (Invalid Priority Enum)',
    operation: 'create',
    path: '/tasks/task_invalid_enum',
    authUid: 'legit_user_1',
    emailVerified: true,
    payload: {
      ownerId: 'legit_user_1',
      title: 'Invalid enum',
      completed: false,
      priority: 'critical_emergency_injection',
      createdAt: 'REQUEST_TIME',
      updatedAt: 'REQUEST_TIME',
    },
    expectedRuleOutcome: 'PERMISSION_DENIED',
    reason: 'Rule enforces priority in [low, medium, high, urgent]',
  },
  {
    name: '9. Owner Immutability Bypass on Update',
    operation: 'update',
    path: '/tasks/my_task_1',
    authUid: 'legit_user_1',
    emailVerified: true,
    payload: {
      ownerId: 'new_recipient_uid',
      updatedAt: 'REQUEST_TIME',
    },
    expectedRuleOutcome: 'PERMISSION_DENIED',
    reason: 'Rule enforces incoming().ownerId == existing().ownerId and affectedKeys immutability',
  },
  {
    name: '10. Client Timestamp Forgery on Create',
    operation: 'create',
    path: '/tasks/task_forged_ts',
    authUid: 'legit_user_1',
    emailVerified: true,
    payload: {
      ownerId: 'legit_user_1',
      title: 'Faked date',
      completed: false,
      priority: 'low',
      createdAt: '2021-01-01T00:00:00Z',
      updatedAt: '2021-01-01T00:00:00Z',
    },
    expectedRuleOutcome: 'PERMISSION_DENIED',
    reason: 'Rule enforces incoming().createdAt == request.time',
  },
  {
    name: '11. Unauthenticated Visitor Access',
    operation: 'get',
    path: '/tasks/any_task_id',
    authUid: undefined, // Anonymous / None
    emailVerified: false,
    expectedRuleOutcome: 'PERMISSION_DENIED',
    reason: 'Rule enforces isSignedIn()',
  },
  {
    name: '12. Cross-User User Profile Write',
    operation: 'update',
    path: '/users/victim_user_2',
    authUid: 'attacker_user_3',
    emailVerified: true,
    payload: {
      displayName: 'Defaced Name',
      updatedAt: 'REQUEST_TIME',
    },
    expectedRuleOutcome: 'PERMISSION_DENIED',
    reason: 'Rule enforces request.auth.uid == userId on /users/{userId}',
  },
];
