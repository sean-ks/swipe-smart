import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from '../ui/button';
import { api } from '../../lib/api';

interface PlaidLinkButtonProps {
  buttonText?: string;
  mode?: 'new' | 'update';
  plaidItemId?: string;
  onSuccess?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
}

export function PlaidLinkButton({
  buttonText,
  mode = 'new',
  plaidItemId,
  onSuccess,
  className,
  variant = 'default',
}: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLinkToken = useCallback(async () => {
    try {
      setTokenLoading(true);
      setError(null);

      const response = await api.plaid.createLinkToken(plaidItemId);
      setLinkToken(response.linkToken);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to initialize Plaid connection'
      );
    } finally {
      setTokenLoading(false);
    }
  }, [plaidItemId]);

  useEffect(() => {
    void fetchLinkToken();
  }, [fetchLinkToken]);

  const handleSuccess = useCallback(
    async (publicToken: string) => {
      try {
        setLoading(true);
        setError(null);

        const exchangeResult = await api.plaid.exchangePublicToken(publicToken);
        await api.plaid.fetchTransactions(exchangeResult.plaidItemId);
        onSuccess?.();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to link bank account. Please try again.'
        );
      } finally {
        setLoading(false);
        // fetching a fresh token allows relaunching Plaid without page reload
        void fetchLinkToken();
      }
    },
    [fetchLinkToken, onSuccess]
  );

  const buttonLabel =
    buttonText ||
    (mode === 'update' ? 'Update Accounts' : 'Connect Bank Account with Plaid');

  if (!linkToken) {
    return (
      <div className="space-y-2">
        <Button disabled variant={variant} className={className}>
          Preparing secure connection...
        </Button>
        {error && (
          <p className="text-red-100 text-sm">{error}</p>
        )}
      </div>
    );
  }

  return (
    <PlaidLauncher
      token={linkToken}
      buttonLabel={buttonLabel}
      mode={mode}
      plaidItemId={plaidItemId}
      loading={loading}
      error={error}
      variant={variant}
      className={className}
      onLaunch={handleSuccess}
    />
  );
}

interface PlaidLauncherProps {
  token: string;
  buttonLabel: string;
  mode: 'new' | 'update';
  plaidItemId?: string;
  loading: boolean;
  error: string | null;
  variant: 'default' | 'outline' | 'secondary';
  className?: string;
  onLaunch: (publicToken: string) => void;
}

function PlaidLauncher({
  token,
  buttonLabel,
  mode,
  plaidItemId,
  loading,
  error,
  variant,
  className,
  onLaunch,
}: PlaidLauncherProps) {
  const { open, ready } = usePlaidLink({
    token,
    onSuccess: (publicToken) => onLaunch(publicToken),
  });

  const disabled =
    loading || !ready || (mode === 'update' && !plaidItemId);

  return (
    <div className="space-y-2">
      <Button
        onClick={() => open()}
        disabled={disabled}
        variant={variant}
        className={className}
      >
        {loading ? 'Processing...' : buttonLabel}
      </Button>
      {error && <p className="text-red-100 text-sm">{error}</p>}
    </div>
  );
}
