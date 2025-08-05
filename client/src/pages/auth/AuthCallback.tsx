import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const errorMessage = urlParams.get('message');

    if (errorMessage) {
      toast({
        title: 'Authentication Failed',
        description: decodeURIComponent(errorMessage),
        variant: 'destructive'
      });
      setLocation('/login');
      return;
    }

    if (token) {
      // Decode the JWT to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Create user object from JWT payload
        const user = {
          id: payload.id,
          email: payload.email,
          role: payload.role,
          name: payload.name || 'User', // Fallback if name not in token
          status: 'active',
          referralCode: payload.referralCode || '',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        login(user, token);
        
        toast({
          title: 'Success',
          description: 'Google authentication successful! Welcome.',
        });

        // Redirect based on role
        if (payload.role === 'admin') {
          setLocation('/admin');
        } else {
          setLocation('/vendor');
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        toast({
          title: 'Authentication Error',
          description: 'Invalid authentication token received.',
          variant: 'destructive'
        });
        setLocation('/login');
      }
    } else {
      toast({
        title: 'Authentication Error',
        description: 'No authentication token received.',
        variant: 'destructive'
      });
      setLocation('/login');
    }
  }, [login, setLocation, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Processing authentication...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}