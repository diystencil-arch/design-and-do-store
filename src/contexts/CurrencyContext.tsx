import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Currency = 'CAD' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'INR';

const SYMBOLS: Record<Currency, string> = {
  CAD: 'CA$',
  USD: 'US$',
  EUR: '€',
  GBP: '£',
  AUD: 'AU$',
  INR: '₹',
};

// Fallback approximate FX from CAD; replaced at runtime by live rates.
const FALLBACK_RATES: Record<Currency, number> = {
  CAD: 1,
  USD: 0.73,
  EUR: 0.68,
  GBP: 0.58,
  AUD: 1.12,
  INR: 62,
};

const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  CA: 'CAD',
  US: 'USD',
  GB: 'GBP',
  IE: 'EUR', FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR', PT: 'EUR', AT: 'EUR', FI: 'EUR',
  AU: 'AUD',
  IN: 'INR',
};

type Ctx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (cadAmount: number) => string;
  symbol: string;
  available: Currency[];
};

const CurrencyContext = createContext<Ctx | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('currency') : null;
    return (saved as Currency) || 'CAD';
  });
  const [rates, setRates] = useState<Record<Currency, number>>(FALLBACK_RATES);

  // Auto-detect currency from IP (only if user hasn't picked one).
  useEffect(() => {
    if (localStorage.getItem('currency')) return;
    fetch('https://ipapi.co/json/')
      .then((r) => r.json())
      .then((data) => {
        const cc = (data?.country_code || '').toUpperCase();
        const detected = COUNTRY_TO_CURRENCY[cc];
        if (detected) setCurrencyState(detected);
      })
      .catch(() => {});
  }, []);

  // Fetch live FX rates (base CAD). Cached for 12h in localStorage.
  useEffect(() => {
    const CACHE_KEY = 'fx_rates_cad';
    const TTL = 12 * 60 * 60 * 1000;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { ts, data } = JSON.parse(cached);
        if (Date.now() - ts < TTL && data) {
          setRates({ ...FALLBACK_RATES, ...data });
          return;
        }
      }
    } catch {}
    const symbols = Object.keys(FALLBACK_RATES).filter((c) => c !== 'CAD').join(',');
    fetch(`https://api.exchangerate.host/latest?base=CAD&symbols=${symbols}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.rates) {
          const merged = { ...FALLBACK_RATES, ...data.rates, CAD: 1 } as Record<Currency, number>;
          setRates(merged);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data.rates }));
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('currency', c);
  };

  const format = (cadAmount: number) => {
    const value = cadAmount * (rates[currency] ?? FALLBACK_RATES[currency]);
    const rounded = currency === 'INR' ? Math.round(value) : Math.round(value * 100) / 100;
    return `${SYMBOLS[currency]}${rounded.toFixed(currency === 'INR' ? 0 : 2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, format, symbol: SYMBOLS[currency], available: Object.keys(FALLBACK_RATES) as Currency[] }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
}
