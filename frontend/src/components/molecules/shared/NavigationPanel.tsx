import { Icon } from "@iconify/react";
import { NavLink, NavLinkProps } from "react-router-dom";
import { memo } from "react";

import { authStore } from "../../../stores/authStore";

import type { UserPermission, UserRole } from "../../../types/User";

export type NavElement = {
    to: string;
    icon: string;
    label: string;
    forPerms?: UserPermission[];
    forRoles?: UserRole[];
    navProps?: Omit<NavLinkProps, "to">;
};

interface NavigationPanelProps {
    title: string;
    elements: NavElement[][];
}

const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
        isActive
            ? "bg-indigo-600 text-slate-50 shadow-sm"
            : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
    }`;

export const NavigationPanel = memo(
    ({ title, elements }: NavigationPanelProps) => {
        const isVisible = (element: NavElement) => {
            if (element.forRoles) {
                const hasRole = element.forRoles.some((role) =>
                    authStore.hasRoles([role]),
                );
                if (!hasRole) return false;
            }
            if (element.forPerms) {
                const hasPerm = element.forPerms.some((perm) =>
                    authStore.hasPermissions([perm]),
                );
                if (!hasPerm) return false;
            }
            return true;
        };

        return (
            <>
                <div className="text-xs uppercase tracking-wide text-slate-400">
                    {title}
                </div>
                <nav className="mt-4 flex flex-col gap-2">
                    {elements.map((group) => (
                        <>
                            <div className="space-y-2">
                                {group.map((element) => {
                                    if (!isVisible(element)) {
                                        return null;
                                    }
                                    return (
                                        <NavLink
                                            key={element.to}
                                            to={element.to}
                                            className={navItemClass}
                                            {...element.navProps}
                                        >
                                            <Icon
                                                icon={element.icon}
                                                className="h-4 w-4"
                                            />
                                            {element.label}
                                        </NavLink>
                                    );
                                })}
                            </div>
                            <div className="h-px bg-slate-200 last:hidden" />
                        </>
                    ))}
                </nav>
            </>
        );
    },
);
