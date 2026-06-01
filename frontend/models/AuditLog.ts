export type AuditEventType = "created" | "updated" | "deleted" | "access";

export type AuditLogListItem = {
  uuid: string;
  eventType: AuditEventType;
  eventLabel: string;
  entityType: string;
  entityLabel: string | null;
  entityLabelHuman: string;
  authorName: string | null;
  authorEmail: string | null;
  summary: string;
  createdAt: string;
};

export type AuditLogDetails = AuditLogListItem & {
  entityId: number | null;
  authorId: number | null;
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
};

export type AuditLogPaginationMeta = {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
  from: number | null;
  to: number | null;
};

export type AuditLogListResponse = {
  data: AuditLogListItem[];
  meta: AuditLogPaginationMeta;
};
