"use client";

import { PropsWithChildren, useEffect } from "react";
import { authStore } from "./AuthStore";
import { observer } from "mobx-react-lite";
import { Loader } from "@kiyotakkkka/zvs-uikit-lib/ui";

export const StoreProvider = observer(function StoreProvider({
  children,
}: PropsWithChildren) {
  useEffect(() => {
    void authStore.bootstrap();
  }, []);

  if (!authStore.isBootstrapped) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-main-950 text-main-100">
        <div className="flex items-center gap-3 rounded-lg border border-main-700/70 bg-main-900/60 px-4 py-3 shadow-sm">
          <Loader />
          <span className="text-sm font-medium">Загрузка...</span>
        </div>
      </div>
    );
  }

  return children;
});
