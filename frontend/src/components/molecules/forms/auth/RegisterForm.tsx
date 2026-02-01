import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { observer } from "mobx-react-lite";

import { Button, InputSmall, Spinner } from "../../../atoms";
import { useToasts } from "../../../../hooks/useToasts";
import { authStore } from "../../../../stores/authStore";

import type React from "react";

const registerSchema = z
    .object({
        name: z.string().min(2, "Введите имя"),
        email: z.string().email("Введите корректный email"),
        password: z.string().min(8, "Пароль должен быть минимум 8 символов"),
        confirmPassword: z.string().min(8, "Повторите пароль"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Пароли не совпадают",
        path: ["confirmPassword"],
    });

export type RegisterFormPayload = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type RegisterFormProps = {
    onSubmit?: (payload: RegisterFormPayload) => Promise<boolean | void>;
    onSuccess?: () => void;
    submitLabel?: string;
    title?: string;
    subtitle?: string;
    className?: string;
    extraContent?: React.ReactNode;
    isLoading?: boolean;
};

export const RegisterForm = observer(
    ({
        onSubmit,
        onSuccess,
        submitLabel = "Регистрация",
        title,
        subtitle,
        className,
        extraContent,
        isLoading,
    }: RegisterFormProps) => {
        const navigate = useNavigate();
        const { toast } = useToasts();
        const [name, setName] = useState("");
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");
        const [errors, setErrors] = useState<{
            name?: string;
            email?: string;
            password?: string;
            confirmPassword?: string;
        }>({});
        const [formError, setFormError] = useState<string | null>(null);
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleSubmit = async (event?: React.FormEvent) => {
            event?.preventDefault();
            setFormError(null);

            const parsed = registerSchema.safeParse({
                name,
                email,
                password,
                confirmPassword,
            });
            if (!parsed.success) {
                const nextErrors: {
                    name?: string;
                    email?: string;
                    password?: string;
                    confirmPassword?: string;
                } = {};
                parsed.error.issues.forEach((issue) => {
                    const key = issue.path[0] as
                        | "name"
                        | "email"
                        | "password"
                        | "confirmPassword";
                    nextErrors[key] = issue.message;
                });
                setErrors(nextErrors);
                return;
            }

            setErrors({});
            const payload = { name, email, password, confirmPassword };

            if (onSubmit) {
                try {
                    setIsSubmitting(true);
                    const result = await onSubmit(payload);
                    if (result === false) {
                        setFormError("Не удалось зарегистрироваться");
                        toast.danger("Не удалось выполнить действие");
                        return;
                    }
                    onSuccess?.();
                } catch (error: any) {
                    setFormError(
                        error?.message ?? "Не удалось зарегистрироваться",
                    );
                    toast.danger(
                        error?.message ?? "Не удалось выполнить действие",
                    );
                } finally {
                    setIsSubmitting(false);
                }
                return;
            }

            const response = await authStore.register({
                name,
                email,
                password,
                password_confirmation: confirmPassword,
            });
            if (response) {
                navigate(`/verify?token=${response}`, { replace: true });
                return;
            }
            const message = authStore.error ?? "Не удалось зарегистрироваться";
            setFormError(message);
            toast.danger(message);
        };

        const busy =
            typeof isLoading === "boolean"
                ? isLoading
                : onSubmit
                  ? isSubmitting
                  : authStore.isLoading;

        return (
            <form
                className={
                    className ??
                    "w-full max-w-md bg-slate-50 p-6 shadow-lg rounded-lg"
                }
                onSubmit={handleSubmit}
            >
                {(title || subtitle) && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-slate-800">
                            {title}
                        </h2>
                        <p className="text-sm text-slate-500">{subtitle}</p>
                    </div>
                )}
                <div className="flex flex-col gap-4">
                    <div>
                        {errors.name && (
                            <span className="text-xs text-rose-600">
                                {errors.name}
                            </span>
                        )}
                        <InputSmall
                            name="name"
                            type="text"
                            placeholder="Имя пользователя"
                            leftIcon="mdi:account-outline"
                            autoComplete="name"
                            className="py-2 text-sm border-slate-200 bg-slate-50/80 shadow-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        {errors.email && (
                            <span className="text-xs text-rose-600">
                                {errors.email}
                            </span>
                        )}
                        <InputSmall
                            name="email"
                            type="email"
                            placeholder="Email"
                            leftIcon="mdi:email-outline"
                            autoComplete="email"
                            className="py-2 text-sm border-slate-200 bg-slate-50/80 shadow-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        {errors.password && (
                            <span className="text-xs text-rose-600">
                                {errors.password}
                            </span>
                        )}
                        <InputSmall
                            name="password"
                            type="password"
                            placeholder="Придумайте пароль"
                            leftIcon="mdi:lock-outline"
                            autoComplete="new-password"
                            className="py-2 text-sm border-slate-200 bg-slate-50/80 shadow-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        {errors.confirmPassword && (
                            <span className="text-xs text-rose-600">
                                {errors.confirmPassword}
                            </span>
                        )}
                        <InputSmall
                            name="confirmPassword"
                            type="password"
                            placeholder="Повторите пароль"
                            leftIcon="mdi:lock-outline"
                            autoComplete="new-password"
                            className="py-2 text-sm border-slate-200 bg-slate-50/80 shadow-sm"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <Link
                        to="/login"
                        className="mt-1 block text-sm text-indigo-600 hover:underline self-end"
                    >
                        Уже есть аккаунт?
                    </Link>
                </div>
                {extraContent}
                {formError && (
                    <div className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
                        {formError}
                    </div>
                )}
                <div className="mt-6 flex items-center justify-between">
                    <Button
                        primary
                        className="flex-1 px-5 py-2 text-sm font-medium"
                        type="submit"
                        disabled={busy}
                    >
                        <span className="inline-flex items-center justify-center gap-2">
                            {busy && <Spinner className="h-4 w-4" />}
                            {submitLabel}
                        </span>
                    </Button>
                </div>
            </form>
        );
    },
);
