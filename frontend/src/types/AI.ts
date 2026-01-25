export type OllamaToolCall = {
  function: {
    name: string;
    arguments: any;
  };
};

export type OllamaChatResponse = {
  model: string;
  created_at: string;
  message: {
    role: 'assistant' | 'tool' | 'user' | 'system';
    content: string;
    tool_calls?: OllamaToolCall[];
  };
  done: boolean;
  done_reason?: string;
};

export type FullAnswerModelEvaluation = {
  scorePercent: number;
  comment: string;
};

export type AIToolObjectParamProps = {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  items?: AIToolObjectParams;
  enum?: Array<string | number>;
}

export type AIToolObjectParams = {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  required?: string[];
  properties?: Record<string, AIToolObjectParamProps>;
}

export type AIToolFunction = {
  name: string;
  description: string;
  parameters: AIToolObjectParams;
}

export type AITool = {
  type: 'function';
  function: AIToolFunction;
}