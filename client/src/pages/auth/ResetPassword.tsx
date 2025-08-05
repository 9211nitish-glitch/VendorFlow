import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { resetPasswordSchema, type ResetPasswordRequest } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get token from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const form = useForm<ResetPasswordRequest>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
      password: ''
    }
  });

  // Validate token
  const { data: tokenValidation, isLoading: validatingToken, error: tokenError } = useQuery({
    queryKey: ['/api/auth/validate-reset-token', token],
    queryFn: () => apiRequest(`/api/auth/validate-reset-token?token=${token}`),
    enabled: !!token,
    retry: false
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      return apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (response) => {
      setResetSuccess(true);
      toast({
        title: 'Success',
        description: 'Your password has been reset successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Reset Failed',
        description: error.message || 'Failed to reset password. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const onSubmit = (data: ResetPasswordRequest) => {
    resetPasswordMutation.mutate(data);
  };

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      setLocation('/forgot-password');
    }
  }, [token, setLocation]);

  if (!token) {
    return null;
  }

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Validating reset token...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid or expired token
  if (tokenError || !tokenValidation?.data?.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Invalid Reset Link
            </CardTitle>
            <CardDescription className="text-center">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The password reset link you clicked is either invalid or has expired. 
                Please request a new one.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Link href="/forgot-password">
                <Button className="w-full" data-testid="button-new-reset">
                  Request New Reset Link
                </Button>
              </Link>

              <div className="text-center">
                <Link href="/login">
                  <a className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    Back to Sign In
                  </a>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold">
                {resetSuccess ? 'Password Reset Complete' : 'Reset Your Password'}
              </CardTitle>
            </div>
          </div>
          <CardDescription>
            {resetSuccess 
              ? 'Your password has been successfully updated.'
              : 'Enter your new password below.'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {resetSuccess ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your password has been reset successfully. You can now sign in with your new password.
                </AlertDescription>
              </Alert>

              <Link href="/login">
                <Button className="w-full" data-testid="button-goto-login">
                  Continue to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your new password"
                            className="pl-9 pr-9"
                            data-testid="input-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 6 characters long.
                      </p>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={resetPasswordMutation.isPending}
                  data-testid="button-reset-password"
                >
                  {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}