# Tradello

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/tradello-logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="public/tradello-logo-light.svg">
  <img alt="Tradello" src="public/tradello-logo-light.svg" width="240" />
</picture>

<br /><br />

![Version](https://img.shields.io/badge/version-1.3.0-00e57a?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)
![Open Source](https://img.shields.io/badge/open--source-yes-00e57a?style=flat-square)

**An institutional-grade trading journal built for serious traders.**

[Features](#features) · [Getting Started](#getting-started) · [Roadmap](#roadmap) · [Contributing](#contributing)

</div>

---

## Why Tradello

Most trading journals are either too simple to be useful or locked behind expensive subscriptions. Tradello is built differently.

- **Your data stays yours.** Everything runs locally on your machine using SQLite. No cloud, no accounts, no tracking.
- **Built for serious traders.** Multi-account support, real equity curve tracking, tag-based behavioral analytics, and a structured daily journal — not just a trade log.
- **Open source.** The entire codebase is available, auditable, and open to contribution.

---

## Features

**Trade Management**
- Import trades directly from Fidelity CSV exports
- Manual trade entry with live P&L preview and auto symbol detection
- Multi-account support — track multiple brokers separately with account-scoped data
- Full trade journal with notes, tags, screenshots, entry/exit times, and R:R ratio

**Dashboard**
- Real-time filtering by symbol, status, tag, and date range
- Stat cards that update dynamically based on active filters
- Full trade history table with click-to-review

**Analytics**
- Real equity curve starting from your actual account balance
- Win rate, profit factor, average win/loss
- P&L breakdown by symbol and tag
- Best and worst trade tracking

**Journal**
- Daily grouped trade review
- Search and filter by symbol, tag, win/loss status, or notes
- Per-day P&L, win/loss count, and daily stats strip

**Calendar**
- Monthly P&L calendar view
- Click any day to see all trades with full detail

**Export**
- Advanced report builder with filter-based export
- Filter by date range, ticker, tags, and trade status
- Choose which sections to include — cover page, stats, daily breakdown, trade history, journal entries
- Live preview before export
- Generates a full PDF report entirely client-side — your data never leaves your machine

**Settings**
- Accent color themes — green, blue, purple, orange, pink
- Trading preferences — default multiplier, commission, fees
- Version checker with live update detection
- Data management — export CSV, clear trades

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Database | SQLite via Prisma 5 |
| Charts | Recharts |
| PDF | @react-pdf/renderer |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/TheQuantum-Dev/tradello.git
cd tradello
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Steps

1. Go to **Accounts** and create your first trading account with your starting balance
2. Go to **Import Trades** and upload your Fidelity CSV export — or use **Add Trade** to enter manually
3. Your trades will be linked to your account and visible across Dashboard, Journal, Analytics, and Calendar

---

## Importing Trades

Currently supported brokers via CSV:

| Broker | Status |
|--------|--------|
| Fidelity | ✅ Supported |
| TD Ameritrade | 🔜 Coming soon |
| Tastytrade | 🔜 Coming soon |
| Interactive Brokers | 🔜 Coming soon |

### How to export from Fidelity

1. Log into Fidelity and go to **Activity & Orders**
2. Select your date range
3. Click **Download** and choose CSV
4. Upload the file in Tradello under **Import Trades**

---

## Project Structure

```
tradello/
├── app/
│   ├── api/              # API routes (trades, accounts, uploads)
│   ├── components/       # Shared UI components
│   ├── context/          # Global state (AppContext)
│   ├── hooks/            # Custom hooks (useSettings)
│   ├── lib/              # Types, Prisma client, CSV parsers, utilities
│   └── pages/            # Page-level components
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration history
├── public/               # Static assets — logos, icons
├── scripts/
│   └── changelog.js      # Automated changelog generator
└── public/
    └── uploads/          # Local screenshot storage (gitignored)
```

---

## Roadmap

**v2.0.0 — In Progress**
- Advanced export page with full report builder
- Logo integration throughout the app and exported PDFs
- Journal entries in PDF export
- Live PDF preview before export

**Upcoming**
- TD Ameritrade, Tastytrade, IBKR CSV import
- Sharpe ratio, Sortino ratio, drawdown duration
- MAE/MFE analysis
- Weekly and yearly calendar views
- GitHub Wiki with setup guides and metric explanations

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for the full release history.

---

## License

Tradello is open source under the [MIT License](./LICENSE).

---

<div align="center">

Built by [TheQuantum-Dev](https://github.com/TheQuantum-Dev)

*Built for traders who take their craft seriously.*

</div>