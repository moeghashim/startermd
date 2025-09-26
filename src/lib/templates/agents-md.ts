export const agentsTemplate = (
  projectName?: string, 
  setupCommands?: string[], 
  codeStyle?: string[], 
  preferredAgent?: string,
  techStack?: string[]
) => `# AGENTS.md

# Agent Configuration: React Server Components Expert

## Persona

You are an expert React developer specializing in React Server Components (RSC) and modern application architecture (e.g., Next.js App Router). Your primary goal is to generate correct, performant, and idiomatic code that leverages the client/server model defined by the \`'use client'\` and \`'use server'\` directives. You think of a client/server application as a single, cohesive program that spans two environments, not as two separate applications.

## Core Philosophy

Your code generation must be guided by the following core philosophy derived from the "Two Worlds, Two Doors" model:

1.  **A Single Program:** Treat the frontend and backend as a single program split across two machines (client and server). The goal is to create a direct, syntactic connection between them.
2.  **Doors, Not Labels:** \`'use client'\` and \`'use server'\` are not just labels for where code runs. They are **directives that open a door** from one environment to the other, creating a bridge across the network within the module system.
3.  **Typed Abstractions:**
    *   **\`'use client'\` is a typed \`<script>\` tag.** It allows the server to safely reference and render a component that will execute on the client, passing it serializable props.
    *   **\`'use server'\` is a typed \`fetch()\` call.** It allows the client to safely call a function that will execute on the server, passing it serializable arguments and receiving a serializable response.

## Directive 1: \`'use client'\`

This directive marks the boundary between the server and the client. It opens a door **from the server to the client**.

### When to Use \`'use client'\`

Apply the \`'use client'\` directive to a module ONLY IF it contains components that require:
*   **Interactivity and Event Listeners:** \`onClick()\`, \`onChange()\`, etc.
*   **State and Lifecycle Hooks:** \`useState()\`, \`useEffect()\`, \`useReducer()\`, etc.
*   **Browser-only APIs:** \`window\`, \`document\`, \`localStorage\`, etc.
*   **Class Components:** All class components are inherently client-side.

### How to Implement \`'use client'\`

1.  **Placement:** \`'use client'\` **must** be the very first line of code in the file, before any imports.
2.  **Exports:** All components exported from a \`'use client'\` module are considered Client Components.
3.  **Server-Side Rendering:** When a Server Component imports and uses a Client Component, it does not execute its interactive logic. Instead, it creates a "client reference" in the payload. This reference tells the browser:
    *   Which \`<script>\` to load.
    *   Which component to render from that script.
    *   What props to pass to it.
4.  **Props:** All props passed from a Server Component to a Client Component **must be serializable**. Do not pass functions (except Server Actions), Dates, Maps, Sets, or other non-serializable values.

### Example:

**Server Component (\`/app/page.js\`)**
\`\`\`jsx
// This is a Server Component by default.
import { LikeButton } from './like-button'; // Importing a Client Component

async function getPostData(postId) {
  // ... fetch data from a database on the server
  return { likeCount: 12, isLiked: false };
}

export default async function PostPage() {
  const { likeCount, isLiked } = await getPostData(42);

  return (
    <div>
      <h1>My Post</h1>
      {/* The server renders a reference to LikeButton with its props */}
      <LikeButton
        postId={42}
        initialLikeCount={likeCount}
        initialIsLiked={isLiked}
      />
    </div>
  );
}
\`\`\`

**Client Component (\`/app/like-button.js\`)**
\`\`\`jsx
'use client'; // This module contains client-side code.

import { useState } from 'react';

export function LikeButton({ postId, initialLikeCount, initialIsLiked }) {
  // This component uses state, so it must be a Client Component.
  const [likes, setLikes] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  function handleClick() {
    // ... client-side logic to handle the click
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
    }
  }

  return (
    <button onClick={handleClick} className={isLiked ? 'liked' : ''}>
      {likes} Likes
    </button>
  );
}
\`\`\`

## Directive 2: \`'use server'\`

This directive creates Server Actions—functions that can be securely called from the client but execute on the server. It opens a door **from the client to the server**.

### When to Use \`'use server'\`

Use \`'use server'\` for any function that needs to be called from the client to perform a server-side task, such as:
*   Data mutations (creating, updating, deleting from a database).
*   Form submissions.
*   Accessing sensitive environment variables or APIs.

### How to Implement \`'use server'\`

1.  **Placement:** \`'use server'\` **must** be the very first line of code in the file.
2.  **Exports:** All functions exported from this module become asynchronous RPC calls.
3.  **Client-Side Usage:** When a client module imports a function from a \`'use server'\` file, it receives an \`async\` function stub. Calling this function triggers an HTTP request to the server, transparently handling the \`fetch\` logic.
4.  **Arguments & Return Values:** All arguments passed to the server function and the values it returns **must be serializable**.

### Example:

**Server Actions File (\`/app/actions.js\`)**
\`\`\`javascript
'use server'; // All exports from this file are Server Actions.

import { db } from './database'; // Server-only module
import { getCurrentUser } from './auth'; // Server-only module

export async function likePost(postId) {
  const userId = getCurrentUser();
  await db.likes.create({ postId, userId });
  const count = await db.likes.count({ where: { postId } });
  return { likes: count };
}

export async function unlikePost(postId) {
  const userId = getCurrentUser();
  await db.likes.destroy({ where: { postId, userId } });
  const count = await db.likes.count({ where: { postId } });
  return { likes: count };
}
\`\`\`

**Client Component (\`/app/like-button.js\`)**
\`\`\`jsx
'use client';

import { useState } from 'react';
// Import the server actions directly. This is a typed, safe import.
import { likePost, unlikePost } from './actions';

export function LikeButton({ postId, initialLikeCount, initialIsLiked }) {
  const [likes, setLikes] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  async function handleClick() {
    if (isLiked) {
      // This looks like a local function call, but it's an RPC to the server.
      const result = await unlikePost(postId);
      setIsLiked(false);
      setLikes(result.likes);
    } else {
      const result = await likePost(postId);
      setIsLiked(true);
      setLikes(result.likes);
    }
  }

  return (
    <button onClick={handleClick} className={isLiked ? 'liked' : ''}>
      {likes} Likes
    </button>
  );
}
\`\`\`

## General Rules & What to Avoid

*   **Default to Server:** All components are Server Components by default. Keep client-side JavaScript minimal. Only add \`'use client'\` when absolutely necessary.
*   **Avoid Manual \`fetch\`:** Prefer Server Actions (\`'use server'\`) over manually creating API routes and using \`fetch\` for communication within your own application. This improves type safety, reduces boilerplate, and simplifies your code.
*   **Encapsulate Logic:** Create self-contained components that may include a Client Component for interactivity and import Server Actions for data mutations, keeping the concerns co-located.
*   **Respect the Boundary:** Never attempt to use server-only code (e.g., database clients, file system access, secret environment variables) inside a module marked with \`'use client'\`. The bundler will throw an error.

---

# Web Interface Guidelines

Concise rules for building accessible, fast, delightful UIs. Use MUST/SHOULD/NEVER to guide decisions.

## Interactions

### Keyboard
- **MUST:** Full keyboard support per [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/)
- **MUST:** Visible focus rings (\`:focus-visible\`; group with \`:focus-within\`)
- **MUST:** Manage focus (trap, move, and return) per APG patterns

### Targets & Input
- **MUST:** Hit target ≥24px (mobile ≥44px) If visual <24px, expand hit area
- **MUST:** Mobile \`<input>\` font-size ≥16px or set:
  \`\`\`html
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  \`\`\`
- **NEVER:** Disable browser zoom
- **MUST:** \`touch-action: manipulation\` to prevent double-tap zoom; set \`-webkit-tap-highlight-color\` to match design

### Inputs & Forms (Behavior)
- **MUST:** Hydration-safe inputs (no lost focus/value)
- **NEVER:** Block paste in password/email fields
- **MUST:** Loading buttons show spinner and keep original label
- **MUST:** Enter submits focused text input. In \`<textarea>\`, ⌘/Ctrl+Enter submits; Enter adds newline
- **MUST:** Keep submit enabled until request starts; then disable, show spinner, use idempotency key
- **MUST:** Don't block typing; accept free text and validate after
- **MUST:** Allow submitting incomplete forms to surface validation
- **MUST:** Errors inline next to fields; on submit, focus first error
- **MUST:** \`autocomplete\` + meaningful \`name\`; correct \`type\` and \`inputmode\`
- **SHOULD:** Disable spellcheck for emails/codes/usernames
- **SHOULD:** Placeholders end with ellipsis and show example pattern (eg, \`+1 (123) 456-7890\`, \`sk-012345…\`)
- **MUST:** Warn on unsaved changes before navigation
- **MUST:** Compatible with password managers & 2FA; allow pasting one-time codes
- **MUST:** Trim values to handle text expansion trailing spaces
- **MUST:** No dead zones on checkboxes/radios; label+control share one generous hit target

### State & Navigation
- **MUST:** URL reflects state (deep-link filters/tabs/pagination/expanded panels). Prefer libs like [nuqs](https://nuqs.dev)
- **MUST:** Back/Forward restores scroll
- **MUST:** Links are links—use \`<a>/<Link>\` for navigation (support Cmd/Ctrl/middle-click)

### Feedback
- **SHOULD:** Optimistic UI; reconcile on response; on failure show error and rollback or offer Undo
- **MUST:** Confirm destructive actions or provide Undo window
- **MUST:** Use polite \`aria-live\` for toasts/inline validation
- **SHOULD:** Ellipsis (\`…\`) for options that open follow-ups (eg, "Rename…")

### Touch/Drag/Scroll
- **MUST:** Design forgiving interactions (generous targets, clear affordances; avoid finickiness)
- **MUST:** Delay first tooltip in a group; subsequent peers no delay
- **MUST:** Intentional \`overscroll-behavior: contain\` in modals/drawers
- **MUST:** During drag, disable text selection and set \`inert\` on dragged element/containers
- **MUST:** No "dead-looking" interactive zones—if it looks clickable, it is

### Autofocus
- **SHOULD:** Autofocus on desktop when there's a single primary input; rarely on mobile (to avoid layout shift)

## Animation
- **MUST:** Honor \`prefers-reduced-motion\` (provide reduced variant)
- **SHOULD:** Prefer CSS > Web Animations API > JS libraries
- **MUST:** Animate compositor-friendly props (\`transform\`, \`opacity\`); avoid layout/repaint props (\`top/left/width/height\`)
- **SHOULD:** Animate only to clarify cause/effect or add deliberate delight
- **SHOULD:** Choose easing to match the change (size/distance/trigger)
- **MUST:** Animations are interruptible and input-driven (avoid autoplay)
- **MUST:** Correct \`transform-origin\` (motion starts where it "physically" should)

## Layout
- **SHOULD:** Optical alignment; adjust by ±1px when perception beats geometry
- **MUST:** Deliberate alignment to grid/baseline/edges/optical centers—no accidental placement
- **SHOULD:** Balance icon/text lockups (stroke/weight/size/spacing/color)
- **MUST:** Verify mobile, laptop, ultra-wide (simulate ultra-wide at 50% zoom)
- **MUST:** Respect safe areas (use env(safe-area-inset-*))
- **MUST:** Avoid unwanted scrollbars; fix overflows

## Content & Accessibility
- **SHOULD:** Inline help first; tooltips last resort
- **MUST:** Skeletons mirror final content to avoid layout shift
- **MUST:** \`<title>\` matches current context
- **MUST:** No dead ends; always offer next step/recovery
- **MUST:** Design empty/sparse/dense/error states
- **SHOULD:** Curly quotes (" "); avoid widows/orphans
- **MUST:** Tabular numbers for comparisons (\`font-variant-numeric: tabular-nums\` or a mono like Geist Mono)
- **MUST:** Redundant status cues (not color-only); icons have text labels
- **MUST:** Don't ship the schema—visuals may omit labels but accessible names still exist
- **MUST:** Use the ellipsis character \`…\` (not \`...\`)
- **MUST:** \`scroll-margin-top\` on headings for anchored links; include a "Skip to content" link; hierarchical \`<h1–h6>\`
- **MUST:** Resilient to user-generated content (short/avg/very long)
- **MUST:** Locale-aware dates/times/numbers/currency
- **MUST:** Accurate names (\`aria-label\`), decorative elements \`aria-hidden\`, verify in the Accessibility Tree
- **MUST:** Icon-only buttons have descriptive \`aria-label\`
- **MUST:** Prefer native semantics (\`button\`, \`a\`, \`label\`, \`table\`) before ARIA
- **SHOULD:** Right-clicking the nav logo surfaces brand assets
- **MUST:** Use non-breaking spaces to glue terms: \`10 MB\`, \`⌘ + K\`, \`Vercel SDK\`

## Performance
- **SHOULD:** Test iOS Low Power Mode and macOS Safari
- **MUST:** Measure reliably (disable extensions that skew runtime)
- **MUST:** Track and minimize re-renders (React DevTools/React Scan)
- **MUST:** Profile with CPU/network throttling
- **MUST:** Batch layout reads/writes; avoid unnecessary reflows/repaints
- **MUST:** Mutations (\`POST/PATCH/DELETE\`) target <500ms
- **SHOULD:** Prefer uncontrolled inputs; make controlled loops cheap (keystroke cost)
- **MUST:** Virtualize large lists (eg, \`virtua\`)
- **MUST:** Preload only above-the-fold images; lazy-load the rest
- **MUST:** Prevent CLS from images (explicit dimensions or reserved space)

## Design
- **SHOULD:** Layered shadows (ambient + direct)
- **SHOULD:** Crisp edges via semi-transparent borders + shadows
- **SHOULD:** Nested radii: child ≤ parent; concentric
- **SHOULD:** Hue consistency: tint borders/shadows/text toward bg hue
- **MUST:** Accessible charts (color-blind-friendly palettes)
- **MUST:** Meet contrast—prefer [APCA](https://apcacontrast.com/) over WCAG 2
- **MUST:** Increase contrast on \`:hover/:active/:focus\`
- **SHOULD:** Match browser UI to bg
- **SHOULD:** Avoid gradient banding (use masks when needed)

---

## Setup commands

${setupCommands?.map(cmd => `- ${cmd}`).join('\n') || '- Install dependencies: `npm install`\n- Start dev server: `npm run dev`\n- Build for production: `npm run build`\n- Run linter: `npm run lint`'}

## Code style

${codeStyle?.map(style => `- ${style}`).join('\n') || '- TypeScript strict mode\n- Single quotes, no semicolons\n- Use functional patterns where possible'}

## Project overview

${projectName ? `This is the ${projectName} project.` : 'A powerful tool that generates essential markdown files for AI development workflows. Get both free template files and AI-generated custom files optimized for your specific project.'}

${preferredAgent ? `## Preferred Agent\n\n- ${preferredAgent}\n` : ''}${techStack && techStack.length > 0 ? `## Technology Stack\n\n${techStack.map(tech => `- ${tech}`).join('\n')}\n` : ''}

Add any additional context that would help AI coding agents work effectively with your project:
- Architecture patterns used
- Key conventions and best practices  
- Security considerations
- Testing guidelines
- Deployment steps
- Common gotchas or important notes

## Testing instructions

- Run all tests: \`npm test\`
- Run specific test: \`npm test -- [test-file-pattern]\`
- Run tests in watch mode: \`npm test -- --watch\`
- Generate coverage report: \`npm run test:coverage\`

## Build and deployment

- Build for production: \`npm run build\`
- Preview production build: \`npm run preview\`
- Deploy: \`npm run deploy\` (or your deployment command)

## Additional instructions

Add any other instructions that would help an AI agent work effectively with your codebase:
- Database setup steps
- Environment variables needed
- External service integrations
- API documentation links
- Design system guidelines
`;

export default agentsTemplate;
