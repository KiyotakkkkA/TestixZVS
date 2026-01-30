<?php

namespace App\Enum;

enum ErrorMessages: string
{
    // General Errors
    case RES_NOT_FOUND = 'Запрашиваемый ресурс не найден.';
    case UNAUTHORIZED = 'Доступ к этому ресурсу запрещен.';
    case UNAUTHENTICATED = 'Не пройден вход в систему.';
    case SERVER_ERROR = 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.';
    case DATA_VALIDATION_FAILED = 'Ошибка проверки данных. Пожалуйста, проверьте введенную информацию.';

    // Custom Errors
    case NOT_ALLOWED_AUDIT_VIEW = 'Недостаточно прав для просмотра журнала аудита.';
    case NOT_ALLOWED_ADMIN_PANEL_VIEW = 'Недостаточно прав для доступа к панели администратора.';
    case NOT_ALLOWED_ADMIN_USERS_CREATE = 'Недостаточно прав для добавления пользователей.';
    case NOT_ALLOWED_ADMIN_USERS_DELETE = 'Недостаточно прав для удаления пользователей.';
    case NOT_ALLOWED_ADMIN_ROLES_UPDATE = 'Недостаточно прав для обновления ролей пользователей.';
    case NOT_ALLOWED_ADMIN_PERMISSIONS_UPDATE = 'Недостаточно прав для обновления прав пользователей.';

    case NOT_ALLOWED_TEST_CREATE = 'Недостаточно прав для создания теста.';
    case NOT_ALLOWED_TEST_UPDATE = 'Недостаточно прав для редактирования теста.';
    case NOT_ALLOWED_TEST_EXPORT = 'Недостаточно прав для экспорта теста.';
    case NOT_ALLOWED_TEST_AUTOFILL = 'Недостаточно прав для автозаполнения теста.';
    case NOT_ALLOWED_TEST_ACCESS = 'Недостаточно прав для доступа к тесту.';
}
