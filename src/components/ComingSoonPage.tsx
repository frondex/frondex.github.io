import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Bell, Sparkles } from 'lucide-react';
import { JoinWaitlistModal } from './JoinWaitlistModal';

interface ComingSoonPageProps {
  plan: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ plan }) => {
  const [showWaitlistModal, setShowWaitlistModal] = React.useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full text-center">
        <CardHeader className="space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <Badge className="mb-4">Coming Soon</Badge>
            <CardTitle className="text-3xl font-bold">
              {plan} Plan Launch
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              We're putting the finishing touches on our {plan} plan. Be the first to know when it's ready!
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="grid gap-4 text-left">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Advanced AI-powered market intelligence</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Priority access to new features</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Exclusive launch pricing</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Direct line to our product team</span>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowWaitlistModal(true)}
            className="w-full gap-2"
            size="lg"
          >
            <Bell className="w-4 h-4" />
            Join the Waitlist
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <p className="text-sm text-muted-foreground">
            In the meantime, explore our free tier and see what Frondex can do for your private markets research.
          </p>
        </CardContent>
      </Card>
      
      <JoinWaitlistModal
        open={showWaitlistModal}
        onOpenChange={setShowWaitlistModal}
      />
    </div>
  );
};

export default ComingSoonPage;