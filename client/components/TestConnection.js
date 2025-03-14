const testBackend = async () => {
  try {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    console.log('Backend response:', data);
  } catch (error) {
    console.error('Error connecting to backend:', error);
  }
};