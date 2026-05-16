"use client";

import {
  Button,
  InputCheckBox,
  InputSmall,
  Separator,
} from "@kiyotakkkka/zvs-uikit-lib/ui";
import { FormContainer } from "../shared";
import { useState } from "react";
import Link from "next/link";
import { useToasts } from "@kiyotakkkka/zvs-uikit-lib/hooks";

export const LoginForm = () => {
  const toasts = useToasts();
  const [isRememberMe, setIsRememberMe] = useState(false);
  const [isPassRememberShowing, setIsPassRememberShowing] = useState(true);

  const handleRegister = () => {
    toasts.success({
      title: "Успех!",
      description: "Вы успешно вошли!",
    });
  };

  return (
    <FormContainer>
      <h1 className="text-2xl font-bold text-center tracking-wide">Вход</h1>
      <Separator className="mt-2 mb-4 bg-main-600" />
      <form className="space-y-4">
        <InputSmall type="email" placeholder="Введите email..." />
        <InputSmall type="password" placeholder="Введите пароль..." />
        <div className="flex justify-between items-center">
          <span className="flex">
            <InputCheckBox checked={isRememberMe} onChange={setIsRememberMe} />
            <span className="ml-2 text-sm text-main-200">Запомнить меня</span>
          </span>
          {isPassRememberShowing && (
            <Link
              href={"/password-recovery"}
              className="text-sm text-main-300 hover:underline cursor-pointer"
            >
              Забыли пароль?
            </Link>
          )}
        </div>
        <Button
          variant="primary"
          className="w-full text-lg p-0.5 font-semibold"
          onClick={handleRegister}
        >
          Продолжить
        </Button>
        <span className="text-sm text-center block">
          <span className="text-main-400">Впервые здесь? </span>
          <Link
            href={"/register"}
            className="text-main-300 font-bold hover:underline"
          >
            Зарегистрироваться
          </Link>
        </span>
      </form>
    </FormContainer>
  );
};
