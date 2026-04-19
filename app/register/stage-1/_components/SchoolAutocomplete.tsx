'use client'

import { useState, useRef, useEffect, useCallback, useId } from 'react'

interface Props {
  value:       string
  onChange:    (v: string) => void
  onBlur?:     () => void
  cityName:    string
  hasError?:   boolean
  placeholder?: string
}

// ─── Singleton Google Maps loader ─────────────────────────────────────────────

let _loaded  = false
let _loading = false
const _cbs: Array<() => void> = []

function loadPlaces(cb: () => void) {
  if (_loaded)   { cb(); return }
  _cbs.push(cb)
  if (_loading) return
  _loading = true

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) {
    console.warn('[SchoolAutocomplete] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set — suggestions disabled')
    return
  }

  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async`
  script.async = true
  script.defer = true
  script.onload = () => {
    _loaded = true
    _cbs.forEach(fn => fn())
  }
  script.onerror = () => {
    _loading = false
    _cbs.length = 0
  }
  document.head.appendChild(script)
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SchoolAutocomplete({ value, onChange, onBlur, cityName, hasError, placeholder }: Props) {
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [open,        setOpen]        = useState(false)
  const [activeIdx,   setActiveIdx]   = useState(-1)
  const [apiReady,    setApiReady]    = useState(false)

  const inputRef   = useRef<HTMLInputElement>(null)
  const listRef    = useRef<HTMLUListElement>(null)
  const svcRef     = useRef<google.maps.places.AutocompleteService | null>(null)
  const debounceId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listId     = useId()

  // Init service when Maps API loads
  const initService = useCallback(() => {
    if (window.google?.maps?.places) {
      svcRef.current = new window.google.maps.places.AutocompleteService()
      setApiReady(true)
    }
  }, [])

  // Fetch predictions
  const fetchSuggestions = useCallback((query: string) => {
    if (!svcRef.current || query.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    const req: google.maps.places.AutocompletionRequest = {
      input:                query,
      types:                ['school'],
      componentRestrictions: { country: 'in' },
    }

    // Bias to city if available (geocoding not needed — text bias via location is enough)
    if (cityName) {
      // append city name to query for better locality bias
      req.input = `${query} ${cityName}`
    }

    svcRef.current.getPlacePredictions(req, (preds, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && preds) {
        // Filter to suggestions that actually contain the user's typed text
        const lq = query.toLowerCase()
        const filtered = preds.filter(p =>
          p.structured_formatting.main_text.toLowerCase().includes(lq) ||
          p.description.toLowerCase().includes(lq)
        )
        setSuggestions(filtered.slice(0, 6))
        setOpen(filtered.length > 0)
      } else {
        setSuggestions([])
        setOpen(false)
      }
    })
  }, [cityName])

  // Debounced input handler
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    onChange(v)
    setActiveIdx(-1)

    if (!apiReady) return
    if (debounceId.current) clearTimeout(debounceId.current)
    debounceId.current = setTimeout(() => fetchSuggestions(v), 280)
  }, [onChange, apiReady, fetchSuggestions])

  // Load Maps API on first focus
  const handleFocus = useCallback(() => {
    if (!_loaded && !_loading) {
      loadPlaces(initService)
    } else if (_loaded) {
      initService()
    }
  }, [initService])

  // Select a suggestion
  const selectSuggestion = useCallback((pred: google.maps.places.AutocompletePrediction) => {
    const name = pred.structured_formatting.main_text
    onChange(name)
    setSuggestions([])
    setOpen(false)
    setActiveIdx(-1)
    inputRef.current?.blur()
  }, [onChange])

  // Keyboard nav
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[activeIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIdx(-1)
    }
  }, [open, suggestions, activeIdx, selectSuggestion])

  // Close on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        listRef.current  && !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  // Scroll active item into view
  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const item = listRef.current.children[activeIdx] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIdx])

  const hasKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInput}
        onFocus={handleFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? (cityName ? 'Start typing your school name…' : 'Select a city first')}
        autoComplete="off"
        autoCapitalize="words"
        inputMode="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={activeIdx >= 0 ? `${listId}-${activeIdx}` : undefined}
        className="w-full rounded-xl px-4 font-body transition-colors outline-none focus:outline-none placeholder:opacity-40"
        style={{
          minHeight: '48px',
          background: 'var(--bg-inset)',
          border: `1px solid ${hasError ? 'rgba(248,113,113,0.45)' : 'var(--border-subtle)'}`,
          color: 'var(--text-1)',
          fontSize: '16px',
        }}
      />

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="School suggestions"
          className="absolute z-50 w-full mt-1 rounded-xl border overflow-hidden shadow-xl"
          style={{
            background: 'var(--bg-float)',
            borderColor: 'var(--border-subtle)',
            maxHeight: '260px',
            overflowY: 'auto',
          }}
        >
          {suggestions.map((pred, i) => {
            const isActive = i === activeIdx
            return (
              <li
                key={pred.place_id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={isActive}
                onMouseDown={e => { e.preventDefault(); selectSuggestion(pred) }}
                className="px-4 py-3 cursor-pointer flex items-start gap-3 transition-colors"
                style={{
                  background: isActive ? 'var(--brand-subtle)' : 'transparent',
                  borderBottom: '1px solid var(--border-faint)',
                }}
              >
                <span className="mt-0.5 shrink-0 text-sm" style={{ color: 'var(--text-4)' }}>🏫</span>
                <div className="min-w-0">
                  <p className="text-sm font-body truncate" style={{ color: 'var(--text-1)' }}>
                    {pred.structured_formatting.main_text}
                  </p>
                  <p className="text-xs font-mono truncate mt-0.5" style={{ color: 'var(--text-4)' }}>
                    {pred.structured_formatting.secondary_text}
                  </p>
                </div>
              </li>
            )
          })}

          {/* Allow free text */}
          <li
            onMouseDown={e => { e.preventDefault(); setOpen(false) }}
            className="px-4 py-2.5 cursor-pointer text-xs transition-colors"
            style={{ color: 'var(--text-3)', borderTop: '1px solid var(--border-faint)' }}
          >
            Can't find your school? Just type the name above ↑
          </li>
        </ul>
      )}

      {/* No-key fallback hint */}
      {!hasKey && (
        <p className="mt-1 text-xs" style={{ color: 'var(--text-4)' }}>
          Type your full school name
        </p>
      )}
    </div>
  )
}
