import { ExternalLink, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useChainId } from "wagmi";

interface TransactionStatusProps {
  hash?: `0x${string}`;
  isPending?: boolean;
  isConfirming?: boolean;
  isSuccess?: boolean;
  error?: Error | null;
  onReset?: () => void;
}

export function TransactionStatus({
  hash,
  isPending,
  isConfirming,
  isSuccess,
  error,
  onReset,
}: TransactionStatusProps) {
  const { t } = useTranslation();
  const chainId = useChainId();

  const getExplorerUrl = (txHash: string) => {
    if (chainId === 11155111) {
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    }
    // Hardhat - no explorer
    return null;
  };

  if (!hash && !isPending && !error) {
    return null;
  }

  const explorerUrl = hash ? getExplorerUrl(hash) : null;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3">
        {isPending && (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="flex-1">
              <p className="font-medium">{t("transaction.waitingConfirmation")}</p>
              <p className="text-sm text-muted-foreground">
                {t("transaction.confirmInWallet")}
              </p>
            </div>
          </>
        )}

        {isConfirming && (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="flex-1">
              <p className="font-medium">{t("transaction.confirming")}</p>
              <p className="text-sm text-muted-foreground">
                {t("transaction.waitingBlockchain")}
              </p>
            </div>
          </>
        )}

        {isSuccess && (
          <>
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div className="flex-1">
              <p className="font-medium text-success">{t("transaction.success")}</p>
              <p className="text-sm text-muted-foreground">
                {t("transaction.confirmed")}
              </p>
            </div>
          </>
        )}

        {error && (
          <>
            <XCircle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">{t("transaction.failed")}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {error.message}
              </p>
            </div>
          </>
        )}
      </div>

      {(hash || error) && (
        <div className="mt-3 flex items-center gap-2">
          {explorerUrl && (
            <Button asChild variant="outline" size="sm" className="gap-1">
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                {t("transaction.viewExplorer")}
              </a>
            </Button>
          )}
          {hash && !explorerUrl && (
            <code className="rounded bg-muted px-2 py-1 text-xs">
              {hash.slice(0, 10)}...{hash.slice(-8)}
            </code>
          )}
          {onReset && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              {t("common.dismiss")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
