
// Anam.ai API utilities

export const getAnamSessionToken = async (): Promise<string> => {
  console.log('Fetching session token...');
  const response = await fetch('/api/anam-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`Session token fetch failed: ${response.status} ${response.statusText}`);
    throw new Error(`Failed to get session token: ${response.statusText}`);
  }

  const { sessionToken } = await response.json();
  console.log('Session token received');
  return sessionToken;
};
