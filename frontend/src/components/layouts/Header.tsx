import { memo, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import { Button, SlidedPanel } from "../atoms"
import { authStore } from "../../stores/authStore";
import { useToasts } from "../../hooks/useToasts";


const RightPart = observer(() => {
    const { toast } = useToasts();
    const navigate = useNavigate();


    if (authStore.isAuthorized) {
        return (
            <div className="hidden items-center gap-4 md:flex">
                <span className="text-sm text-slate-600">
                    {authStore.user?.name ?? 'Пользователь'}
                </span>
                { authStore.hasPermission('view admin panel') && (
                    <Button to="/admin" secondary className="py-2 px-3">Админ-панель</Button>
                )}
                <Button danger onClick={async () => {
                    await authStore.logout();
                    toast.info('Вы вышли из аккаунта');
                    navigate("/");
                }} className="py-2 px-3">
                    Выйти
                </Button>
            </div>
        );
    }

    return (
        <div className="hidden gap-4 md:flex">
            <Button to="/login" secondaryNoBorder className="py-2 px-3">Войти</Button>
            <Button to="/register" primary className="py-2 px-3">Регистрация</Button>
        </div>
    )
});

const LeftPart = memo(() => {

    const navigate = useNavigate();

    return (
        <div className="flex items-center gap-3">
            <div
                className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 cursor-pointer select-none"
                onClick={() => navigate("/")}
            >
                Testix
            </div>
        </div>
    )
})

const MobileNav = observer(({ onClose }: { onClose: () => void }) => {
    const { toast } = useToasts();
    const navigate = useNavigate();
    
    return (
        <nav className="flex flex-col gap-3">
            {authStore.isAuthorized ? (
                <div className="flex flex-col gap-4">
                    { authStore.hasPermission('view admin panel') && (
                        <Button secondary to="/admin" className="py-2 px-3 text-center" onClick={onClose}>Админ-панель</Button>
                    )}
                    <Button
                        onClick={async () => {
                            await authStore.logout();
                            toast.info('Вы вышли из аккаунта');
                            onClose();
                            navigate("/");
                        }}
                        danger
                        className="py-2 px-3"
                    >
                        Выйти
                    </Button>
                </div>
            ) : (
                <>
                    <Link
                        to="/login"
                        className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600"
                        onClick={onClose}
                    >
                        Войти
                    </Link>
                    <Link
                        to="/register"
                        className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600"
                        onClick={onClose}
                    >
                        Регистрация
                    </Link>
                </>
            )}
        </nav>
    );
});

export const Header = () => {
    const [isOpenSlided, setIsOpenSlided] = useState(false);

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
            <div className="mx-auto flex items-center justify-between px-4 py-3 md:px-8">
                <LeftPart />
                <RightPart />

                <button
                    type="button"
                    className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50 md:hidden"
                    onClick={() => setIsOpenSlided(true)}
                    aria-label="Открыть меню"
                >
                    <Icon icon="mdi:menu" className="h-7 w-7" />
                </button>
            </div>
            <SlidedPanel open={isOpenSlided} onClose={() => setIsOpenSlided(false)} title={
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Навигация
                </h2>
            }>
                <MobileNav onClose={() => setIsOpenSlided(false)} />
            </SlidedPanel>
        </header>
    )
}