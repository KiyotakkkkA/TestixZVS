"use client";

import { InputCheckBox } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { useEffect, useMemo, useState } from "react";

type AccessEntity = {
  key: string;
  label: string;
  permissionsByAspect: Partial<Record<AccessAspectKey, string[]>>;
};

type AccessAspect = {
  key: AccessAspectKey;
  label: string;
};

type AccessAspectKey = "view" | "edit" | "access" | "master";
type MatrixState = Record<string, Record<AccessAspectKey, boolean>>;

type AdminUsersMaxtrixFormProps = {
  permissions?: string[];
  role?: string;
  onPermissionsChange?: (permissions: string[]) => void;
};

const accessEntities: AccessEntity[] = [
  {
    key: "tests",
    label: "Тесты",
    permissionsByAspect: {
      view: ["tests.view"],
      edit: ["tests.edit"],
      access: ["tests.access"],
      master: ["tests.view", "tests.edit", "tests.access"],
    },
  },
  {
    key: "users",
    label: "Пользователи",
    permissionsByAspect: {
      view: ["users.view"],
      edit: ["users.edit"],
      access: ["users.access"],
    },
  },
  {
    key: "audit",
    label: "Аудит",
    permissionsByAspect: {
      view: ["audit.view"],
    },
  },
];

const accessAspects: AccessAspect[] = [
  {
    key: "view",
    label: "Просмотр",
  },
  {
    key: "edit",
    label: "Редактирование",
  },
  {
    key: "access",
    label: "Изменение доступа",
  },
  {
    key: "master",
    label: "Мастер-доступ",
  },
];

const rolePermissionsMap: Record<string, string[]> = {
  root: [
    "tests.view",
    "tests.edit",
    "tests.access",
    "users.view",
    "users.edit",
    "users.access",
  ],
  admin: [
    "tests.view",
    "tests.edit",
    "tests.access",
    "users.view",
    "users.edit",
    "users.access",
  ],
  editor: ["tests.view", "tests.edit"],
  user: ["tests.view"],
};

const createMatrixState = () => {
  return Object.fromEntries(
    accessEntities.map((entity) => [
      entity.key,
      Object.fromEntries(accessAspects.map((aspect) => [aspect.key, false])),
    ]),
  ) as MatrixState;
};

const resolvePermissions = (permissions: string[] = [], role?: string) => {
  if (permissions.length > 0) {
    return permissions;
  }

  return role ? (rolePermissionsMap[role] ?? []) : [];
};

const hasEveryPermission = (
  userPermissions: Set<string>,
  requiredPermissions: string[],
) => {
  return requiredPermissions.every((permission) =>
    userPermissions.has(permission),
  );
};

const createMatrixStateFromPermissions = (
  permissions: string[] = [],
  role?: string,
) => {
  const userPermissions = new Set(resolvePermissions(permissions, role));
  const matrix = createMatrixState();

  accessEntities.forEach((entity) => {
    accessAspects.forEach((aspect) => {
      const requiredPermissions = entity.permissionsByAspect[aspect.key];

      if (!requiredPermissions) {
        return;
      }

      matrix[entity.key][aspect.key] = hasEveryPermission(
        userPermissions,
        requiredPermissions,
      );
    });
  });

  return matrix;
};

const getPermissionsFromMatrix = (matrix: MatrixState) => {
  const permissions = new Set<string>();

  accessEntities.forEach((entity) => {
    accessAspects.forEach((aspect) => {
      if (!matrix[entity.key][aspect.key]) {
        return;
      }

      entity.permissionsByAspect[aspect.key]?.forEach((permission) => {
        permissions.add(permission);
      });
    });
  });

  return Array.from(permissions);
};

export const AdminUsersMaxtrixForm = ({
  permissions = [],
  role,
  onPermissionsChange,
}: AdminUsersMaxtrixFormProps) => {
  const initialMatrix = useMemo(
    () => createMatrixStateFromPermissions(permissions, role),
    [permissions, role],
  );
  const [matrix, setMatrix] = useState(initialMatrix);

  useEffect(() => {
    setMatrix(initialMatrix);
  }, [initialMatrix]);

  useEffect(() => {
    onPermissionsChange?.(getPermissionsFromMatrix(matrix));
  }, [matrix, onPermissionsChange]);

  const handleChange = (
    entityKey: string,
    aspectKey: AccessAspectKey,
    checked: boolean,
  ) => {
    setMatrix((currentMatrix) => ({
      ...currentMatrix,
      [entityKey]: {
        ...currentMatrix[entityKey],
        [aspectKey]: checked,
      },
    }));
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-main-700 bg-main-900/60">
      <table className="min-w-180 w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-main-700 bg-main-800/80">
            <th className="w-64 px-4 py-3 text-xs font-bold uppercase tracking-wide text-main-300">
              Сущность
            </th>
            {accessAspects.map((aspect) => (
              <th
                key={aspect.key}
                className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-main-300"
              >
                {aspect.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {accessEntities.map((entity) => (
            <tr
              key={entity.key}
              className="border-b border-main-800 last:border-b-0"
            >
              <th className="px-4 py-4 align-top">
                <span className="block text-sm font-semibold text-main-50">
                  {entity.label}
                </span>
              </th>
              {accessAspects.map((aspect) => (
                <td key={aspect.key} className="px-4 py-4 text-center">
                  <div className="inline-flex justify-center">
                    {entity.permissionsByAspect[aspect.key] && (
                      <InputCheckBox
                        checked={matrix[entity.key][aspect.key]}
                        onChange={(checked) =>
                          handleChange(entity.key, aspect.key, checked)
                        }
                        aria-label={`${entity.label}: ${aspect.label}`}
                      />
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
