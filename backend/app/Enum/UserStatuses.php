<?php

namespace App\Enum;

enum UserStatuses: string
{
    case CONFIRMATION_PENDING = 'confirmation_pending';
    case ACTIVE = 'active';
    case SUSPENDED = 'suspended';
}
