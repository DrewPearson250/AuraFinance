#!/usr/bin/env python3
"""
AuraFinance Analytics Engine
Provides financial statistics, automated categorization, spending anomaly detection,
portfolio performance, allocation metrics, and benchmark comparisons.
Standard library only (math, statistics, csv, json, re, datetime, urllib.request).
"""

import sys
import json
import re
import math
import statistics
from datetime import datetime
from collections import defaultdict
import urllib.request
import urllib.error

# ---------------------------------------------------------
# Categorization Rules & Heuristics
# ---------------------------------------------------------

CATEGORY_PATTERNS = {
    "Food & Dining": [
        r"starbucks", r"whole foods", r"trader joe", r"kroger", r"safeway", r"aldi",
        r"mcdonald", r"chipotle", r"uber eats", r"doordash", r"grubhub", r"restaurant",
        r"cafe", r"diner", r"coffee", r"bakery", r"bistro", r"pizza", r"taco",
        r"sweetgreen", r"shake shack", r"grocery", r"supermarket", r"pub", r"brewery"
    ],
    "Transportation": [
        r"uber(?! eats)", r"lyft", r"shell", r"chevron", r"bp gas", r"exxon", r"mobil",
        r"subway", r"mta", r"bart", r"transit", r"caltrain", r"metro", r"parking",
        r"toll", r"gas station", r"auto repair", r"oil change", r"valero", r"speedway",
        r"hertz", r"avis", r"zipcar", r"amtrak"
    ],
    "Housing & Utilities": [
        r"rent", r"lease", r"mortgage", r"electric", r"coned", r"pge", r"water bill",
        r"sewer", r"gas company", r"national grid", r"internet", r"comcast", r"verizon",
        r"at&t", r"xfinity", r"spectrum", r"trash", r"hoa", r"home depot", r"lowe'?s"
    ],
    "Education": [
        r"coursera", r"udemy", r"edx", r"university", r"college", r"tuition", r"textbook",
        r"chegg", r"datacamp", r"codecademy", r"masterclass", r"books", r"barnes & noble",
        r"audible", r"skillshare", r"duolingo", r"school"
    ],
    "Entertainment & Subs": [
        r"netflix", r"spotify", r"hulu", r"disney", r"apple\.com/bill", r"playstation",
        r"xbox", r"steam", r"nintendo", r"cinema", r"amc", r"regal", r"ticketmaster",
        r"concert", r"patreon", r"youtube", r"hbo", r"paramount", r"prime video"
    ],
    "Shopping & Retail": [
        r"amazon(?! prime video)", r"target", r"walmart", r"costco", r"best buy",
        r"apple store", r"zara", r"nike", r"nordstrom", r"ikea", r"ebay", r"etsy",
        r"unison", r"uniqlo", r"sephora", r"clothing", r"department store"
    ],
    "Health & Wellness": [
        r"pharmacy", r"cvs", r"walgreens", r"doctor", r"dental", r"dentist", r"clinic",
        r"hospital", r"gym", r"fitness", r"equinox", r"peloton", r"optometry", r"health",
        r"urgent care", r"labcorp", r"quest diagnostics", r"therapy"
    ],
    "Travel": [
        r"delta", r"united airlines", r"american airlines", r"southwest", r"airbnb",
        r"hotel", r"marriott", r"hilton", r"hyatt", r"expedia", r"booking\.com",
        r"flight", r"hostel", r"tsa precheck"
    ],
    "Income & Salary": [
        r"payroll", r"direct dep", r"salary", r"dividend", r"interest paid", r"bonus",
        r"venmo cashout", r"employer", r"stipend", r"tax refund"
    ],
    "Financial & Transfers": [
        r"transfer", r"vanguard", r"fidelity", r"charles schwab", r"robinhood",
        r"coinbase", r"atm withdrawal", r"payment received", r"credit card payment",
        r"wire transfer", r"deposit"
    ]
}

def auto_categorize(description: str, amount: float) -> tuple[str, float]:
    """Returns (category, confidence 0.0 - 1.0)"""
    desc_lower = description.lower()
    
    # If positive amount and contains income markers
    if amount > 0:
        for pattern in CATEGORY_PATTERNS["Income & Salary"]:
            if re.search(pattern, desc_lower):
                return "Income & Salary", 0.95
        if re.search(r"payroll|salary|direct dep", desc_lower):
            return "Income & Salary", 0.98

    # Match expense categories
    for cat, patterns in CATEGORY_PATTERNS.items():
        if cat == "Income & Salary" and amount < 0:
            continue
        for p in patterns:
            if re.search(r"\b" + p + r"\b", desc_lower) or re.search(p, desc_lower):
                return cat, 0.90
                
    # Fallback heuristics
    if amount > 0:
        return "Income & Salary", 0.60
    return "Other / Miscellaneous", 0.40

# ---------------------------------------------------------
# Anomaly Detection
# ---------------------------------------------------------

def detect_anomalies(transactions: list[dict]) -> list[dict]:
    """
    Identifies abnormal spending events using:
    1. Z-Score outlier detection relative to category historical baseline.
    2. Large single-transaction threshold relative to category median.
    3. Rapid repetition/duplicate transaction velocity flags.
    """
    anomalies = []
    
    # Group expense transactions by category
    cat_expenses = defaultdict(list)
    for t in transactions:
        amt = abs(float(t.get("amount", 0)))
        cat = t.get("category", "Other / Miscellaneous")
        # Exclude income/transfers from expense anomaly checks
        if cat not in ["Income & Salary", "Financial & Transfers"] and amt > 0:
            cat_expenses[cat].append((amt, t))

    # Analyze each category distribution
    for cat, items in cat_expenses.items():
        if len(items) < 2:
            continue
        
        amounts = [x[0] for x in items]
        mean_val = statistics.mean(amounts)
        std_val = statistics.stdev(amounts) if len(amounts) > 2 else mean_val * 0.5
        median_val = statistics.median(amounts)
        
        for amt, tx in items:
            z_score = (amt - mean_val) / (std_val if std_val > 0 else 1.0)
            ratio_to_median = amt / median_val if median_val > 0 else 1.0
            
            # Condition 1: Severe statistical outlier (Z >= 2.2 and ratio >= 2.5)
            if z_score >= 2.2 and ratio_to_median >= 2.2 and amt > 150:
                anomalies.append({
                    "id": tx.get("id", ""),
                    "date": tx.get("date", ""),
                    "description": tx.get("description", ""),
                    "category": cat,
                    "amount": amt,
                    "severity": "critical" if z_score >= 3.0 or ratio_to_median >= 3.5 else "warning",
                    "reason": f"Spending is {ratio_to_median:.1f}x higher than the {cat} median (${median_val:,.2f})",
                    "zScore": round(z_score, 2),
                    "baselineMedian": round(median_val, 2),
                    "baselineMean": round(mean_val, 2)
                })
            # Condition 2: Moderate spike on prominent categories
            elif amt > 500 and ratio_to_median >= 3.0:
                anomalies.append({
                    "id": tx.get("id", ""),
                    "date": tx.get("date", ""),
                    "description": tx.get("description", ""),
                    "category": cat,
                    "amount": amt,
                    "severity": "warning",
                    "reason": f"Unusually large transaction (${amt:,.2f}) for category baseline",
                    "zScore": round(z_score, 2),
                    "baselineMedian": round(median_val, 2),
                    "baselineMean": round(mean_val, 2)
                })

    # Velocity / Duplicate check: Same merchant and same amount within 24 hours
    sorted_tx = sorted(transactions, key=lambda x: str(x.get("date", "")))
    for i in range(len(sorted_tx) - 1):
        t1 = sorted_tx[i]
        t2 = sorted_tx[i+1]
        if (t1.get("date") == t2.get("date") and
            abs(float(t1.get("amount", 0))) == abs(float(t2.get("amount", 0))) and
            t1.get("description", "").strip().lower() == t2.get("description", "").strip().lower() and
            abs(float(t1.get("amount", 0))) > 25):
            anomalies.append({
                "id": t2.get("id", ""),
                "date": t2.get("date", ""),
                "description": t2.get("description", ""),
                "category": t2.get("category", "General"),
                "amount": abs(float(t2.get("amount", 0))),
                "severity": "notice",
                "reason": "Possible duplicate charge detected on the same date",
                "zScore": 0.0,
                "baselineMedian": abs(float(t1.get("amount", 0))),
                "baselineMean": abs(float(t1.get("amount", 0)))
            })

    # Sort by date descending
    anomalies.sort(key=lambda x: str(x["date"]), reverse=True)
    return anomalies

# ---------------------------------------------------------
# Portfolio & Investment Analytics
# ---------------------------------------------------------

def calculate_portfolio(investments: list[dict], benchmark_return_pct: float = 14.8) -> dict:
    """
    Computes portfolio performance, asset allocation, sector weights,
    returns, and benchmark comparison (Alpha, Sharpe ratio proxy).
    """
    total_cost_basis = 0.0
    total_current_value = 0.0
    total_unrealized_gain = 0.0
    
    asset_allocation = defaultdict(float)
    sector_allocation = defaultdict(float)
    positions_detail = []

    for inv in investments:
        shares = float(inv.get("shares", 0))
        buy_price = float(inv.get("buyPrice", 0))
        curr_price = float(inv.get("currentPrice", buy_price))
        asset_class = inv.get("assetClass", "Stocks")
        sector = inv.get("sector", "Broad Market")
        ticker = inv.get("ticker", "").upper()
        
        cost_basis = shares * buy_price
        curr_val = shares * curr_price
        gain_loss = curr_val - cost_basis
        gain_loss_pct = ((curr_val - cost_basis) / cost_basis * 100) if cost_basis > 0 else 0.0

        total_cost_basis += cost_basis
        total_current_value += curr_val
        total_unrealized_gain += gain_loss
        
        asset_allocation[asset_class] += curr_val
        sector_allocation[sector] += curr_val

        positions_detail.append({
            "ticker": ticker,
            "name": inv.get("name", ticker),
            "assetClass": asset_class,
            "sector": sector,
            "shares": shares,
            "buyPrice": round(buy_price, 2),
            "currentPrice": round(curr_price, 2),
            "costBasis": round(cost_basis, 2),
            "currentValue": round(curr_val, 2),
            "gainLoss": round(gain_loss, 2),
            "gainLossPct": round(gain_loss_pct, 2),
            "dayChangePct": float(inv.get("dayChangePct", 0.0))
        })

    total_return_pct = ((total_current_value - total_cost_basis) / total_cost_basis * 100) if total_cost_basis > 0 else 0.0
    
    # Calculate allocation percentages and Herfindahl index (diversification metric)
    hhi = 0.0
    for pos in positions_detail:
        weight = (pos["currentValue"] / total_current_value) if total_current_value > 0 else 0
        pos["weightPct"] = round(weight * 100, 2)
        hhi += (weight * 100) ** 2

    # Benchmark comparison (Alpha = Portfolio Return - Benchmark Return)
    alpha = total_return_pct - benchmark_return_pct

    # Asset Allocation list for charting
    asset_alloc_list = [
        {"name": k, "value": round(v, 2), "percentage": round((v / total_current_value * 100) if total_current_value > 0 else 0, 1)}
        for k, v in sorted(asset_allocation.items(), key=lambda x: x[1], reverse=True)
    ]

    # Sector Allocation list
    sector_alloc_list = [
        {"name": k, "value": round(v, 2), "percentage": round((v / total_current_value * 100) if total_current_value > 0 else 0, 1)}
        for k, v in sorted(sector_allocation.items(), key=lambda x: x[1], reverse=True)
    ]

    # Risk metric: annualized volatility estimation and Sharpe Ratio (assuming 4.5% risk-free rate)
    rf_rate = 4.5
    excess_return = total_return_pct - rf_rate
    est_volatility = 16.2  # realistic annualized equity volatility estimate
    sharpe_ratio = round(excess_return / est_volatility, 2) if est_volatility > 0 else 0.0

    return {
        "summary": {
            "totalCostBasis": round(total_cost_basis, 2),
            "totalCurrentValue": round(total_current_value, 2),
            "totalUnrealizedGain": round(total_unrealized_gain, 2),
            "totalReturnPct": round(total_return_pct, 2),
            "benchmarkReturnPct": round(benchmark_return_pct, 2),
            "alpha": round(alpha, 2),
            "outperforming": alpha >= 0,
            "sharpeRatio": sharpe_ratio,
            "diversificationScore": "Well Diversified" if hhi < 2500 else ("Moderate Concentration" if hhi < 4000 else "High Concentration"),
            "herfindahlIndex": round(hhi, 1)
        },
        "assetAllocation": asset_alloc_list,
        "sectorAllocation": sector_alloc_list,
        "positions": positions_detail
    }

# ---------------------------------------------------------
# Cash Flow & Spending Analytics
# ---------------------------------------------------------

def analyze_cash_flow(transactions: list[dict]) -> dict:
    monthly_inflow = defaultdict(float)
    monthly_outflow = defaultdict(float)
    category_totals = defaultdict(float)
    category_counts = defaultdict(int)

    total_income = 0.0
    total_expenses = 0.0

    for t in transactions:
        raw_amt = float(t.get("amount", 0))
        cat = t.get("category", "Other / Miscellaneous")
        date_str = str(t.get("date", ""))
        month_key = date_str[:7] if len(date_str) >= 7 else "Unknown"

        if cat == "Income & Salary" or raw_amt > 0:
            amt = abs(raw_amt)
            monthly_inflow[month_key] += amt
            total_income += amt
        else:
            amt = abs(raw_amt)
            monthly_outflow[month_key] += amt
            total_expenses += amt
            category_totals[cat] += amt
            category_counts[cat] += 1

    # Monthly savings trends
    months = sorted(list(set(list(monthly_inflow.keys()) + list(monthly_outflow.keys()))))
    monthly_trends = []
    for m in months:
        inflow = round(monthly_inflow[m], 2)
        outflow = round(monthly_outflow[m], 2)
        net_savings = round(inflow - outflow, 2)
        savings_rate = round((net_savings / inflow * 100) if inflow > 0 else 0, 1)
        monthly_trends.append({
            "month": m,
            "income": inflow,
            "expenses": outflow,
            "netSavings": net_savings,
            "savingsRate": savings_rate
        })

    # Category breakdowns sorted descending
    cat_breakdown = []
    for cat, tot in sorted(category_totals.items(), key=lambda x: x[1], reverse=True):
        cat_breakdown.append({
            "category": cat,
            "total": round(tot, 2),
            "percentage": round((tot / total_expenses * 100) if total_expenses > 0 else 0, 1),
            "count": category_counts[cat]
        })

    net_savings_total = total_income - total_expenses
    avg_savings_rate = round((net_savings_total / total_income * 100) if total_income > 0 else 0, 1)

    return {
        "totalIncome": round(total_income, 2),
        "totalExpenses": round(total_expenses, 2),
        "netSavings": round(net_savings_total, 2),
        "savingsRate": avg_savings_rate,
        "monthlyTrends": monthly_trends,
        "categoryBreakdown": cat_breakdown
    }

# ---------------------------------------------------------
# Main CLI / Subprocess Interface
# ---------------------------------------------------------

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--categorize-one":
        desc = sys.argv[2] if len(sys.argv) > 2 else ""
        amt = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
        cat, conf = auto_categorize(desc, amt)
        print(json.dumps({"category": cat, "confidence": conf}))
        return

    # Default: read full payload from stdin
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print(json.dumps({"error": "Empty input"}))
            return
        data = json.loads(raw_input)
    except Exception as e:
        print(json.dumps({"error": f"JSON parse error: {str(e)}"}))
        return

    action = data.get("action", "full_analysis")
    transactions = data.get("transactions", [])
    investments = data.get("investments", [])
    benchmark_pct = float(data.get("benchmarkReturnPct", 14.8))

    # Auto-categorize any transactions missing category or flagged as uncategorized
    for t in transactions:
        if not t.get("category") or t.get("category") in ["Uncategorized", "", "Unknown"]:
            cat, conf = auto_categorize(t.get("description", ""), float(t.get("amount", 0)))
            t["category"] = cat
            t["categoryConfidence"] = conf

    if action == "categorize":
        categorized = []
        for t in transactions:
            cat, conf = auto_categorize(t.get("description", ""), float(t.get("amount", 0)))
            t_copy = dict(t)
            t_copy["category"] = cat
            t_copy["confidence"] = conf
            categorized.append(t_copy)
        print(json.dumps({"transactions": categorized}))
        return

    # Full analysis
    anomalies = detect_anomalies(transactions)
    portfolio_res = calculate_portfolio(investments, benchmark_pct)
    cash_flow_res = analyze_cash_flow(transactions)

    result = {
        "status": "success",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "engine": "Python 3.10 Statistical & Financial Engine",
        "transactionsCount": len(transactions),
        "categorizedTransactions": transactions,
        "anomalies": anomalies,
        "cashFlow": cash_flow_res,
        "portfolio": portfolio_res
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()
