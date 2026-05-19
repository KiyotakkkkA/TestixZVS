"use client";

import { Alert, Loader, Separator } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { FormContainer } from "../shared";
import { useState } from "react";
import Link from "next/link";
import { endpoints } from "@/services/endpoints";
import { useApi } from "@/hooks/useApi";
import { useSearchParams } from "next/navigation";

export const EmailConfirmationForm = () => {
  const [isActivationSucceed, setIsActivationSucceed] = useState(false);
  const [isActivatonErrorMessage, setIsActivationErrorMessage] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { loading } = useApi(
    `${endpoints.auth["email-confirmation"]}?token=${token}`,
    "GET",
    {
      immediate: true,
      onSuccessFn: () => {
        setIsActivationSucceed(true);
      },
      onErrorFn: (error) => {
        setIsActivationSucceed(false);
        setIsActivationErrorMessage(error);
      },
    },
  );

  return (
    <FormContainer>
      {loading && (
        <span className="flex gap-2 items-center justify-center">
          <Loader />
          Активация учётной записи...
        </span>
      )}
      {!loading && isActivatonErrorMessage && (
        <Alert variant="danger">{isActivatonErrorMessage}</Alert>
      )}
      {!loading && isActivationSucceed && (
        <Alert variant="success">
          Ваша учётная запись успешно активирована! Теперь вы можете войти в
          систему.
        </Alert>
      )}
      {isActivationSucceed && (
        <>
          <Separator className="my-3" />
          <div className="flex justify-end">
            <Link
              className="text-sm text-main-300 hover:bg-main-700 py-1 px-2 rounded transition-colors"
              href="/login"
            >
              На страницу входа
            </Link>
          </div>
        </>
      )}
    </FormContainer>
  );
};
