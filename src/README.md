# Source Directory

This directory contains the main source code for the Waiver Wire fantasy football analytics application.

## Structure

```
/src
  /app          - Next.js App Router pages and API routes
  /components   - React components organized by category
    /ui         - Reusable UI components (buttons, forms, cards, etc.)
    /fantasy    - Fantasy football specific components (player cards, projections, etc.)
  /lib          - Utility libraries and business logic
    /database   - Database operations and queries
    /projections - Player projection algorithms and models
    /risk-models - Risk assessment and analysis tools
  /types        - TypeScript type definitions
```

## Purpose

- **Clean separation** of concerns with organized folder structure
- **Scalable architecture** for fantasy football analytics
- **Reusable components** for consistent UI/UX
- **Modular libraries** for data processing and analysis 