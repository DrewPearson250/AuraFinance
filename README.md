# AuraWish — Personal Finance, Portfolio & Stock Wishlist Analytics

[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

**AuraWish** is a modern personal finance and investment analytics platform. It automatically categorizes spending habits from bank CSV files, flags statistical spending anomalies using $Z$-score algorithms, tracks investment portfolio returns against market benchmarks (S&P 500, Nasdaq 100), and monitors target stock acquisition prices via an interactive **Stock Wishlist**.

---

## 📸 Key Features

### 1. Automated Expense Categorization & Cash Flow Trends
* **Smart Rule & Heuristic Categorizer:** Automatically parses and categorizes raw bank statements across 10 core financial categories (*Food & Dining, Transportation, Housing & Utilities, Education, Shopping & Retail, Health & Wellness, Entertainment, Travel, Income, Transfers*).
* **Confidence Scoring & Inline Overrides:** Displays pattern confidence tags on categorized transactions and allows instant inline category reassignments.
* **Cash Flow Visualizer:** Responsive SVG charts showing monthly inflows, outflows, and net savings rate curves with crosshair hover tooltips.

### 2. Statistical Spending Anomaly Detection ($Z$-Score & Velocity)
* **Outlier Detection Algorithm:** Computes category rolling medians and standard deviations ($Z \ge 2.0$) to flag uncharacteristic spending spikes (e.g., surprise $850 transmission repair vs. $54 automotive baseline).
* **Velocity & Duplicate Charge Filter:** Identifies rapid repeated charges on the same day from identical payees.
* **Actionable Alert Review:** Detailed severity indicators (*Critical Spike, Outlier Warning, Velocity Duplicate*) with persistent dismissal and restore functionality.

### 3. Investment Portfolio Analytics & Market Benchmarks
* **Holdings Ledger:** Real-time computation of total cost basis, current market value, unrealized gain/loss ($ and %), day's change, and portfolio weights.
* **Benchmark Outperformance (Alpha):** Evaluates excess return against primary index funds including the **S&P 500 (`SPY`)**, **Nasdaq 100 (`QQQ`)**, and **Dow Jones (`DIA`)**.
* **Risk & Diversification Metrics:** Calculates portfolio Sharpe ratio proxy and Herfindahl-Hirschman Index (HHI) concentration scores.
* **Allocation Distribution:** Interactive segmented meters breaking down asset classes (*Stocks, ETFs, Crypto, Bonds*) and sector exposures (*Semiconductors, Software, Fixed Income, Consumer Tech*).

### 4. Stock Wishlist & Target "Buy Zone" Tracker
* **Target Dip Price Monitoring:** Track watchlist candidates (e.g., `TSLA`, `AMZN`, `PLTR`, `AMD`, `ETH`) with customizable target buy prices and investment theses.
* **"In Buy Zone" Alerts:** Automatically highlights assets whose current market price has pulled back to or below your target entry price.
* **1-Click Portfolio Promotion:** Click the shopping bag button on any wishlist item to purchase shares at the current quote and seamlessly transfer it into your active portfolio holdings.
* **Live Batch Quote Refresh:** Update all watchlist ticker quotes and daily percentages simultaneously with a single click.

### 5. Real-Time Financial Market Integration
* **Live Ticker Quote Lookup:** Query real-time prices, daily change percentages, 52-week highs/lows, and market caps for 60+ major equities.
* **Zero-Fail Fallback Engine:** Resilient multi-tier architecture ensures quote searches and sparkline histories respond instantaneously.

### 6. CSV Data Ingestion & Export Engine
* **Flexible Column Auto-Mapping:** Ingests bank and brokerage CSV exports with auto-detection for dates, payees, debits/credits, amounts, shares, and tickers.
* **Sample Templates:** Pre-loaded with realistic multi-month sample transactions and investment positions for immediate testing.
* **1-Click Export:** Download filtered transactions, holdings, or wishlist data as clean CSV files.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19 (Hooks, Functional Components, Context) |
| **Language** | TypeScript (Strict Typing, Interfaces, Generic Types) |
| **Styling** | Tailwind CSS v4 (`@import "tailwindcss";`) |
| **Build & Tooling** | Vite 8, ESBuild |
| **Icons & Visuals** | Lucide React |
| **Persistence** | LocalStorage with schema versioning |
| **Backend & APIs** | Express / Node.js, Financial Market Quote Services |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended)
* **npm** or **bun** / **yarn**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/aurawish-finance.git
   cd aurawish-finance
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:3000` to view the dashboard.

---

## 📁 Project Structure

```
├── index.html                   # HTML entry point with metadata & typography
├── package.json                 # Project dependencies & build scripts
├── vite.config.ts               # Vite configuration with Tailwind CSS plugin
├── tsconfig.json                # TypeScript compiler configuration
├── src/
│   ├── main.tsx                 # React application mounting point
│   ├── App.tsx                  # Core state orchestrator, tab router & modals
│   ├── index.css                # Tailwind CSS v4 & typography layer
│   ├── types/
│   │   └── finance.ts           # Type definitions (Transaction, Investment, WishlistItem)
│   ├── data/
│   │   └── sampleFinancialData.ts # Multi-month realistic financial fixtures & CSVs
│   ├── services/
│   │   └── marketData.ts        # Live market quote service & equity data registry
│   ├── utils/
│   │   ├── clientAnalytics.ts   # Cash flow, portfolio math & Z-score algorithms
│   │   └── csvParser.ts         # Smart CSV parser, column detector & exporter
│   └── components/
│       ├── Header.tsx           # Navigation bar with inline customizable title
│       ├── MetricCards.tsx       # Executive financial KPI summary cards
│       ├── TransactionsTable.tsx # Ledger with search, filters & inline category edit
│       ├── PortfolioView.tsx    # Holdings table, benchmark selector & live API lookup
│       ├── StockWishlistView.tsx# Target buy tracker, Buy Zone badges & promote dialog
│       ├── AnomaliesView.tsx    # Z-score outlier inspector with dismiss/restore
│       ├── charts/
│       │   ├── CashFlowChart.tsx   # Interactive SVG monthly income vs outflow curve
│       │   ├── BenchmarkChart.tsx  # Normalized performance index vs SPY & QQQ
│       │   └── AllocationChart.tsx # Segmented asset class & sector exposure meter
│       └── modals/
│           ├── ImportModal.tsx        # CSV upload, raw paste & template preview
│           ├── AddTransactionModal.tsx # Manual transaction entry with auto-predict
│           ├── AddInvestmentModal.tsx  # Holding entry with price lookup
│           └── AddWishlistModal.tsx    # Stock wishlist target entry modal
```

---

## 📊 Sample CSV Data Format

You can import transactions or investment holdings directly using standard CSV formats:

### Transactions CSV Format
```csv
Date,Description,Amount,Category
2026-10-01,Tech Corp Direct Deposit Payroll,4850.00,Income & Salary
2026-10-02,Apex Residential Rent Payment,-1950.00,Housing & Utilities
2026-10-03,Whole Foods Market Organic Groceries,-142.30,Food & Dining
2026-10-04,Uber Ride to Downtown Client Site,-38.45,Transportation
2026-10-05,Coursera Quantitative Finance Spec,-399.00,Education
```

### Investments CSV Format
```csv
Ticker,Name,Shares,BuyPrice,CurrentPrice,AssetClass,Sector
VOO,Vanguard S&P 500 ETF,45,440.00,524.80,ETFs,Broad Market
QQQ,Invesco QQQ Trust,32,395.00,492.10,ETFs,Technology
AAPL,Apple Inc.,40,185.00,232.50,Stocks,Consumer Tech
NVDA,NVIDIA Corporation,65,88.50,138.25,Stocks,Semiconductors
```
