import React from 'react';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCredits } from '@/hooks/useCredits';

interface CreditDisplayProps {
  showTransactions?: boolean;
  className?: string;
}

const CreditDisplay: React.FC<CreditDisplayProps> = ({ 
  showTransactions = false, 
  className = "" 
}) => {
  const { credits, transactions, loading } = useCredits();

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            <Skeleton className="h-5 w-20" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-4" />
          {showTransactions && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Coins className="w-5 h-5 text-amber-500" />
          Credits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold text-foreground">{credits}</span>
          <span className="text-sm text-muted-foreground">available</span>
        </div>
        
        {credits < 10 && (
          <Badge variant="destructive" className="mb-4">
            Low balance
          </Badge>
        )}
        
        {showTransactions && transactions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground mb-2">Recent Activity</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {transactions.slice(0, 5).map((transaction, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <div className="flex items-center gap-2">
                    {transaction.amount > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className="text-muted-foreground truncate max-w-20">
                      {transaction.description}
                    </span>
                  </div>
                  <span 
                    className={`font-medium ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreditDisplay;