import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useConnect, useDisconnect, useAccount } from 'wagmi'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import type { WalletType } from '@/lib/wallet'
import { useAuth } from '@/components/AuthContext'
import { useWalletLink } from './useWalletLink'

interface UseWalletAuthReturn {
  isConnecting: boolean
  error: string | null
  isConnected: boolean
  address: string | undefined
  connectWallet: (walletType: WalletType) => Promise<void>
  disconnectWallet: () => Promise<void>
  isLinking: boolean
  linkWallet: (address: string) => Promise<boolean>
  linkedWallets: string[]
}

export function useWalletAuth(): UseWalletAuthReturn {
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { connect, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { isConnected, address } = useAccount()
  const { user } = useAuth()
  const { isLinking, linkWallet: performLinkWallet, linkedWallets, fetchLinkedWallets } = useWalletLink()

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
        onSuccess: async (data) => {
          const walletAddress = data.accounts[0]
          toast({
            title: 'Wallet Connected',
            description: `Successfully connected ${walletType} wallet: ${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`,
          })
          console.log('Connected wallet:', { walletType, address: walletAddress })
          
          // If user is authenticated, offer to link the wallet
          if (user && walletAddress) {
            setTimeout(() => {
              toast({
                title: 'Link Wallet?',
                description: 'Would you like to link this wallet to your account?',
              })
            }, 1000)
          }
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

  const linkWallet = useCallback(async (address: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in first to link your wallet',
        variant: 'destructive',
      })
      return false
    }
    return await performLinkWallet(address)
  }, [user, performLinkWallet, toast])

  return {
    isConnecting,
    error,
    isConnected,
    address,
    connectWallet,
    disconnectWallet,
    isLinking,
    linkWallet,
    linkedWallets,
  }
}