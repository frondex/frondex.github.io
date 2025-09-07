import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// Create wagmi config
export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId: 'your-walletconnect-project-id', // You'll need to get this from WalletConnect
    }),
    coinbaseWallet({
      appName: 'Your App Name',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

export type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'rainbow' | 'binance'

export interface WalletOption {
  id: WalletType
  name: string
  icon: string
  description: string
  downloadUrl?: string
  isInstalled?: () => boolean
}

export const walletOptions: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Connect using browser wallet',
    downloadUrl: 'https://metamask.io/download/',
    isInstalled: () => typeof window !== 'undefined' && !!window.ethereum?.isMetaMask,
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect using mobile wallet',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🏦',
    description: 'Connect using Coinbase',
    downloadUrl: 'https://www.coinbase.com/wallet',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: '🌈',
    description: 'Connect using Rainbow wallet',
    downloadUrl: 'https://rainbow.me/',
  },
  {
    id: 'binance',
    name: 'Binance Wallet',
    icon: '🔶',
    description: 'Connect using Binance wallet',
    downloadUrl: 'https://www.binance.org/en',
  },
]

declare global {
  interface Window {
    ethereum?: any
  }
}