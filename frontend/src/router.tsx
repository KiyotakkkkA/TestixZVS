import type { ComponentType, ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { OurTeamPage } from "./components/pages/general/OurTeamPage";

import { LoginPage } from "./components/pages/auth/LoginPage";
import { RegisterPage } from "./components/pages/auth/RegisterPage";
import { VerifyPage } from "./components/pages/auth/VerifyPage";

import { TestsListPage } from "./components/pages/tests/TestsListPage";
import { TestStartPage } from "./components/pages/tests/TestStartPage";
import { TestPage } from "./components/pages/tests/TestPage";
import { TestResultsPage } from "./components/pages/tests/TestResultsPage";
import { TestEditingPage } from "./components/pages/tests/TestEditingPage";

import { AdminLayout } from "./components/pages/admin/AdminLayout";
import { AdminCabinetPage } from "./components/pages/admin/AdminCabinetPage";
import { AdminUsersPage } from "./components/pages/admin/AdminUsersPage";
import { AdminAuditPage } from "./components/pages/admin/AdminAuditPage";
import { AdminStatisticsPage } from "./components/pages/admin/AdminStatisticsPage";
import { AdminTestsAccessPage } from "./components/pages/admin/AdminTestsAccessPage";

import { TeacherLayout } from "./components/pages/teacher/TeacherLayout";
import { TeacherCabinetPage } from "./components/pages/teacher/TeacherCabinetPage";
import { TeacherUsersPage } from "./components/pages/teacher/TeacherUsersPage";
import { TeacherTestsAccessPage } from "./components/pages/teacher/TeacherTestsAccessPage";
import { TeacherStatisticsPage } from "./components/pages/teacher/TeacherStatisticsPage";

import { E403 } from "./components/pages/errors/E403";
import { E404 } from "./components/pages/errors/E404";

import { TestSessionGuard, RouteGuard } from "./providers/guards/indes";

type RouteMiddleware = {
    name: ComponentType<any>;
    props?: Record<string, unknown>;
};

type RouteNode = {
    path: string;
    index?: boolean;
    component?: ComponentType<any>;
    middleware?: RouteMiddleware[];
    children?: Record<string, RouteNode>;
};

const RouterScheme: Record<string, RouteNode> = {
    index: { path: "/", component: TestsListPage },

    team: { path: "/team", component: OurTeamPage },

    login: { path: "/login", component: LoginPage },
    register: { path: "/register", component: RegisterPage },
    verify: { path: "/verify", component: VerifyPage },

    tests: {
        path: "/tests",
        children: {
            start: { path: ":testId/start", component: TestStartPage },
            results: { path: ":testId/results", component: TestResultsPage },
            view: { path: ":testId", component: TestPage },
        },
    },

    workbench: {
        path: "/workbench",
        children: {
            editTest: {
                path: "test/:testId",
                component: TestEditingPage,
                middleware: [
                    {
                        name: RouteGuard,
                        props: {
                            requiredPermissions: ["create tests", "edit tests"],
                        },
                    },
                ],
            },
        },
    },

    teacher: {
        path: "/teacher",
        component: TeacherLayout,
        middleware: [
            {
                name: RouteGuard,
                props: { requiredPermissions: ["view teacher panel"] },
            },
        ],
        children: {
            cabinet: { path: "", index: true, component: TeacherCabinetPage },
            users: { path: "users", component: TeacherUsersPage },
            testsAccess: {
                path: "tests-access",
                component: TeacherTestsAccessPage,
            },
            statistics: {
                path: "statistics",
                component: TeacherStatisticsPage,
            },
        },
    },

    admin: {
        path: "/admin",
        component: AdminLayout,
        middleware: [
            {
                name: RouteGuard,
                props: { requiredPermissions: ["view admin panel"] },
            },
        ],
        children: {
            cabinet: { path: "", index: true, component: AdminCabinetPage },
            users: { path: "users", component: AdminUsersPage },
            testsAccess: {
                path: "tests-access",
                component: AdminTestsAccessPage,
            },
            audit: { path: "audit", component: AdminAuditPage },
            statistics: { path: "statistics", component: AdminStatisticsPage },
        },
    },

    errors: {
        path: "/errors",
        children: {
            e403: { path: "403", component: E403 },
            e404: { path: "404", component: E404 },
        },
    },

    notFound: { path: "*", component: E404 },
};

export class Router {
    private scheme: Record<string, RouteNode> = RouterScheme;
    private cachedTree: ReactNode[] | null = null;

    build() {
        if (!this.cachedTree) {
            this.cachedTree = this.buildRoutes(this.scheme);
        }

        return (
            <>
                <TestSessionGuard />
                <main className="flex flex-1 w-full px-6 pt-20">
                    <Routes>{this.cachedTree}</Routes>
                </main>
            </>
        );
    }

    private buildRoutes(
        nodes: Record<string, RouteNode>,
        parentPath = "",
    ): ReactNode[] {
        return Object.entries(nodes).flatMap(([key, node]) => {
            const isWildcard = node.path === "*";
            const fullPath = isWildcard
                ? "*"
                : node.index
                  ? parentPath || "/"
                  : this.joinPaths(parentPath, node.path);

            const element = this.createElement(node.component, node.middleware);

            if (isWildcard) {
                return <Route key={key} path="*" element={element} />;
            }

            if (node.index) {
                return <Route key={key} index element={element} />;
            }

            if (node.children) {
                return (
                    <Route key={key} path={fullPath} element={element}>
                        {this.buildRoutes(node.children, fullPath)}
                    </Route>
                );
            }

            return <Route key={key} path={fullPath} element={element} />;
        });
    }

    private createElement(
        Component?: ComponentType<any>,
        middleware?: RouteMiddleware[],
    ) {
        if (!Component) return undefined;

        let element: ReactNode = <Component />;

        if (middleware?.length) {
            element = middleware.reduceRight((child, mw) => {
                const Middleware = mw.name;
                return <Middleware {...mw.props}>{child}</Middleware>;
            }, element);
        }

        return element;
    }

    private joinPaths(parent: string, child: string): string {
        if (!parent) return child.startsWith("/") ? child : `/${child}`;
        if (!child) return parent;

        const normalizedParent = parent.endsWith("/")
            ? parent.slice(0, -1)
            : parent;
        const normalizedChild = child.startsWith("/") ? child.slice(1) : child;

        return `${normalizedParent}/${normalizedChild}`;
    }
}
