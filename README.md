# 🚀 DevCollab — AI-Powered Real-Time Developer Collaboration SaaS

> A unified workspace that combines real-time Kanban task tracking, team synchronization, and an integrated AI engineering copilot to keep software teams aligned and shipping faster.

---

## 🛑 The Problem

Modern software development teams lose significant speed, focus, and momentum due to **tool sprawl and communication gaps**:

1. **Fragmented Workflows & Context Switching**: Developers are forced to constantly juggle between disconnected tools for task tracking, team communication, and code assistance. This causes lost context, scattered information, and out-of-sync project boards.
2. **Stale Data & Delayed Task Updates**: Traditional project management platforms often lack real-time synchronization or require manual page refreshes. When teammates create, move, or edit tasks, others frequently see outdated board states, leading to duplicated effort and miscommunication.
3. **Disjointed Technical Guidance**: When engineers hit roadblocks—whether debugging tricky code, reviewing architecture decisions, or designing data structures—they have to leave their project workflow to query generic external chatbots that have no awareness of their active development context.

**DevCollab solves this** by unifying real-time drag-and-drop Kanban boards, instant live synchronization across clients, and an embedded developer AI assistant directly into a single, cohesive workspace.

---

## 🎯 Who It’s For

DevCollab is designed specifically for:

- **Software Engineering Teams & Agile Squads**: Product teams that need a lightweight, real-time board to manage sprints, track backlogs, and organize releases without heavy enterprise complexity.
- **Startups, Hackathons & Fast-Paced Collaborators**: Remote or co-located teams that require instant workspace creation, live multi-user card updates, and zero-friction collaboration.
- **Pair Programmers & Open Source Contributors**: Developers building features together who need real-time awareness of what teammates are working on and the ability to assign, discuss, and track tasks live.
- **Student & Junior Developers**: Learners who benefit from an integrated, on-demand AI copilot (DevBot) to explain complex errors, suggest optimizations, and guide technical decision-making directly within their project dashboard.

---

## 💻 How to Run It

Follow the steps below to set up and run DevCollab locally on your machine:

### 1. Prerequisites

Make sure you have the following installed on your system:
- **Node.js** (v18.x or later) — [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** / **pnpm**
- **MongoDB** (A local MongoDB instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- **Clerk Account** (Free tier at [clerk.com](https://clerk.com) for authentication)
- **Redis** *(Optional)*: DevCollab features an in-memory fallback for Socket.IO when Redis is not running locally.

---

### 2. Clone the Repository

```bash
git clone https://github.com/SAKTHISANJAY13/DevCollab.git
cd DevCollab
```

---

### 3. Install Dependencies

```bash
npm install
```

---

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Open `.env.local` and configure your credentials:

```ini
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# MongoDB Database URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/devcollab?retryWrites=true&w=majority

# Clerk Authentication (from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Auth Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding

# Real-Time & Caching (Optional for local dev)
REDIS_URL=redis://localhost:6379

# AI Integration Keys (Groq or Gemini)
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=...
```

---

### 5. Start the Development Server

```bash
npm run dev
```

Once started, open your browser and navigate to:
```
http://localhost:3000
```

---

### 6. Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server at `http://localhost:3000` |
| `npm run build` | Compiles the production build |
| `npm run start` | Starts the production server after building |
| `npm run lint` | Runs Next.js ESLint to verify code quality |
| `npm run typecheck` | Validates TypeScript types across the entire project (`tsc --noEmit`) |

---

## 🛠️ Tech Stack Overview

- **Core**: Next.js 15 (App Router), React 19, TypeScript
- **Styling & UI**: Tailwind CSS v4, Radix UI Primitives, Lucide Icons
- **Board Mechanics**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **Real-Time Layer**: Socket.IO, Redis Pub/Sub Broker
- **Database & ODM**: MongoDB, Mongoose
- **Authentication**: Clerk Auth
- **AI Copilot**: Groq (Llama 3.3) / Google Gemini
