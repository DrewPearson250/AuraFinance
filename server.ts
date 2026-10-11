import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Known stock market reference data (with fallback real-market quotes)
const MARKET_FALLBACKS: Record<string, { name: string; price: number; change: number; changePct: number; assetClass: string; sector: string }> = {
  'VOO': { name: 'Vanguard S&P 500 ETF', price: 524.80, change: 3.42, changePct: 0.65, assetClass: 'ETFs', sector: 'Broad Market' },
  'SPY': { name: 'SPDR S&P 500 ETF Trust', price: 576.20, change: 3.85, changePct: 0.67, assetClass: 'ETFs', sector: 'Broad Market' },
  'QQQ': { name: 'Invesco QQQ Trust (Nasdaq 100)', price: 492.10, change: 4.10, changePct: 0.84, assetClass: 'ETFs', sector: 'Technology' },
  'AAPL': { name: 'Apple Inc.', price: 232.50, change: 1.80, changePct: 0.78, assetClass: 'Stocks', sector: 'Consumer Tech' },
  'MSFT': { name: 'Microsoft Corporation', price: 428.15, change: -1.20, changePct: -0.28, assetClass: 'Stocks', sector: 'Software & Cloud' },
  'NVDA': { name: 'NVIDIA Corporation', price: 138.25, change: 2.90, changePct: 2.14, assetClass: 'Stocks', sector: 'Semiconductors' },
  'GOOGL': { name: 'Alphabet Inc.', price: 182.40, change: 0.95, changePct: 0.52, assetClass: 'Stocks', sector: 'Internet Services' },
  'AMZN': { name: 'Amazon.com Inc.', price: 194.80, change: 1.50, changePct: 0.78, assetClass: 'Stocks', sector: 'E-commerce & Cloud' },
  'TSLA': { name: 'Tesla Inc.', price: 248.60, change: -3.40, changePct: -1.35, assetClass: 'Stocks', sector: 'Automotive & Clean Tech' },
  'BND': { name: 'Vanguard Total Bond Market ETF', price: 73.15, change: 0.08, changePct: 0.11, assetClass: 'Bonds', sector: 'Fixed Income' },
  'BTC': { name: 'Bitcoin (USD)', price: 67450.00, change: 1240.00, changePct: 1.87, assetClass: 'Crypto', sector: 'Digital Assets' },
  'ETH': { name: 'Ethereum (USD)', price: 2620.00, change: 48.00, changePct: 1.87, assetClass: 'Crypto', sector: 'Digital Assets' }
};

// Helper: Run python analytics engine
function runPythonEngine(payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'server', 'python_engine.py');
    const pyProcess = spawn('python3', [pythonScript]);

    let stdout = '';
    let stderr = '';

    pyProcess.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    pyProcess.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    pyProcess.on('close', (code) => {
      if (code !== 0 && !stdout) {
        return reject(new Error(`Python process exited with code ${code}: ${stderr}`));
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Failed to parse Python JSON output: ${stdout || stderr}`));
      }
    });

    pyProcess.on('error', (err) => {
      reject(err);
    });

    pyProcess.stdin.write(JSON.stringify(payload));
    pyProcess.stdin.end();
  });
}

// Helper: Run user-supplied custom python script
function runCustomPythonCode(code: string, transactions: any[], investments: any[]): Promise<{ stdout: string; stderr: string; executionTimeMs: number }> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    // Inject dataset into python execution as variables
    const wrapperScript = `
import sys, json, math, statistics
from collections import defaultdict

data = json.loads(sys.stdin.read())
transactions = data.get("transactions", [])
investments = data.get("investments", [])

# User code execution
${code}
`;

    const pyProcess = spawn('python3', ['-c', wrapperScript]);

    let stdout = '';
    let stderr = '';

    pyProcess.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    pyProcess.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    const timeout = setTimeout(() => {
      pyProcess.kill('SIGKILL');
      stderr += '\n[Timeout: Execution exceeded 6 seconds limit]';
    }, 6000);

    pyProcess.on('close', () => {
      clearTimeout(timeout);
      const executionTimeMs = Date.now() - startTime;
      resolve({ stdout, stderr, executionTimeMs });
    });

    pyProcess.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    pyProcess.stdin.write(JSON.stringify({ transactions, investments }));
    pyProcess.stdin.end();
  });
}

// API Routes
app.post('/api/python/analyze', async (req: Request, res: Response) => {
  try {
    const { transactions = [], investments = [], benchmarkReturnPct = 14.8 } = req.body;
    const result = await runPythonEngine({
      action: 'full_analysis',
      transactions,
      investments,
      benchmarkReturnPct
    });
    res.json(result);
  } catch (error: any) {
    console.error('Python analytics error:', error);
    res.status(500).json({ error: error.message || 'Python analysis failed' });
  }
});

app.post('/api/python/categorize', async (req: Request, res: Response) => {
  try {
    const { transactions = [] } = req.body;
    const result = await runPythonEngine({
      action: 'categorize',
      transactions
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Python categorization failed' });
  }
});

app.post('/api/python/run', async (req: Request, res: Response) => {
  try {
    const { code, transactions = [], investments = [] } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Python code is required' });
    }
    const result = await runCustomPythonCode(code, transactions, investments);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Execution failed' });
  }
});

// External Market API Endpoint (Yahoo Finance chart quote or intelligent fallback)
app.get('/api/market/quote/:ticker', async (req: Request, res: Response) => {
  const ticker = req.params.ticker.toUpperCase().trim();
  const fallback = MARKET_FALLBACKS[ticker];

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1mo`;
    
    const requestPromise = new Promise<{ price: number; change: number; changePct: number; history: any[] }>((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AuraFinance/1.0'
        },
        timeout: 3500
      };

      const reqH = https.get(url, options, (httpRes) => {
        if (httpRes.statusCode !== 200) {
          return reject(new Error(`HTTP ${httpRes.statusCode}`));
        }
        let data = '';
        httpRes.on('data', chunk => data += chunk);
        httpRes.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const resultMeta = parsed?.chart?.result?.[0]?.meta;
            const indicators = parsed?.chart?.result?.[0]?.indicators?.quote?.[0];
            const timestamps = parsed?.chart?.result?.[0]?.timestamp || [];
            
            if (!resultMeta || resultMeta.regularMarketPrice == null) {
              return reject(new Error('Invalid price data'));
            }

            const currentPrice = Number(resultMeta.regularMarketPrice);
            const prevClose = Number(resultMeta.chartPreviousClose || resultMeta.previousClose || currentPrice);
            const change = currentPrice - prevClose;
            const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0;

            const history = timestamps.slice(-14).map((ts: number, i: number) => {
              const closeVal = indicators?.close?.[timestamps.length - 14 + i] ?? currentPrice;
              const dateObj = new Date(ts * 1000);
              return {
                date: dateObj.toISOString().split('T')[0],
                price: Number(closeVal ? closeVal.toFixed(2) : currentPrice.toFixed(2))
              };
            });

            resolve({ price: currentPrice, change, changePct, history });
          } catch (e) {
            reject(e);
          }
        });
      });

      reqH.on('error', reject);
      reqH.on('timeout', () => {
        reqH.destroy();
        reject(new Error('Timeout'));
      });
    });

    const liveData = await requestPromise;

    return res.json({
      ticker,
      name: fallback?.name || `${ticker} Holding`,
      price: Number(liveData.price.toFixed(2)),
      change: Number(liveData.change.toFixed(2)),
      changePct: Number(liveData.changePct.toFixed(2)),
      assetClass: fallback?.assetClass || 'Stocks',
      sector: fallback?.sector || 'Equities',
      history: liveData.history,
      source: 'live_api'
    });
  } catch (err) {
    if (fallback) {
      const history = Array.from({ length: 14 }).map((_, idx) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - idx));
        const variance = Math.sin(idx * 0.7) * (fallback.price * 0.02);
        return {
          date: d.toISOString().split('T')[0],
          price: Number((fallback.price + variance).toFixed(2))
        };
      });

      return res.json({
        ticker,
        name: fallback.name,
        price: fallback.price,
        change: fallback.change,
        changePct: fallback.changePct,
        assetClass: fallback.assetClass,
        sector: fallback.sector,
        history,
        source: 'cached_reference'
      });
    }

    return res.json({
      ticker,
      name: `${ticker} Asset`,
      price: 100.0,
      change: 0.0,
      changePct: 0.0,
      assetClass: 'Stocks',
      sector: 'General',
      history: [],
      source: 'default'
    });
  }
});

app.get('/api/market/benchmarks', (_req: Request, res: Response) => {
  res.json({
    benchmarks: [
      { ticker: 'SPY', name: 'S&P 500 Index (SPY)', returnPct: 14.8, ytd: 15.2, price: 576.20, changePct: 0.67 },
      { ticker: 'QQQ', name: 'Nasdaq 100 (QQQ)', returnPct: 18.5, ytd: 19.1, price: 492.10, changePct: 0.84 },
      { ticker: 'DIA', name: 'Dow Jones Industrial (DIA)', returnPct: 10.4, ytd: 11.0, price: 421.30, changePct: 0.32 },
      { ticker: 'VT', name: 'Vanguard Total World Stock', returnPct: 13.1, ytd: 13.5, price: 118.40, changePct: 0.45 }
    ]
  });
});

app.get('/api/export/python-script', (_req: Request, res: Response) => {
  const pythonScriptPath = path.join(__dirname, 'server', 'python_engine.py');
  res.download(pythonScriptPath, 'personal_finance_analytics.py');
});

// Boot Vite middleware
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
