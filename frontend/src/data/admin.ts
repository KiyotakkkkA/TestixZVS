export const ROLE_RANKS: Record<string, number> = {
    user: 0,
    editor: 1,
    admin: 2,
    root: 3,
};

export const ROLES_NAMES = {
    root: "Суперпользователь",
    admin: "Администратор",
    editor: "Редактор",
    user: "Пользователь",
};

export const PERMISSION_GROUPS = {
    testing: {
        title: "Управление тестированием",
        permissions: [
            "create tests",
            "edit tests",
            "delete tests",
            "edit tests access",
            "tests master access",
        ],
    },
    users: {
        title: "Управление пользователями",
        permissions: [
            "add users",
            "remove users",
            "assign editor role",
            "assign admin role",
            "assign permissions",
        ],
    },
    access: {
        title: "Доступ к разделам сервиса",
        permissions: [
            "view admin panel",
            "view audit logs",
            "view statistics",
            "make reports",
        ],
    },
};
