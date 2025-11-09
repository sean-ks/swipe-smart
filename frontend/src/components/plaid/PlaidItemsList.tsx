import { Banknote, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { PlaidItemSummary } from '../../lib/api';
import { PlaidLinkButton } from './PlaidLinkButton';

interface PlaidItemsListProps {
  items: PlaidItemSummary[];
  loading: boolean;
  error: string | null;
  onRemove: (itemId: string) => Promise<void>;
  onRefresh: () => void;
}

export function PlaidItemsList({
  items,
  loading,
  error,
  onRemove,
  onRefresh,
}: PlaidItemsListProps) {
  if (loading) {
    return (
      <div className="text-white/80 text-sm">
        Syncing your bank connections...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-100 bg-red-500/20 border border-red-400 rounded-lg p-3 text-sm">
        {error}
      </div>
    );
  }

  if (!items.length) {
    return (
      <p className="text-white/80 text-sm">
        No bank accounts connected yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white/5 border border-white/20 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">
                {item.institutionName || 'Unknown institution'}
              </p>
              <p className="text-xs text-white/60">
                Last synced:{' '}
                {item.lastSuccessfulUpdate
                  ? new Date(item.lastSuccessfulUpdate).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
            <StatusBadge status={item.status} />
          </div>

          <div className="space-y-2">
            {item.accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between text-sm text-white/80 bg-white/5 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-white/60" />
                  <span>{account.name}</span>
                  {account.subtype && (
                    <span className="text-white/50 text-xs">
                      ({account.subtype})
                    </span>
                  )}
                </div>
                {typeof account.currentBalance === 'number' && (
                  <span>
                    {(account.currentBalance / 100).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
            {item.status === 'LOGIN_REQUIRED' && (
              <PlaidLinkButton
                mode="update"
                plaidItemId={item.id}
                buttonText="Re-authenticate"
                onSuccess={onRefresh}
                variant="outline"
                className="bg-amber-500/20 border-amber-300 text-white"
              />
            )}
            <PlaidLinkButton
              mode="update"
              plaidItemId={item.id}
              buttonText="Update accounts"
              onSuccess={onRefresh}
              variant="outline"
              className="border-white/40 text-white"
            />
            <Button
              variant="outline"
              className="border-red-300 text-red-100 hover:bg-red-500/20"
              onClick={() => void onRemove(item.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: PlaidItemSummary['status'];
}) {
  const base = 'text-xs px-3 py-1 rounded-full border';

  if (status === 'ACTIVE') {
    return (
      <span className={`${base} bg-emerald-500/20 border-emerald-300 text-emerald-100`}>
        Active
      </span>
    );
  }

  if (status === 'LOGIN_REQUIRED') {
    return (
      <span className={`${base} bg-amber-500/20 border-amber-300 text-amber-100`}>
        Re-auth required
      </span>
    );
  }

  if (status === 'ERROR') {
    return (
      <span className={`${base} bg-red-500/20 border-red-300 text-red-100`}>
        Error
      </span>
    );
  }

  return (
    <span className={`${base} bg-white/10 border-white/30 text-white/70`}>
      Disconnected
    </span>
  );
}
