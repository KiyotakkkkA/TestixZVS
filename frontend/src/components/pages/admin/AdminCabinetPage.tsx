import { useState } from 'react';

import { authStore } from '../../../stores/authStore';
import { InputSmall } from '../../atoms';

const getInitials = (name?: string | null) => {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/g);
  const first = parts[0]?.[0] ?? 'A';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return `${first}${last}`.toUpperCase();
};

export const AdminCabinetPage = () => {
  const user = authStore.user;

  const [telegramTag, setTelegramTag] = useState('');
  const [additionalEmail, setAdditionalEmail] = useState('');

  return (
    <div className="w-full space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-2xl font-semibold text-slate-800">Кабинет администратора</div>
                    <div className="text-sm text-slate-500">Ваш профиль и доступы.</div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                    {getInitials(user?.name)}
                    </div>
                </div>
            </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-slate-800">Информация об администраторе</div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg shadow-md border p-4">
                        <div className="text-xs uppercase tracking-wide text-slate-400">Имя</div>
                        <div className="mt-1 text-sm font-semibold text-slate-800">{user?.name ?? '—'}</div>
                    </div>
                    <div className="rounded-lg shadow-md border p-4">
                        <div className="text-xs uppercase tracking-wide text-slate-400">Email</div>
                        <div className="mt-1 text-sm font-semibold text-slate-800">{user?.email ?? '—'}</div>
                    </div>
                </div>
            </div>

            <div className="relative rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-slate-800 mb-2">Контакты</div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Telegram Tag</div>
                <InputSmall
                    name="telegramTag"
                    placeholder="@exampleTGTag"
                    leftIcon="mdi:telegram"
                    className="flex-1 py-2 text-sm border-slate-200"
                    value={telegramTag}
                    onChange={(e) => setTelegramTag(e.target.value)}
                />
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400 mt-4">Дополнительный Email</div>
                <InputSmall
                    name="email"
                    placeholder="example@example.com"
                    leftIcon="mdi:email-outline"
                    className="flex-1 py-2 text-sm border-slate-200"
                    value={additionalEmail}
                    onChange={(e) => setAdditionalEmail(e.target.value)}
                />
                <div className="absolute top-0 inset-0 z-10 flex items-center justify-center rounded-lg bg-slate-900/10">
                    <div className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                        В разработке
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
