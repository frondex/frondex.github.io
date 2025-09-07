import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { WalletConnectModal } from '@/components/ui/wallet-connect-modal'
import { useWalletAuth } from '@/hooks/useWalletAuth'
import { useAuth } from '@/components/AuthContext'
import { Wallet, Link } from 'lucide-react'
import type { WalletType } from '@/lib/wallet'

export function ConnectWalletHeaderButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { isConnecting, error, connectWallet, isConnected, address, linkWallet, isLinking } = useWalletAuth()
  const { user } = useAuth()

  const handleWalletSelect = async (walletType: WalletType) => {
    await connectWallet(walletType)
    setIsModalOpen(false)
  }

  const handleLinkWallet = async () => {
    if (address) {
      await linkWallet(address)
    }
  }

  // If wallet is connected and user is authenticated, show link button
  if (isConnected && user && address) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1 sm:gap-2 border-green-200 text-green-700 hover:bg-green-50 bg-white/90 backdrop-blur-sm shadow-sm text-xs sm:text-sm"
        onClick={handleLinkWallet}
        disabled={isLinking}
      >
        <Link className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">{isLinking ? 'Linking...' : 'Link Wallet'}</span>
        <span className="sm:hidden">{isLinking ? 'Linking...' : 'Link'}</span>
      </Button>
    )
  }

  // If wallet is connected but user not authenticated
  if (isConnected && address) {
    return (
      <Button
        variant="outline" 
        size="sm"
        className="gap-1 sm:gap-2 border-orange-200 text-orange-700 hover:bg-orange-50 bg-white/90 backdrop-blur-sm shadow-sm text-xs sm:text-sm"
        disabled
      >
        <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Connected: {address.slice(0, 6)}...{address.slice(-4)}</span>
        <span className="sm:hidden">Connected</span>
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1 sm:gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 bg-white/90 backdrop-blur-sm shadow-sm text-xs sm:text-sm"
        onClick={() => setIsModalOpen(true)}
        disabled={isConnecting}
      >
        <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Connect</span>
        <span className="sm:hidden">Connect</span>
      </Button>

      <WalletConnectModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onWalletSelect={handleWalletSelect}
        isConnecting={isConnecting}
        error={error}
      />
    </>
  )
}