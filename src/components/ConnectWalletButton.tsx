import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WalletConnectModal } from '@/components/ui/wallet-connect-modal'
import { useWalletAuth } from '@/hooks/useWalletAuth'
import { Wallet } from 'lucide-react'
import type { WalletType } from '@/lib/wallet'

export function ConnectWalletButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { isConnecting, error, connectWallet } = useWalletAuth()

  const handleWalletSelect = async (walletType: WalletType) => {
    await connectWallet(walletType)
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full border-border hover:bg-accent hover:text-accent-foreground"
        onClick={() => setIsModalOpen(true)}
        disabled={isConnecting}
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
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