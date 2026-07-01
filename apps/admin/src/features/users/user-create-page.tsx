import { Button, Input } from '@fishmarket/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { usersService } from '../../services';

export function UserCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER',
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof usersService.create>[0]) => usersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/users');
    },
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;

    createMutation.mutate({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone || undefined,
      role: form.role,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create User" description="Create a new marketplace user">
        <Button variant="outline" onClick={() => navigate('/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Password <span className="text-destructive">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="Min 8 chars, upper, lower, number"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <Input
                  placeholder="+216 XX XXX XXX"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  User Role <span className="text-destructive">*</span>
                </label>
                <Select value={form.role} onValueChange={(v) => handleChange('role', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="SELLER">Seller</SelectItem>
                    <SelectItem value="DRIVER">Driver</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-lg border bg-muted/50 mt-4">
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">User Summary</p>
                    <p>
                      {form.name || 'No name set'} — {form.role}
                    </p>
                    <p>{form.email || 'No email set'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" type="button" onClick={() => navigate('/users')}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || !form.name || !form.email || !form.password}
          >
            <Plus className="mr-2 h-4 w-4" />
            {createMutation.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </div>

        {createMutation.isError && (
          <p className="text-destructive text-sm mt-2 text-right">
            Failed to create user: {(createMutation.error as Error).message}
          </p>
        )}
      </form>
    </div>
  );
}
