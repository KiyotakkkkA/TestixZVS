"use client";

import { Button, InputSmall, Separator } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { FormContainer } from "../shared";
import { useToasts } from "@kiyotakkkka/zvs-uikit-lib/hooks";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useApi } from "@/hooks/useApi";
import { endpoints } from "@/services/endpoints";

const LAST_CODE_SENDED_AT_KEY = "ZVS.LAST_CODE_SENDED_AT";
const CODE_RESEND_INTERVAL_SECONDS = 60;

const getSecondsToNextSend = () => {
  const lastSendedAt = localStorage.getItem(LAST_CODE_SENDED_AT_KEY);

  if (!lastSendedAt) {
    return 0;
  }

  const secondsPassed = Math.floor((Date.now() - Number(lastSendedAt)) / 1000);
  const secondsLeft = CODE_RESEND_INTERVAL_SECONDS - secondsPassed;

  return secondsLeft > 0 ? secondsLeft : 0;
};

export const PasswordRecoveryForm = () => {
  const toasts = useToasts();
  const [email, setEmail] = useState("");
  const [toNextSendSeconds, setToNextSendSeconds] = useState(0);

  useEffect(() => {
    const updateSecondsToNextSend = () => {
      setToNextSendSeconds(getSecondsToNextSend());
    };

    const timeout = setTimeout(updateSecondsToNextSend, 0);
    const interval = setInterval(updateSecondsToNextSend, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const { execute, loading } = useApi(
    `${endpoints.auth["password-recovery"]}?email=${email}`,
    "GET",
    {
      immediate: false,
      onSuccessFn: () => {
        handlePasswordRecovery();
      },
      onErrorFn: (error) => {
        toasts.danger({
          title: "Ошибка!",
          description: error,
        });
      },
    },
  );

  const handlePasswordRecovery = () => {
    const now = Date.now();

    localStorage.setItem(LAST_CODE_SENDED_AT_KEY, now.toString());
    setToNextSendSeconds(CODE_RESEND_INTERVAL_SECONDS);
    toasts.success({
      title: "Проверьте почту!",
      description:
        "Ссылка для восстановления пароля была отправлена на ваш email.",
    });
  };

  return (
    <FormContainer>
      <h1 className="text-2xl font-bold text-center tracking-wide">
        Восстановление пароля
      </h1>
      <Separator className="mt-2 mb-4 bg-main-600" />
      <form className="space-y-4">
        <InputSmall
          type="email"
          placeholder="Введите email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          disabled={toNextSendSeconds > 0 || loading || !email}
          variant={toNextSendSeconds > 0 || loading ? "secondary" : "primary"}
          className="w-full text-md p-1 font-semibold"
          onClick={() => {
            execute();
          }}
        >
          <Icon icon="mdi:mail" className="w-5 h-5 mr-2" />
          {toNextSendSeconds > 0
            ? `Отправить код (${toNextSendSeconds} сек.)`
            : loading
              ? "Отправка..."
              : "Отправить код"}
        </Button>
      </form>
    </FormContainer>
  );
};
