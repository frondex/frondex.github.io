import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JoinWaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JoinWaitlistModal: React.FC<JoinWaitlistModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Welcome to the waitlist!",
        description: "We'll notify you when we launch. Thanks for your interest!",
      });
      setEmail("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 border-0 bg-transparent shadow-none">
        <div className="relative h-[40rem] w-full rounded-lg bg-background overflow-hidden">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground font-bold mb-4">
                Join the Waitlist
              </h1>
              
              <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-sm md:text-base">
                Be the first to experience our revolutionary AI platform. Get early access to advanced chat features, 
                agent mode, and exclusive beta testing opportunities.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full max-w-md mx-auto"
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full max-w-md mx-auto font-semibold"
                >
                  Join Waitlist
                </Button>
              </form>
            </div>
          </div>
          
          <BackgroundBeams />
        </div>
      </DialogContent>
    </Dialog>
  );
};