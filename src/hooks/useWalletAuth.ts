import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useConnect, useDisconnect, useAccount } from 'wagmi'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import type { WalletType } from '@/lib/wallet'

interface UseWalletAuthReturn {
  isConnecting: boolean
  error: string | null
  isConnected: boolean
  address: string | undefined
  connectWallet: (walletType: WalletType) => Promise<void>
  disconnectWallet: () => Promise<void>
}

export function useWalletAuth(): UseWalletAuthReturn {
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { connect, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { isConnected, address } = useAccount()

  const getConnector = (walletType: WalletType) => {
    switch (walletType) {
      case 'metamask':
        return injected()
      case 'walletconnect':
        return walletConnect({
          projectId: 'demo-project-id', // You can get a real one from WalletConnect
        })
      case 'coinbase':
        return coinbaseWallet({
          appName: 'Your App',
        })
      default:
        return injected()
    }
  }

  const connectWallet = useCallback(async (walletType: WalletType) => {
    setError(null)

    try {
      // Check if MetaMask is available for metamask connections
      if (walletType === 'metamask' && !window.ethereum?.isMetaMask) {
        throw new Error('MetaMask not detected. Please install MetaMask.')
      }

      const connector = getConnector(walletType)
      
      connect({ connector }, {
        onSuccess: (data) => {
          toast({
            title: 'Wallet Connected',
            description: `Successfully connected ${walletType} wallet: ${data.accounts[0]?.slice(0, 6)}...${data.accounts[0]?.slice(-4)}`,
          })
          console.log('Connected wallet:', { walletType, address: data.accounts[0] })
        },
        onError: (err) => {
          const errorMessage = err.message || 'Failed to connect wallet'
          setError(errorMessage)
          toast({
            title: 'Connection Failed',
            description: errorMessage,
            variant: 'destructive',
          })
        }
      })

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to connect wallet'
      setError(errorMessage)
      toast({
        title: 'Connection Failed',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }, [connect, toast])

  const disconnectWallet = useCallback(async () => {
    try {
      disconnect()
      setError(null)
      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected',
      })
    } catch (err: any) {
      toast({
        title: 'Disconnection Failed',
        description: err.message || 'Failed to disconnect wallet',
        variant: 'destructive',
      })
    }
  }, [disconnect, toast])

  return {
    isConnecting,
    error,
    isConnected,
    address,
    connectWallet,
    disconnectWallet,
  }
}