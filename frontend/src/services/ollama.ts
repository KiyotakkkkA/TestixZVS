import { buildFullAnswerSystemPrompt, fillTestSystemPrompt } from '../data/prompts';
import { AnswerCheckingTool, TestFillingTool } from '../data/tools';

import type { FullAnswerModelEvaluation, OllamaChatResponse } from '../types/AI';
import type { FullAnswerCheckMode } from '../types/Test';

const clampPercent = (n: number): number => {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
};

const getEnv = () => {
  const model = process.env.REACT_APP_OLLAMA_MODEL;
  const token = process.env.REACT_APP_OLLAMA_TOKEN;
  return { model, token };
};

export const OllamaService = {
  fillTestFromText: async (input: { text: string }) => {
    const { model, token } = getEnv();
    if (!model) {
      throw new Error('Ollama model is not configured (REACT_APP_OLLAMA_MODEL)');
    }

    const system = fillTestSystemPrompt;

    const payload = {
      model: 'ministral-3:3b-cloud',
      stream: false,
      options: {
        temperature: 0.2,
      },
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: JSON.stringify({ text: input.text }, null, 2),
        },
      ],
      tools: [TestFillingTool],
    };

    const res = await fetch(`/ollama/api/chat`, {
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

    const toolCall = data.message.tool_calls?.find((c) => c.function?.name === 'fill_test');
    if (toolCall) {
      const args = toolCall.function.arguments;
      if (typeof args === 'string') {
        return JSON.parse(args);
      }
      return args;
    }

    const raw = (data.message.content || '').trim();
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error('Ollama did not return tool_calls(fill_test) or valid JSON fallback');
    }
  },
  gradeFullAnswer: async (input: {
    questionText: string;
    correctAnswers: string[];
    userAnswer: string;
    checkMode?: FullAnswerCheckMode;
  }): Promise<FullAnswerModelEvaluation> => {
    const { model, token } = getEnv();
    if (!model) {
      throw new Error('Ollama model is not configured (REACT_APP_OLLAMA_MODEL)');
    }

    const mode = input.checkMode ?? 'medium';
    const system = buildFullAnswerSystemPrompt(mode);

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
      tools: [AnswerCheckingTool],
    };

    const res = await fetch(`/ollama/api/chat`, {
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
