import { useMutation } from '@tanstack/react-query';
import { Fish } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button, Input } from '@fishmarket/ui';
import { Card, CardContent } from '../../components/ui/card';
import { authService } from '../../services';
import { useAuthStore } from '../../stores/auth';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: () =>
      authService.register({ name, email, password, phone: phone || undefined, role: 'SELLER' }),
    onSuccess: (data) => {
      setToken(data.accessToken);
      setUser(data.user);
      navigate('/', { replace: true });
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Registration failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    registerMutation.mutate();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
          <Fish className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold">FishMarket</h1>
        <p className="text-muted-foreground">Create your seller account</p>
      </div>

      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive text-center">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="you@fishmarket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Phone (optional)</label>
              <Input
                type="tel"
                placeholder="+1 234 567 890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Confirm Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
