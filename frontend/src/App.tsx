import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { Header } from "./components/layouts";
import { LoginPage } from "./components/pages/LoginPage";
import { RegisterPage } from "./components/pages/RegisterPage";

import { TestsListPage } from "./components/pages/test/TestsListPage";
import { TestStartPage } from "./components/pages/test/TestStartPage";
import { TestPage } from "./components/pages/test/TestPage";
import { TestResultsPage } from "./components/pages/test/TestResultsPage";
import { TestCreatingPage } from "./components/pages/test/TestCreatingPage";

import { AdminLayout } from "./components/pages/admin/AdminLayout";
import { AdminUsersPage } from "./components/pages/admin/AdminUsersPage";
import { AdminAuditPage } from "./components/pages/admin/AdminAuditPage";

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
        <div className="w-full border-b border-indigo-200/70 bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 text-sm text-white sm:flex-row sm:items-center sm:justify-between md:px-8">
            <div className="flex items-start gap-2 sm:items-center">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-base">🚀</span>
              <div className="flex flex-col">
                <span className="font-semibold">Мы обновились! Спасибо что пользуетесь нашим сервисом.</span>
              </div>
            </div>
            <div className="self-start rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide sm:self-auto">
              ❤️ Спасибо! ❤️
            </div>
          </div>
        </div>
        <Header />
        <main className="flex flex-1 w-full p-6">
          <Routes>
            <Route path="/" element={<TestsListPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/tests/:testId/start" element={<TestStartPage />} />
            <Route path="/tests/:testId/results" element={<TestResultsPage />} />
            <Route path="/tests/:testId" element={<TestPage />} />
            <Route
              path="/workbench/test"
              element={
                <RouteGuard requiredPermissions={["create tests"]}>
                  <TestCreatingPage />
                </RouteGuard>
              }
            />
            <Route
              path="/admin"
              element={
                <RouteGuard requiredPermissions={["view admin panel"]}>
                  <AdminLayout />
                </RouteGuard>
              }
            >
              <Route index element={<AdminUsersPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="audit" element={<AdminAuditPage />} />
            </Route>
            <Route path="/errors/403" element={<E403 />} />
            <Route path="/errors/404" element={<E404 />} />
            <Route path="*" element={<E404 />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
