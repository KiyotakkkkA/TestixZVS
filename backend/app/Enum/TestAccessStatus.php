<?php

namespace App\Enum;

enum TestAccessStatus: string
{
    case ALL = 'all';
    case AUTH = 'auth';
    case PROTECTED = 'protected';
    case LINK = 'link';
}
