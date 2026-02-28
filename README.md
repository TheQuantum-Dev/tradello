# Tradello

**An institutional-grade trading journal built for serious traders.**

Tradello is an open-source trading performance platform that gives you full ownership of your data, deep analytics, and a structured way to review and improve your trading — without subscriptions, paywalls, or your data living on someone else's server.

---

## Why Tradello

Most trading journals are either too simple to be useful or locked behind expensive subscriptions. Tradello is built differently.

- **Your data stays yours.** Everything runs locally on your machine using SQLite. No cloud, no accounts, no tracking.
- **Built for serious traders.** Multi-account support, equity curve tracking, tag-based behavioral analytics, and a daily journal — not just a trade log.
- **Open source.** The entire codebase is available, auditable, and open to contribution.

---

## Features

**Trade Management**
- Import trades directly from Fidelity CSV exports
- Automatic parsing of options, stocks, and futures
- Multi-account support — track multiple brokers separately
- Full trade journal with notes, tags, screenshots, entry/exit times, and R:R ratio

**Analytics**
- Real equity curve starting from your actual account balance
- Win rate, profit factor, average win/loss, drawdown
- P&L breakdown by symbol and tag
- Best and worst trade tracking

**Journal**
- Daily grouped trade review
- Search and filter by symbol, tag, win/loss status, or notes
- Per-day P&L, win/loss count, and daily stats strip

**Calendar**
- Monthly P&L calendar view
- Click any day to see all trades with full detail

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | SQLite via Prisma 5 |
| Styling | CSS Variables + Inline styles |
| Charts | Recharts |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/TheQuantum-Dev/tradello.git
cd tradello

# Install dependencies
npm install

# Set up the database
cp .env.example .env
npx prisma migrate dev

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Steps

1. Go to **Accounts** and create your first trading account with your starting balance
2. Go to **Import Trades** and upload your Fidelity CSV export
3. Your trades will be linked to your account and visible across Dashboard, Journal, Analytics, and Calendar

---

## Importing Trades

Currently supported brokers via CSV:

- **Fidelity** — fully supported

More brokers are on the roadmap. If you want to add support for your broker, see [CONTRIBUTING.md](./CONTRIBUTING.md).

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
│   ├── lib/              # Types, Prisma client, CSV parsers
│   └── pages/            # Page-level components
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration history
└── public/
    └── uploads/          # Local screenshot storage (gitignored)
```

---

## Roadmap

- [ ] Manual trade entry (no CSV required)
- [ ] Additional broker CSV support (TD Ameritrade, IBKR, Tastytrade)
- [ ] Dashboard filtering by symbol, tag, and date range
- [ ] Weekly and yearly calendar views
- [ ] Sharpe ratio, Sortino ratio, and drawdown duration
- [ ] Trade replay and MAE/MFE analysis
- [ ] Dark/light theme toggle
- [ ] Export journal as PDF
- [ ] Hosted version (optional, for non-technical users)

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

---

## License

Tradello is open source under the [MIT License](./LICENSE).

A hosted version may be offered in the future for users who prefer not to self-host. The core software will always remain open source.

---

## Author

Built by [TheQuantum-Dev](https://github.com/TheQuantum-Dev)

> *Built for traders who take their craft seriously.*
