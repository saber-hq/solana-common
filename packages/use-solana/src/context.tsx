import type { ReactNode } from "react";
import React from "react";
import { createContainer } from "unstated-next";

import type { UseSolanaError } from "./error";
import { ErrorLevel } from "./error";
import type {
  ConnectionArgs,
  ConnectionContext,
} from "./utils/useConnectionInternal";
import { useConnectionInternal } from "./utils/useConnectionInternal";
import type { UseProvider } from "./utils/useProviderInternal";
import { useProviderInternal } from "./utils/useProviderInternal";
import type { UseWallet, UseWalletArgs } from "./utils/useWalletInternal";
import { useWalletInternal } from "./utils/useWalletInternal";

export interface UseSolana<T extends boolean = boolean>
  extends ConnectionContext,
    UseWallet<T>,
    UseProvider {}

export interface UseSolanaArgs
  extends ConnectionArgs,
    Partial<Pick<UseWalletArgs, "onConnect" | "onDisconnect">> {
  /**
   * Called when an error is thrown.
   */
  onError?: (err: UseSolanaError) => void;
}

/**
 * Provides Solana.
 * @returns
 */
const useSolanaInternal = ({
  onConnect = (wallet, provider) => {
    alert(
      `Connected to ${provider.name} wallet: ${wallet.publicKey.toString()}`
    );
  },
  onDisconnect = (_wallet, provider) => {
    alert(`Disconnected from ${provider.name} wallet`);
  },
  onError = (err) => {
    if (err.level === ErrorLevel.WARN) {
      console.warn(err);
    } else {
      console.error(err);
    }
  },
  ...connectionArgs
}: UseSolanaArgs = {}): UseSolana => {
  const connectionCtx = useConnectionInternal(connectionArgs);
  const { network, endpoint } = connectionCtx;
  const walletCtx = useWalletInternal({
    onConnect,
    onDisconnect,
    network,
    endpoint,
    onError,
  });
  const providerCtx = useProviderInternal({
    connection: connectionCtx.connection,
    wallet: walletCtx.wallet,
  });

  return {
    ...walletCtx,
    ...connectionCtx,
    ...providerCtx,
  };
};

const Solana = createContainer(useSolanaInternal);

type ProviderProps = UseSolanaArgs & { children: ReactNode };

/**
 * Provides a Solana SDK.
 *
 * Note: ensure that `onConnect` and `onDisconnect` are wrapped in useCallback or are
 * statically defined, otherwise the wallet will keep re-rendering.
 * @returns
 */
export const SolanaProvider: React.FC<ProviderProps> = ({
  children,
  ...args
}: ProviderProps) => (
  <Solana.Provider initialState={args}>{children}</Solana.Provider>
);

/**
 * Fetches the loaded Solana SDK.
 */
export const useSolana = Solana.useContainer;
