import type { QuestionDraft, QuestionDraftType } from '../components/organisms/test/QuestionEditEntity';
import type { TestQuestionPayload, TestQuestionResponse } from '../types/editing/TestManagement';

const createClientId = (): string => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const createQuestionDraft = (id?: number, type: QuestionDraftType = 'single'): QuestionDraft => ({
  id,
  clientId: createClientId(),
  type,
  question: '',
  disabled: false,
  media: [],
  existingFiles: [],
  removedFileIds: [],
  options: [''],
  correctOptions: [],
  terms: [''],
  meanings: [''],
  matches: [''],
  answers: [''],
  lastSavedPayload: null,
});

const ensureList = <T>(value: T[] | undefined | null, fallback: T[]): T[] => {
  if (!value || value.length === 0) return fallback;
  return value;
};

export const mapApiQuestionToDraft = (question: TestQuestionResponse): QuestionDraft => {
  const options = question.options ?? {};

  const base = createQuestionDraft(question.id, question.type as QuestionDraftType);
  const mapped = {
    ...base,
    question: question.title,
    disabled: question.disabled ?? false,
    options: ensureList(options.options, ['']),
    correctOptions: options.correctOptions ?? [],
    terms: ensureList(options.terms, ['']),
    meanings: ensureList(options.meanings, ['']),
    matches: ensureList(options.matches, ['']),
    answers: ensureList(options.answers, ['']),
    existingFiles: (question.files ?? []).map((file) => ({
      id: file.id,
      name: file.name,
      url: file.url,
      mime_type: file.mime_type ?? null,
      size: file.size ?? null,
    })),
    removedFileIds: [],
  };

  if (mapped.type === 'matching' && mapped.matches.length < mapped.meanings.length) {
    mapped.matches = [...mapped.matches, ...Array(mapped.meanings.length - mapped.matches.length).fill('')];
  }

  mapped.lastSavedPayload = mapDraftToPayload(mapped);

  return mapped;
};

const serializePayload = (payload: TestQuestionPayload | null | undefined): string => {
  if (!payload) return '';
  return JSON.stringify(payload);
};

export const isDraftEmpty = (draft: QuestionDraft): boolean => {
  const hasText = draft.question.trim().length > 0;
  const hasOptions = draft.options.some((opt) => opt.trim().length > 0);
  const hasAnswers = draft.answers.some((ans) => ans.trim().length > 0);
  const hasTerms = draft.terms.some((term) => term.trim().length > 0);
  const hasMeanings = draft.meanings.some((meaning) => meaning.trim().length > 0);
  const hasMatches = draft.matches.some((match) => match.trim().length > 0);
  const hasMedia = draft.media.length > 0 || draft.existingFiles.length > 0;

  return !(hasText || hasOptions || hasAnswers || hasTerms || hasMeanings || hasMatches || hasMedia);
};

export const isDraftChanged = (draft: QuestionDraft): boolean => {
  const payload = mapDraftToPayload(draft);
  const payloadChanged = serializePayload(payload) !== serializePayload(draft.lastSavedPayload ?? null);
  const filesChanged = (draft.removedFileIds?.length ?? 0) > 0 || (draft.media?.length ?? 0) > 0;

  return payloadChanged || filesChanged;
};

export const mapDraftToPayload = (draft: QuestionDraft): TestQuestionPayload => {
  switch (draft.type) {
    case 'single':
    case 'multiple':
      return {
        id: draft.id,
        client_id: draft.clientId,
        title: draft.question,
        disabled: draft.disabled,
        type: draft.type,
        options: {
          options: draft.options,
          correctOptions: draft.correctOptions,
        },
      };
    case 'matching':
      return {
        id: draft.id,
        client_id: draft.clientId,
        title: draft.question,
        disabled: draft.disabled,
        type: draft.type,
        options: {
          terms: draft.terms,
          meanings: draft.meanings,
          matches: draft.matches,
        },
      };
    case 'full_answer':
    default:
      return {
        id: draft.id,
        client_id: draft.clientId,
        disabled: draft.disabled,
        title: draft.question,
        type: draft.type,
        options: {
          answers: draft.answers,
        },
      };
  }
};
