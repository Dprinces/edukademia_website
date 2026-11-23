import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { COUNTRIES, type Country, type CountryCode } from '../../lib/countries';

interface CountryPickerProps {
  /** id for the trigger button, so a <label htmlFor> can point at it. */
  id: string;
  value: CountryCode | '';
  onChange: (code: CountryCode) => void;
  /** "dial" shows the dialling code (+234) on the button; "country" shows the country name. */
  mode: 'dial' | 'country';
  placeholder: string;
  /** Accessible name when there is no visible label, e.g. "Country dialling code". */
  ariaLabel?: string;
  invalid?: boolean;
  describedBy?: string;
  onBlur?: () => void;
}

const normalise = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Country from the browser's language setting (e.g. "en-GB" → GB), if there is one. */
function browserRegion(): CountryCode | undefined {
  try {
    for (const lang of navigator.languages ?? [navigator.language]) {
      const region = new Intl.Locale(lang).maximize().region;
      if (region && COUNTRIES.some((c) => c.code === region)) return region as CountryCode;
    }
  } catch {
    /* Intl.Locale unsupported */
  }
  return undefined;
}

const COMMON: CountryCode[] = ['NG', 'GH', 'GB', 'US', 'CA'];

function matches(country: Country, query: string) {
  if (!query) return true;
  const digits = query.replace(/[^\d]/g, '');
  return (
    normalise(country.name).includes(query) ||
    country.code.toLowerCase() === query ||
    (digits.length > 0 && country.dialCode.startsWith(digits))
  );
}

/**
 * Searchable country list (WAI-ARIA combobox inside a popover).
 * Used for both the Country field and the phone dialling code.
 */
export default function CountryPicker({
  id, value, onChange, mode, placeholder, ariaLabel, invalid, describedBy, onBlur,
}: CountryPickerProps) {
  const uid = useId();
  const listId = `${uid}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = COUNTRIES.find((c) => c.code === value);

  // Suggested countries first (when not searching), then everything A–Z.
  const options = useMemo(() => {
    const q = normalise(query);
    const filtered = COUNTRIES.filter((c) => matches(c, q));
    if (q) return { suggested: [] as Country[], all: filtered };
    const region = browserRegion();
    const codes = [...new Set([region, ...COMMON].filter(Boolean))] as CountryCode[];
    const suggested = codes.map((code) => COUNTRIES.find((c) => c.code === code)!).filter(Boolean);
    return { suggested, all: filtered };
  }, [query]);

  const flat = [...options.suggested, ...options.all];

  function openList() {
    setQuery('');
    setOpen(true);
  }

  function close(returnFocus = true) {
    setOpen(false);
    onBlur?.();
    if (returnFocus) buttonRef.current?.focus();
  }

  function choose(country: Country) {
    onChange(country.code);
    close();
  }

  // On open: focus the search box and highlight the current value.
  useEffect(() => {
    if (!open) return;
    const index = flat.findIndex((c) => c.code === value);
    setActive(index >= 0 ? index : 0);
    searchRef.current?.focus();
  }, [open]);

  // Close when clicking or tabbing outside.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Keep the highlighted option visible while using the arrow keys.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  function onSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flat[active]) choose(flat[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      close(false);
    }
  }

  const buttonText = selected
    ? mode === 'dial' ? `+${selected.dialCode}` : selected.name
    : placeholder;

  const optionId = (index: number) => `${uid}-opt-${index}`;

  function renderOption(country: Country, index: number) {
    const isSelected = country.code === value;
    return (
      <li
        key={`${index}-${country.code}`}
        id={optionId(index)}
        data-index={index}
        role="option"
        aria-selected={isSelected}
        className={['picker-option', index === active && 'is-active', isSelected && 'is-selected'].filter(Boolean).join(' ')}
        onPointerMove={() => setActive(index)}
        onClick={() => choose(country)}
      >
        <span className="picker-option-name">{country.name}</span>
        <span className="picker-option-dial">+{country.dialCode}</span>
      </li>
    );
  }

  return (
    <div className={`picker picker-${mode}`} ref={rootRef}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        className={selected ? 'picker-trigger' : 'picker-trigger is-placeholder'}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel ? `${ariaLabel}${selected ? `: ${selected.name} +${selected.dialCode}` : ''}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        title={selected ? `${selected.name} (+${selected.dialCode})` : undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            openList();
          }
        }}
      >
        <span className="picker-trigger-text">{buttonText}</span>
        <span className="picker-caret" aria-hidden="true" />
      </button>

      {open && (
        <div className="picker-popover">
          <input
            ref={searchRef}
            type="text"
            className="picker-search"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={flat[active] ? optionId(active) : undefined}
            aria-label="Search countries"
            placeholder="Search country or code"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={onSearchKeyDown}
            autoComplete="off"
          />
          <ul className="picker-list" id={listId} role="listbox" ref={listRef} aria-label="Countries">
            {flat.length === 0 && <li className="picker-empty">No countries match “{query}”</li>}
            {options.suggested.length > 0 && <li className="picker-group" role="presentation">Suggested</li>}
            {options.suggested.map((c, i) => renderOption(c, i))}
            {options.suggested.length > 0 && <li className="picker-group" role="presentation">All countries</li>}
            {options.all.map((c, i) => renderOption(c, options.suggested.length + i))}
          </ul>
        </div>
      )}
    </div>
  );
}
