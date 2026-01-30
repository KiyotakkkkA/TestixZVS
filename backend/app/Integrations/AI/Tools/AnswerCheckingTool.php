<?php

namespace App\Integrations\AI\Tools;

class AnswerCheckingTool
{
    public static function get(): array
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => 'check_answer',
                'description' => 'Оценивает ответ студента по шкале 0-100 и даёт краткий комментарий.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'scorePercent' => [
                            'type' => 'number',
                            'description' => 'Процент правильности (0-100)',
                        ],
                        'comment' => [
                            'type' => 'string',
                            'description' => 'Короткий комментарий на русском: что верно/что не так и как улучшить.',
                        ],
                    ],
                    'required' => ['scorePercent', 'comment'],
                ],
            ],
        ];
    }
}
