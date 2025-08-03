
// Anam.ai API utilities

export const getAnamSessionToken = async (): Promise<string> => {
  console.log('Fetching session token...');
  const response = await fetch('https://anam-test-gldl7fbe6-spark-stones-projects.vercel.app/session', {
    method: 'GET',
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
