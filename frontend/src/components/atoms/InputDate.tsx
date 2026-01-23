import { useId } from "react";

import type React from "react";

export interface InputDateProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const InputDate = ({
    label,
    className,
    id,
    disabled,
    ...props
}: InputDateProps) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const behaviorClasses = 'transition-colors duration-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100';

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                type="date"
                disabled={disabled}
                className={`w-full rounded-lg border px-4 py-2 text-sm text-slate-700 focus:border-indigo-600 hover:border-indigo-400 ${behaviorClasses} ${className ?? ''}`}
                {...props}
            />
        </div>
    );
};
