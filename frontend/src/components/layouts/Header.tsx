import { memo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { Button, Dropbox, SlidedPanel } from "../atoms";
import { authStore } from "../../stores/authStore";
import { useToasts } from "../../hooks/useToasts";
import { useTheme } from "../../providers/ThemeProvider";

const RightPart = observer(() => {
    const { toast } = useToasts();
    const navigate = useNavigate();

    if (authStore.isAuthorized) {
        return (
            <div className="hidden items-center gap-3 md:flex">
                <span className="hidden text-sm text-slate-400 lg:inline">
                    {authStore.user?.name ?? "Пользователь"}
                </span>
                {authStore.hasPermission("view admin panel") && (
                    <Button to="/admin" secondary className="px-3 py-2">
                        Панель управления
                    </Button>
                )}
                <ThemeToggle />
                <div className="h-6 w-px bg-slate-300/40" />
                <Button
                    danger
                    onClick={async () => {
                        await authStore.logout();
                        toast.info("Вы вышли из аккаунта");
                        navigate("/");
                    }}
                    className="px-3 py-2"
                >
                    Выйти
                </Button>
            </div>
        );
    }

    return (
        <div className="hidden items-center gap-3 md:flex">
            <Button to="/login" secondaryNoBorder className="px-3 py-2">
                Войти
            </Button>
            <Button to="/register" primary className="px-3 py-2">
                Регистрация
            </Button>
            <ThemeToggle />
        </div>
    );
});

const LeftPart = memo(() => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center gap-3">
            <div
                className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 cursor-pointer select-none"
                onClick={() => navigate("/")}
            >
                Testix
            </div>
        </div>
    );
});

const MobileNav = observer(({ onClose }: { onClose: () => void }) => {
    const { toast } = useToasts();
    const navigate = useNavigate();

    return (
        <nav className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="rounded-lg px-3 py-2 text-sm text-slate-600">
                    {authStore.user?.name ?? "Пользователь"}
                </div>
                <ThemeToggle />
            </div>
            {authStore.isAuthorized ? (
                <div className="flex flex-col gap-4">
                    {authStore.hasPermission("view admin panel") && (
                        <Button
                            secondary
                            to="/admin"
                            className="py-2 px-3 text-center"
                            onClick={onClose}
                        >
                            Панель управления
                        </Button>
                    )}
                    <Button
                        onClick={async () => {
                            await authStore.logout();
                            toast.info("Вы вышли из аккаунта");
                            onClose();
                            navigate("/");
                        }}
                        danger
                        className="py-2 px-3"
                    >
                        Выйти
                    </Button>
                </div>
            ) : (
                <>
                    <Link
                        to="/login"
                        className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={onClose}
                    >
                        Войти
                    </Link>
                    <Link
                        to="/register"
                        className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={onClose}
                    >
                        Регистрация
                    </Link>
                </>
            )}
        </nav>
    );
});

const ThemeToggle = () => {
    const { theme, resolvedTheme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const options = [
        {
            value: "light" as const,
            label: "Светлая",
            icon: "mdi:white-balance-sunny",
        },
        {
            value: "dark" as const,
            label: "Тёмная",
            icon: "mdi:moon-waning-crescent",
        },
        {
            value: "system" as const,
            label: "Системная",
            icon: "mdi:desktop-classic",
        },
    ];

    const currentIcon =
        theme === "system"
            ? resolvedTheme === "dark"
                ? "mdi:moon-waning-crescent"
                : "mdi:white-balance-sunny"
            : (options.find((option) => option.value === theme)?.icon ??
              "mdi:white-balance-sunny");

    return (
        <div className="relative">
            <button
                type="button"
                className="flex items-center justify-center rounded-lg border border-slate-300/50 p-2 text-indigo-600 transition hover:bg-indigo-50"
                aria-label="Сменить тему"
                title="Сменить тему"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <Icon icon={currentIcon} className="h-5 w-5" />
            </button>
            <Dropbox
                open={isOpen}
                onClose={() => setIsOpen(false)}
                className="w-48 rounded-xl border border-slate-200/70 bg-slate-50/98 p-2 shadow-lg"
            >
                {options.map((option) => {
                    const isActive = theme === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                setTheme(option.value);
                                setIsOpen(false);
                            }}
                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                                isActive
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-slate-700 hover:bg-indigo-50"
                            }`}
                        >
                            <Icon icon={option.icon} className="h-5 w-5" />
                            {option.label}
                        </button>
                    );
                })}
            </Dropbox>
        </div>
    );
};

export const Header = () => {
    const [isOpenSlided, setIsOpenSlided] = useState(false);

    return (
        <header className="fixed z-30 w-full border-b border-slate-200/70 bg-slate-50/95 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-8">
                <LeftPart />
                <RightPart />

                <div className="flex items-center gap-2 md:hidden">
                    <ThemeToggle />
                    <button
                        type="button"
                        className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                        onClick={() => setIsOpenSlided(true)}
                        aria-label="Открыть меню"
                    >
                        <Icon icon="mdi:menu" className="h-7 w-7" />
                    </button>
                </div>
            </div>
            <SlidedPanel
                open={isOpenSlided}
                onClose={() => setIsOpenSlided(false)}
                title={
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Навигация
                    </h2>
                }
            >
                <MobileNav onClose={() => setIsOpenSlided(false)} />
            </SlidedPanel>
        </header>
    );
};
