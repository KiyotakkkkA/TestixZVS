import type React from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";

interface ModalProps {
    open: boolean;
    title?: string | React.ReactNode;
    onClose: () => void;
    children: React.ReactNode;
    outsideClickClosing?: boolean;
    zIndexClassName?: string;
}

const Modal = ({
    open,
    title,
    onClose,
    children,
    outsideClickClosing = false,
    zIndexClassName,
}: ModalProps) => {
    const zIndexClass = zIndexClassName ?? "z-40";

    if (typeof document === "undefined") {
        return null;
    }

    return createPortal(
        <div
            className={`fixed inset-0 ${zIndexClass} flex items-center justify-center px-4 py-6 sm:py-8 overflow-y-auto ${open ? "pointer-events-auto" : "pointer-events-none"}`}
            aria-hidden={!open}
        >
            <div
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
                    open ? "opacity-100" : "opacity-0"
                }`}
                onClick={outsideClickClosing ? onClose : undefined}
            />
            <div
                role="dialog"
                aria-modal="true"
                className={`relative w-full max-w-lg max-h-[calc(100dvh-3rem)] rounded-lg bg-slate-50 shadow-2xl transition-all duration-300 flex flex-col ${
                    open
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                }`}
            >
                <div className="flex items-center justify-end p-4 border-b border-slate-200/70">
                    <div
                        className={`flex ${title ? "justify-between" : "justify-end"} items-start w-full`}
                    >
                        {title}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Закрыть окно"
                        >
                            <Icon icon="mdi:close" className="h-7 w-7" />
                        </button>
                    </div>
                </div>
                <div className="py-2 px-4 min-h-0 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>,
        document.body,
    );
};

export { Modal };
