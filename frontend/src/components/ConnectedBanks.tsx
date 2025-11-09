import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { PlaidItemsList } from './plaid/PlaidItemsList';
import { usePlaidItems } from '../hooks/usePlaidItems';
import { api } from '../lib/api';
import { Button } from './ui/button';

export function ConnectedBanks() {
  const { items, loading, error, refresh } = usePlaidItems();
  const [sandboxLoading, setSandboxLoading] = useState(false);

  const handleRemove = async (itemId: string) => {
    await api.plaid.removeItem(itemId);
    await refresh();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <CreditCard className="text-white" />
          </div>
          <div>
            <h2 className="text-white text-2xl font-semibold mb-1">Connected Banks</h2>
            <p className="text-white/70">
              Link multiple institutions to help Swipe Smart understand your spending
              and optimize recommendations.
            </p>
          </div>
        </div>

        <Button
          className="w-full bg-white text-[#4962bf] hover:bg-white/90"
          disabled={sandboxLoading}
          onClick={async () => {
            try {
              setSandboxLoading(true);
              await api.plaid.createSandboxItem();
              await refresh();
            } catch (sandboxError) {
              console.error(sandboxError);
            } finally {
              setSandboxLoading(false);
            }
          }}
        >
          {sandboxLoading ? 'Connecting sample bank...' : 'Connect sample sandbox bank'}
        </Button>
      </div>

      <PlaidItemsList
        items={items}
        loading={loading}
        error={error}
        onRemove={handleRemove}
        onRefresh={refresh}
      />
    </div>
  );
}
