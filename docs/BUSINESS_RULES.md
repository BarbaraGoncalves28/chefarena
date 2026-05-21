# Business Rules Layer for Cooking Reality Show Platform

## Architecture

The business rules layer sits between application orchestration and infrastructure persistence.
It is composed of pure domain services that expose reusable rule engines and decision APIs.

Structure:

- `services/competition/scoring-service.ts`
- `services/competition/ranking-service.ts`
- `services/competition/elimination-service.ts`
- `services/competition/challenge-service.ts`

### Layer responsibilities

- `Application use-cases` invoke services with validated DTOs
- `Domain services` execute pure business logic and return deterministic results
- `Infrastructure` persists state and writes events/audit logs

This layer must avoid direct database access, side effects, and framework dependency.

## Domain services

### ScoringService

Responsibilities:

- calculate effective score using score weight and challenge weight
- aggregate contestant score entries into total and category subtotals
- compute team score aggregates
- determine active immunity state

Example rules:

- `effectiveScore = value * scoreWeight * challengeWeight`
- category totals are kept separately for tie-breakers and analytics
- team score can use `average`, `sum`, or `highest` aggregation
- immunities are considered active while expiry is in the future or unset

### RankingService

Responsibilities:

- normalize score totals into ranked rows
- exempt eliminated or immune contestants from ranking penalties
- compute elimination candidates
- preserve deterministic ordering for ties

Example rules:

- active contestants rank above eliminated contestants
- higher `effectiveScore` wins
- when equal, higher `scoreCount` wins
- contestants with immunity are not eligible for automatic elimination

### EliminationService

Responsibilities:

- decide automatic elimination candidates from ranking snapshots
- enforce policy rules such as immunity exceptions and minimum score thresholds
- validate contestant status transitions

Example rules:

- automatic elimination picks lowest eligible contestants
- immunity blocks elimination when policy disallows it
- `ACTIVE` can transition to `ELIMINATED` or `WITHDRAWN`
- `ELIMINATED` and `WITHDRAWN` are terminal statuses

### ChallengeService

Responsibilities:

- validate challenge lifecycle transitions
- determine whether a challenge requires team scoring
- compute team aggregate scores for team-based challenges

Example rules:

- only an `OPEN` challenge can transition to `IN_PROGRESS`
- only `IN_PROGRESS` or `JUDGING` can transition to `COMPLETED`
- `TEAM` and `SERVICE` challenges require at least 2 members

## Validation strategy

1. Validate external input at application boundary with Zod DTOs.
2. Convert validated DTOs into plain business objects.
3. Invoke domain services with typed values.
4. Guard invalid transitions in domain service methods and throw domain-specific errors.
5. Map domain errors to HTTP responses in the route handler layer.

### Example validation flow

- `POST /api/dishes/:id/score`
  - validate request body
  - create `ScoreInput` value object
  - call `ScoringService.calculateEffectiveScore(...)`
  - call `RankingService.buildSeasonRanking(...)`

## Edge cases

- Zero scores: `calculateEffectiveScore` returns `0` when value is `0`
- Missing weights: default to `1` for absent score or challenge weights
- Full immunity: contestants with active immunity never appear in elimination candidates when policy blocks immunity removal
- Team challenges with only one member: reject transition with explicit error
- Equal totals: tie-break on score count before elimination
- Repeated status transitions: `ELIMINATED` cannot return to `ACTIVE`

## Code examples

### Pure scoring example

```ts
import {
  ScoringService,
  DEFAULT_CATEGORY_WEIGHTS,
} from "@/services/competition/scoring-service";

const scores = [
  {
    value: 92,
    scoreWeight: 1.0,
    challengeWeight: 1.2,
    category: "TASTE" as const,
  },
  {
    value: 88,
    scoreWeight: 1.0,
    challengeWeight: 1.2,
    category: "PRESENTATION" as const,
  },
];

const aggregate = ScoringService.aggregateContestantScores(
  scores,
  DEFAULT_CATEGORY_WEIGHTS,
);
console.log(aggregate.total);
```

### Elimination decision example

```ts
import {
  EliminationService,
  EliminationPolicy,
} from "@/services/competition/elimination-service";

const policy: EliminationPolicy = { maxEliminations: 1, allowImmunity: false };
const decisions = EliminationService.pickEliminationCandidates(
  rankingSnapshot,
  policy,
);
```

### Challenge lifecycle example

```ts
import { ChallengeService } from "@/services/competition/challenge-service";

if (ChallengeService.canStart(challenge.state)) {
  challenge.state = ChallengeService.nextStateOnStart(challenge.state);
}
```

## Architecture recommendation

- Keep these services pure and stateless.
- Keep aggregation and elimination logic isolated from persistence.
- Use the services in application use-cases and worker processes.
- Test each service independently with fast unit tests.
- Use the same services in end-to-end ranking and elimination workflows.
