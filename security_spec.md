# Security Specification for LedgerLite

## 1. Data Invariants
- Only authenticated users can read or write their own business records (`userId == request.auth.uid` or admin).
- Admin access is granted to bootstrapping admin `adejolanu@gmail.com`.
- Transactions, Invoices, Receipts, and Staff records must be bound to the creating user.
- Document IDs must conform to `isValidId` (`size <= 128` and regex alphanumeric).
- All string inputs are bounded by `.size()` checks to prevent resource exhaustion attacks.
- Immutable fields like `createdAt` cannot be altered upon update.
- Users cannot manipulate another user's business profile or financial ledgers.

## 2. The "Dirty Dozen" Threat Payloads
1. **Unauthenticated Write**: An unauthenticated user attempts to create a transaction without signing in.
2. **Identity Spoofing**: User A creates a transaction with `userId: "user-B"` to falsify audit logs.
3. **Ghost Field Injection**: Adding an unverified privileged flag `isAdmin: true` inside a transaction payload.
4. **Denial of Wallet Oversized String**: Injecting a 2MB base64 payload into the `title` or `notes` field.
5. **ID Poisoning**: Creating a record with document ID containing path traversal `../../admin`.
6. **Cross-Tenant List Reading**: An authenticated user attempting a collection query to read another tenant's records without filtering by their `userId`.
7. **Cross-Tenant Document Access**: Direct `get` request targeting an invoice belonging to a different business owner.
8. **Negative Amount Tampering**: Updating an invoice balance to a negative value or non-numeric object.
9. **CreatedAt Timestamp Mutation**: Tampering with the initial `createdAt` timestamp to backdate accounts.
10. **Role Escalation**: Setting staff member `roleType` to an unauthorized value.
11. **Malicious Payment Method Enum**: Submitting arbitrary string "crypto_transfer" outside approved enum.
12. **PII Scraping**: Attempting blanket listing on business profiles without tenant isolation.

## 3. Test Runner Design
All tests must verify that the "Dirty Dozen" operations result in `PERMISSION_DENIED`.
