import { PhantomWalletAdapter, PhantomWalletAdapterConfig } from '@solana/wallet-adapter-wallets';
import { hasSolanaInjectedProvider } from '../../utils/getSolanaInjectedProvider';
import { SolanaWallet } from '../types';
import { phantomWalletConfig } from '@/core/configs/phantomWallet';

interface PhantomOptions extends Partial<SolanaWallet> {
  adapterOptions?: Partial<PhantomWalletAdapterConfig>;
}

export function phantomWallet(props: PhantomOptions = {}): SolanaWallet {
  const { adapterOptions, ...restProps } = props;

  return {
    ...phantomWalletConfig,
    id: 'solana:phantom',
    walletType: 'solana',
    adapterName: 'Phantom',
    behaviors: [
      {
        platforms: ['browser-android', 'browser-ios', 'browser-pc'],
        connectType: 'default',
        isInstalled() {
          return hasSolanaInjectedProvider('isPhantom');
        },
        getAppLink() {
          const encodedUrl = encodeURIComponent(window.location.href);
          const encodeDapp = encodeURIComponent(window.origin);
          return `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodeDapp}`;
        },
        getAdapter() {
          return new PhantomWalletAdapter({
            ...adapterOptions,
          });
        },
      },
    ],
    ...restProps,
  };
}
