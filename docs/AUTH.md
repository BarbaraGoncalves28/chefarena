# Authentication and Authorization Architecture

This document defines a scalable auth architecture for the cooking reality show platform.
It supports JWT and session auth, role-based permissions, route/API protection, secure design, and audit logging.

## 1. Goals

- Protect admin, judge, and viewer scopes.
- Keep auth separated from business rules.
- Support secure JWT and session-based access.
- Enforce RBAC consistently in route handlers and application services.
- Emit audit logs for sensitive actions.

## 2. Roles and permissions

### Roles

- `ADMIN`
  - full platform control
  - manage seasons, challenges, contestants, judges, eliminations
  - grant/revoke immunities
  - view audit logs

- `JUDGE`
  - submit and adjust scores
  - view assigned judges and scoring data
  - comment on challenges and dishes

- `VIEWER`
  - view live rankings and episodes
  - consume public feed and leaderboard results

### Permission model

Use explicit permissions per action, not only role labels:

- `season.manage`
- `challenge.start`
- `challenge.finish`
- `dish.score`
- `elimination.execute`
- `ranking.view`
- `audit.read`

`Role` maps to a permission set, and individual users may have additional custom permissions.

## 3. Auth architecture

### 3.1 Authentication flow

- Support two modes:
  - JWT bearer tokens for API clients and server-to-server requests
  - session cookies for browser-based admin/judge UI

- Auth middleware extracts credentials from:
  - `Authorization: Bearer <token>`
  - `Cookie: session=<token>`

- Middleware validates token signature and optional refresh flows.
- Middleware resolves the authenticated principal into an `AuthContext`.

### 3.2 AuthContext

A typed context object passed through route handlers and services:

```ts
export type AuthContext = {
  userId: string;
  role: "ADMIN" | "JUDGE" | "VIEWER";
  permissions: string[];
  email?: string;
  name?: string;
  correlationId: string;
};
```

### 3.3 Token structure

JWT payload should include:

```ts
{
  sub: "user-id",
  role: "ADMIN" | "JUDGE" | "VIEWER",
  permissions: ["dish.score", "challenge.start"],
  email: "judge@example.com",
  name: "Judge 1",
  iat: 1680000000,
  exp: 1680086400,
  jti: "uuid",
}
```

- Use RS256 or ES256 for signature.
- `jti` for token revocation and reuse detection.
- Keep tokens short and avoid storing secrets in JWT payload.

### 3.4 Session design

For browser sessions, store a secure cookie:

- `Secure; HttpOnly; SameSite=Strict`
- stored against a session store (Redis or database)
- session records reference `userId`, `role`, `permissions`, `expiresAt`

Session cookie flows are ideal for the admin dashboard.

## 4. Middleware strategy

### 4.1 Route protection middleware

- `requireAuth(request)`
  - validates token or session
  - resolves `AuthContext`
  - throws `UnauthorizedError` if missing or invalid

- `requireRoles(request, roles)`
  - ensures `AuthContext.role` is in allowed roles
  - throws `ForbiddenError` otherwise

- `requirePermissions(request, permissions)`
  - ensures all required permissions exist in `AuthContext.permissions`
  - throws `ForbiddenError` otherwise

### 4.2 Next.js route handler integration

In `app/api/.../route.ts`:

```ts
import {
  requireAuth,
  requirePermissions,
} from "@/infrastructure/auth/middleware";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  requirePermissions(auth, ["challenge.start"]);
  // application service call
}
```

### 4.3 Middleware placement

- Route handlers: authenticate and perform quick RBAC checks.
- Application services: re-check permissions for critical operations.
- Domain layer: remain permission-agnostic; use auth context passed from services.

## 5. RBAC design

### 5.1 Role-to-permission mapping

Define a map in configuration:

```ts
const rolePermissions = {
  ADMIN: ["*"],
  JUDGE: ["dish.score", "challenge.view", "ranking.view"],
  VIEWER: ["ranking.view", "content.view"],
};
```

- `ADMIN` has wildcard `*` for all actions.
- `JUDGE` is limited to scoring and judging related flows.
- `VIEWER` is read-only.

### 5.2 Permission checks

Use a central checker helper:

```ts
function can(auth: AuthContext, required: string[]) {
  if (auth.permissions.includes("*")) return true;
  return required.every((perm) => auth.permissions.includes(perm));
}
```

### 5.3 Fine-grained access

- Use scoped permission checks for `seasonId`, `challengeId`, and `contestantId` where needed.
- Example: judges may only score challenges assigned to them.

Authorize using both

- global role permissions, and
- resource-specific policies.

## 6. Permission flow

1. Client authenticates via login endpoint.
2. Server issues JWT or session cookie.
3. Client sends requests with credentials.
4. Middleware validates auth and builds `AuthContext`.
5. Route handler checks role/permission requirements.
6. Application service may perform secondary policy checks.
7. Service creates audit logs with `actorId`, `actorRole`, and `correlationId`.

## 7. Audit logging

Audit logs should record:

- who performed the action (`actorId`, `actorRole`)
- what action occurred (`action`)
- target resources (`targetId`, `targetType`)
- when and why (`createdAt`, `details`)
- request correlation (`correlationId`)

Example audit entry:

```ts
await auditLogRepository.createAuditLog({
  action: "challenge.start",
  actorId: auth.userId,
  actorRole: auth.role,
  targetId: challengeId,
  targetType: "Challenge",
  details: { seasonId, challengeType },
  correlationId: auth.correlationId,
});
```

## 8. Folder structure

Recommended auth folder layout:

```
src/
  infrastructure/
    auth/
      jwt-provider.ts
      session-store.ts
      middleware.ts
      permissions.ts
      auth-context.ts
      token-service.ts
      user-session.ts
  application/
    auth/
      login.ts
      refresh-token.ts
      logout.ts
  domain/
    auth/
      roles.ts
      permissions.ts
  docs/
    AUTH.md
```

### Example file responsibilities

- `jwt-provider.ts`: sign/verify JWT tokens, config keys, expiration
- `session-store.ts`: session persistence adapter for Redis or database
- `middleware.ts`: request auth extraction, role/permission enforcement
- `permissions.ts`: role mapping and helper functions
- `auth-context.ts`: typed context object
- `token-service.ts`: token issuance and revocation
- `user-session.ts`: session lifecycle helpers

## 9. Secure architecture

### Data protection

- Use HTTPS everywhere.
- Store refresh tokens or sessions in secure, HttpOnly cookies.
- Use short-lived JWTs and refresh tokens for longer sessions.
- Protect against CSRF for cookie-based auth with double submit or same-site cookies.

### Token security

- Use asymmetric signing (RS256 / ES256) if possible.
- Support key rotation and `kid` headers.
- Validate token expiration and `jti` for revocation.
- Store revoked token IDs or session IDs in a revocation store.

### Rate limiting

- Apply rate limits to login, score submission, and admin actions.
- Use IP+user or token-based throttling.

### Secrets

- Keep private keys and JWT secrets in environment variables.
- Do not store secrets in source control.

### Monitoring

- Log failed auth attempts and suspicious behavior.
- Use audit logs for critical state changes.
- Generate alerts for repeated access denials.

## 10. Example auth flow

### Login

- `POST /api/auth/login`
- validate credentials
- issue JWT or session cookie
- return user info and allowed role

### Protected action

- `POST /api/challenges/:challengeId/start`
- middleware verifies auth
- middleware checks `challenge.start` permission
- service validates resource-specific policies
- audit log is created

### Viewer access

- `GET /api/rankings/live`
- `requireAuth` or optional public route if leaderboard is public
- check `ranking.view` permission for private seasons

## 11. Notes

- Keep routing and role checks in middleware, but perform extra checks in services for authorization boundary.
- `VIEWER` should never be able to invoke judge/admin actions.
- `ADMIN` should have both broad permissions and the ability to delegate.

## 12. Next step

If you want, I can also scaffold the auth folder and generate the actual middleware and JWT/session provider files in the repo.
