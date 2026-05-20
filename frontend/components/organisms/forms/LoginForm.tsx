"use client";

import {
  Button,
  InputCheckBox,
  InputSmall,
  Loader,
  Separator,
} from "@kiyotakkkka/zvs-uikit-lib/ui";
import { FormContainer } from "../shared";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useToasts } from "@kiyotakkkka/zvs-uikit-lib/hooks";
import { authStore, type LoginResponse } from "@/stores";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { endpoints } from "@/services/endpoints";

type LoginRequest = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export const LoginForm = () => {
  const toasts = useToasts();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRememberMe, setIsRememberMe] = useState(false);
  const [isPassRememberShowing, setIsPassRememberShowing] = useState(true);

  const { execute, loading } = useApi<LoginResponse, LoginRequest>(
    endpoints.auth.login,
    "POST",
    {
      onSuccessFn: (data) => {
        authStore.login(data, isRememberMe ? "local" : "session");
        toasts.success({
          title: "Успех!",
          description: "Вы успешно вошли!",
        });
        router.push("/");
      },
      onErrorFn: (error) => {
        toasts.danger({
          title: "Ошибка!",
          description: error,
        });
        setIsPassRememberShowing(true);
      },
    },
  );

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await execute({
      email,
      password,
      rememberMe: isRememberMe,
    });
  };

  return (
    <FormContainer>
      <h1 className="text-2xl font-bold text-center tracking-wide">Вход</h1>
      <Separator className="mt-2 mb-4 bg-main-600" />
      <form className="space-y-4" onSubmit={handleLogin}>
        <InputSmall
          type="email"
          placeholder="Введите email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputSmall
          type="password"
          placeholder="Введите пароль..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
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
          disabled={loading}
          variant={loading ? "secondary" : "primary"}
          className="w-full text-lg p-0.5 font-semibold"
          type="submit"
        >
          {loading ? (
            <span className="flex gap-2 items-center">
              <Loader></Loader>
              Вход...
            </span>
          ) : (
            "Войти"
          )}
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
