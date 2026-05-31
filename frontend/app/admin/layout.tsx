"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";

const navList = [
  {
    name: "Пользователи",
    href: "/admin/users",
    icon: "mdi:account-group",
  },
  {
    name: "Журнал аудита",
    href: "/admin/audit",
    icon: "mdi:clipboard-text-clock",
  },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex w-full max-w-9/12 flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-start lg:gap-6 lg:py-7">
      <aside className="lg:sticky lg:top-20 lg:w-56 lg:shrink-0">
        <nav className="rounded-md bg-main-800/70 p-3 backdrop-blur-md">
          <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-col">
            {navList.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  href={item.href}
                  key={item.name}
                  className={`group flex min-w-0 items-center justify-center gap-2 rounded p-1 transition-colors sm:justify-start sm:px-2.5 lg:gap-2.5 ${
                    isActive
                      ? "bg-main-50/95 text-main-900"
                      : "text-main-300 hover:bg-white/7 hover:text-main-50"
                  }`}
                >
                  <span
                    className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded transition-colors min-[380px]:flex ${
                      isActive
                        ? "text-main-900"
                        : "text-main-400 group-hover:text-main-50"
                    }`}
                  >
                    <Icon icon={item.icon} width={19} height={19} />
                  </span>
                  <span className="min-w-0 text-center sm:text-left">
                    <span className="block truncate text-xs font-semibold min-[380px]:text-sm">
                      {item.name}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
