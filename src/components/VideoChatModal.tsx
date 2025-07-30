import { useEffect, useRef, useState } from "react";
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

declare global {
  interface Window {
    anam: any;
  }
}

export function VideoChatModal({ isOpen, onClose }: VideoChatModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [anamClient, setAnamClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const apiKey = "YzYxODc1NDgtOWEzNC00MmE5LTk5NjktZjM3NzM4ODNkMDkxOlMwclorMDRadUlwY0pYa0lpV04yZDFtZjFDZTNOUEp1K2orZnpuSjJYd0k9";

  // Load the Anam SDK script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.anam) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@anam-ai/js-sdk@2.4.4/dist/umd/anam.js';
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setError('Failed to load Anam SDK');
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    } else if (window.anam) {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen && scriptLoaded && videoRef.current) {
      initializeVideoChat();
    }

    return () => {
      if (anamClient) {
        anamClient.disconnect?.();
      }
    };
  }, [isOpen, scriptLoaded]);

  const initializeVideoChat = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.anam) {
        throw new Error('Anam SDK not loaded');
      }

      // Create the Anam client using the direct API key approach
      const { unsafe_createClientWithApiKey } = window.anam;
      const client = unsafe_createClientWithApiKey(apiKey, {
        name: "",
        avatarId: "6cc28442-cccd-42a8-b6e4-24b7210a09c5",
        voiceId: "8246d9f7-827e-4a5c-8697-644ce860ca02",
        llmId: "ANAM_GPT_4O_MINI_V1",
        systemPrompt: `[ROLE]
You are a helpful, concise, and reliable assistant.

[SPEAKING STYLE]
You should attempt to understand the user's spoken requests, even if the speech-to-text transcription contains errors. Your responses will be converted to speech using a text-to-speech system. Therefore, your output must be plain, unformatted text.

When you receive a transcribed user request:

1. Silently correct for likely transcription errors. Focus on the intended meaning, not the literal text. If a word sounds like another word in the given context, infer and correct. For example, if the transcription says "buy milk two tomorrow" interpret this as "buy milk tomorrow".
2. Provide short, direct answers unless the user explicitly asks for a more detailed response. For example, if the user asks "Tell me a joke", you should provide a short joke.
3. Always prioritize clarity and accuracy. Respond in plain text, without any formatting, bullet points, or extra conversational filler.
4. Occasionally add a pause "..." or disfluency eg., "Um" or "Erm."

Your output will be directly converted to speech, so your response should be natural-sounding and appropriate for a spoken conversation.

[USEFUL CONTEXT]
`,
      });

      setAnamClient(client);

      // Stream to the video element
      if (videoRef.current) {
        await client.streamToVideoElement(videoRef.current.id);
        
        // Add listener for when video starts playing
        client.addListener('VIDEO_PLAY_STARTED', () => {
          client.talk('Hello! I\'m your AI assistant. How can I help you today?');
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
      anamClient.disconnect?.();
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