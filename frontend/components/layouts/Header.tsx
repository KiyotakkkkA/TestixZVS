"use client";

import { Button, Separator, SlidedPanel } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import { authStore, type AuthUser } from "@/stores";

const LinksForSlidedMenu = [
  {
    href: "/register",
    icon: "mdi:account-plus",
    label: "Зарегистрироваться",
  },
  {
    href: "/login",
    icon: "mdi:account",
    label: "Войти",
  },
];

type UserBadgeProps = {
  user: AuthUser;
};

const UserBadge = ({ user }: UserBadgeProps) => {
  return (
    <div className="flex items-center gap-3 rounded-lg0 bg-main-900/40 px-3 py-2 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-main-700 text-main-100 ring-1 ring-main-500/50">
        <Icon icon="mdi:account" width={24} height={24} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-main-50">
          {user.name}
        </p>
        <p className="truncate text-xs text-main-300">{user.email}</p>
      </div>
    </div>
  );
};

export const Header = observer(() => {
  const [isSlidedMenuOpen, setIsSlidedMenuOpen] = useState(false);
  const isAuthenticated = authStore.isAuthenticated;

  const handleLogout = async () => {
    await authStore.logout();
    setIsSlidedMenuOpen(false);
  };

  return (
    <>
      <header className="flex items-center justify-between lg:justify-around px-4 py-2">
        <div>
          <Image src={"/images/logo.svg"} width={42} height={42} alt="Logo" />
        </div>
        {!isAuthenticated && (
          <div className="hidden sm:flex sm:gap-2 sm:items-center">
            <Link
              href={"/register"}
              className="relative after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-full after:-translate-x-1/2 after:scale-x-0 after:bg-current after:transition-transform after:duration-200 after:content-[''] hover:after:scale-x-100"
            >
              Зарегистрироваться
            </Link>
            <Button variant="primary" className="p-1">
              <Link href={"/login"} className="w-full h-full">
                Войти
              </Link>
            </Button>
          </div>
        )}
        <Button
          className={`p-1 ${isAuthenticated ? "block" : "block sm:hidden"}`}
          onClick={() => setIsSlidedMenuOpen(true)}
        >
          <Icon icon={"mdi:menu"} width={24} height={24} />
        </Button>
      </header>
      <SlidedPanel
        open={isSlidedMenuOpen}
        onClose={() => setIsSlidedMenuOpen(false)}
        className="max-w-[65%]"
      >
        <SlidedPanel.Header>Навигация</SlidedPanel.Header>
        <SlidedPanel.Content>
          <nav className="flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                {authStore.user && <UserBadge user={authStore.user} />}
                <Separator className="my-2" />
                <Button
                  className="gap-2 justify-start py-1 px-3 bg-transparent hover:text-red-300 hover:bg-red-100/10"
                  onClick={handleLogout}
                >
                  <Icon icon="mdi:logout" width={20} height={20} />
                  Выйти
                </Button>
              </>
            ) : (
              LinksForSlidedMenu.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-md font-medium px-4 py-2 rounded hover:bg-main-800 transition-colors flex items-center gap-2 cursor-pointer"
                  onClick={() => setIsSlidedMenuOpen(false)}
                >
                  <Icon icon={link.icon} width={20} height={20} />
                  {link.label}
                </Link>
              ))
            )}
          </nav>
        </SlidedPanel.Content>
      </SlidedPanel>
    </>
  );
});
