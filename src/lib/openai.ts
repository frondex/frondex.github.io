export interface OpenAISettings {
  apiKey: string;
  model: string;
  streaming: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIService {
  private static readonly STORAGE_KEY = 'openai-settings';
  private static readonly DEFAULT_SETTINGS: OpenAISettings = {
    apiKey: '',
    model: 'gpt-4o',
    streaming: true,
  };

  static getSettings(): OpenAISettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...this.DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading OpenAI settings:', error);
    }
    return this.DEFAULT_SETTINGS;
  }

  static saveSettings(settings: OpenAISettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving OpenAI settings:', error);
    }
  }

  static async sendMessage(
    messages: ChatMessage[],
    onStreamChunk?: (chunk: string) => void
  ): Promise<string> {
    const settings = this.getSettings();
    
    if (!settings.apiKey) {
      throw new Error('OpenAI API key is required. Please configure it in settings.');
    }

    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `You are Frondex AI, a specialized assistant for private markets, deal flow, and portfolio insights. You help users understand venture capital, private equity, hedge funds, and alternative investments. Provide accurate, professional, and actionable insights while maintaining a conversational tone.`
    };

    const payload = {
      model: settings.model,
      messages: [systemPrompt, ...messages],
      stream: settings.streaming,
      temperature: 0.7,
      max_tokens: 1000,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
    }

    if (settings.streaming && onStreamChunk) {
      return this.handleStreamResponse(response, onStreamChunk);
    } else {
      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    }
  }

  private static async handleStreamResponse(
    response: Response,
    onStreamChunk: (chunk: string) => void
  ): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Failed to get response reader');

    const decoder = new TextDecoder();
    let fullResponse = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return fullResponse;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                onStreamChunk(content);
              }
            } catch (e) {
              // Ignore parsing errors for malformed chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullResponse;
  }

  static getAvailableModels(): Array<{ id: string; name: string }> {
    return [
      { id: 'gpt-4o', name: 'GPT-4o (Latest)' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast)' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ];
  }
}