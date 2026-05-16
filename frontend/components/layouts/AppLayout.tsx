"use client";

import { ToastProvider } from "@kiyotakkkka/zvs-uikit-lib/providers";
import { Header } from "./Header";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider>
      <Header />
      {children}
    </ToastProvider>
  );
};
