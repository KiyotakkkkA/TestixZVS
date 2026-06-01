"use client";

import {
  Badge,
  Button,
  EmptyState,
  Modal,
  ScrollArea,
} from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import {
  AdminUsersAddingForm,
  AdminUsersMaxtrixForm,
} from "@/components/organisms/forms";
import { Pagination } from "@/components/atoms";
import { AdminUsersListFilter } from "@/components/organisms/filters";
import { authStore, usersStore, type AdminUserStatus } from "@/stores";
import { useApi } from "@/hooks/useApi";
import { useToasts } from "@kiyotakkkka/zvs-uikit-lib/hooks";
import { endpoints } from "@/services/endpoints";
import type { User } from "@/models/User";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";

type AccessChangeRequest = {
  userId: number;
  permissions: string[];
};

const statusLabels: Record<AdminUserStatus, string> = {
  active: "Активен",
  confirmation_pending: "Ожидает подтверждения",
  suspended: "Заблокирован",
};

const statusBadgeVariants: Record<
  AdminUserStatus,
  "success" | "warning" | "danger"
> = {
  active: "success",
  confirmation_pending: "warning",
  suspended: "danger",
};

const AdminUsersPage = observer(() => {
  const toasts = useToasts();
  const selectedUser = usersStore.selectedUser;
  const filteredUsers = usersStore.filteredUsers;
  const canManageUsersAccess = authStore.isUserHasPermission("users.access");

  const [isUserCreateModalOpen, setIsUserCreateModalOpen] = useState(false);
  const [isAccessConfirmModalOpen, setIsAccessConfirmModalOpen] =
    useState(false);
  const [selectedAccessPermissions, setSelectedAccessPermissions] = useState<
    string[]
  >([]);

  const { execute: changeAccess, loading: isAccessSaving } = useApi<
    User,
    AccessChangeRequest
  >(endpoints.admin.users["access-change"], "POST", {
    immediate: false,
    onSuccessFn: () => {
      toasts.success({
        title: "Готово!",
        description: "Права пользователя обновлены.",
      });
    },
    onErrorFn: (error) => {
      toasts.danger({
        title: "Ошибка!",
        description: error,
      });
    },
  });

  const closeAccessModal = () => {
    setIsAccessConfirmModalOpen(false);
    usersStore.clearSelectedUser();
  };

  const handlePermissionsChange = useCallback((permissions: string[]) => {
    setSelectedAccessPermissions(permissions);
  }, []);

  const handleAccessSaveConfirm = async () => {
    if (!selectedUser) {
      return;
    }

    const response = await changeAccess({
      userId: selectedUser.id,
      permissions: selectedAccessPermissions,
    });

    if (!response.ok) {
      return;
    }

    setIsAccessConfirmModalOpen(false);
    closeAccessModal();
    void usersStore.loadUsers();
  };

  useEffect(() => {
    return reaction(
      () => [
        usersStore.query,
        usersStore.selectedStatus,
        usersStore.sortBy,
        usersStore.sortDirection,
        usersStore.page,
        usersStore.perPage,
      ],
      () => {
        void usersStore.loadUsers();
      },
      { fireImmediately: true },
    );
  }, []);

  return (
    <>
      <div className="flex flex-col gap-5">
        <section className="rounded-lg border border-main-700 bg-main-800/55 p-5">
          <div>
            <p className="inline-flex items-center gap-2 rounded bg-main-700/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-main-300">
              <Icon icon="mdi:account-group" width={16} height={16} />
              Администрирование
            </p>
            <h1 className="mt-4 text-2xl font-extrabold text-main-50">
              Управление пользователями
            </h1>
          </div>
        </section>

        <AdminUsersListFilter />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={usersStore.resetFilters}
              className="px-3 py-1.5"
            >
              Сбросить фильтры
            </Button>
            {authStore.isUserHasPermission("users.edit") && (
              <Button
                variant="primary"
                className="p-2"
                onClick={() => setIsUserCreateModalOpen(true)}
              >
                <Icon icon="mdi:account-plus-outline" width={22} height={22} />
              </Button>
            )}
          </div>
        </div>

        <section className="overflow-hidden rounded-lg border border-main-700 bg-main-800/45">
          {usersStore.loading ? (
            <div className="flex items-center justify-center gap-3 p-10 text-sm text-main-300">
              <Icon
                icon="mdi:loading"
                width={24}
                height={24}
                className="animate-spin"
              />
              Загружаем пользователей...
            </div>
          ) : usersStore.error ? (
            <EmptyState
              icon={
                <Icon icon="mdi:alert-circle-outline" width={48} height={48} />
              }
              className="bg-main-800/35 p-10 m-3"
              title="Не удалось загрузить пользователей"
              description={usersStore.error}
            />
          ) : filteredUsers.length > 0 ? (
            <>
              <div className="border-b border-main-700 p-2 sm:p-3">
                <Pagination
                  page={usersStore.meta.currentPage}
                  perPage={usersStore.meta.perPage}
                  total={usersStore.meta.total}
                  lastPage={usersStore.meta.lastPage}
                  from={usersStore.meta.from}
                  to={usersStore.meta.to}
                  disabled={usersStore.loading}
                  onPageChange={usersStore.setPage}
                  onPerPageChange={usersStore.setPerPage}
                />
              </div>
              <ScrollArea orientation="horizontal" className="w-full">
                <table className="min-w-215 w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-main-700 bg-main-800/80">
                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-main-300">
                        Пользователь
                      </th>
                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-main-300">
                        Email
                      </th>
                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-main-300">
                        Роль
                      </th>
                      <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-main-300">
                        Статус
                      </th>
                      {canManageUsersAccess && (
                        <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-main-300">
                          Доступ
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-main-800 last:border-b-0"
                      >
                        <td className="px-5 py-4 text-sm font-semibold text-main-50">
                          {user.name}
                        </td>
                        <td className="px-5 py-4 text-sm text-main-300">
                          {user.email}
                        </td>
                        <td className="px-5 py-4 text-sm text-main-300">
                          {user.role}
                        </td>
                        <td className="px-5 py-4 text-sm text-main-300">
                          <Badge variant={statusBadgeVariants[user.status]}>
                            {statusLabels[user.status]}
                          </Badge>
                        </td>
                        {canManageUsersAccess && (
                          <td className="px-5 py-4 text-right">
                            <Button
                              onClick={() => usersStore.selectUser(user)}
                              className="gap-2 px-3 py-1.5"
                            >
                              <Icon
                                icon="mdi:shield-key-outline"
                                width={18}
                                height={18}
                              />
                              Настроить
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </>
          ) : (
            <EmptyState
              icon={
                <Icon
                  icon="mdi:account-search-outline"
                  width={48}
                  height={48}
                />
              }
              className="bg-main-800/35 p-10 m-3"
              title="Пользователи не найдены"
              description="Попробуйте изменить имя, статус или сбросить фильтры."
            />
          )}
        </section>
      </div>

      <Modal
        open={isUserCreateModalOpen}
        onClose={() => setIsUserCreateModalOpen(false)}
        className="w-[min(520px,calc(100vw-2rem))]"
      >
        <Modal.Header className="border-b border-main-700 bg-main-800/40">
          <span className="flex items-center gap-2">
            <Icon icon="mdi:account-plus-outline" width={20} height={20} />
            Создание нового пользователя
          </span>
        </Modal.Header>
        <Modal.Content className="p-5">
          <AdminUsersAddingForm
            onCancel={() => setIsUserCreateModalOpen(false)}
            onCreated={() => {
              setIsUserCreateModalOpen(false);
              void usersStore.loadUsers();
            }}
          />
        </Modal.Content>
      </Modal>

      <Modal
        closeOnOverlayClick={false}
        open={selectedUser !== null}
        onClose={closeAccessModal}
        className="w-[min(960px,calc(100vw-2rem))]"
      >
        <Modal.Header>
          {selectedUser
            ? `${selectedUser.name}`
            : "[Не удалось определить пользователя]"}
        </Modal.Header>
        <Modal.Content className="space-y-4">
          <AdminUsersMaxtrixForm
            permissions={selectedUser?.permissions}
            role={selectedUser?.role}
            onPermissionsChange={handlePermissionsChange}
          />
        </Modal.Content>
        <Modal.Footer className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={closeAccessModal}
            className="py-1 px-2"
          >
            Отмена
          </Button>
          <Button
            onClick={() => setIsAccessConfirmModalOpen(true)}
            className="py-1 px-2"
            variant="primary"
          >
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        closeOnOverlayClick={false}
        open={isAccessConfirmModalOpen}
        onClose={() => setIsAccessConfirmModalOpen(false)}
        className="w-[min(480px,calc(100vw-2rem))]"
      >
        <Modal.Header>Подтвердите изменение доступа</Modal.Header>
        <Modal.Content className="space-y-3 text-sm text-main-300">
          <p>
            Вы собираетесь изменить права пользователя{" "}
            <span className="font-semibold text-main-50">
              {selectedUser?.name}
            </span>
            .
          </p>
        </Modal.Content>
        <Modal.Footer className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsAccessConfirmModalOpen(false)}
            className="py-1 px-2"
            disabled={isAccessSaving}
          >
            Отмена
          </Button>
          <Button
            onClick={handleAccessSaveConfirm}
            className="py-1 px-2"
            variant={isAccessSaving ? "secondary" : "primary"}
            disabled={isAccessSaving}
          >
            {isAccessSaving ? "Сохранение..." : "Подтвердить"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
});

export default AdminUsersPage;
