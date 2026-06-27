import { Button, Input } from '@fishmarket/ui';
import { useMutation } from '@tanstack/react-query';
import { Fish } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { authService } from '../../services';
import { useAuthStore } from '../../stores/auth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: () => authService.login({ email, password }),
    onSuccess: (data) => {
      setToken(data.accessToken);
      setUser(data.user);
      navigate('/', { replace: true });
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <Fish className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">FishMarket</h1>
          <p className="mt-1 text-sm text-muted-foreground">Admin Dashboard</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Welcome back</CardTitle>
            <CardDescription>Sign in to your admin account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@fishmarket.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
