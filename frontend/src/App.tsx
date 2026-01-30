import {
    BrowserRouter,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { useEffect } from "react";

import { Footer, Header } from "./components/layouts";
import { LoginPage } from "./components/pages/LoginPage";
import { RegisterPage } from "./components/pages/RegisterPage";
import { OurTeamPage } from "./components/pages/general/OurTeamPage";

import { TestsListPage } from "./components/pages/test/TestsListPage";
import { TestStartPage } from "./components/pages/test/TestStartPage";
import { TestPage } from "./components/pages/test/TestPage";
import { TestResultsPage } from "./components/pages/test/TestResultsPage";
import { TestEditingPage } from "./components/pages/test/TestEditingPage";

import { AdminLayout } from "./components/pages/admin/AdminLayout";
import { AdminCabinetPage } from "./components/pages/admin/AdminCabinetPage";
import { AdminUsersPage } from "./components/pages/admin/AdminUsersPage";
import { AdminAuditPage } from "./components/pages/admin/AdminAuditPage";
import { AdminStatisticsPage } from "./components/pages/admin/AdminStatisticsPage";
import { AdminTestsAccessPage } from "./components/pages/admin/AdminTestsAccessPage";

import { E403 } from "./components/pages/errors/E403";
import { E404 } from "./components/pages/errors/E404";
import { RouteGuard } from "./providers/RouteGuard";

import { StorageService } from "./services/storage";
import { authStore } from "./stores/authStore";

const TestSessionGuard = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const session = StorageService.getSession();
        if (!session) return;

        const targetPath = `/tests/${session.testId}`;
        if (location.pathname.startsWith(targetPath)) return;

        navigate(targetPath, { replace: true });
    }, [location.pathname, navigate]);

    return null;
};

function App() {
    useEffect(() => {
        authStore.init();
    }, []);

    return (
        <BrowserRouter>
            <div className="min-h-screen overflow-auto bg-slate-100 flex flex-col">
                <TestSessionGuard />
                <Header />
                <main className="flex flex-1 w-full px-6 pt-20">
                    <Routes>
                        <Route path="/" element={<TestsListPage />} />
                        <Route path="/team" element={<OurTeamPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        <Route
                            path="/tests/:testId/start"
                            element={<TestStartPage />}
                        />
                        <Route
                            path="/tests/:testId/results"
                            element={<TestResultsPage />}
                        />
                        <Route path="/tests/:testId" element={<TestPage />} />
                        <Route
                            path="/workbench/test/:testId"
                            element={
                                <RouteGuard
                                    requiredPermissions={[
                                        "create tests",
                                        "edit tests",
                                    ]}
                                >
                                    <TestEditingPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <RouteGuard
                                    requiredPermissions={["view admin panel"]}
                                >
                                    <AdminLayout />
                                </RouteGuard>
                            }
                        >
                            <Route index element={<AdminCabinetPage />} />
                            <Route path="users" element={<AdminUsersPage />} />
                            <Route
                                path="tests-access"
                                element={<AdminTestsAccessPage />}
                            />
                            <Route path="audit" element={<AdminAuditPage />} />
                            <Route
                                path="statistics"
                                element={<AdminStatisticsPage />}
                            />
                        </Route>
                        <Route path="/errors/403" element={<E403 />} />
                        <Route path="/errors/404" element={<E404 />} />
                        <Route path="*" element={<E404 />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;
