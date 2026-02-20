import type { Summary, Unit } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export async function fetchSummary(): Promise<Summary> {
  const res = await fetch(`${API_BASE}/api/summary`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function fetchUnits(): Promise<Unit[]> {
  const res = await fetch(`${API_BASE}/api/units`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
