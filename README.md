# Stock AI 📈

Stock AI is an AI-powered financial assistant that helps you research stocks, analyze financial statements, and stay updated with market news through a conversational interface. Ask questions in natural language and get real-time data, interactive charts, and generated financial tables.

> **Disclaimer**: This project is for **educational and research purposes only**. It is not intended for real trading or investment advice.

## ✨ Features

- **Natural-language stock research** — Ask about prices, fundamentals, and news in plain English
- **Real-time & historical prices** — Live quotes and interactive price charts (daily OHLCV)
- **Financial statements** — Income statements, balance sheets, and cash flow statements rendered as tables
- **Financial metrics** — P/E ratio, margins, ROE/ROA, valuation and liquidity ratios
- **Market news** — Latest financial news articles
- **Generative UI** — Responses stream as interactive charts and tables, not just text
- **Task visualization** — See the AI's reasoning steps as it breaks down and researches your query
- **Chat history** — Persistent conversations stored in a PostgreSQL database
- **Automatic authentication** — Seamless fingerprint-based auto-login (no signup required)
- **Multiple models** — GPT-4o, GPT-4.1, GPT-4.1 mini, and GPT-4.1 nano
- **Solarized Dark theme** — VS Code-inspired Solarized Dark/Light color scheme with dark mode

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 15](https://nextjs.org) (App Router) |
| **Language** | TypeScript |
| **AI** | [Vercel AI SDK](https://sdk.vercel.ai) (`ai` v4) + OpenAI models |
| **Financial data** | [Financial Modeling Prep (FMP)](https://financialmodelingprep.com) API |
| **Database** | [Supabase](https://supabase.com) PostgreSQL via [Drizzle ORM](https://orm.drizzle.team) |
| **Auth** | [NextAuth.js](https://next-auth.js.org) (credentials + fingerprint auto-login) |
| **UI** | [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS](https://tailwindcss.com) + [Radix UI](https://www.radix-ui.com) |
| **Charts** | [Recharts](https://recharts.org) |
| **Code editor** | [CodeMirror](https://codemirror.net) + [ProseMirror](https://prosemirror.net) |
| **Storage** | [Vercel Blob](https://vercel.com/storage/blob) |
| **Observability** | OpenTelemetry + LangSmith (optional) |
| **Package manager** | pnpm |

## 📁 Project Structure

```
app/                 # Next.js App Router pages & API routes
  (auth)/            # Authentication (NextAuth config, login/register)
  (chat)/            # Chat interface & /api/chat endpoint
  api/               # Auto-login and other API routes
components/          # React components (chat, tables, charts, UI)
  ui/                # shadcn/ui primitives
lib/
  ai/                # AI models, prompts, middleware, tools
    tools/           # Financial tools (prices, statements, metrics, news)
  api/               # FMP data adapter
  db/                # Drizzle schema, queries, migrations
hooks/               # React hooks
public/              # Static assets (fonts, images)
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- [pnpm](https://pnpm.io)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy the example env file and fill in your keys:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `OPENAI_API_KEY` | AI model access | https://platform.openai.com/api-keys |
| `FMP_API_KEY` | Financial market data (free tier) | https://site.financialmodelingprep.com/developer/docs |
| `AUTH_SECRET` | Session signing secret | `openssl rand -base64 32` |
| `POSTGRES_URL` | PostgreSQL connection string | Supabase (or any Postgres provider) |

Optional variables:

| Variable | Purpose |
|----------|---------|
| `LANGCHAIN_API_KEY` / `LANGCHAIN_TRACING_V2` / `LANGCHAIN_PROJECT` | LangSmith tracing |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage for document/block feature |

> ⚠️ Never commit `.env` or `.env.local` files — they contain secrets.

### 3. Run the database migrations

```bash
pnpm db:migrate
```

### 4. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## 🔌 Financial Data (FMP)

Stock AI uses the **Financial Modeling Prep (FMP)** API on its **free tier** (250 requests/day).

**Available on the free tier:**
- Real-time quotes and historical daily prices
- Income statements, balance sheets, and cash flow statements (annual/quarterly)
- Financial ratios and key metrics (TTM and periodic)
- General market news (FMP Articles)

**Not available on the free tier** (paid endpoints):
- Ticker-specific news
- Stock screener (the app gracefully reports screening as unavailable)

The FMP adapter lives in [`lib/api/fmp.ts`](lib/api/fmp.ts) and maps FMP responses into the shapes consumed by the UI components.

## 🗄 Database Schema

| Table | Purpose |
|-------|---------|
| `User` | Registered/auto-generated users |
| `Chat` | Conversation metadata |
| `Message` | Chat messages |
| `Vote` | Message up/down votes |
| `Document` | Generated documents (block editor) |
| `Suggestion` | Suggested follow-up messages |

## 🔐 Authentication

The app uses automatic **fingerprint-based authentication**: on first visit, a fingerprint cookie is set and a user is auto-created in the database — no signup or password required. Traditional email/password login and registration are also supported via NextAuth credentials.

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Run migrations + production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Lint with Next.js + Biome |
| `pnpm format` | Format with Biome |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:push` | Push schema to database |

## ☁️ Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add the environment variables (`OPENAI_API_KEY`, `FMP_API_KEY`, `AUTH_SECRET`, `POSTGRES_URL`).
4. Deploy — the build runs database migrations automatically.

The project is currently deployed at https://stock-ai-github.vercel.app/

## 📄 License

Licensed under the [MIT License](LICENSE).

---

Built with the [Vercel AI SDK](https://sdk.vercel.ai) and [shadcn/ui](https://ui.shadcn.com).
