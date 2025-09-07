import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { walletOptions, type WalletType } from '@/lib/wallet'
import { cn } from '@/lib/utils'

interface WalletConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWalletSelect: (walletType: WalletType) => void
  isConnecting?: boolean
  error?: string
}

export function WalletConnectModal({
  open,
  onOpenChange,
  onWalletSelect,
  isConnecting = false,
  error
}: WalletConnectModalProps) {
  const [showAllWallets, setShowAllWallets] = useState(false)

  const primaryWallets = walletOptions.slice(0, 3)
  const secondaryWallets = walletOptions.slice(3)

  const handleWalletClick = (walletType: WalletType) => {
    const wallet = walletOptions.find(w => w.id === walletType)
    
    if (wallet?.isInstalled && !wallet.isInstalled()) {
      // Open download link in new tab
      if (wallet.downloadUrl) {
        window.open(wallet.downloadUrl, '_blank')
      }
      return
    }
    
    onWalletSelect(walletType)
  }

  const WalletCard = ({ wallet }: { wallet: typeof walletOptions[0] }) => {
    const isInstalled = wallet.isInstalled ? wallet.isInstalled() : true
    
    return (
      <Card 
        className={cn(
          "p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-border",
          "hover:border-primary/20 hover:bg-card/80",
          isConnecting && "opacity-50 pointer-events-none"
        )}
        onClick={() => handleWalletClick(wallet.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{wallet.icon}</div>
            <div>
              <div className="font-medium text-card-foreground">{wallet.name}</div>
              <div className="text-sm text-muted-foreground">{wallet.description}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isInstalled && (
              <Badge variant="outline" className="text-xs">
                Install
              </Badge>
            )}
            {!isInstalled && wallet.downloadUrl && (
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-6 w-6"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl font-semibold text-center">
            Connect Wallet
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Connect your crypto wallet to get started
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Error Display */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Primary Wallets */}
          <div className="space-y-3">
            {primaryWallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </div>

          {/* Other Wallets Toggle */}
          {secondaryWallets.length > 0 && (
            <div className="space-y-3">
              <Button
                variant="ghost"
                className="w-full text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setShowAllWallets(!showAllWallets)}
              >
                Other wallets
                {showAllWallets ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </Button>

              {showAllWallets && (
                <div className="space-y-3">
                  {secondaryWallets.map((wallet) => (
                    <WalletCard key={wallet.id} wallet={wallet} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              By connecting a wallet, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
