import { CreditCard } from 'lucide-react';
import { PlaidLinkButton } from './plaid/PlaidLinkButton';
import { PlaidItemsList } from './plaid/PlaidItemsList';
import { usePlaidItems } from '../hooks/usePlaidItems';
import { api } from '../lib/api';

export function ConnectedBanks() {
  const { items, loading, error, refresh } = usePlaidItems();

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

        <PlaidLinkButton
          buttonText="Add bank account"
          onSuccess={refresh}
          className="bg-white text-[#4962bf] hover:bg-white/90 w-full"
        />
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
