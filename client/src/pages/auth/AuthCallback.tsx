import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      // Handle authentication error
      console.error('Authentication error:', error);
      setLocation('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (token) {
      try {
        // Decode the JWT token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userData = {
          id: payload.id,
          email: payload.email,
          role: payload.role,
          name: payload.name || payload.email.split('@')[0],
          status: 'active'
        };

        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Force a page reload to ensure proper authentication state
        window.location.href = userData.role === 'admin' ? '/admin/dashboard' : '/vendor/dashboard';
      } catch (error) {
        console.error('Token parsing error:', error);
        setLocation('/login?error=invalid_token');
      }
    } else {
      setLocation('/login');
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
}