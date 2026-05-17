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
import Link from "next/link";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { endpoints } from "@/services/endpoints";

type RegisterRequest = {
  email: string;
  password: string;
  passwordConfirmation: string;
};

export const RegisterForm = () => {
  const toasts = useToasts();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isPasswordMismatch, setIsPasswordMismatch] = useState(false);

  const { execute, loading } = useApi<RegisterRequest>(
    endpoints.auth.register,
    "POST",
    {
      onSuccessFn: () => {
        toasts.success({
          title: "Успех!",
          description: "Вы успешно зарегистрировались!",
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

  const handleRegister = async () => {
    setIsPasswordMismatch(false);

    if (password !== passwordConfirmation) {
      setIsPasswordMismatch(true);
      return;
    }

    const res = await execute({
      email,
      password,
      passwordConfirmation,
    });

    if (!res.ok) return;

    console.log("Registration successful:", res.data);
  };

  return (
    <FormContainer>
      <h1 className="text-2xl font-bold text-center tracking-wide">
        Регистрация
      </h1>
      <Separator className="mt-2 mb-4 bg-main-600" />
      {isPasswordMismatch && (
        <Alert variant="danger" className="text-sm mb-4">
          Введённые пароли не совпадают!
        </Alert>
      )}
      <form className="space-y-4">
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
        <InputSmall
          type="password"
          placeholder="Повторите пароль..."
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
        />
        <Button
          disabled={loading || !email || !password || !passwordConfirmation}
          variant={loading ? "secondary" : "primary"}
          className="w-full text-lg p-0.5 font-semibold"
          onClick={handleRegister}
        >
          {loading ? (
            <span className="flex gap-2 items-center">
              <Loader></Loader>
              Регистрация...
            </span>
          ) : (
            "Зарегистрироваться"
          )}
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
