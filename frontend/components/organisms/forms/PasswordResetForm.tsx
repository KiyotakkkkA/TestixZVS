"use client";

import {
  Alert,
  Button,
  InputSmall,
  Separator,
} from "@kiyotakkkka/zvs-uikit-lib/ui";
import { FormContainer } from "../shared";
import { useToasts } from "@kiyotakkkka/zvs-uikit-lib/hooks";

export const PasswordResetForm = () => {
  const toasts = useToasts();

  const handlePasswordReset = () => {
    toasts.success({
      title: "Успех!",
      description: "Пароль успешно сброшен!",
    });
  };

  return (
    <FormContainer>
      <h1 className="text-2xl font-bold text-center tracking-wide">
        Сброс пароля
      </h1>
      <Separator className="mt-2 mb-4 bg-main-600" />
      <Alert variant="warning" className="text-sm mb-4">
        Действие необратимо! Внимательно проверьте введенные данные перед
        продолжением.
      </Alert>
      <form className="space-y-4">
        <InputSmall type="password" placeholder="Введите пароль..." />
        <InputSmall type="password" placeholder="Введите новый пароль..." />
        <Button
          variant="primary"
          className="w-full text-lg p-0.5 font-semibold"
          onClick={handlePasswordReset}
        >
          Продолжить
        </Button>
      </form>
    </FormContainer>
  );
};
