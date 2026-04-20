# CareAI – Medical Intelligence Assistant (India-focused)

Hackathon-ready MVP with:
- Next.js 14 (App Router) + Tailwind frontend
- Node.js + Express backend
- Groq chat completions for diagnosis after 3 questions
- Pre-AI triage short-circuit for emergencies
- Simple in-memory session state (no DB complexity)

## Folder structure

```
careai/
├── backend/
│   ├── server.js
│   ├── routes/chat.js
│   ├── utils/triage.js
│   ├── utils/groq.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── app/layout.js
│   ├── app/page.js
│   ├── components/ChatBox.js
│   ├── components/MessageBubble.js
│   ├── components/EmergencyAlert.js
│   ├── lib/api.js
│   ├── styles/globals.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

## Setup

### 1) Backend install

```bash
cd backend
npm install
```

### 2) Backend run

Create `.env` from `.env.example`:

```bash
copy .env.example .env
```

Add your key in `.env`:

```bash
GROQ_API_KEY=your_key_here
```

Important: use a real Groq key (it typically starts with `gsk_...`). If you use an `xai-...` key, that's for a different provider and Groq will return `invalid_api_key`.

Run:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

### 3) Frontend install

In a new terminal:

```bash
cd frontend
npm install
```

### 4) Frontend run

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`.

## One-link usage (recommended)

Open only: `http://localhost:3000`

The frontend proxies API calls to the backend using a Next.js rewrite (`frontend/next.config.js`), so you don't need to use the backend URL directly.

## Quick test

- Send: `I have stomach pain`
  - You should get Q1 (duration), then Q2 (intensity), then Q3 (context), then a diagnosis response.
- Send: `I have chest pain`
  - You should instantly get `🚨 Call 108 immediately` with severity `Severe` and the red emergency UI banner.

