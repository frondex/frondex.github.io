import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/AuthContext'
import { useSignMessage, useAccount } from 'wagmi'

interface UseWalletLinkReturn {
  isLinking: boolean
  linkWallet: (address: string, chain?: string) => Promise<boolean>
  linkedWallets: string[]
  fetchLinkedWallets: () => Promise<void>
}

export function useWalletLink(): UseWalletLinkReturn {
  const [isLinking, setIsLinking] = useState(false)
  const [linkedWallets, setLinkedWallets] = useState<string[]>([])
  const { toast } = useToast()
  const { user, session } = useAuth()
  const { address: connectedAddress } = useAccount()
  const { signMessageAsync } = useSignMessage()

  const fetchLinkedWallets = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('address')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching linked wallets:', error)
        return
      }

      setLinkedWallets(data?.map(w => w.address) || [])
    } catch (error) {
      console.error('Error fetching linked wallets:', error)
    }
  }, [user])

  const linkWallet = useCallback(async (address: string, chain: string = 'eip155:1'): Promise<boolean> => {
    if (!user || !session) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to link your wallet',
        variant: 'destructive',
      })
      return false
    }

    setIsLinking(true)

    try {
      // Step 1: Get a nonce from the backend
      const { data: nonceData, error: nonceError } = await supabase.functions.invoke(
        'wallet-link-nonce',
        {
          body: { address, chain }
        }
      )

      if (nonceError || !nonceData?.nonce) {
        throw new Error('Failed to get nonce: ' + (nonceError?.message || 'Unknown error'))
      }

      // Step 2: Create SIWE-like message
      const domain = window.location.host
      const origin = window.location.origin
      const message = `${domain} wants you to sign in with your Ethereum account:\n${address}\n\nLink this wallet to your account.\n\nURI: ${origin}\nVersion: 1\nChain ID: 1\nNonce: ${nonceData.nonce}\nIssued At: ${new Date().toISOString()}`

      // Step 3: Sign the message
      let signature: string
      try {
        signature = await signMessageAsync({ 
          message,
          account: address as `0x${string}`
        })
      } catch (signError) {
        throw new Error('User rejected signature request')
      }

      // Step 4: Verify and link the wallet
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
        'wallet-link-verify',
        {
          body: {
            address,
            signature,
            message,
            chain
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      )

      if (verifyError || !verifyData?.success) {
        throw new Error('Failed to verify signature: ' + (verifyError?.message || verifyData?.error || 'Unknown error'))
      }

      toast({
        title: 'Wallet Linked',
        description: `Successfully linked wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
      })

      // Refresh linked wallets list
      await fetchLinkedWallets()
      
      return true

    } catch (error: any) {
      console.error('Wallet linking error:', error)
      toast({
        title: 'Wallet Link Failed',
        description: error.message || 'Failed to link wallet',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsLinking(false)
    }
  }, [user, session, signMessageAsync, toast, fetchLinkedWallets])

  return {
    isLinking,
    linkWallet,
    linkedWallets,
    fetchLinkedWallets,
  }
}