# DevCollab

Modern SaaS dashboard built with **Next.js 15**, **App Router**, **TypeScript**, and **Tailwind CSS v4**.

## Project structure

```
├── app/                    # App Router routes & layouts
│   ├── (auth)/             # Auth route group (login, register)
│   ├── (dashboard)/        # Protected dashboard shell
│   └── api/                # Route handlers
├── components/
│   ├── layout/             # Shell, sidebar, topbar
│   ├── shared/             # Reusable page-level UI
│   └── ui/                 # Primitive UI components
├── hooks/                  # Client-side React hooks
├── lib/                    # Utilities, constants, API client
├── services/               # Data access / API service layer
└── types/                  # Shared TypeScript types
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start dev server (Turbopack) |
| `npm run build`| Production build         |
| `npm run start`| Start production server  |
| `npm run lint` | Run ESLint               |
| `npm run typecheck` | TypeScript check    |

## Architecture notes

- **Route groups** `(auth)` and `(dashboard)` separate layouts without affecting URLs.
- **Services** encapsulate API calls; pages and server components consume services instead of raw `fetch`.
- **Types** live in a single module for domain models shared across layers.
- **Components** are split by responsibility: `ui` (primitives), `layout` (shell), `shared` (composites).
