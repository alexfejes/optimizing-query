export type Status = 'active' | 'pending' | 'churned' | 'trial'

export interface CustomerRecord {
  id: number
  name: string
  email: string
  company: string
  city: string
  status: Status
  revenue: number
  tags: string[]
}

export const RECORD_COUNT = 5000

// Placeholder identity for every record; emails use the reserved example domains (RFC 2606).
const NAME = 'John Doe'
const EMAIL_PREFIXES = ['john.doe', 'johndoe', 'jdoe', 'john_doe', 'doe.john', 'j.doe']
const EMAIL_DOMAINS = ['example.com', 'example.org', 'example.net']
const COMPANIES = ['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Stark Industries', 'Wayne Enterprises', 'Hooli', 'Vandelay', 'Soylent', 'Tyrell', 'Cyberdyne', 'Wonka', 'Aperture', 'Massive Dynamic', 'Oscorp']
const CITIES = ['Atlanta', 'Berlin', 'Chicago', 'Dublin', 'Lisbon', 'London', 'Madrid', 'Nairobi', 'Oslo', 'Paris', 'Seoul', 'Sydney', 'Tokyo', 'Toronto', 'Zurich']
const STATUSES: Status[] = ['active', 'pending', 'churned', 'trial']
const TAGS = ['enterprise', 'smb', 'priority', 'renewal', 'upsell', 'at-risk', 'beta', 'partner']

// Deterministic PRNG so every run (and every profiling session) sees the same data.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateRecords(count: number): CustomerRecord[] {
  const rand = mulberry32(42)
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)]

  return Array.from({ length: count }, (_, i) => {
    return {
      id: i + 1,
      name: NAME,
      email: `${pick(EMAIL_PREFIXES)}${Math.floor(rand() * 10_000)}@${pick(EMAIL_DOMAINS)}`,
      company: pick(COMPANIES),
      city: pick(CITIES),
      status: pick(STATUSES),
      revenue: Math.round(rand() * 250_000),
      tags: [pick(TAGS), pick(TAGS)].filter((t, idx, arr) => arr.indexOf(t) === idx),
    }
  })
}

// Generated once at module load — the data itself never changes.
export const RECORDS = generateRecords(RECORD_COUNT)
