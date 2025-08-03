import { useState } from "react";
import { Settings, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AnamSettingsProps {
  onSettingsChange?: () => void;
}

interface AnamSettings {
  sessionToken: string;
}

export class AnamService {
  private static STORAGE_KEY = 'anam_settings';

  static getSettings(): AnamSettings {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing Anam settings:', error);
      }
    }
    return {
      sessionToken: ''
    };
  }

  static saveSettings(settings: AnamSettings): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
  }
}

export function AnamSettings({ onSettingsChange }: AnamSettingsProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AnamSettings>(AnamService.getSettings());
  const [showToken, setShowToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      AnamService.saveSettings(settings);
      onSettingsChange?.();
      setOpen(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (key: keyof AnamSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Anam Settings</DialogTitle>
          <DialogDescription>
            Configure your Anam session token for video chat functionality.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Session Token */}
          <div className="grid gap-2">
            <Label htmlFor="sessionToken">Session Token</Label>
            <div className="relative">
              <Input
                id="sessionToken"
                type={showToken ? "text" : "password"}
                placeholder="eyJhbGciOiJIUzI1NiJ9..."
                value={settings.sessionToken}
                onChange={(e) => handleSettingChange('sessionToken', e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-10"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your session token is stored locally and used for Anam video chat sessions.
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertDescription>
              Get your session token from your Anam dashboard or API endpoint. 
              This token is required for video chat functionality.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !settings.sessionToken.trim()}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}