# Skill Registry - juniorssntndr/myotd

## Project Standards (auto-resolved)

### General Conventions
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + OKLCH colors
- **State**: Zustand
- **Forms**: react-hook-form + zod
- **Rules**:
  - Use dedicated pages for forms, NO modals for data creation.
  - Use Route Handlers, NO Server Actions.
  - Prefer Clean/Hexagonal architecture.

### Component Structure
- Organized by domain in `src/components/`.
- Server components by default.
- `use client` only when necessary for interactivity.

## Active Skills

| Skill | Trigger | Source |
|-------|---------|--------|
| branch-pr | Creating a PR, opening a PR, or preparing changes for review | User Skill |
| issue-creation | Creating a GitHub issue, reporting a bug, or requesting a feature | User Skill |
| judgment-day | Dual adversarial review protocol | User Skill |
| sdd-* | Spec-Driven Development phases | User Skill |
| skill-creator | Creating new AI agent skills | User Skill |
| skill-registry | Updating the skill registry | User Skill |
