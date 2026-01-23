import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Icon } from "@iconify/react";

type SelectorOption = {
    value: string;
    label: string;
};

interface SelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    options: SelectorOption[];
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
}

export const Selector = ({
    options,
    placeholder,
    className,
    disabled,
    value,
    onChange,
    ...props
}: SelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    const selectedOption = useMemo(
        () => options.find((option) => option.value === value),
        [options, value]
    );

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

    const behaviorClasses = 'transition-colors duration-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100';

    return (
        <div ref={rootRef} className={`relative ${className ?? ''}`} {...props}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-4 py-2 text-left text-sm text-slate-700 focus:border-indigo-600 hover:border-indigo-400 ${behaviorClasses}`}
            >
                <span className={selectedOption ? 'text-slate-700' : 'text-slate-400'}>
                    {selectedOption?.label ?? placeholder ?? 'Выберите значение'}
                </span>
                <Icon
                    icon="mdi:chevron-down"
                    className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <div
                className={`absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg transition-all duration-200 ${
                    isOpen ? 'max-h-64 opacity-100' : 'pointer-events-none max-h-0 opacity-0'
                }`}
            >
                <div className="max-h-64 overflow-auto py-1">
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange?.(option.value);
                                    setIsOpen(false);
                                }}
                                className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors ${
                                    isSelected
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-slate-700 hover:bg-indigo-50'
                                }`}
                            >
                                <span>{option.label}</span>
                                {isSelected && <Icon icon="mdi:check" className="h-4 w-4 text-indigo-500" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
