"use client";

import { Button } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

export const Header = () => {
  return (
    <header className="flex items-center justify-between lg:justify-around px-4 py-2">
      <div>
        <Image src={"/images/logo.svg"} width={42} height={42} alt="Logo" />
      </div>
      <div className="hidden sm:flex sm:gap-2 sm:items-center">
        <Button
          variant="ghost"
          className="p-1 relative after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-full after:-translate-x-1/2 after:scale-x-0 after:bg-current after:transition-transform after:duration-200 after:content-[''] hover:after:scale-x-100"
        >
          <Link href={"/register"} className="w-full h-full">
            Зарегистрироваться
          </Link>
        </Button>
        <Button variant="primary" className="p-1">
          <Link href={"/login"} className="w-full h-full">
            Войти
          </Link>
        </Button>
      </div>
      <Button className="p-1 block sm:hidden">
        <Icon icon={"mdi:menu"} width={24} height={24} />
      </Button>
    </header>
  );
};
