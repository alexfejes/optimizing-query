import { useState } from 'react'
// FIX 2 (part a): bring in the concurrent hook.
// import { useState, useDeferredValue } from 'react'
import SearchInput from './components/SearchInput'
import DataList from './components/DataList'
import { RECORDS } from './data/records'
import './App.css'

/*
 * DATA FLOW
 *
 *   keystroke
 *     └─> SearchInput onChange
 *           └─> setQuery(value)                 (App state)
 *                 ├─> <SearchInput value={query} />           tiny, must be instant
 *                 └─> <DataList query={query} />              filter + up to 5000 rows
 *
 * PROBLEM: both children are rendered in the SAME synchronous, urgent render.
 * React can't paint the new character in the input until all rows are done,
 * so the main thread is blocked for hundreds of ms on every keystroke.
 */
function App() {
  const [query, setQuery] = useState('')

  // FIX 2 (part b): a lagging copy of `query`.
  // On a keystroke React first renders with the OLD deferredQuery (urgent, cheap),
  // then re-renders in the background with the NEW one. That background render is
  // interruptible — the next keystroke abandons it and starts again.
  // const deferredQuery = useDeferredValue(query)

  // FIX 4 (part a): while the background render is pending, the two values differ.
  // const isStale = query !== deferredQuery

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>Customer Search</h1>
          <p className="dashboard__subtitle">{RECORDS.length.toLocaleString()} records · live query</p>
        </div>
        {/* FIX 4 (part b): a small badge so the user knows results are catching up. */}
        {/* {isStale && <span className="badge badge--updating">Updating…</span>} */}
      </header>

      {/* The input ALWAYS stays bound to the RAW query (high priority). Never defer this. */}
      <SearchInput value={query} onChange={setQuery} />

      {/* BEFORE: list receives the raw query -> blocks the input on every keystroke. */}
      <div className="list-shell">
        <DataList records={RECORDS} query={query} />
      </div>

      {/* FIX 3: pass deferredQuery to the heavy list (low priority).
          FIX 4 (part c): dim the old results while they are stale. */}
      {/* <div className={isStale ? 'list-shell list-shell--stale' : 'list-shell'} aria-busy={isStale}>
        // <DataList records={RECORDS} query={deferredQuery} />
      </div> */}
    </div>
  )
}

export default App
