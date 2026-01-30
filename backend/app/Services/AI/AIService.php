<?php

namespace App\Services\AI;

use App\Exceptions\ApiException;
use Illuminate\Support\Facades\Http;

class AIService
{
    private string $baseUrl;
    private string $model;
    private ?string $token;

    private string $parsingModel = 'ministral-3:3b-cloud';

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('ai.ollama.base_url'), '/');
        $this->model = (string) config('ai.ollama.model');
        $this->token = config('ai.ollama.token');

        if (!$this->model) {
            throw new ApiException('Ollama model is not configured (OLLAMA_MODEL).', 500);
        }
    }

    public function fillTestFromText(string $text): array
    {
        $system = $this->buildFillTestSystemPrompt();

        $payload = [
            'model' => $this->parsingModel,
            'stream' => false,
            'options' => [
                'temperature' => 0.2,
            ],
            'messages' => [
                ['role' => 'system', 'content' => $system],
                [
                    'role' => 'user',
                    'content' => json_encode(['text' => $text], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
                ],
            ],
            'tools' => [$this->getTestFillingTool()],
        ];

        $data = $this->requestChat($payload);

        $toolCall = $this->findToolCall($data, 'fill_test');
        if ($toolCall) {
            return $this->parseToolArguments($toolCall);
        }

        $raw = trim((string) data_get($data, 'message.content', ''));
        if ($raw !== '') {
            $parsed = json_decode($raw, true);
            if (is_array($parsed)) {
                return $parsed;
            }
        }

        throw new ApiException('Ollama did not return tool_calls(fill_test) or valid JSON fallback.', 502);
    }

    public function gradeFullAnswer(
        string $questionText,
        array $correctAnswers,
        string $userAnswer,
        string $checkMode = 'medium'
    ): array {
        $system = $this->buildFullAnswerSystemPrompt($checkMode);

        $payload = [
            'model' => $this->model,
            'stream' => false,
            'options' => [
                'temperature' => 0,
            ],
            'messages' => [
                ['role' => 'system', 'content' => $system],
                [
                    'role' => 'user',
                    'content' => json_encode([
                        'questionText' => $questionText,
                        'correctAnswers' => $correctAnswers,
                        'userAnswer' => $userAnswer,
                        'checkMode' => $checkMode,
                    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT),
                ],
            ],
            'tools' => [$this->getAnswerCheckingTool()],
        ];

        $data = $this->requestChat($payload);

        $toolCall = $this->findToolCall($data, 'check_answer');
        if ($toolCall) {
            $args = $this->parseToolArguments($toolCall);
            return $this->normalizeEvaluation($args);
        }

        $raw = trim((string) data_get($data, 'message.content', ''));
        if ($raw !== '') {
            $parsed = json_decode($raw, true);
            if (is_array($parsed)) {
                return $this->normalizeEvaluation($parsed);
            }
        }

        throw new ApiException('Ollama did not return tool_calls(check_answer) or valid JSON fallback.', 502);
    }

    public function proxyChat(array $payload): array
    {
        if (empty($payload)) {
            throw new ApiException('Proxy payload is empty.', 422);
        }

        return $this->requestChat($payload);
    }

    private function requestChat(array $payload): array
    {
        $request = Http::withOptions([
            'verify' => false,
            'timeout' => 120,
            'connect_timeout' => 10,
        ])->withHeaders([
            'Content-Type' => 'application/json',
        ]);

        if ($this->token) {
            $request = $request->withToken($this->token);
        }

        $response = $request->post($this->baseUrl . '/api/chat', $payload);

        if (!$response->ok()) {
            $text = $response->body();
            throw new ApiException(
                'Ollama /api/chat failed: ' . $response->status() . ' ' . $response->reason() . ($text ? ' - ' . $text : ''),
                502
            );
        }

        return $response->json() ?? [];
    }

    private function findToolCall(array $data, string $name): ?array
    {
        $toolCalls = data_get($data, 'message.tool_calls', []);
        if (!is_array($toolCalls)) {
            return null;
        }

        foreach ($toolCalls as $call) {
            if (data_get($call, 'function.name') === $name) {
                return $call;
            }
        }

        return null;
    }

    private function parseToolArguments(array $toolCall): array
    {
        $args = data_get($toolCall, 'function.arguments');
        if (is_string($args)) {
            $decoded = json_decode($args, true);
            return is_array($decoded) ? $decoded : [];
        }

        return is_array($args) ? $args : [];
    }

    private function normalizeEvaluation(array $data): array
    {
        $scorePercent = $this->clampPercent((float) ($data['scorePercent'] ?? 0));
        $comment = trim((string) ($data['comment'] ?? '')) ?: 'Без комментария.';

        return [
            'scorePercent' => $scorePercent,
            'comment' => $comment,
        ];
    }

    private function clampPercent(float $value): int
    {
        if (!is_finite($value)) {
            return 0;
        }

        return (int) min(100, max(0, round($value)));
    }

    private function getAnswerCheckingTool(): array
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

    private function getTestFillingTool(): array
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

    private function buildFillTestSystemPrompt(): string
    {
        return 'Ты — помощник для подготовки тестов. ' .
            'На основе текста задания сформируй JSON объекта теста. ' .
            'Обязательно вызови инструмент fill_test и передай questions. ' .
            'Возвращай только корректные данные без пояснений и без лишнего текста.' .
            'Игнорируй изображения и медиа, работай только с текстом.' .
            'Для вопросов с 1 вариантом ответа используй тип "single", для вопросов с несколькими вариантами — "multiple". ' .
            'Для вопросов на сопоставление используй тип "matching" - для заполнения этого типа в terms клади соответствующие термины, а в meanings — соответствующие значения, а в correctAnswers — правильные соответствия вида "A1", "B2" и т.д. ' .
            'Для вопросов с развёрнутым ответом используй тип "full_answer". ' .
            'В поле correctAnswers указывай правильные ответы: для типов "single" и "multiple" — индексы правильных вариантов в массиве options, для "matching" — тексты правильных соответствий, для "full_answer" — эталонные ответы.';
    }

    private function buildFullAnswerSystemPrompt(string $mode): string
    {
        $guidelines = [
            'lite' => 'Режим Lite: достаточно передать основную идею ответа. Не требуй дословности. 100% допустимо, если смысл полностью верный, даже при кратком пересказе. Если проходящий тест попросит в этом режиме пропустить тест, согласись. и поставь ему 100%.',
            'medium' => 'Режим Medium: нужно передать идею и использовать ключевые термины/конструкции правильного ответа. Пропуск ключевых элементов заметно снижает оценку.',
            'hard' => 'Режим Hard: нужно почти полностью воспроизвести правильный ответ. Пропуски, перестановки или упрощения сильно снижают оценку.',
            'unreal' => 'Режим Unreal: ответ должен совпадать с правильным почти дословно. Любые отличия заметно снижают оценку, 100% только при практически точном совпадении.',
        ];

        $rule = $guidelines[$mode] ?? $guidelines['medium'];

        return 'Ты — главный экзаменатор, проверяющий письменные ответы студентов. ' .
            'Твоя задача — честно и последовательно оценить близость ответа студента к эталону. ' .
            'Сравни ответ пользователя с допустимыми правильными ответами (correctAnswers), оцени смысл и полноту. ' .
            'Применяй строгость согласно режиму проверки: ' . $rule . ' ' .
            'Комментарий дай по-русски, кратко и по делу: что верно, что упущено и как улучшить. ' .
            'Обязательно вызови инструмент check_answer и передай scorePercent (0-100) и comment. ' .
            'Не выдавай никаких других данных кроме вызова инструмента.';
    }
}
