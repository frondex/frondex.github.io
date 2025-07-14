export interface FlowithMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FlowithRequest {
  messages: FlowithMessage[];
  model: string;
  stream: boolean;
  kb_list: string[];
}

export interface FlowithSettings {
  apiToken: string;
  kbIds: string[];
  model: string;
  stream: boolean;
}

export class FlowithService {
  private static readonly API_URL = 'https://edge.flowith.net/external/use/seek-knowledge';
  
  constructor(private settings: FlowithSettings) {}

  async sendMessage(messages: FlowithMessage[]): Promise<string> {
    if (this.settings.stream) {
      return this.sendStreamingMessage(messages);
    } else {
      return this.sendRegularMessage(messages);
    }
  }

  private async sendRegularMessage(messages: FlowithMessage[]): Promise<string> {
    const response = await fetch(FlowithService.API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.settings.apiToken}`,
        'Content-Type': 'application/json',
        'Host': 'edge.flowith.net'
      },
      body: JSON.stringify({
        messages,
        model: this.settings.model,
        stream: false,
        kb_list: this.settings.kbIds
      })
    });

    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (response.status === 402) {
      throw new Error('Account quota exceeded. Please check your Flowith account billing.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.content || data.message || 'No response received';
  }

  private async sendStreamingMessage(messages: FlowithMessage[]): Promise<string> {
    const response = await fetch(FlowithService.API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.settings.apiToken}`,
        'Content-Type': 'application/json',
        'Host': 'edge.flowith.net'
      },
      body: JSON.stringify({
        messages,
        model: this.settings.model,
        stream: true,
        kb_list: this.settings.kbIds
      })
    });

    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (response.status === 402) {
      throw new Error('Account quota exceeded. Please check your Flowith account billing.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || `API error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    if (!response.body) {
      throw new Error('No response body received');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullResponse += data.content;
              }
            } catch (error) {
              // Skip invalid JSON lines
              console.log('Skipping invalid JSON:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullResponse || 'No response received';
  }

  static getStoredSettings(): FlowithSettings | null {
    try {
      const stored = localStorage.getItem('flowith-settings');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  static saveSettings(settings: FlowithSettings): void {
    localStorage.setItem('flowith-settings', JSON.stringify(settings));
  }

  static clearSettings(): void {
    localStorage.removeItem('flowith-settings');
  }
}