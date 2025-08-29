# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js web application that generates essential markdown files for AI development workflows. It provides both free template downloads and AI-powered custom file generation for projects using various coding agents (Cursor, Claude Code, etc.).

The application features:
- Template generation for AGENTS.md, CLAUDE.md, and workflow files
- AI-powered custom file generation using OpenAI GPT-5
- Stripe integration for payment processing
- Usage statistics tracking

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **AI Integration**: OpenAI GPT-5 nano with reasoning capabilities
- **Payments**: Stripe with checkout sessions and webhooks
- **Build Tools**: Turbopack for development
- **Type Checking**: TypeScript strict mode
- **Linting**: ESLint with Next.js config

## Development Commands

- **Install dependencies**: `npm install`
- **Start development server**: `npm run dev` (uses Turbopack)
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Run linter**: `npm run lint`

## Architecture

### Core Components

- `src/app/` - Next.js App Router structure
  - `api/` - API routes for generation, payments, and webhooks
  - `page.tsx` - Main application interface
  - `stats/` - Usage statistics page
- `src/components/` - React components including UI components from shadcn/ui
- `src/lib/` - Utilities and template generation logic
  - `templates/` - Template generators for different agent configurations
  - `file-utils.ts` - ZIP file creation and download utilities
  - `stats.ts` - Statistics tracking functionality

### Key Features

**Template Generation**: Multiple template generators in `src/lib/templates/` create configuration files for different coding agents (AGENTS.md, CLAUDE.md, replit.md) and workflow templates.

**AI Generation**: The `/api/generate` endpoint uses OpenAI GPT-5 nano to create custom files based on project descriptions, with structured JSON responses for consistent output.

**Payment Flow**: Stripe checkout sessions handle payments, with webhook validation for secure transaction processing.

**File Management**: Client-side ZIP file creation allows users to download multiple generated files as a single archive.

## Environment Variables Required

- `OPENAI_API_KEY` - OpenAI API key for AI generation
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

## Code Style Guidelines

- TypeScript strict mode enabled
- Path aliases configured (`@/*` maps to `./src/*`)
- Functional React components with hooks
- Async/await for API calls
- Error handling with try/catch blocks
- shadcn/ui component patterns

## File Organization

- API routes follow RESTful conventions
- Components organized by feature/UI hierarchy  
- Templates are separate modules for maintainability
- Utilities are grouped by functionality
- Client and server code clearly separated

## Payment and Security

- Stripe webhook validation ensures payment security
- Environment variables protect sensitive keys
- No client-side storage of payment information
- CORS and rate limiting should be considered for production