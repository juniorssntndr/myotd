# Skill Registry - ECOMMERCE

This file documents the conventions, rules, and skills applicable to the ECOMMERCE (myotd) project.

## Project Rules (from CLAUDE.md / AGENTS.md)

1. **No Modals for Creation**: When creating new data, use dedicated pages for forms, not modal dialogs.
2. **No Server Actions**: Use Route Handlers (API routes) instead of React Server Actions.
3. **State Management**: Use Zustand for global state.
4. **Forms**: Use `react-hook-form` and `zod` for forms.
5. **Components**: Server Components by default, `"use client"` for interactivity. Use `cn()` utility for class merging.
6. **Styling**: Tailwind CSS v4 with OKLCH color variables and `next-themes` (class strategy).

## Compact Rules (auto-resolved)

- **Next.js & TypeScript**: Use app router, route handlers for data mutations, standard TypeScript types.
- **Tailwind v4**: Use CSS variables in OKLCH, standard Tailwind classes, and next-themes.
- **Form validation**: Combine `react-hook-form` and `zod`.
