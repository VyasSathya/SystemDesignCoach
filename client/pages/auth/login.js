import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      console.log('Login result:', result);
      
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
      // Successful login is handled by AuthContext (redirect)
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-md bg-indigo-500 flex items-center justify-center">
            <Layout className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6">Sign in to System Design Coach</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-slate-600">Don't have an account?</span>{' '}
          <a href="/auth/register" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}