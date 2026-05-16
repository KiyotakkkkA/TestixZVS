"use client";

import { Button, SlidedPanel } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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

export const Header = () => {
  const [isSlidedMenuOpen, setIsSlidedMenuOpen] = useState(false);
  return (
    <>
      <header className="flex items-center justify-between lg:justify-around px-4 py-2">
        <div>
          <Image src={"/images/logo.svg"} width={42} height={42} alt="Logo" />
        </div>
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
        <Button
          className="p-1 block sm:hidden"
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
            {LinksForSlidedMenu.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-md font-medium px-4 py-2 rounded hover:bg-main-800 transition-colors flex items-center gap-2"
                onClick={() => setIsSlidedMenuOpen(false)}
              >
                <Icon icon={link.icon} width={20} height={20} />
                {link.label}
              </Link>
            ))}
          </nav>
        </SlidedPanel.Content>
      </SlidedPanel>
    </>
  );
};
