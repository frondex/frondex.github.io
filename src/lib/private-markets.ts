export interface PrivateMarketsMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PrivateMarketsSettings {
  apiUrl: string;
  userId: string;
  appId: string;
  responseFormat: 'conversational' | 'structured' | 'brief';
  includeCharts: boolean;
  maxResults: number;
}

export interface PrivateMarketsEntity {
  id: string;
  name: string;
  type: string;
  aum?: number;
  aumFormatted?: string;
  rank?: number;
  location?: string;
  highlight?: string;
}

export interface PrivateMarketsSuggestion {
  text: string;
  action: string;
  entityId?: string;
  context?: string;
}

export interface PrivateMarketsVisualization {
  type: string;
  title: string;
  description: string;
  dataUrl?: string;
  suggestedHeight?: number;
}

export interface PrivateMarketsResponse {
  success: boolean;
  message: string;
  entities: PrivateMarketsEntity[];
  suggestions: PrivateMarketsSuggestion[];
  visualizations: PrivateMarketsVisualization[];
  sessionToken: string;
  conversationContext: {
    intent: string;
    entitiesDiscussed: string[];
    topicHistory: string[];
    lastQuery: string;
    queryCount: number;
  };
}

export class PrivateMarketsService {
  private static readonly STORAGE_KEY = 'private-markets-settings';
  private static readonly DEFAULT_SETTINGS: PrivateMarketsSettings = {
    apiUrl: 'https://merry-creativity-production.up.railway.app',
    userId: 'user-' + Math.random().toString(36).substr(2, 9),
    appId: 'frondex-chat',
    responseFormat: 'conversational',
    includeCharts: true,
    maxResults: 5,
  };

  private sessionToken: string | null = null;

  constructor(private settings: PrivateMarketsSettings) {}

  static getSettings(): PrivateMarketsSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...this.DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading Private Markets settings:', error);
    }
    return this.DEFAULT_SETTINGS;
  }

  static saveSettings(settings: PrivateMarketsSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving Private Markets settings:', error);
    }
  }

  async initSession(): Promise<void> {
    try {
      const response = await fetch(`${this.settings.apiUrl}/api/wrapper/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.settings.userId,
          appId: this.settings.appId,
          userPreferences: {
            responseFormat: this.settings.responseFormat,
            includeCharts: this.settings.includeCharts,
            maxResults: this.settings.maxResults
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Session creation failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        this.sessionToken = data.sessionToken;
      } else {
        throw new Error(data.error || 'Session creation failed');
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      // Continue without session - API will auto-create one
    }
  }

  async sendMessage(message: string): Promise<PrivateMarketsResponse> {
    try {
      const response = await fetch(`${this.settings.apiUrl}/api/wrapper/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionToken: this.sessionToken,
          userId: this.settings.userId,
          context: { 
            appId: this.settings.appId,
            userPreferences: {
              responseFormat: this.settings.responseFormat,
              includeCharts: this.settings.includeCharts,
              maxResults: this.settings.maxResults
            }
          }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 404) {
          throw new Error('Session expired. Starting new conversation.');
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update session token
        this.sessionToken = data.sessionToken;
        
        return {
          success: true,
          message: data.response.message,
          entities: data.response.data?.entities || [],
          suggestions: data.response.suggestions || [],
          visualizations: data.response.visualizations || [],
          sessionToken: data.sessionToken,
          conversationContext: data.conversationContext || {
            intent: 'general_search',
            entitiesDiscussed: [],
            topicHistory: [],
            lastQuery: message,
            queryCount: 1
          }
        };
      } else {
        throw new Error(data.error?.message || 'Chat request failed');
      }
    } catch (error) {
      console.error('Private Markets API error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        entities: [],
        suggestions: [],
        visualizations: [],
        sessionToken: this.sessionToken || '',
        conversationContext: {
          intent: 'error',
          entitiesDiscussed: [],
          topicHistory: [],
          lastQuery: message,
          queryCount: 0
        }
      };
    }
  }

  async getSessionInfo(): Promise<any> {
    if (!this.sessionToken) return null;
    
    try {
      const response = await fetch(`${this.settings.apiUrl}/api/wrapper/session/${this.sessionToken}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get session info:', error);
    }
    return null;
  }

  async deleteSession(): Promise<boolean> {
    if (!this.sessionToken) return false;

    try {
      const response = await fetch(`${this.settings.apiUrl}/api/wrapper/session/${this.sessionToken}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        this.sessionToken = null;
        return true;
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
    return false;
  }

  static async checkHealth(apiUrl: string = PrivateMarketsService.DEFAULT_SETTINGS.apiUrl): Promise<boolean> {
    try {
      const response = await fetch(`${apiUrl}/health`);
      const health = await response.json();
      return health.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}