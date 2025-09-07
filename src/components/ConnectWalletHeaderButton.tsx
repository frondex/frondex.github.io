import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WalletConnectModal } from '@/components/ui/wallet-connect-modal'
import { useWalletAuth } from '@/hooks/useWalletAuth'
import { Wallet } from 'lucide-react'
import type { WalletType } from '@/lib/wallet'

export function ConnectWalletHeaderButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { isConnecting, error, connectWallet } = useWalletAuth()

  const handleWalletSelect = async (walletType: WalletType) => {
    await connectWallet(walletType)
    setIsModalOpen(false)
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