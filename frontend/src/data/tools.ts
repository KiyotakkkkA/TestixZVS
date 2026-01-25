import { AITool } from "../types/AI"

export const AnswerCheckingTool: AITool = {
    type: 'function',
    function: {
        name: 'check_answer',
        description: 'Оценивает ответ студента по шкале 0-100 и даёт краткий комментарий.',
        parameters: {
            type: 'object',
            properties: {
                scorePercent: {
                    type: 'number',
                    description: 'Процент правильности (0-100)',
                },
                comment: {
                    type: 'string',
                    description: 'Короткий комментарий на русском: что верно/что не так и как улучшить.',
                },
            },
            required: ['scorePercent', 'comment'],
        },
    },
}

export const TestFillingTool: AITool = {
    type: 'function',
    function: {
        name: 'fill_test',
        description: 'Формирует JSON представление теста по тексту задания. Возвращает массив questions в формате авто-импорта.',
        parameters: {
            type: 'object',
            properties: {
                questions: {
                    type: 'array',
                    description: 'Список вопросов теста',
                    items: {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                enum: ['single', 'multiple', 'matching', 'full_answer'],
                            },
                            question: { type: 'string' },
                            title: { type: 'string' },
                            options: { type: 'array', items: { type: 'string' } },
                            correctAnswers: { type: 'array', items: { type: 'string' } },
                            terms: { type: 'array', items: { type: 'string' } },
                            meanings: { type: 'array', items: { type: 'string' } },
                        },
                        required: ['type'],
                    },
                },
            },
            required: ['questions'],
        },
    },
}