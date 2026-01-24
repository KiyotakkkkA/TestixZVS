import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { observer } from "mobx-react-lite";

import { Button, InputCheckbox, InputSmall, Spinner } from "../../atoms";
import { useToasts } from "../../../hooks/useToasts";
import { authStore } from "../../../stores/authStore";

const loginSchema = z.object({
    email: z.string().email('Введите корректный email'),
    password: z.string().min(8, 'Пароль должен быть минимум 8 символов'),
    rememberMe: z.boolean().optional(),
});

export const LoginForm = observer(() => {
    const navigate = useNavigate();
    const { toast } = useToasts();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        const parsed = loginSchema.safeParse({ email, password, rememberMe });
        if (!parsed.success) {
            const nextErrors: { email?: string; password?: string } = {};
            parsed.error.issues.forEach((issue) => {
                const key = issue.path[0] as 'email' | 'password';
                nextErrors[key] = issue.message;
            });
            setErrors(nextErrors);
            return;
        }

        setErrors({});
        const ok = await authStore.login({
            email,
            password,
            rememberMe,
        });
        if (ok) {
            toast.success('Вы вошли в систему');
            navigate('/', { replace: true });
            return;
        }
        const message = authStore.error ?? 'Не удалось войти';
        setFormError(message);
        toast.danger(message);
    };

    return (
        <form className="w-full max-w-md bg-white p-6 shadow-lg rounded-lg" onSubmit={handleSubmit}>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-800">С возвращением</h2>
                <p className="text-sm text-slate-500">Войдите в аккаунт, чтобы продолжить.</p>
            </div>
            <div className="flex flex-col gap-4">
                <div>
                    {errors.email && (
                        <span className="text-xs text-rose-600">{errors.email}</span>
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
                        <span className="text-xs text-rose-600">{errors.password}</span>
                    )}
                    <InputSmall
                        name="password"
                        type="password"
                        placeholder="Введите пароль"
                        leftIcon="mdi:lock-outline"
                        autoComplete="current-password"
                        className="py-2 text-sm border-slate-200 bg-slate-50/80 shadow-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="flex items-center">
                    <InputCheckbox
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label className="ml-2 text-sm text-slate-500">Запомнить меня</label>
                </div>
            </div>
            {formError && (
                <div className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    {formError}
                </div>
            )}
            <div className="mt-6 flex items-center justify-between">
                <Button primary className="flex-1 px-5 py-2 text-sm font-medium flex items-center justify-center" type="submit" disabled={authStore.isLoading}>
                    { authStore.isLoading && <Spinner className="h-4 w-4 mr-2" /> }
                    Войти
                </Button>
            </div>
        </form>
    );
});
