// FIX 1 (part a): import memo so the list can bail out of urgent re-renders.
// import { memo } from 'react'
import type { CustomerRecord } from '../data/records'

// Simulates a "realistic" heavy row (charts, formatters, nested components…).
// Bump this up if your machine is too fast to feel the lag during the demo.
const ROW_RENDER_COST_MS = 0.05

function burnCpu(ms: number) {
  const end = performance.now() + ms
  while (performance.now() < end) {
    // intentionally blocking the main thread
  }
}

function matches(record: CustomerRecord, query: string) {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    record.name.toLowerCase().includes(q) ||
    record.email.includes(q) ||
    record.company.toLowerCase().includes(q) ||
    record.city.toLowerCase().includes(q)
  )
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function Row({ record, query }: { record: CustomerRecord; query: string }) {
  burnCpu(ROW_RENDER_COST_MS)
  return (
    <li className="row">
      <span className="row__id">#{record.id}</span>
      <span className="row__name">
        <Highlight text={record.name} query={query} />
      </span>
      <span className="row__email">
        <Highlight text={record.email} query={query} />
      </span>
      <span className="row__company">
        <Highlight text={record.company} query={query} />
      </span>
      <span className="row__city">
        <Highlight text={record.city} query={query} />
      </span>
      <span className={`row__status status--${record.status}`}>{record.status}</span>
      <span className="row__revenue">{currency.format(record.revenue)}</span>
      <span className="row__tags">
        {record.tags.map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </span>
    </li>
  )
}

interface DataListProps {
  records: CustomerRecord[]
  query: string
}

// The LOW-PRIORITY part of the UI. Filtering + rendering up to 5000 heavy rows.
// BEFORE: receives the raw `query`, so it re-renders synchronously on EVERY keystroke.
// AFTER:  receives `deferredQuery`, so React can render it in the background.
function DataList({ records, query }: DataListProps) {
  const filtered = records.filter((r) => matches(r, query))

  return (
    <section className="list">
      <header className="list__header">
        <span>
          Showing <strong>{filtered.length.toLocaleString()}</strong> of {records.length.toLocaleString()} records
        </span>
      </header>
      <ul className="list__body">
        {filtered.map((record) => (
          <Row key={record.id} record={record} query={query} />
        ))}
      </ul>
    </section>
  )
}

// BEFORE: plain export — DataList re-renders whenever <App> re-renders.
export default DataList

// FIX 1 (part b): memo is REQUIRED for useDeferredValue to help.
// On the urgent render, App re-renders with the NEW query but the OLD deferredQuery.
// memo sees identical props and skips the 5000-row render, so the input paints instantly.
// export default memo(DataList)
