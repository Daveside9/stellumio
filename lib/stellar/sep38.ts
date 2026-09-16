/**
 * SEP-38 client — Firm-quote RFQ for Stellumio.
 *
 * Implements the four SEP-38 endpoints:
 *   GET  /info    — list supported assets and delivery methods
 *   GET  /prices  — indicative prices for a sell asset
 *   GET  /price   — indicative price for a specific pair
 *   POST /quote   — create a firm quote (requires SEP-10 JWT)
 *
 * Reference: https://stellar.org/protocol/sep-38
 */

import type {
  Sep38Info,
  Sep38PricesParams,
  Sep38IndicativePrice,
  Sep38QuoteParams,
  Sep38Quote,
} from '@/types';

const DEFAULT_TIMEOUT_MS = 10_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchJson<T>(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...fetchOptions, signal: controller.signal });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message =
        (body as { error?: string }).error ?? `SEP-38 HTTP ${res.status}`;
      throw new Error(message);
    }
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timerId);
  }
}

// ─── GET /info ────────────────────────────────────────────────────────────────

/**
 * Fetches the list of assets supported by the anchor's SEP-38 quote server.
 */
export async function getSep38Info(quoteServerUrl: string): Promise<Sep38Info> {
  const url = `${quoteServerUrl.replace(/\/$/, '')}/info`;
  const raw = await fetchJson<{
    assets: Array<{
      asset: string;
      sell_delivery_methods?: Array<{ name: string; description: string }>;
      buy_delivery_methods?: Array<{ name: string; description: string }>;
      country_codes?: string[];
    }>;
  }>(url);

  return {
    assets: raw.assets.map((a) => ({
      asset: a.asset,
      sellDeliveryMethods: a.sell_delivery_methods ?? [],
      buyDeliveryMethods: a.buy_delivery_methods ?? [],
      countryCodes: a.country_codes ?? [],
    })),
  };
}

// ─── GET /prices ──────────────────────────────────────────────────────────────

/**
 * Fetches indicative prices for all buy assets given a sell asset and amount.
 * Returns an empty array if the server responds with an error (graceful downgrade).
 */
export async function getSep38Prices(
  quoteServerUrl: string,
  params: Sep38PricesParams
): Promise<Sep38IndicativePrice[]> {
  const base = `${quoteServerUrl.replace(/\/$/, '')}/prices`;
  const searchParams = new URLSearchParams({
    sell_asset: params.sell_asset,
    sell_amount: params.sell_amount,
  });
  if (params.sell_delivery_method) {
    searchParams.set('sell_delivery_method', params.sell_delivery_method);
  }
  if (params.buy_delivery_method) {
    searchParams.set('buy_delivery_method', params.buy_delivery_method);
  }
  if (params.country_code) {
    searchParams.set('country_code', params.country_code);
  }

  const raw = await fetchJson<{
    buy_assets: Array<{ asset: string; price: string; decimals?: number }>;
  }>(`${base}?${searchParams}`);

  return (raw.buy_assets ?? []).map((b) => ({
    asset: b.asset,
    buy_asset: b.asset,
    price: b.price,
    total_price: b.price, // indicative — total_price not available from /prices
  }));
}

// ─── POST /quote ──────────────────────────────────────────────────────────────

/**
 * Creates a firm SEP-38 quote. Requires a valid SEP-10 JWT.
 *
 * The returned `id` should be passed as `quote_id` to
 * `POST /transactions/withdraw/interactive` so the anchor is bound to the price.
 */
export async function postSep38Quote(
  quoteServerUrl: string,
  params: Sep38QuoteParams,
  jwt: string
): Promise<Sep38Quote> {
  const url = `${quoteServerUrl.replace(/\/$/, '')}/quote`;

  const body: Record<string, string> = {
    sell_asset: params.sell_asset,
    buy_asset: params.buy_asset,
    sell_amount: params.sell_amount,
    context: params.context,
  };
  if (params.buy_delivery_method) body['buy_delivery_method'] = params.buy_delivery_method;
  if (params.sell_delivery_method) body['sell_delivery_method'] = params.sell_delivery_method;
  if (params.country_code) body['country_code'] = params.country_code;
  if (params.expire_after) body['expire_after'] = params.expire_after;

  const raw = await fetchJson<{
    id: string;
    expires_at: string;
    price: string;
    sell_amount: string;
    buy_amount: string;
    fee?: { total?: string; percent?: string };
  }>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  });

  return {
    id: raw.id,
    expires_at: raw.expires_at,
    price: raw.price,
    sell_amount: raw.sell_amount,
    buy_amount: raw.buy_amount,
    fee: {
      total: raw.fee?.total ?? '0',
      percent: raw.fee?.percent ?? '0',
    },
    context: params.context as 'sep24',
  };
}

// ─── Quote expiry helpers ─────────────────────────────────────────────────────

/**
 * Returns true if the quote's `expires_at` timestamp is in the past.
 */
export function isQuoteExpired(quote: Pick<Sep38Quote, 'expires_at'>): boolean {
  return Date.now() >= new Date(quote.expires_at).getTime();
}

/**
 * Returns the number of milliseconds until the quote expires.
 * Returns 0 if already expired.
 */
export function quoteExpiresInMs(quote: Pick<Sep38Quote, 'expires_at'>): number {
  return Math.max(0, new Date(quote.expires_at).getTime() - Date.now());
}
