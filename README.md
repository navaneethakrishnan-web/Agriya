# AGRIYA — AI-Based Farmer Query Support & Advisory System

A premium AgriTech platform for Indian farmers: an AI advisor grounded in
verified agricultural sources (RAG), a peer discussion forum with
Agriculture Officer escalation, weather + nearby facility maps, a rewards
economy, government scheme discovery, and an admin dashboard.

Built for **Smart India Hackathon 2025 · SIH25076** by Team Regal Hackers.

---

## Tech stack

- **Frontend:** React 19 + TypeScript, Vite, Tailwind CSS v4, Framer Motion,
  React Router, TanStack Query, React Hook Form, Recharts, Lucide icons,
  React-Leaflet (OpenStreetMap)
- **Backend:** Firebase (Auth, Firestore, Storage, Hosting; Cloud Functions
  sketch included but optional)
- **AI:** Groq API (Llama 3.3 70B) behind a RAG pipeline
- **Weather:** Open-Meteo (free, no API key required)

---

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev
```

### 1. Firebase configuration

Go to [Firebase Console](https://console.firebase.google.com) → your project
→ ⚙️ **Project settings** → **General** → scroll to **Your apps** → select
the web app (or create one) → copy the `firebaseConfig` values into `.env`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Then in the Firebase console enable:
- **Authentication** → Sign-in method → Email/Password, Google, Phone
- **Firestore Database** → create in production mode
- **Storage** → create default bucket

Deploy the included security rules and indexes:
```bash
npm install -g firebase-tools
firebase login
firebase use --add            # select your project
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 2. Groq API key (the AI brain)

Get a free key at [console.groq.com/keys](https://console.groq.com/keys),
then set:
```
VITE_GROQ_API_KEY=gsk_xxxxxxxx
VITE_GROQ_MODEL=llama-3.3-70b-versatile
```

**Without a key**, the app still runs — `src/services/ai/groqClient.ts` falls
back to a local simulator that answers only from the retrieved knowledge-base
context, so the RAG pipeline and confidence-scoring UI are fully demoable
out of the box.

⚠️ **Production note:** calling Groq directly from the browser exposes the
key in network requests. Before going live, deploy the sketch in
`functions/src/askAi.ts` as a Cloud Function and call that instead — see the
comments in `groqClient.ts` for the swap.

### 3. Run it

```bash
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
firebase deploy --only hosting   # after `npm run build`
```

---

## RAG architecture

```
User Question
   ↓
retrieveContext()  — src/services/rag/retriever.ts
   ↓ searches KNOWLEDGE_BASE (src/services/rag/knowledgeBase.ts)
   ↓ returns contextText + sources[] + confidence (0–1)
   ↓
askAgriya()  — src/services/ai/chat.ts
   ↓ if confidence < 0.22 → return "I don't have enough verified
     information" WITHOUT calling the model (no hallucination risk)
   ↓ else → build a system prompt containing ONLY the retrieved context
   ↓
askGroq()  — src/services/ai/groqClient.ts
   ↓ sends context + question to Llama 3.3 70B
   ↓
Answer + confidence badge + source citations shown in chat UI
```

`KNOWLEDGE_BASE` currently holds 10 real, hand-written agricultural
reference documents (PMFBY, soil health, rice blast, wheat rust, KCC, etc.)
so the assistant has something genuine to ground itself in immediately.

**To go from demo → production RAG:**
1. Replace `keywordRetrieve()` (simple keyword + token-overlap scoring) with
   a real embeddings call (OpenAI/Cohere/local model) + a vector index
   (Firestore Vector Search, Pinecone, or Weaviate).
2. Build an Admin → Knowledge Base upload flow that chunks PDFs, embeds
   them, and writes to that index (the `documents` and `knowledge_base`
   Firestore collections and Storage `knowledge-base/` path are already
   modeled for this).
3. Keep `retrieveContext()`'s return shape (`contextText`, `sources`,
   `confidence`) the same so nothing downstream needs to change.

---

## Firestore schema

| Collection          | Purpose                                            |
|----------------------|-----------------------------------------------------|
| `users`              | Farmer/Officer/Admin profiles, roles, reward points |
| `questions` / `answers` | Legacy structured Q&A (reserved for future use)  |
| `community_posts`    | Forum posts                                        |
| `comments`           | Forum replies (linked via `postId`)                |
| `rewards`            | Points ledger (one doc per award transaction)      |
| `officers`           | Agriculture Officer directory                      |
| `weather_cache`      | Optional server-side weather cache                 |
| `government_schemes` | Scheme catalogue (seeded client-side for demo)     |
| `notifications`      | Push/in-app notification records                   |
| `chat_history`       | Per-user AI chat threads                           |
| `knowledge_base`     | RAG source document metadata                       |
| `documents`          | Uploaded PDFs pending embedding                    |
| `reports`            | Fake-info / abuse reports                          |

Security rules live in `firestore.rules` (role-based access via a `role`
field on `users`) and `storage.rules`.

---

## What's fully implemented vs. what's scaffolded

**Fully working:**
- Email/password + Google authentication, Firestore profile creation
- RAG chatbot with confidence gating, voice input/output, image/PDF
  attach UI, chat history persistence, markdown rendering, like/retry/share
- Community forum: post, reply, upvote/downvote, accepted answers,
  48-hour-unresolved escalation banner
- Live weather (Open-Meteo) + 7-day forecast chart + farming advisory text
- Nearby facilities map (Leaflet/OpenStreetMap) — placeholder facility data
  positioned relative to the user's real coordinates
- Government schemes search/filter/bookmark
- Rewards: points, badges, leaderboard, redeemable catalogue
- Admin dashboard: live user/post counts, user role management, popular
  crop/issue charts (charts use illustrative data — see below), knowledge
  base document list
- Dark mode, large-text accessibility toggle, fully responsive layout,
  route-level lazy loading

**Scaffolded / clearly marked placeholders (need real infra to complete):**
- **Phone OTP** — wired to Firebase Auth's `signInWithPhoneNumber`; requires
  Phone provider enabled + billing in the Firebase console to actually send
  SMS.
- **SMS delivery of weather/subsidy alerts** — needs an SMS gateway (e.g.
  Twilio, MSG91) called from a Cloud Function; not included.
- **Push notifications** — needs Firebase Cloud Messaging setup
  (service worker + VAPID key); the `notifications` Firestore collection
  and UI badge exist, the FCM wiring doesn't.
- **Expert escalation automation** — the UI correctly *shows* escalation
  after 48 hours with no replies; a real deployment should add a scheduled
  Cloud Function that also emails/calls the assigned Officer.
- **Real vector search / embeddings** — see the RAG section above.
- **Admin analytics** (DAU trend, popular crops/issues) — illustrative
  sample data in `src/services/admin.ts`; user/post counts are live.
- **Full PWA** — manifest included; add `vite-plugin-pwa` for an offline
  service worker if true offline support is required.

---

## Project structure

```
src/
  components/   ui/, layout/, chat/  — reusable presentational components
  context/      AuthContext, ThemeContext
  data/         schemes.ts, nearby.ts — static/mock reference datasets
  hooks/        useSpeech.ts — Web Speech API wrappers
  pages/        one file per route, admin/ for the admin dashboard
  services/
    firebase/   config, auth, collections
    rag/        knowledgeBase.ts, retriever.ts
    ai/         groqClient.ts, chat.ts
    forum.ts, rewards.ts, weather.ts, chatHistory.ts, admin.ts
  types/        shared TypeScript interfaces
functions/       optional Cloud Function sketch (askAi.ts) for a
                 server-side Groq proxy
```

---

## Links

- Research reference: AgriLLM (arXiv:2407.04724)
- Team: Regal Hackers · Team ID 80516
