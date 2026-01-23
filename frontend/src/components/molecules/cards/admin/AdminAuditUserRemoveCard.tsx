import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';

import { Button } from '../../../atoms';

import type { AdminAuditRecord } from '../../../../types/admin/AdminAudit';

export type AdminAuditUserRemoveCardProps = {
  record: AdminAuditRecord;
};

export const AdminAuditUserRemoveCard = ({ record }: AdminAuditUserRemoveCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const target = useMemo(() => {
    return record.old_object_state?.user || null;
  }, [record]);

  const roles = record.old_object_state?.roles ?? [];
  const perms = record.old_object_state?.permissions ?? [];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
              Удаление пользователя
            </span>
            <span className="text-xs text-slate-400">
              {new Date(record.created_at).toLocaleString('ru-RU')}
            </span>
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Администратор: <span className="font-semibold text-slate-800">{record.actor?.name ?? '—'}</span>
            {record.actor?.email && <span className="text-slate-400"> ({record.actor.email})</span>}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Удалённый пользователь: <span className="font-semibold text-slate-800">{target?.name ?? '—'}</span>
            {target?.email && <span className="text-slate-400"> ({target.email})</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <Button primaryNoBackground className="text-sm whitespace-nowrap" onClick={() => setIsOpen((prev) => !prev)}>
            {isOpen ? <Icon icon='mdi:eye-off' className="h-6 w-6" /> : <Icon icon='mdi:eye' className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        <div className={`mt-5 border-t border-slate-100 pt-5 transition-transform duration-300 ${isOpen ? 'translate-y-0' : '-translate-y-2'}`}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Роли</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {roles.length ? roles.map((role) => (
                  <span key={role} className="rounded-full border border-rose-100 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                    {role}
                  </span>
                )) : (
                  <span className="text-sm text-slate-400">Нет</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Права</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {perms.length ? perms.map((perm) => (
                  <span key={perm} className="rounded-full border border-rose-100 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                    {perm}
                  </span>
                )) : (
                  <span className="text-sm text-slate-400">Нет</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
