// Anam.ai API utilities

export const getAnamSessionToken = async (): Promise<string> => {
  const response = await fetch('/functions/v1/anam-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get session token: ${response.statusText}`);
  }

  const { sessionToken } = await response.json();
  return sessionToken;
};