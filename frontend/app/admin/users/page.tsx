"use client";

import {
  Badge,
  Button,
  EmptyState,
  Modal,
  ScrollArea,
} from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import { AdminUsersMaxtrixForm } from "@/components/organisms/forms";
import { AdminUsersListFilter } from "@/components/organisms/filters";
import { usersStore, type AdminUserStatus } from "@/stores";
import { observer } from "mobx-react-lite";

const statusLabels: Record<AdminUserStatus, string> = {
  active: "Активен",
  pending: "Ожидает подтверждения",
  blocked: "Заблокирован",
};

const statusBadgeVariants: Record<
  AdminUserStatus,
  "success" | "warning" | "danger"
> = {
  active: "success",
  pending: "warning",
  blocked: "danger",
};

const AdminUsersPage = observer(() => {
  const selectedUser = usersStore.selectedUser;
  const filteredUsers = usersStore.filteredUsers;

  const closeAccessModal = () => {
    usersStore.clearSelectedUser();
  };

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
          <p className="text-sm text-main-300">
            Найдено:{" "}
            <span className="font-semibold text-main-50">
              {filteredUsers.length}
            </span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={usersStore.resetFilters}
              className="px-3 py-1.5"
            >
              Сбросить фильтры
            </Button>
            <Button variant="primary" className="p-2">
              <Icon icon="mdi:account-plus-outline" width={22} height={22} />
            </Button>
          </div>
        </div>

        <section className="overflow-hidden rounded-lg border border-main-700 bg-main-800/45">
          {filteredUsers.length > 0 ? (
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
                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-main-300">
                      Доступ
                    </th>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
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
          <AdminUsersMaxtrixForm />
        </Modal.Content>
        <Modal.Footer className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={closeAccessModal}
            className="p-1"
          >
            Отмена
          </Button>
          <Button onClick={closeAccessModal} className="p-1" variant="primary">
            Сохранить
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
});

export default AdminUsersPage;
