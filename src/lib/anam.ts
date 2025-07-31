
// Anam.ai API utilities

export const getAnamSessionToken = async (): Promise<string> => {
  const response = await fetch('https://anam-test-gldl7fbe6-spark-stones-projects.vercel.app/session', {
    method: 'GET',
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
