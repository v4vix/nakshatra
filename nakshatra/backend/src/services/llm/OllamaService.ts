import axios, { AxiosInstance } from 'axios';

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaChatMessage[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
  };
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: OllamaChatMessage;
  done: boolean;
  total_duration?: number;
  eval_count?: number;
}

export interface OllamaTagEntry {
  name: string;
  modified_at: string;
  size: number;
}

export interface OllamaTagsResponse {
  models: OllamaTagEntry[];
}

const OLLAMA_TIMEOUT_MS = 8000;

export class OllamaService {
  private client: AxiosInstance;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.2';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: OLLAMA_TIMEOUT_MS,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async isHealthy(): Promise<boolean> {
    try {
      const res = await this.client.get<OllamaTagsResponse>('/api/tags', { timeout: 3000 });
      return res.status === 200 && Array.isArray(res.data.models);
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const res = await this.client.get<OllamaTagsResponse>('/api/tags');
      return res.data.models.map((m) => m.name);
    } catch {
      return [];
    }
  }

  async chat(
    messages: OllamaChatMessage[],
    options: { temperature?: number; maxTokens?: number } = {}
  ): Promise<string> {
    const request: OllamaChatRequest = {
      model: this.model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
        top_p: 0.9,
        num_predict: options.maxTokens ?? 1024,
      },
    };

    const res = await this.client.post<OllamaChatResponse>('/api/chat', request, {
      timeout: OLLAMA_TIMEOUT_MS,
    });

    if (!res.data.message?.content) {
      throw new Error('Ollama returned empty response');
    }
    return res.data.message.content;
  }

  async *chatStream(
    messages: OllamaChatMessage[],
    options: { temperature?: number; maxTokens?: number } = {}
  ): AsyncGenerator<string, void, unknown> {
    const request: OllamaChatRequest = {
      model: this.model,
      messages,
      stream: true,
      options: {
        temperature: options.temperature ?? 0.7,
        top_p: 0.9,
        num_predict: options.maxTokens ?? 1024,
      },
    };

    const res = await this.client.post('/api/chat', request, {
      responseType: 'stream',
      timeout: OLLAMA_TIMEOUT_MS,
    });

    for await (const chunk of res.data) {
      const lines = (chunk as Buffer).toString('utf8').split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const parsed: OllamaChatResponse = JSON.parse(line);
          if (parsed.message?.content) {
            yield parsed.message.content;
          }
          if (parsed.done) return;
        } catch {
          // Skip malformed chunks
        }
      }
    }
  }

  getModel(): string {
    return this.model;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

export const ollamaService = new OllamaService();
