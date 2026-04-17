import { useCurrency, Currency } from '@/contexts/CurrencyContext';

export default function CurrencySwitcher() {
  const { currency, setCurrency, available } = useCurrency();
  return (
    <select
      aria-label="Select currency"
      value={currency}
      onChange={(e) => setCurrency(e.target.value as Currency)}
      className="h-8 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {available.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );
}
