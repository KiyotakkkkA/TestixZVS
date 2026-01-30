import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

import { NavLink, Outlet } from "react-router-dom";

const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
    }`;

const NavigationPanel = () => {
    return (
        <>
            <div className="text-xs uppercase tracking-wide text-slate-400">
                Навигация
            </div>
            <nav className="mt-4 flex flex-col gap-2">
                <NavLink to="/admin" end className={navItemClass}>
                    <Icon icon="mdi:account" width={22} height={22} />
                    Кабинет
                </NavLink>
                <NavLink to="/admin/users" className={navItemClass}>
                    <Icon icon="mdi:account-multiple" width={22} height={22} />
                    Пользователи
                </NavLink>
                <NavLink to="/admin/tests-access" className={navItemClass}>
                    <Icon icon="mdi:lock" width={22} height={22} />
                    Доступ к тестам
                </NavLink>
                <div className="border-t border-slate-200 my-2" />
                <NavLink to="/admin/audit" className={navItemClass}>
                    <Icon icon="mdi:journal" width={22} height={22} />
                    Журнал аудита
                </NavLink>
                <NavLink to="/admin/statistics" className={navItemClass}>
                    <Icon icon="mdi:chart-bar" width={22} height={22} />
                    Статистика
                </NavLink>
            </nav>
        </>
    );
};

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
                <aside className="hidden rounded-lg shadow-md w-64 border-r border-slate-200 bg-white/90 px-4 py-6 md:block self-start">
                    <NavigationPanel />
                </aside>

                <div className="flex-1">
                    <div className="flex w-full justify-center">
                        <div className="w-full max-w-5xl p-4 md:p-6">
                            <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow-md md:hidden">
                                <NavigationPanel />
                            </div>
                            <Outlet />
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={handleScrollTop}
                className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
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
