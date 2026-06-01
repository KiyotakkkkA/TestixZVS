<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'uuid',
    'event_type',
    'entity_type',
    'entity_id',
    'entity_label',
    'author_id',
    'author_name',
    'author_email',
    'summary',
    'old_values',
    'new_values',
    'metadata',
    'ip_address',
    'user_agent',
    'created_at',
])]
class AuditLog extends Model
{
    public const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    protected function eventLabel(): Attribute
    {
        return Attribute::get(fn (): string => match ($this->event_type) {
            'created' => 'Создание',
            'updated' => 'Изменение',
            'deleted' => 'Удаление',
            'access' => 'Доступ',
            default => $this->event_type,
        });
    }

    protected function entityLabelHuman(): Attribute
    {
        return Attribute::get(fn (): string => match ($this->entity_type) {
            'user' => 'Пользователь',
            'test' => 'Тест',
            default => $this->entity_type,
        });
    }
}
