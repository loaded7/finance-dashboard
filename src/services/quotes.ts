import { BRAPI_TOKEN } from '../config'

export interface Quote {
  ticker: string
  price: number
  change: number // % change
  name: string
}

export async function fetchQuotes(tickers: string[]): Promise<Quote[]> {
  if (tickers.length === 0) return []
  const symbols = tickers.join(',')
  const url = `https://brapi.dev/api/quote/${symbols}?token=${BRAPI_TOKEN}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Erro ao buscar cotações')
  const data = await res.json()
  return (data.results || []).map((r: { symbol: string; regularMarketPrice: number; regularMarketChangePercent: number; longName: string; shortName: string }) => ({
    ticker: r.symbol,
    price: r.regularMarketPrice,
    change: r.regularMarketChangePercent,
    name: r.longName || r.shortName || r.symbol,
  }))
}
