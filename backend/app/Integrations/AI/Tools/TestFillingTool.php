<?php

namespace App\Integrations\AI\Tools;

class TestFillingTool
{
    public static function get(): array
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => 'fill_test',
                'description' => 'Формирует JSON представление теста по тексту задания. Возвращает массив questions в формате авто-импорта.',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'questions' => [
                            'type' => 'array',
                            'description' => 'Список вопросов теста',
                            'items' => [
                                'type' => 'object',
                                'properties' => [
                                    'type' => [
                                        'type' => 'string',
                                        'enum' => ['single', 'multiple', 'matching', 'full_answer'],
                                    ],
                                    'question' => ['type' => 'string'],
                                    'title' => ['type' => 'string'],
                                    'options' => [
                                        'type' => 'array',
                                        'items' => ['type' => 'string'],
                                    ],
                                    'correctAnswers' => [
                                        'type' => 'array',
                                        'items' => ['type' => 'string'],
                                    ],
                                    'terms' => [
                                        'type' => 'array',
                                        'items' => ['type' => 'string'],
                                    ],
                                    'meanings' => [
                                        'type' => 'array',
                                        'items' => ['type' => 'string'],
                                    ],
                                ],
                                'required' => ['type'],
                            ],
                        ],
                    ],
                    'required' => ['questions'],
                ],
            ],
        ];
    }
}
