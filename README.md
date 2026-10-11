<div align="center">

  <h1>💰 AuraFinance</h1>
  <p><strong>Personal Finance, Investment Portfolio & Stock Wishlist Dashboard</strong></p>

  <p>
    An intelligent, beginner-friendly financial dashboard that tracks your everyday spending, spots unusual charges, analyzes your investment gains against the S&P 500, and alerts you when dream stocks hit your target buy price.
  </p>

  <!-- Live Demo Button -->
  <p>
    <a href="https://aurafinance-personal-financeinvestment.ai.studio" target="_blank" rel="noopener noreferrer">
      <img src="https://img.shields.io/badge/🚀_OPEN_LIVE_WEBSITE-CLICK_HERE_TO_LAUNCH-059669?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Open Live Website" />
    </a>
  </p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/React_19-Modern_SPA-61dafb?logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-Type_Safe-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS_v4-Responsive_UI-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Vite_8-Blazing_Fast-646cff?logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License" />
  </p>

</div>

---

## 🌟 What Can AuraFinance Do for You?

If you find spreadsheets complicated or banking apps cluttered, **AuraFinance** gives you a clean, single-screen view of your entire financial life:

| What you want to do | How AuraFinance helps |
| :--- | :--- |
| **Understand where your money goes** | Automatically sorts bank transactions into categories like *Food & Dining*, *Groceries*, *Rent*, and *Education*. |
| **Catch accidental or surprise charges** | Automatically flags unusual spikes (e.g. surprise $850 car repair) and duplicate coffee charges so you never miss a billing error. |
| **Know if your investments are beating the market** | Compares your portfolio return side-by-side with the **S&P 500** and **Nasdaq 100** with clear graphs. |
| **Wait for stock dips without staring at charts** | Set target buy prices on your **Stock Wishlist** (e.g. "Buy Tesla if it hits $220"). When the price dips, it lights up green in the **Buy Zone**. |
| **Buy with one click** | When a wishlist stock reaches your target price, hit the shopping bag button to purchase shares directly into your portfolio. |

---

## ⚡ Quick 1-Minute Tour

You don't need any special setup or account to get started:

1. **Open the Website:** Click the **[Launch Live Website](https://aurafinance-personal-financeinvestment.ai.studio)** button. It loads pre-filled with realistic sample data so you can explore immediately.
2. **Import Your Own Data (Optional):** Click **Import CSV** in the top bar to upload your own bank or brokerage export, or keep exploring with the pre-loaded data.
3. **Explore the Tabs:**
   * **Overview:** High-level net worth, monthly savings rate, and cash flow curves.
   * **Expenses & Trends:** Interactive ledger with search, category filters, and monthly spending charts.
   * **Portfolio & Benchmarks:** Track your stocks, ETFs, and crypto gains vs. major index funds.
   * **Stock Wishlist:** Monitor candidate stocks and see which ones are in the **Buy Zone**.
   * **Spending Anomalies:** Review flagged outliers and click **Dismiss Flag** once reviewed.

---

## 🔍 Features in Detail

### 📊 1. Automated Expense Categorization & Cash Flow
* **Smart Categorization:** Automatically identifies merchants (e.g., *Trader Joe's*, *Starbucks*, *Uber*, *Coursera*, *Consolidated Edison*) and assigns them to the right budget bucket.
* **Inline Editing:** Reassign any category directly from the table with a dropdown.
* **Visual Cash Flow Chart:** Clean interactive bar charts comparing monthly income against expenses, plus your net monthly savings rate.

### 🚨 2. Spending Anomaly & Duplicate Detection
* **Statistical Outlier Detection:** Uses $Z$-score math ($Z \ge 2.0$) to compare each charge against your normal category spending history.
* **Duplicate Charge Warnings:** Catches repeat charges made on the same date with identical payees and amounts.
* **Working Dismiss & Restore Actions:** Click **Dismiss Flag** to acknowledge an alert and remove it from your counter, or restore it anytime with the **Restore Dismissed** button.

### 📈 3. Portfolio Tracking & Market Benchmarks
* **Live Market Math:** Calculates total cost basis, current market value, and total dollar and percentage gains.
* **Benchmark Outperformance (Alpha):** See if your investments beat the S&P 500 (`SPY`) and Nasdaq 100 (`QQQ`).
* **Diversification & Asset Classes:** View your split across Stocks, ETFs, Bonds, and Crypto, alongside a sector breakdown.

### 🎯 4. Stock Wishlist & "Buy Zone" Dip Tracker
* **Target Price Tracking:** Add companies you'd love to own (like `NVDA`, `TSLA`, `AAPL`, `AMZN`, `PLTR`) and write down your target entry price.
* **"In Buy Zone" Badges:** Highlights assets in bright green whenever the market price is at or below your target price.
* **1-Click Portfolio Transfer:** Seamlessly move a wishlist stock into your active portfolio holdings when executed.
* **Live Batch Quote Refresh:** Update all watchlist stock prices simultaneously with one click.

### 🔄 5. Live Market Price Lookup
* Built-in instant financial market feed covering 60+ major tickers (`AAPL`, `MSFT`, `NVDA`, `TSLA`, `GOOGL`, `AMZN`, `VOO`, `QQQ`, `BTC`, etc.) with daily price changes and 14-day price sparklines.

---

## 💻 Tech Stack

* **Frontend:** React 19, TypeScript
* **Styling:** Tailwind CSS v4, Plus Jakarta Sans & JetBrains Mono typography
* **Icons:** Lucide React
* **Charts:** Interactive custom SVG vector charts (zero third-party bloat)
* **Local Storage:** Automatic browser persistence so your edits, custom holdings, and wishlist items stay saved
* **Build System:** Vite 8

---

## 🚀 Running Locally on Your Machine

If you want to run AuraFinance on your own computer:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (version 18 or higher) installed.

### 1. Clone the project
```bash
git clone https://github.com/your-username/aurafinance.git
cd aurafinance
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the dev server
```bash
npm run dev
```

### 4. View in your browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📑 Sample CSV Formats

Want to import your own spreadsheets? You can format your CSV files simply like this:

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

---

<div align="center">
  <p>Made with ❤️ for smart personal finance & portfolio management.</p>
  <p>
    <a href="https://aurafinance-personal-financeinvestment.ai.studio" target="_blank" rel="noopener noreferrer">
      <strong>▶ Launch the AuraFinance Dashboard in your browser</strong>
    </a>
  </p>
  <p>
    <sub>Direct link: <a href="https://aurafinance-personal-financeinvestment.ai.studio">https://aurafinance-personal-financeinvestment.ai.studio</a></sub>
  </p>
</div>
