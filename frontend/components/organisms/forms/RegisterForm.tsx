"use client";

import { Button, InputSmall, Separator } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { FormContainer } from "../shared";
import { useToasts } from "@kiyotakkkka/zvs-uikit-lib/hooks";
import Link from "next/link";

export const RegisterForm = () => {
  const toasts = useToasts();

  const handleRegister = () => {
    toasts.success({
      title: "Успех!",
      description: "Вы успешно зарегистрировались!",
    });
  };

  return (
    <FormContainer>
      <h1 className="text-2xl font-bold text-center tracking-wide">
        Регистрация
      </h1>
      <Separator className="mt-2 mb-4 bg-main-600" />
      <form className="space-y-4">
        <InputSmall type="email" placeholder="Введите email..." />
        <InputSmall type="password" placeholder="Введите пароль..." />
        <InputSmall type="password" placeholder="Повторите пароль..." />
        <Button
          variant="primary"
          className="w-full text-lg p-0.5 font-semibold"
          onClick={handleRegister}
        >
          Продолжить
        </Button>
        <span className="text-sm text-center block">
          <span className="text-main-400">Уже есть аккаунт? </span>
          <Link
            href={"/login"}
            className="text-main-300 font-bold hover:underline"
          >
            Войти
          </Link>
        </span>
      </form>
    </FormContainer>
  );
};
