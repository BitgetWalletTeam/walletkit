import { Chain } from 'wagmi';

import { WalletProps } from '../types';
import { OkxWalletIcon } from './icon';
import { PartialCustomProps, getInjectedProvider, hasInjectedProvider } from '..';
import { CustomConnector } from '../custom/connector';

export const OKX_WALLET_ID = 'okxWallet';

export function okxWallet(props: PartialCustomProps = {}): WalletProps {
  const { connectorOptions, ...restProps } = props;

  return {
    id: OKX_WALLET_ID,
    name: 'OKX Wallet',
    logos: {
      default: <OkxWalletIcon />,
    },
    downloadUrls: {
      default: 'https://www.okx.com/web3',
    },
    spinnerColor: undefined,
    installed: isOkxWallet(),
    createConnector: (chains: Chain[]) => {
      return new CustomConnector({
        id: OKX_WALLET_ID,
        chains,
        options: {
          name: 'OKX Wallet',
          shimDisconnect: true,
          getProvider() {
            if (typeof window === 'undefined') return;

            const provider = getInjectedProvider('isOkxWallet');
            return provider ?? window.okexchain;
          },
          ...connectorOptions,
        },
      });
    },
    getUri: () => {
      return `okx://wallet/dapp/details?dappUrl=${window.location.href}`;
    },
    ...restProps,
  };
}

export function isOkxWallet() {
  if (typeof window === 'undefined') return false;

  return !!(hasInjectedProvider('isOkxWallet') || window.okexchain?.isOkxWallet);
}
