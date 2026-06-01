"use client";

import {
  Alert,
  Button,
  InputSmall,
  Loader,
} from "@kiyotakkkka/zvs-uikit-lib/ui";
import { FormContainer } from "../shared";
import { useToasts } from "@kiyotakkkka/zvs-uikit-lib/hooks";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { endpoints } from "@/services/endpoints";
import type { AdminUser } from "@/stores";

type AdminUsersAddingRequest = {
  email: string;
  password: string;
  passwordConfirmation: string;
};

type AdminUsersAddingFormProps = {
  onCancel?: () => void;
  onCreated?: () => void;
};

export const AdminUsersAddingForm = ({
  onCancel,
  onCreated,
}: AdminUsersAddingFormProps) => {
  const toasts = useToasts();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isPasswordMismatch, setIsPasswordMismatch] = useState(false);

  const { execute, loading } = useApi<AdminUser, AdminUsersAddingRequest>(
    endpoints.admin.users.create,
    "POST",
    {
      immediate: false,
      onSuccessFn: () => {
        setEmail("");
        setPassword("");
        setPasswordConfirmation("");
        toasts.success({
          title: "Успех!",
          description: "Пользователь создан.",
        });
        onCreated?.();
      },
      onErrorFn: (error) => {
        toasts.danger({
          title: "Ошибка!",
          description: error,
        });
      },
    },
  );

  const registerUser = async () => {
    setIsPasswordMismatch(false);

    if (password !== passwordConfirmation) {
      setIsPasswordMismatch(true);
      return;
    }

    await execute({
      email,
      password,
      passwordConfirmation,
    });
  };

  return (
    <FormContainer className="w-full max-w-none bg-transparent p-0!">
      {isPasswordMismatch && (
        <Alert variant="danger" className="mb-4 text-sm">
          Пароли не совпадают. Проверьте повтор пароля.
        </Alert>
      )}

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-main-300">
            Email
          </span>
          <InputSmall
            type="email"
            placeholder="user@example.com"
            value={email}
            required
            autoComplete="email"
            classNames={{ wrapper: "w-full" }}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-main-300">
            Пароль
          </span>
          <InputSmall
            type="password"
            placeholder="Введите пароль"
            value={password}
            required
            minLength={8}
            autoComplete="new-password"
            classNames={{ wrapper: "w-full" }}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-main-300">
            Повтор пароля
          </span>
          <InputSmall
            type="password"
            placeholder="Повторите пароль"
            value={passwordConfirmation}
            required
            minLength={8}
            autoComplete="new-password"
            classNames={{ wrapper: "w-full" }}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
          />
        </label>
      </div>

      <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="justify-center px-4 py-2"
        >
          Отмена
        </Button>
        <Button
          disabled={loading}
          onClick={registerUser}
          variant={loading ? "secondary" : "primary"}
          className="justify-center gap-2 px-4 py-2 font-semibold"
        >
          {loading ? (
            <>
              <Loader />
              Создание...
            </>
          ) : (
            <>
              <Icon icon="mdi:check" width={18} height={18} />
              Создать пользователя
            </>
          )}
        </Button>
      </div>
    </FormContainer>
  );
};
