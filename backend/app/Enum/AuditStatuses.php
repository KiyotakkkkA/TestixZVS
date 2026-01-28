<?php

namespace App\Enum;

enum AuditStatuses: string
{
    case ACTION_ADMIN_ROLES_CHANGE = 'admin_roles_change';
    case ACTION_ADMIN_PERMISSIONS_CHANGE = 'admin_permissions_change';
    case ACTION_ADMIN_USER_ADD = 'admin_user_add';
    case ACTION_ADMIN_USER_REMOVE = 'admin_user_remove';
    case ACTION_TEST_CREATED = 'test_created';
    case ACTION_TEST_UPDATED = 'test_updated';
    case ACTION_TEST_DELETED = 'test_deleted';
}
