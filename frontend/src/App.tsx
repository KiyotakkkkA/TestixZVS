import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { Header } from "./components/layouts";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

import { TestsListPage } from "./pages/test/TestsListPage";
import { TestStartPage } from "./pages/test/TestStartPage";
import { TestPage } from "./pages/test/TestPage";
import { TestResultsPage } from "./pages/test/TestResultsPage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";

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
                <span className="font-semibold">Мы переехали на новый VDS-хостинг! Спасибо что пользуетесь нашим сервисом.</span>
              </div>
            </div>
            <div className="self-start rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide sm:self-auto">
              Поздравляем!
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
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminUsersPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
