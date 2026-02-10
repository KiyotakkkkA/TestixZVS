import { Navigate } from "react-router-dom";

import { authStore } from "../../stores/authStore";

import type { JSX } from "react";
import type { UserPermission, UserRole } from "../../types/User";

export type RouteGuardProps = {
    children: JSX.Element;
    requiredPermissions?: UserPermission[];
    requiredRoles?: UserRole[];
};

export const RouteGuard = ({
    children,
    requiredPermissions = [],
    requiredRoles = [],
}: RouteGuardProps) => {
    const hasPermissions = requiredPermissions.every((perm) =>
        authStore.hasPermissions([perm]),
    );
    const hasRoles =
        requiredRoles.length === 0 ||
        requiredRoles.some((role) => authStore.hasRoles([role]));

    if (!hasPermissions || !hasRoles) {
        return <Navigate to="/errors/403" replace />;
    }

    return children;
};
