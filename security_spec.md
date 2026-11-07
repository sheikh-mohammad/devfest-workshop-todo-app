# Security Specification: Collaborative To-Do List Application

## 1. Data Invariants
1. **User Identity Isolation**: A task document in `/tasks/{taskId}` MUST have `ownerId == request.auth.uid`. No user can read, list, create, update, or delete any task belonging to another user.
2. **Strict Key Integrity**: Tasks must only contain explicitly allowed keys (`ownerId`, `title`, `description`, `completed`, `priority`, `category`, `dueDate`, `createdAt`, `updatedAt`). No arbitrary fields or shadow injection allowed.
3. **Temporal Integrity**: `createdAt` and `updatedAt` on creation must match `request.time`. On updates, `updatedAt` must equal `request.time` and `createdAt` must remain immutable.
4. **Owner Immutability**: `ownerId` cannot be transferred or changed once written (`incoming().ownerId == existing().ownerId`).
5. **Path Validation**: Document IDs must satisfy alphanumeric/hyphen/underscore syntax and not exceed 128 characters.
6. **Action-Based Boundaries**: State changes (such as toggling completion or editing content) must specify allowable affected keys.
7. **Verified Users**: All task writes require `request.auth.token.email_verified == true`.
8. **Public Presence Profile**: `/users/{userId}` can only be written by the authenticated user whose `request.auth.uid == userId`.

---

## 2. The Dirty Dozen Payloads (Designed to Fail / PERMISSION_DENIED)

1. **Payload 1: Identity Spoofing (Foreign Owner ID on Create)**
```json
{
  "ownerId": "attacker_or_other_uid",
  "title": "Malicious task",
  "completed": false,
  "priority": "medium",
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
*Expected Result*: PERMISSION_DENIED (User cannot create a task for another user).

2. **Payload 2: Cross-User Read Attack (Get Foreign Task)**
*Action*: User B attempts `getDoc(doc(db, 'tasks', 'userA_task_123'))`.
*Expected Result*: PERMISSION_DENIED.

3. **Payload 3: Cross-User List Attack (Querying without owner filter or other's tasks)**
*Action*: User B attempts `getDocs(collection(db, 'tasks'))` without filtering or with `where('ownerId', '==', 'userA')`.
*Expected Result*: PERMISSION_DENIED.

4. **Payload 4: Cross-User Update / Hijack (Modifying another's task)**
*Action*: User B attempts `updateDoc(doc(db, 'tasks', 'userA_task_123'), { completed: true })`.
*Expected Result*: PERMISSION_DENIED.

5. **Payload 5: Cross-User Deletion Attack**
*Action*: User B attempts `deleteDoc(doc(db, 'tasks', 'userA_task_123'))`.
*Expected Result*: PERMISSION_DENIED.

6. **Payload 6: Shadow Field Injection Attack on Create**
```json
{
  "ownerId": "valid_user_uid",
  "title": "Injecting admin flag",
  "completed": false,
  "priority": "medium",
  "isAdmin": true,
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
*Expected Result*: PERMISSION_DENIED (Violates strict key schema / `hasOnly`).

7. **Payload 7: Denial of Wallet / Resource Exhaustion (1MB Title String)**
```json
{
  "ownerId": "valid_user_uid",
  "title": "A".repeat(10000),
  "completed": false,
  "priority": "medium",
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
*Expected Result*: PERMISSION_DENIED (`title.size() <= 200`).

8. **Payload 8: Value Poisoning (Invalid Priority Enum)**
```json
{
  "ownerId": "valid_user_uid",
  "title": "Invalid enum task",
  "completed": false,
  "priority": "super-critical-hack",
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
*Expected Result*: PERMISSION_DENIED (`priority in ['low', 'medium', 'high', 'urgent']`).

9. **Payload 9: Owner Transfer / Hijack on Update**
```json
{
  "ownerId": "new_transferred_uid",
  "title": "Stealing task",
  "updatedAt": "SERVER_TIMESTAMP"
}
```
*Expected Result*: PERMISSION_DENIED (`incoming().ownerId == existing().ownerId` immutability check).

10. **Payload 10: Client Timestamp Forgery (Faking Past/Future createdAt)**
```json
{
  "ownerId": "valid_user_uid",
  "title": "Faked timestamp",
  "completed": false,
  "priority": "low",
  "createdAt": "2020-01-01T00:00:00Z",
  "updatedAt": "2020-01-01T00:00:00Z"
}
```
*Expected Result*: PERMISSION_DENIED (`createdAt == request.time`).

11. **Payload 11: Unauthenticated Task Access**
*Action*: Anonymous/unauthenticated visitor attempts to read `/tasks/any_id` or query `/tasks`.
*Expected Result*: PERMISSION_DENIED (`isSignedIn() == true` required).

12. **Payload 12: Profile Spoofing on User Document**
*Action*: User A attempts to write to `/users/{userB_uid}`.
*Expected Result*: PERMISSION_DENIED (`request.auth.uid == userId` required).

---

## 3. Test Runner Concept (firestore.rules.test.ts)
The tests assert that each of the Dirty Dozen vectors yields `PERMISSION_DENIED` under the ruleset.
