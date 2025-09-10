// Utility for currency listing/formatting using the Intl API.

interface CurrencyOption {
value: string; // ISO-4217 code (e.g., "EUR") 
label: string; // Localized name with code and symbol 
symbol: string; // Display symbol (€, $, …)   
}

const FALLBACK_CURRENCIES = [
  "USD","EUR","GBP","JPY","CNY","INR","AUD","CAD","CHF","HKD","SEK","NOK","DKK",
  "PLN","CZK","HUF","TRY","BRL","ZAR","MXN","AED","SAR","ILS","KRW","TWD","SGD",
  "NZD","THB","MYR","IDR","PHP","CLP","COP","ARS","PEN","VND","RON","BGN","HRK",
  "ISK","KWD","QAR","BHD","RUB","UAH","GHS","NGN","KES"
];

function getSupportedCurrencyCodes(): string[] {
  // Prefer runtime-supported values; fall back to a curated list.
  if (typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("currency") as string[];
  }
  return [...FALLBACK_CURRENCIES];
}


export function listCurrencies(locale = "en"): CurrencyOption[] {
  const codes = getSupportedCurrencyCodes();

  const dn = new Intl.DisplayNames(locale, { type: "currency" });
  const safeName = (c: string) => (dn.of(c) ?? c);

  return codes
    .map((code) => {
      const symbol = extractSymbol(code, locale);
      const name = safeName(code);
      return {
        value: code,
        label: `${name} (${code}) – ${symbol}`,
        symbol
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, locale));
}

function extractSymbol(currency: string, locale = "en"): string {
  const nf = new Intl.NumberFormat(locale, { style: "currency", currency });
  const parts = nf.formatToParts(0);
  const sym = parts.find((p) => p.type === "currency")?.value;
return (sym ?? nf.format(0).replace(/[\d\s.,\-+]/g, "").trim()) || currency;
}


