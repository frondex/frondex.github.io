
// Anam.ai API utilities

export const getAnamSessionToken = async (): Promise<string> => {
  console.log('Using hardcoded session token for testing...');
  // Temporary hardcoded token for testing
  const sessionToken = "eyJhbGciOiJIUzI1NiJ9.eyJhY2NvdW50SWQiOiIweE1aVUJWaWo2YzlpcjA1ODdrMldscU9GSmNaNWZ6ViIsInNlc3Npb25TdG9yZUlkIjoiZTFlZjNlMjQtZWE5Yi00MTZiLWE2ZDItODViNTk0NjJjY2VhIiwidHlwZSI6ImVwaGVtZXJhbCIsImFwaUtleUlkIjoiYzYxODc1NDgtOWEzNC00MmE5LTk5NjktZjM3NzM4ODNkMDkxIiwiaWF0IjoxNzU0MjExMDY4LCJleHAiOjE3NTQyMTQ2Njh9._cdR3eE0tom3eVlv-PSq6SnvC_xBnnChdRc5wyZX8q4";
  console.log('Hardcoded session token ready');
  return sessionToken;
};
