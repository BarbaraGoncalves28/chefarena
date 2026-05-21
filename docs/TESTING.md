# Testing Strategy for Cooking Reality Show Platform

This document defines a production-grade testing architecture for the platform.
It covers unit tests, integration tests, business-rule tests, API tests, PostgreSQL tests, and event tests.

## 1. Testing architecture

### 1.1 Test tiers

- **Unit tests**
  - Validate small, isolated functions and classes.
  - Focus on domain services, utilities, and DTO validation.
  - No database or external dependency.

- **Business rule tests**
  - Exercise domain services and policy engines.
  - Validate ranking, elimination, scoring, immunity, and challenge lifecycle rules.
  - Use pure service inputs and expected outputs.

- **API tests**
  - Validate Route Handlers and application flows.
  - Use HTTP-style request objects or supertest against a running app.
  - Cover authorization, validation, error mapping, and response payloads.

- **Integration tests**
  - Validate real infrastructure interactions.
  - Use PostgreSQL via Prisma and/or the event broker adapter.
  - Cover `ScoreService` + repository persistence + ranking updates.

- **PostgreSQL tests**
  - Validate database-level behavior, migrations, constraints, and transactions.
  - Use a dedicated test database or ephemeral container.

- **Event tests**
  - Validate event production, delivery, and handler side-effects.
  - Include event envelope shape, worker processing, and idempotency.

### 1.2 Testing principles

- Write tests for **behavior**, not implementation details.
- Keep unit tests fast and deterministic.
- Use dependency injection for service dependencies.
- Isolate business logic from framework and database.
- Avoid monolithic integration tests; keep them targeted.
- Use typed fixtures and factories for repeatable scenarios.

## 2. Recommended folder structure

```
project-root/
  tests/
    unit/
      domain/
        scoring-service.test.ts
        ranking-service.test.ts
        elimination-service.test.ts
        challenge-service.test.ts
      application/
        record-score.usecase.test.ts
        start-challenge.usecase.test.ts
      infrastructure/
        event-publisher.test.ts
        audit-log-repo.test.ts
    integration/
      api/
        score-route.test.ts
        rankings-route.test.ts
      prisma/
        prisma-integration.test.ts
      events/
        ranking-worker.test.ts
    fixtures/
      contestants.ts
      seasons.ts
      challenges.ts
      scores.ts
    helpers/
      prisma-client.ts
      test-server.ts
      seed.ts
```

Alternative directory style using `src/__tests__`:

```
src/
  application/
  domain/
  infrastructure/

tests/
  unit/
  integration/
```

## 3. Tooling recommendation

### Test runner

- Use `vitest` for speed and modern TypeScript support.
- Alternative: `jest` if the team prefers an established ecosystem.

### Assertion / mocking

- Use `@testing-library/react` for any client component tests.
- Use `vi` or `jest` for mocks and spies.
- Use `@sinonjs/fake-timers` if time manipulation is required.

### HTTP / API testing

- Use `supertest` for route handler integration tests.
- Optionally `playwright` for end-to-end browser flows.

### PostgreSQL / database testing

- Use a dedicated test database URL from `.env.test`.
- Prefer ephemeral containers via `docker-compose` or `testcontainers`.
- Use `prisma migrate deploy` or `prisma db push` on the test database.

## 4. Mocking strategy

### 4.1 Unit tests

- Mock repository interfaces and event bus adapters.
- Use factories for domain inputs.
- Do not mock the service under test.
- Example dependencies to mock:
  - `CompetitionRepository`
  - `AuditLogRepository`
  - `EventBus`
  - `RankingRepository`

### 4.2 Business rule tests

- No mocking required for pure service classes.
- Provide arrays of DTO-like objects and assert deterministic outputs.

### 4.3 Application tests

- Mock infrastructure dependencies at the boundary.
- Replace Prisma repository implementations with in-memory or stubbed versions.
- For authorization, mock auth context providers.

### 4.4 Event tests

- Use fake broker adapters for publish/subscribe.
- Assert that `publish(event)` is called with the correct envelope.
- For handler tests, inject a fake event store and verify state changes.

## 5. Transactional testing strategy

### 5.1 Test database setup

- Create a dedicated PostgreSQL test database via environment variable `TEST_DATABASE_URL`.
- Run migrations or `prisma db push` before tests.
- Use a shared connection pool for test processes.

### 5.2 Transaction rollback

- In integration tests, wrap each test in a transaction and roll back at the end.
- Example with Prisma:

```ts
let txClient: PrismaClient;

beforeEach(async () => {
  txClient = await prisma.$transaction();
});

afterEach(async () => {
  await txClient.$rollback();
});
```

- If transactions are not possible due to multiple connections, use schema reset or truncate strategy.

### 5.3 Ephemeral test database

- Use a fresh database for the test suite and truncate tables between tests.
- Use `prisma.$executeRaw` to clear state safely.
- Keep seed fixtures idempotent.

### 5.4 Parallelism

- For parallel tests, each worker should use a unique database instance or schema.
- Use `vitest` `--pool=threads` with separate `TEST_DATABASE_URL` values.

## 6. Critical rule test coverage

### 6.1 Ranking calculations

- Validate rank order with mixed scores.
- Validate tie-breaking by score count.
- Validate immunity exclusion from elimination ranking.
- Validate team scoring aggregation modes.

### 6.2 Eliminations

- Validate automatic elimination candidate selection.
- Validate policy blocks elimination for immune contestants.
- Validate manual elimination can override only with proper authorization.
- Validate status transitions from `ACTIVE` to `ELIMINATED` and reject invalid transitions.

### 6.3 Immunity logic

- Test active immunity expiration.
- Test immunity override when policy allows it.
- Test challenge-level immunity grants for team and individual challenges.

### 6.4 Score calculations

- Validate effective score formula with scoreWeight and challengeWeight.
- Validate default weights when undefined.
- Validate category subtotal and weighted average behavior.

### 6.5 Challenge lifecycle

- Validate start only from `OPEN`.
- Validate finish only from `IN_PROGRESS` or `JUDGING`.
- Validate team challenge participant constraints.
- Validate state transitions produce expected next state.

## 7. Example test templates

### 7.1 Unit test example

```ts
import { describe, expect, it } from "vitest";
import { ScoringService } from "@/services/competition/scoring-service";

describe("ScoringService", () => {
  it("calculates effective scores with weights", () => {
    const result = ScoringService.calculateEffectiveScore({
      value: 80,
      scoreWeight: 1.2,
      challengeWeight: 1.5,
      category: "TASTE",
    });

    expect(result).toBe(144);
  });
});
```

### 7.2 Business rule test example

```ts
import { describe, expect, it } from "vitest";
import { EliminationService } from "@/services/competition/elimination-service";

const rankingSnapshot = {
  seasonId: "season-1",
  generatedAt: new Date().toISOString(),
  contestants: [
    {
      contestantId: "c1",
      name: "Alice",
      effectiveScore: 42,
      rank: 1,
      eliminated: false,
      immunity: false,
      scoreCount: 3,
    },
    {
      contestantId: "c2",
      name: "Bob",
      effectiveScore: 25,
      rank: 2,
      eliminated: false,
      immunity: false,
      scoreCount: 2,
    },
  ],
};

it("selects the lowest eligible elimination candidate", () => {
  const decisions = EliminationService.pickEliminationCandidates(
    rankingSnapshot,
    {
      maxEliminations: 1,
      allowImmunity: false,
    },
  );

  expect(decisions).toEqual([
    expect.objectContaining({ contestantId: "c2", automatic: true }),
  ]);
});
```

### 7.3 API test example

```ts
import request from "supertest";
import { app } from "@/app/server";

describe("POST /api/dishes/:dishId/score", () => {
  it("returns 201 and ranking snapshot", async () => {
    const response = await request(app)
      .post("/api/dishes/dish-123/score")
      .send({
        seasonId: "season-1",
        challengeId: "challenge-1",
        contestantId: "contestant-1",
        judgeId: "judge-1",
        value: 92,
        category: "TASTE",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.ranking).toBeDefined();
  });
});
```

### 7.4 PostgreSQL integration test example

```ts
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Score", "Contestant", "Challenge" RESTART IDENTITY CASCADE;',
  );
});

it("persists a score and updates ranking state", async () => {
  // Arrange: create season/challenge/contestant fixtures
  // Act: call service to record a score
  // Assert: verify stored score and aggregate result
});
```

### 7.5 Event test example

```ts
import { describe, expect, it, vi } from "vitest";
import { EventPublisher } from "@/infrastructure/events/eventPublisher";

it("publishes dish.scored event after score creation", async () => {
  const publisher = new EventPublisher({ broker: { publish: vi.fn() } });

  await publisher.publish({
    type: "dish.scored.v1",
    aggregateId: "dish-1",
    aggregateType: "Dish",
    payload: { scoreId: "score-1", value: 88 },
    correlationId: "corr-1",
  });

  expect(publisher.broker.publish).toHaveBeenCalledWith(
    expect.objectContaining({ type: "dish.scored.v1" }),
  );
});
```

## 8. Recommended test commands

- `npm install -D vitest @testing-library/react @testing-library/jest-dom supertest testcontainers`
- `npx vitest run` for full suite
- `npx vitest run tests/unit` for unit tests only
- `npx vitest run tests/integration` for integration tests

## 9. CI strategy

- Run unit tests first
- Run business-rule tests in parallel
- Run integration and PostgreSQL tests in a separate job with database setup
- Use coverage gating for core domain services and API responses
- Keep event tests in a separate stage if they depend on broker services

## 10. Summary

This strategy separates responsibilities cleanly:

- unit tests for service logic and validation
- business tests for core domain rules
- API tests for contract validation and route behavior
- integration tests for persistence and worker flows
- PostgreSQL tests for DB schema and transaction invariants
- event tests for event publication and handling

Use dependency injection and mocked adapters to keep tests fast and maintainable.
