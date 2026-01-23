import { useId, useMemo, useState } from "react";
import { Icon } from "@iconify/react";

import type React from "react";

export interface InputSmallProps extends React.InputHTMLAttributes<HTMLInputElement> {
    leftIcon?: string;
}

export const InputSmall = ({
    leftIcon,
    className,
    type = "text",
    id,
    disabled,
    ...props
}: InputSmallProps) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = useState(false);

    const computedType = useMemo(() => {
        if (!isPassword) return type;
        return showPassword ? "text" : "password";
    }, [isPassword, showPassword, type]);

    const paddingLeft = leftIcon ? "pl-10" : "pl-4";
    const paddingRight = isPassword ? "pr-10" : "pr-4";

    const behaviorClasses = 'transition-colors duration-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100';

    return (
        <div className="relative">
            {leftIcon && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon icon={leftIcon} className="h-4 w-4" />
                </span>
            )}
            <input
                id={inputId}
                type={computedType}
                disabled={disabled}
                className={
                    `w-full rounded-lg border ${paddingLeft} ${paddingRight} ${behaviorClasses} text-slate-700 placeholder:text-slate-400 focus:border-indigo-600 hover:border-indigo-400 ${
                        className ?? ""
                    }`
                }
                {...props}
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-indigo-500"
                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                    <Icon icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};
