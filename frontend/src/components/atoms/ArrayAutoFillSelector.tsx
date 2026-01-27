import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Icon } from '@iconify/react';

export type ArrayAutoFillOption = {
  value: string;
  label: string;
  description?: string;
};

interface ArrayAutoFillSelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: ArrayAutoFillOption[];
  placeholder?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
}

export const ArrayAutoFillSelector = ({
  options,
  placeholder,
  className,
  disabled,
  value = [],
  onChange,
  ...props
}: ArrayAutoFillSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selectedSet = useMemo(() => new Set(value), [value]);

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => {
      const label = option.label.toLowerCase();
      const description = option.description?.toLowerCase() ?? '';
      const valueText = option.value.toLowerCase();
      return label.includes(normalized) || description.includes(normalized) || valueText.includes(normalized);
    });
  }, [options, query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleValue = (nextValue: string) => {
    const next = new Set(value);
    if (next.has(nextValue)) {
      next.delete(nextValue);
    } else {
      next.add(nextValue);
    }
    onChange?.(Array.from(next));
  };

  const removeValue = (removeValue: string) => {
    onChange?.(value.filter((item) => item !== removeValue));
  };

  const behaviorClasses = 'transition-colors duration-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100';

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`} {...props}>
      <div
        className={`flex min-h-[42px] w-full flex-wrap items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-slate-700 focus-within:border-indigo-600 hover:border-indigo-400 ${behaviorClasses}`}
        onClick={() => {
          if (disabled) return;
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {value.map((item) => {
          const option = options.find((opt) => opt.value === item);
          return (
            <span key={item} className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
              {option?.label ?? item}
              {!disabled && (
                <button
                  type="button"
                  className="text-indigo-400 transition hover:text-indigo-600"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeValue(item);
                  }}
                  aria-label="Удалить"
                >
                  <Icon icon="mdi:close" className="h-3.5 w-3.5" />
                </button>
              )}
            </span>
          );
        })}
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          onChange={(event) => {
            setQuery(event.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => !disabled && setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !query && value.length) {
              removeValue(value[value.length - 1]);
            }
          }}
          placeholder={value.length ? '' : (placeholder ?? 'Введите для поиска')}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      <div
        className={`absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg transition-all duration-200 ${
          isOpen ? 'max-h-64 opacity-100' : 'pointer-events-none max-h-0 opacity-0'
        }`}
      >
        <div className="max-h-64 overflow-auto py-1">
          {filteredOptions.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-400">Ничего не найдено</div>
          )}
          {filteredOptions.map((option) => {
            const isSelected = selectedSet.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  toggleValue(option.value);
                  setQuery('');
                }}
                className={`flex w-full items-start justify-between gap-2 px-4 py-2 text-left text-sm transition-colors ${
                  isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-indigo-50'
                }`}
              >
                <span>
                  <span className="font-medium">{option.label}</span>
                  {option.description && (
                    <span className="mt-0.5 block text-xs text-slate-400">{option.description}</span>
                  )}
                </span>
                {isSelected && <Icon icon="mdi:check" className="mt-0.5 h-4 w-4 text-indigo-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
