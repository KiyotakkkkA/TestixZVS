import { Navigate } from "react-router-dom";

import { authStore } from "../stores/authStore";

import type { JSX } from "react";

export type RouteGuardProps = {
  children: JSX.Element;
  requiredPermissions?: string[];
  requiredRoles?: string[];
};

export const RouteGuard = ({ children, requiredPermissions = [], requiredRoles = [] }: RouteGuardProps) => {
  const hasPermissions = requiredPermissions.every((perm) => authStore.hasPermission(perm));
  const hasRoles = requiredRoles.length === 0 || requiredRoles.some((role) => authStore.hasRole(role));

  if (!hasPermissions || !hasRoles) {
    return <Navigate to="/errors/403" replace />;
  }

  return children;
};
