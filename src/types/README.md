# TypeScript Type Definitions

Comprehensive type definitions for the Waiver Wire fantasy football application.

## Type Categories

- **player.ts** - Player data structures and statistics
- **league.ts** - Fantasy league and roster types
- **projections.ts** - Projection model interfaces
- **database.ts** - Database schema types
- **api.ts** - API request/response types
- **ui.ts** - Component prop interfaces

## Key Types

```typescript
// Example structures
interface Player {
  id: string;
  name: string;
  position: Position;
  team: NFLTeam;
  stats: PlayerStats;
  projections: ProjectionData;
}

interface Projection {
  playerId: string;
  week: number;
  points: number;
  confidence: number;
  risk: RiskLevel;
}
```

## Benefits

- **Type Safety** - Compile-time error checking
- **IntelliSense** - Better IDE autocomplete
- **Documentation** - Self-documenting code
- **Refactoring** - Safer code changes 