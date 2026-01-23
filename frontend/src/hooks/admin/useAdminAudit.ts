import { useCallback, useEffect, useMemo, useState } from 'react';

import { AdminService } from '../../services/admin';

import type { AdminAuditFilters, AdminAuditPagination, AdminAuditRecord } from '../../types/admin/AdminAudit';

const DEFAULT_PAGINATION: AdminAuditPagination = {
  page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
};

export const useAdminAudit = (initialFilters?: AdminAuditFilters) => {
  const [records, setRecords] = useState<AdminAuditRecord[]>([]);
  const [pagination, setPagination] = useState<AdminAuditPagination>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminAuditFilters>(() => ({
    action_type: '',
    date_from: '',
    date_to: '',
    page: 1,
    per_page: 10,
    ...initialFilters,
  }));

  const appliedFilters = useMemo(() => ({
    ...filters,
    action_type: filters.action_type || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
  }), [filters]);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await AdminService.getAudit(appliedFilters);
      setRecords(response.data);
      setPagination(response.pagination);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Не удалось загрузить журнал аудита');
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    load();
  }, [load]);

  const updateFilters = (next: Partial<AdminAuditFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...next,
      page: next.page ?? 1,
    }));
  };

  return {
    records,
    pagination,
    isLoading,
    error,
    filters,
    reload: load,
    updateFilters,
  };
};
