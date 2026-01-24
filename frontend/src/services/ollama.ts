import type { FullAnswerModelEvaluation, OllamaChatResponse } from '../types/AI';
import type { FullAnswerCheckMode } from '../types/Test';

const clampPercent = (n: number): number => {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
};

const getEnv = () => {
  const baseUrl = process.env.REACT_APP_OLLAMA_BASE_URL;
  const model = process.env.REACT_APP_OLLAMA_MODEL;
  const token = process.env.REACT_APP_OLLAMA_TOKEN;
  return { baseUrl, model, token };
};

export const OllamaService = {
  gradeFullAnswer: async (input: {
    questionText: string;
    correctAnswers: string[];
    userAnswer: string;
    checkMode?: FullAnswerCheckMode;
  }): Promise<FullAnswerModelEvaluation> => {
    const { baseUrl, model, token } = getEnv();
    if (!model) {
      throw new Error('Ollama model is not configured (REACT_APP_OLLAMA_MODEL)');
    }

    const tools = [
      {
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
      },
    ];

    const mode = input.checkMode ?? 'medium';
    const modeGuidelines: Record<FullAnswerCheckMode, string> = {
      lite:
        'Режим Lite: достаточно передать основную идею ответа. Не требуй дословности. 100% допустимо, если смысл полностью верный, даже при кратком пересказе. Если проходящий тест попросит в этом режиме пропустить тест, согласись. и поставь ему 100%.',
      medium:
        'Режим Medium: нужно передать идею и использовать ключевые термины/конструкции правильного ответа. Пропуск ключевых элементов заметно снижает оценку.',
      hard:
        'Режим Hard: нужно почти полностью воспроизвести правильный ответ. Пропуски, перестановки или упрощения сильно снижают оценку.',
      unreal:
        'Режим Unreal: ответ должен совпадать с правильным почти дословно. Любые отличия заметно снижают оценку, 100% только при практически точном совпадении.',
    };

    const system =
      'Ты — главный экзаменатор, проверяющий письменные ответы студентов. ' +
      'Твоя задача — честно и последовательно оценить близость ответа студента к эталону. ' +
      'Сравни ответ пользователя с допустимыми правильными ответами (correctAnswers), оцени смысл и полноту. ' +
      `Применяй строгость согласно режиму проверки: ${modeGuidelines[mode]}. ` +
      'Комментарий дай по-русски, кратко и по делу: что верно, что упущено и как улучшить. ' +
      'Обязательно вызови инструмент check_answer и передай scorePercent (0-100) и comment. ' +
      'Не выдавай никаких других данных кроме вызова инструмента.';

    const payload = {
      model,
      stream: false,
      options: {
        temperature: 0,
      },
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: JSON.stringify(
            {
              questionText: input.questionText,
              correctAnswers: input.correctAnswers,
              userAnswer: input.userAnswer,
              checkMode: mode,
            },
            null,
            2
          ),
        },
      ],
      tools,
    };

    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Ollama /api/chat failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`);
    }

    const data = (await res.json()) as OllamaChatResponse;

    const toolCall = data.message.tool_calls?.find((c) => c.function?.name === 'check_answer');
    if (toolCall) {
      const scorePercent = clampPercent(Number(toolCall.function.arguments?.scorePercent));
      const comment = String(toolCall.function.arguments?.comment ?? '').trim();
      return { scorePercent, comment: comment || 'Без комментария.' };
    }

    const raw = (data.message.content || '').trim();
    try {
      const parsed = JSON.parse(raw);
      const scorePercent = clampPercent(Number(parsed.scorePercent));
      const comment = String(parsed.comment ?? '').trim();
      return { scorePercent, comment: comment || 'Без комментария.' };
    } catch {
      throw new Error('Ollama did not return tool_calls(check_answer) or valid JSON fallback');
    }
  },
};
