import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface SignupPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignup: () => void;
  onLogin: () => void;
}

export function SignupPrompt({ open, onOpenChange, onSignup, onLogin }: SignupPromptProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-8 bg-white">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-6 w-6 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col items-center space-y-6 -mt-4">
          {/* Frondex Logo */}
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <img 
              src="/lovable-uploads/1ad1bb02-baea-496e-9c88-6451decd0e12.png" 
              alt="Frondex" 
              className="h-10 w-auto"
            />
          </div>
          
          {/* Heading */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">
              Join and start building
            </h2>
            <p className="text-gray-600 text-base leading-relaxed max-w-sm">
              Create a free account to continue your private markets journey with unlimited access to Frondex AI
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="w-full space-y-3">
            <Button 
              variant="outline" 
              className="w-full h-12 text-base font-medium border-gray-300 hover:bg-gray-50"
              onClick={onLogin}
            >
              Log in
            </Button>
            <Button 
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              onClick={onSignup}
            >
              Sign up
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}