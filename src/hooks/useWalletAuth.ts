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
          
          if (user && walletAddress) {
            // User is authenticated - offer to link wallet
            setTimeout(() => {
              toast({
                title: 'Link Wallet?',
                description: 'Would you like to link this wallet to your account?',
              })
            }, 1000)
          } else if (!user && walletAddress) {
            // User is not authenticated - use wallet as login
            setTimeout(async () => {
              try {
                // Get nonce for wallet authentication
                const { data: nonceData, error: nonceError } = await supabase.functions.invoke('wallet-link-nonce', {
                  body: { address: walletAddress, chain: 'eip155:1' }
                })

                if (nonceError || !nonceData?.nonce) {
                  throw new Error('Failed to get authentication nonce')
                }

                // Create message for user to sign
                const message = `Sign this message to authenticate with your wallet.\n\nAddress: ${walletAddress}\nChain: Ethereum\nNonce: ${nonceData.nonce}\nTimestamp: ${new Date().toISOString()}`

                // Get signature using wagmi
                const { signMessage } = await import('@wagmi/core')
                const { wagmiConfig } = await import('@/lib/wallet')
                
                const signature = await signMessage(wagmiConfig, { 
                  account: walletAddress as `0x${string}`,
                  message 
                })

                // Authenticate with backend
                const { data: authData, error: authError } = await supabase.functions.invoke('wallet-auth', {
                  body: {
                    address: walletAddress,
                    signature,
                    message,
                    chain: 'eip155:1'
                  }
                })

                if (authError || !authData?.success) {
                  throw new Error('Wallet authentication failed')
                }

                // Navigate to magic link to complete authentication
                if (authData.magic_link) {
                  window.location.href = authData.magic_link
                }

                toast({
                  title: 'Wallet Authentication Successful',
                  description: 'You are now signed in with your wallet',
                })

              } catch (authErr: any) {
                console.error('Wallet authentication failed:', authErr)
                toast({
                  title: 'Authentication Failed',
                  description: authErr.message || 'Failed to authenticate with wallet',
                  variant: 'destructive',
                })
              }
            }, 500)
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
  }, [connect, toast, user])

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