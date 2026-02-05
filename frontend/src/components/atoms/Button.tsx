import type React from "react";
import { Link } from "react-router-dom";
import { Spinner } from "./Spinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    to?: string;
    isLoading?: boolean;
    loadingText?: string;
    onClick?: () => void;

    primary?: boolean;
    primaryNoBackground?: boolean;
    disabled?: boolean;
    secondary?: boolean;
    secondaryNoBorder?: boolean;
    success?: boolean;
    successInverted?: boolean;
    successNoBackground?: boolean;
    warning?: boolean;
    warningInverted?: boolean;
    warningNoBackground?: boolean;
    danger?: boolean;
    dangerInverted?: boolean;
    dangerNoBackground?: boolean;
}

export const Button = ({
    to,
    isLoading,
    loadingText,
    onClick,
    children,
    className,
    type = "button",
    disabled = false,
    primary = false,
    primaryNoBackground = false,
    secondary = false,
    secondaryNoBorder = false,
    success = false,
    successInverted = false,
    successNoBackground = false,
    warning = false,
    warningInverted = false,
    warningNoBackground = false,
    danger = false,
    dangerInverted = false,
    dangerNoBackground = false,
    ...props
}: ButtonProps) => {
    let buttonClasses = `transition-colors duration-300 rounded-lg font-semibold`;
    if (primary)
        buttonClasses += " bg-indigo-500 text-contrast hover:bg-indigo-600";
    if (primaryNoBackground)
        buttonClasses += " text-gray-600 hover:text-indigo-600";

    if (secondary)
        buttonClasses +=
            " border border-indigo-500/50 text-indigo-500 hover:bg-indigo-500 hover:text-contrast";
    if (secondaryNoBorder)
        buttonClasses +=
            " text-indigo-500 hover:bg-indigo-500 hover:text-contrast";
    if (success) buttonClasses += " bg-green-500 text-white hover:bg-green-600";
    if (successInverted)
        buttonClasses +=
            " border border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white";
    if (successNoBackground)
        buttonClasses += " text-green-500 hover:text-green-600";

    if (warning)
        buttonClasses += " bg-yellow-500 text-white hover:bg-yellow-600";
    if (warningInverted)
        buttonClasses +=
            " border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-white";
    if (warningNoBackground)
        buttonClasses += " text-yellow-500 hover:text-yellow-600";

    if (danger) buttonClasses += " bg-red-500 text-white hover:bg-red-600";
    if (dangerInverted)
        buttonClasses +=
            " border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white";
    if (dangerNoBackground) buttonClasses += " text-red-500 hover:text-red-600";

    if (disabled || isLoading)
        buttonClasses += " opacity-50 cursor-not-allowed pointer-events-none";

    const combinedClassName =
        (className ? className + " " : "") + buttonClasses;

    if (to) {
        const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
            if (disabled || isLoading) {
                event.preventDefault();
                return;
            }
            onClick?.();
        };

        return (
            <Link
                to={to}
                onClick={handleClick}
                className={combinedClassName}
                aria-disabled={disabled || isLoading}
            >
                {children}
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            className={combinedClassName}
            disabled={disabled || isLoading}
            type={type}
            {...props}
        >
            {isLoading ? (
                <span className="flex gap-2 items-center justify-center">
                    <Spinner className="h-5 w-5" />
                    {loadingText || ""}
                </span>
            ) : (
                children
            )}
        </button>
    );
};
