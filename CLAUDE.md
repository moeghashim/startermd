# Development Workflow

**Always use `pnpm`, not `npm`.**

```sh
# 1. Make changes

# 2. Typecheck (fast)
pnpm typecheck

# 3. Run tests
pnpm test -- -t "test name"      # Single suite
pnpm test:file -- "glob"         # Specific files

# 4. Lint before committing
pnpm lint:file -- "file1.ts"     # Specific files
pnpm lint                        # All files

# 5. Before creating PR
pnpm lint:claude && pnpm test
```

## Project Overview

This is a web application that generates essential markdown files for AI development workflows. It provides template downloads and AI-powered custom file generation for coding agents like Cursor and Claude Code.

## Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Payments**: Stripe
- **Build**: Turbopack

## Code Style Guidelines

- **TypeScript**: Strict mode enabled, use path aliases (`@/*`)
- **React**: Functional components with hooks, use functional patterns
- **Styling**: Tailwind utility classes, shadcn/ui components
- **API**: Async/await with try/catch, structured JSON responses
- **Organization**: Features grouped in `src/app/`, components in `src/components/`, templates in `src/lib/templates/`
