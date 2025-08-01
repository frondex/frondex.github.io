import { useEffect, useRef, useState } from "react";
import { getAnamSessionToken } from "@/lib/anam";

// Declare window properties for TypeScript
declare global {
  interface Window {
    anam: any;
    createAnamClient: any;
  }
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Mic, MicOff } from "lucide-react";

interface VideoChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoChatModal({ isOpen, onClose }: VideoChatModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [anamClient, setAnamClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get session token from our edge function
  const getSessionToken = async () => {
    return await getAnamSessionToken();
  };

  useEffect(() => {
    if (isOpen && videoRef.current) {
      initializeVideoChat();
    }

    return () => {
      if (anamClient) {
        anamClient.stopStreaming?.();
      }
    };
  }, [isOpen]);

  const initializeVideoChat = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load Anam SDK if not already loaded
      if (!window.createAnamClient) {
        // Use ES modules approach from documentation
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
          import { createClient } from "https://esm.sh/@anam-ai/js-sdk@latest";
          window.createAnamClient = createClient;
          window.dispatchEvent(new Event('anamLoaded'));
        `;
        document.head.appendChild(script);
        
        // Wait for script to load
        await new Promise((resolve) => {
          window.addEventListener('anamLoaded', resolve, { once: true });
          // Fallback timeout
          setTimeout(resolve, 3000);
        });
      }

      // Get session token from your endpoint
      const sessionToken = await getSessionToken();
      
      // Create the Anam client using session token (secure approach)
      const anamClient = window.createAnamClient(sessionToken);
      setAnamClient(anamClient);

      // Start streaming to the video element
      if (videoRef.current) {
        await anamClient.streamToVideoElement(videoRef.current.id);
        
        // Optional: Add event listeners for better UX
        anamClient.addListener('VIDEO_PLAY_STARTED', () => {
          console.log('Video chat started successfully!');
        });
        
        anamClient.addListener('CONNECTION_ESTABLISHED', () => {
          console.log('Connection established');
        });
      }
    } catch (err) {
      console.error("Failed to initialize video chat:", err);
      setError("Failed to start video chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Add mute/unmute logic here if supported by the SDK
  };

  const handleClose = () => {
    if (anamClient) {
      anamClient.stopStreaming?.();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Video Chat with AI Assistant
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative bg-black">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Connecting to AI assistant...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
              <div className="text-white text-center p-4">
                <p className="mb-4">{error}</p>
                <Button onClick={initializeVideoChat} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            id="anam-video-chat"
            autoPlay
            playsInline
            muted={false}
            className="w-full h-[400px] object-cover"
            style={{ backgroundColor: "#000" }}
          />

          {/* Video Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              {isMuted ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="px-6 py-4 bg-muted/50">
          <p className="text-sm text-muted-foreground text-center">
            Speak naturally with your AI assistant. The conversation will begin automatically.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}