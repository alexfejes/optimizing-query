import { useRef } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

// The HIGH-PRIORITY part of the UI. Whatever the user types must show up here
// on the very next frame. It is always bound to the RAW `query` state.
export default function SearchInput({ value, onChange }: SearchInputProps) {
  const latencyRef = useRef<HTMLSpanElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Tiny DIY latency meter: time from the keystroke to the next animation frame.
    // If React blocks the main thread rendering 5000 rows, this number explodes.
    // Written straight to the DOM (no state) so the meter never causes a re-render.
    const start = performance.now()
    requestAnimationFrame(() => {
      const ms = performance.now() - start
      const el = latencyRef.current
      if (!el) return
      el.textContent = `${ms.toFixed(0)} ms`
      el.dataset.level = ms > 100 ? 'bad' : ms > 50 ? 'warn' : 'good'
    })

    onChange(e.target.value)
  }

  return (
    <div className="search">
      <label htmlFor="live-query" className="search__label">
        Live query
      </label>
      <input
        id="live-query"
        className="search__input"
        type="search"
        autoComplete="off"
        spellCheck={false}
        placeholder="Search name, email, company, city…"
        value={value}
        onChange={handleChange}
      />
      <div className="search__latency" title="Keystroke → next frame">
        Input lag <span ref={latencyRef} data-level="good">–</span>
      </div>
    </div>
  )
}
