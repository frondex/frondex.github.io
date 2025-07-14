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

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content || data.message || 'No response received';
  }

  private async sendStreamingMessage(messages: FlowithMessage[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`${FlowithService.API_URL}?stream=true`, {
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
      } as any);

      let fullResponse = '';

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.content) {
            fullResponse += data.content;
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        eventSource.close();
        if (fullResponse) {
          resolve(fullResponse);
        } else {
          reject(new Error('Streaming connection failed'));
        }
      };

      eventSource.addEventListener('end', () => {
        eventSource.close();
        resolve(fullResponse);
      });
    });
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