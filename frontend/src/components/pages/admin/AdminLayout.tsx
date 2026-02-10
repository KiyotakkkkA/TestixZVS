import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";

import { NavigationPanel } from "../../molecules/shared";

import type { NavElement } from "../../molecules/shared";

const NavigationElements: NavElement[][] = [
    [
        {
            to: "/admin",
            icon: "mdi:account",
            label: "Кабинет",
            navProps: { end: true },
        },
        {
            to: "/admin/users",
            icon: "mdi:account-multiple",
            label: "Пользователи",
        },
        {
            to: "/admin/tests-access",
            icon: "mdi:lock",
            label: "Доступ к тестам",
            forPerms: ["edit tests access"],
        },
    ],
    [
        {
            to: "/admin/audit",
            icon: "mdi:journal",
            label: "Журнал аудита",
            forPerms: ["view audit logs"],
        },
        {
            to: "/admin/statistics",
            icon: "mdi:chart-bar",
            label: "Статистика",
            forPerms: ["view statistics"],
        },
    ],
];

export const AdminLayout = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (rafRef.current !== null) return;
            rafRef.current = window.requestAnimationFrame(() => {
                rafRef.current = null;
                const nextValue = window.scrollY > 200;
                setShowScrollTop((prev) =>
                    prev === nextValue ? prev : nextValue,
                );
            });
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            if (rafRef.current !== null) {
                window.cancelAnimationFrame(rafRef.current);
            }
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleScrollTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="w-full self-stretch">
            <div className="flex w-full">
                <aside className="hidden rounded-lg shadow-md w-64 border-r border-slate-200 bg-slate-50/90 px-4 py-6 md:block self-start">
                    <NavigationPanel
                        title="Навигация"
                        elements={NavigationElements}
                    />
                </aside>

                <div className="flex-1">
                    <div className="flex w-full justify-center">
                        <div className="w-full max-w-[110rem] md:px-4">
                            <aside className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-md md:hidden">
                                <NavigationPanel
                                    title="Навигация"
                                    elements={NavigationElements}
                                />
                            </aside>
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={handleScrollTop}
                className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-slate-50 shadow-lg transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    showScrollTop
                        ? "opacity-100 translate-y-0"
                        : "pointer-events-none opacity-0 translate-y-2"
                }`}
                aria-label="Наверх"
            >
                <span className="text-lg">↑</span>
            </button>
        </div>
    );
};
