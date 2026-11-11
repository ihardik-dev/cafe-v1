import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FolderTree, UtensilsCrossed } from 'lucide-react';

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-content-primary">Admin Overview</h1>
        <p className="text-xs text-content-secondary mt-1">
          Manage your live cafe menu, categories, and item availability flags.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border-subdued bg-surface-secondary/40 p-5">
          <div className="flex items-center gap-2 text-brand-primary mb-2">
            <FolderTree className="h-5 w-5" />
            <h2 className="text-sm font-bold text-content-primary">Categories</h2>
          </div>
          <p className="text-xs text-content-secondary mb-4">
            Create, rename, and review menu categories.
          </p>
          <Link to="/admin/categories">
            <Button variant="secondary" size="sm">
              Manage Categories
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border border-border-subdued bg-surface-secondary/40 p-5">
          <div className="flex items-center gap-2 text-brand-primary mb-2">
            <UtensilsCrossed className="h-5 w-5" />
            <h2 className="text-sm font-bold text-content-primary">Menu Items</h2>
          </div>
          <p className="text-xs text-content-secondary mb-4">
            Add items, update prices, adjust availability, or remove items.
          </p>
          <Link to="/admin/menu-items">
            <Button variant="secondary" size="sm">
              Manage Items
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
