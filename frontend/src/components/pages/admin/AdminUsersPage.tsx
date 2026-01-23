import { useMemo, useState } from 'react';

import { UserCard } from '../../molecules/cards';
import { authStore } from '../../../stores/authStore';
import { ROLE_RANKS } from '../../../data/admin';
import { Modal, Button, Spinner } from '../../atoms';
import { RegisterForm } from '../../molecules/forms';
import { useAdministrateUsers } from '../../../hooks/admin/useAdministrateUsers';
import { useToasts } from '../../../hooks/useToasts';

export const AdminUsersPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<null | { id: number; name: string; email: string }>(null);
  const { toast } = useToasts();
  const {
    users,
    roles,
    permissions,
    isLoading,
    isAdding,
    error,
    deletingIds,
    createUser,
    deleteUser,
    updateUserRoles,
    updateUserPermissions,
  } = useAdministrateUsers();

  const canAssignPermissions = authStore.hasPermission('assign permissions');
  const canAddUsers = authStore.hasPermission('add users');
  const canRemoveUsers = authStore.hasPermission('remove users');
  const canAssignAdmin = authStore.hasPermission('assign admin role');
  const canAssignEditor = authStore.hasPermission('assign editor role');

  const actorRank = Math.max(
    -1,
    ...(authStore.user?.roles ?? []).map((role) => ROLE_RANKS[role] ?? -1)
  );

  const rolePermissionsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    roles.forEach((role) => {
      map[role.name] = role.permissions ?? [];
    });
    return map;
  }, [roles]);

  const handleSaveRoles = async (userId: number, nextRoles: string[]) => {
    try {
      await updateUserRoles(userId, nextRoles);
      toast.success('Роли пользователя сохранены');
    } catch (error: any) {
      toast.danger(error?.response?.data?.message || 'Не удалось сохранить роли');
    }
  };

  const handleSavePermissions = async (userId: number, nextPerms: string[]) => {
    try {
      await updateUserPermissions(userId, nextPerms);
      toast.success('Права пользователя сохранены');
    } catch (error: any) {
      toast.danger(error?.response?.data?.message || 'Не удалось сохранить права');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId);
      toast.success('Пользователь удалён');
    } catch (error: any) {
      toast.danger(error?.response?.data?.message || 'Не удалось удалить пользователя');
    }
  };

  const handleRequestDelete = (user: { id: number; name: string; email: string }) => {
    setDeleteTarget(user);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await handleDeleteUser(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleCreateUser = async (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      await createUser({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        password_confirmation: payload.confirmPassword,
        role: 'user',
      });
      setIsAddModalOpen(false);
      toast.success('Пользователь создан');
      return true;
    } catch {
      toast.danger('Не удалось создать пользователя');
      return false;
    } finally {
    }
  };

  if (isLoading) {
    return (
      <div className="w-full rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        <div className="flex items-center justify-center gap-2">
          <Spinner className="h-4 w-4" />
          Загружаем пользователей...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Пользователи</h1>
        <p className="mt-2 text-sm text-slate-500">
          Управляйте ролями и правами пользователей.
        </p>
        {canAddUsers && (
          <div className="mt-4">
            <Button primary className="px-4 py-2 text-sm" onClick={() => setIsAddModalOpen(true)}>
              Добавить пользователя
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {users.map((user) => {
          const isSelf = authStore.user?.id === user.id;
          const targetRank = Math.max(
            -1,
            ...(user.roles ?? []).map((role) => ROLE_RANKS[role] ?? -1)
          );
          const maxRoleRank = Math.max(actorRank, -1);
          const canDelete = Boolean(
            !isSelf
            && canRemoveUsers
            && (targetRank <= actorRank)
            && (!user.roles.includes('editor') || canAssignEditor)
            && (!user.roles.includes('admin') || canAssignAdmin)
            && (!user.roles.includes('root') || authStore.user?.roles.includes('root'))
          );

          return (
          <UserCard
            key={user.id}
            user={user}
            roles={roles}
            permissions={permissions}
            rolePermissionsMap={rolePermissionsMap}
            maxRoleRank={maxRoleRank}
            isSelf={isSelf}
            isRankHigher={actorRank > targetRank}
            canDelete={canDelete}
            isDeleting={Boolean(deletingIds[user.id])}
            onRequestDelete={handleRequestDelete}
            onSaveRoles={handleSaveRoles}
            onSavePermissions={handleSavePermissions}
            canAssignPermissions={canAssignPermissions}
          />
          );
        })}
      </div>
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={<h3 className="text-lg font-semibold text-slate-800">Подтвердите удаление</h3>}
        outsideClickClosing
      >
        <div className="space-y-4 mb-2">
          <p className="text-sm text-slate-600">
            Удалить пользователя{' '}
            <span className="font-semibold text-slate-800">{deleteTarget?.name}</span> ({deleteTarget?.email})?
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button secondary className='flex-1 p-2' onClick={() => setDeleteTarget(null)}>
              Отмена
            </Button>
            <Button danger className='p-2' onClick={handleConfirmDelete} disabled={deleteTarget ? Boolean(deletingIds[deleteTarget.id]) : false}>
              <span className="inline-flex items-center gap-2">
                {deleteTarget && deletingIds[deleteTarget.id] && <Spinner className="h-4 w-4" />}
                Удалить
              </span>
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={<h3 className="text-lg font-semibold text-slate-800">Добавить пользователя</h3>}
        outsideClickClosing
      >
        <RegisterForm
          submitLabel="Создать пользователя"
          onSubmit={handleCreateUser}
          isLoading={isAdding}
          className="w-full bg-white p-2"
          onSuccess={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
