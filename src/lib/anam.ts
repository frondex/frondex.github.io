
// Anam.ai API utilities

interface AnamSettings {
  sessionToken: string;
}

class AnamService {
  private static STORAGE_KEY = 'anam_settings';

  static getSettings(): AnamSettings {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing Anam settings:', error);
      }
    }
    return {
      sessionToken: ''
    };
  }
}

export const getAnamSessionToken = async (): Promise<string> => {
  const settings = AnamService.getSettings();
  
  if (settings.sessionToken) {
    console.log('Using saved session token from settings');
    return settings.sessionToken;
  }
  
  // Fallback to hardcoded token if no token is saved
  console.log('No saved token found, using fallback token');
  const fallbackToken = "eyJhbGciOiJIUzI1NiJ9.eyJhY2NvdW50SWQiOiIweE1aVUJWaWo2YzlpcjA1ODdrMldscU9GSmNaNWZ6ViIsInNlc3Npb25TdG9yZUlkIjoiZTFlZjNlMjQtZWE5Yi00MTZiLWE2ZDItODViNTk0NjJjY2VhIiwidHlwZSI6ImVwaGVtZXJhbCIsImFwaUtleUlkIjoiYzYxODc1NDgtOWEzNC00MmE5LTk5NjktZjM3NzM4ODNkMDkxIiwiaWF0IjoxNzU0MjExMDY4LCJleHAiOjE3NTQyMTQ2Njh9._cdR3eE0tom3eVlv-PSq6SnvC_xBnnChdRc5wyZX8q4";
  return fallbackToken;
};
