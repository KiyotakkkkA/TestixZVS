"use client";

import {
  Alert,
  Button,
  InputSmall,
  Loader,
  Separator,
} from "@kiyotakkkka/zvs-uikit-lib/ui";
import { FormContainer } from "../shared";
import { useToasts } from "@kiyotakkkka/zvs-uikit-lib/hooks";
import { useState } from "react";
import { endpoints } from "@/services/endpoints";
import { useApi } from "@/hooks/useApi";

type PasswordResetRequest = {
  newPassword: string;
  newPasswordConfirmation: string;
};

export const PasswordResetForm = () => {
  const toasts = useToasts();
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [isPasswordMismatch, setIsPasswordMismatch] = useState(false);

  const { execute, loading } = useApi<PasswordResetRequest>(
    endpoints.auth["password-reset"],
    "POST",
    {
      onSuccessFn: () => {
        toasts.success({
          title: "Успех!",
          description: "Пароль успешно сброшен!",
        });
      },
      onErrorFn: (error) => {
        toasts.danger({
          title: "Ошибка!",
          description: error,
        });
      },
    },
  );

  const handlePasswordReset = () => {
    setIsPasswordMismatch(false);

    if (newPassword !== newPasswordConfirmation) {
      setIsPasswordMismatch(true);
      return;
    }

    execute({
      newPassword,
      newPasswordConfirmation,
    });
  };

  return (
    <FormContainer>
      <h1 className="text-2xl font-bold text-center tracking-wide">
        Сброс пароля
      </h1>
      <Separator className="mt-2 mb-4 bg-main-600" />
      {isPasswordMismatch && (
        <Alert variant="danger" className="text-sm mb-4">
          Введённые пароли не совпадают!
        </Alert>
      )}
      <Alert variant="warning" className="text-sm mb-4">
        Действие необратимо! Внимательно проверьте введенные данные перед
        продолжением.
      </Alert>
      <form className="space-y-4">
        <InputSmall
          type="password"
          placeholder="Введите новый пароль..."
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <InputSmall
          type="password"
          placeholder="Подтвердите новый пароль..."
          value={newPasswordConfirmation}
          onChange={(e) => setNewPasswordConfirmation(e.target.value)}
        />
        <Button
          disabled={loading || !newPassword || !newPasswordConfirmation}
          variant={loading ? "secondary" : "primary"}
          className="w-full text-lg p-0.5 font-semibold"
          onClick={handlePasswordReset}
        >
          {loading ? (
            <span className="flex gap-2 items-center">
              <Loader></Loader>
              Сброс пароля...
            </span>
          ) : (
            "Сбросить пароль"
          )}
        </Button>
      </form>
    </FormContainer>
  );
};
