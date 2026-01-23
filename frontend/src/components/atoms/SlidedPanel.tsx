import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";

import type React from "react";

interface SlidedPanelProps {
    open: boolean;
    onClose: () => void;
    title?: string | React.ReactNode;
    children: React.ReactNode;
    outsideClickClosing?: boolean;
}

const SlidedPanel = ({ open, onClose, title, children, outsideClickClosing = false }: SlidedPanelProps) => {
    if (typeof document === "undefined") {
        return null;
    }

    return createPortal(
        <div
            className={`fixed inset-0 z-40 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
            aria-hidden={!open}
        >
            <div
                className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-300 ${
                    open ? "opacity-100" : "opacity-0"
                }`}
                onClick={outsideClickClosing ? onClose : undefined}
            />
            <aside
                className={`absolute right-0 top-0 h-[100dvh] min-w-72 bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
                    open ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between border-b border-slate-100 p-4">
                    <div>
                        { title }
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Закрыть меню"
                    >
                        <Icon icon="mdi:close" className="h-7 w-7" />
                    </button>
                </div>
                <div className="px-4 py-4 flex-1 min-h-0 overflow-y-auto">{children}</div>
            </aside>
        </div>,
        document.body
    );
};

export { SlidedPanel };