import { CONNECT_STATUS } from '@/core/constants';
import { TemplateConnectingView } from '@/core/modals/ConnectModal/TemplateConnectingView';
import { useWalletKit } from '@/core/providers/WalletKitProvider/context';
import { getWalletBehaviorOnPlatform } from '@/core/utils/common';
import { EventEmitter } from '@/core/utils/eventEmitter';
import { useTronConnect } from '@/tron/hooks/useTronConnect';
import { tronCommonErrorHandler } from '@/tron/utils/tronCommonErrorHandler';
import { TronWallet, TronWalletBehavior } from '@/tron/wallets';
import { useWallet, WalletProviderProps } from '@tronweb3/tronwallet-adapter-react-hooks';
import { useCallback, useEffect, useState } from 'react';

type WalletError = Parameters<Required<WalletProviderProps>['onError']>[0];

export function TronConnectingView() {
  const { log, selectedWallet, options, tronConfig } = useWalletKit();

  const behavior = getWalletBehaviorOnPlatform<TronWalletBehavior>(selectedWallet);

  const [status, setStatus] = useState(
    behavior?.isInstalled?.() ? CONNECT_STATUS.CONNECTING : CONNECT_STATUS.UNAVAILABLE,
  );

  const { connect, isConnected } = useTronConnect();
  const { address } = useWallet();

  useEffect(() => {
    const onError = (error: WalletError) => {
      let message = '';

      if (error.message.includes('rejected')) {
        message = 'User rejected the request';
        setStatus(CONNECT_STATUS.REJECTED);
      } else {
        setStatus(CONNECT_STATUS.FAILED);
      }

      tronCommonErrorHandler({
        log,
        handler: options.onError,
        error: {
          message,
        },
      });
    };

    EventEmitter.on(EventEmitter.TRON_WALLET_ERROR, onError);
    return () => {
      EventEmitter.off(EventEmitter.TRON_WALLET_ERROR, onError);
    };
  }, [options.onError, log]);

  const runConnect = useCallback(async () => {
    if (!behavior?.isInstalled?.()) return;
    setStatus(CONNECT_STATUS.CONNECTING);

    connect({
      adapterName: (selectedWallet as TronWallet).adapterName,
      chainId: tronConfig?.initialChainId,
    });
  }, [behavior, connect, selectedWallet, tronConfig?.initialChainId]);

  return (
    <TemplateConnectingView
      status={status}
      runConnect={runConnect}
      onTryAgain={runConnect}
      wallet={selectedWallet}
      isConnected={isConnected}
      address={address}
    />
  );
}
