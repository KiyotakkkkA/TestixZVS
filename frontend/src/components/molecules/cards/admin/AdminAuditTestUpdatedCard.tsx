import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';

import { Button } from '../../../atoms';

import type { AdminAuditRecord } from '../../../../types/admin/AdminAudit';

export type AdminAuditTestUpdatedCardProps = {
  record: AdminAuditRecord;
};

const actionBadge = (action?: 'added' | 'updated' | 'removed') => {
  switch (action) {
    case 'added':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'removed':
      return 'bg-rose-50 text-rose-700 border-rose-100';
    case 'updated':
    default:
      return 'bg-amber-50 text-amber-700 border-amber-100';
  }
};

const actionLabel = (action?: 'added' | 'updated' | 'removed') => {
  switch (action) {
    case 'added':
      return 'Добавлен';
    case 'removed':
      return 'Удалён';
    case 'updated':
    default:
      return 'Изменён';
  }
};

export const AdminAuditTestUpdatedCard = ({ record }: AdminAuditTestUpdatedCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const test = record.new_object_state?.test;

  const changed = useMemo(() => {
    return record.new_object_state?.changed_questions ?? [];
  }, [record]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Тест изменён
            </span>
            <span className="text-xs text-slate-400">
              {new Date(record.created_at).toLocaleString('ru-RU')}
            </span>
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Автор: <span className="font-semibold text-slate-800">{record.actor?.name ?? '—'}</span>
            {record.actor?.email && <span className="text-slate-400"> ({record.actor.email})</span>}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Тест: <span className="font-semibold text-slate-800">{test?.title ?? '—'}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          {test?.link && (
            <Button secondary className="px-3 py-1.5 text-xs" to={test.link}>
              Открыть
            </Button>
          )}
          <Button primaryNoBackground className="text-sm whitespace-nowrap" onClick={() => setIsOpen((prev) => !prev)}>
            {isOpen ? <Icon icon='mdi:eye-off' className="h-6 w-6" /> : <Icon icon='mdi:eye' className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'max-h-[700px] opacity-100 overflow-y-scroll' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!isOpen}
      >
        <div className={`mt-5 border-t border-slate-100 pt-5 transition-transform duration-300 ${isOpen ? 'translate-y-0' : '-translate-y-2'}`}>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Изменённые вопросы</div>
          <div className="mt-3 space-y-2">
            {changed.length ? (
              changed.map((item, index) => (
                <>
                  <div key={`${item.title}-${index}`} className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${actionBadge(item.action)}`}>
                      {actionLabel(item.action)}
                    </span>
                    <span className="font-semibold text-slate-800">{item.title}</span>
                    <span className="text-xs text-slate-400">{item.type}</span>
                  </div>
                  <div className='border-b border-slate-200' />
                </>
              ))
            ) : (
              <div className="text-sm text-slate-400">Нет данных.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
