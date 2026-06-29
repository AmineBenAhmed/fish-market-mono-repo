import { List } from 'lucide-react';

import { PageHeader } from '../../components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export function ListingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Listings" description="Manage marketplace listings" />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">All Listings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center">
              <List className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">Listings table coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
