import { useState } from "react";
import { Settings, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OpenAIService, type OpenAISettings } from "@/lib/openai";

interface OpenAISettingsProps {
  onSettingsChange?: () => void;
}

export function OpenAISettings({ onSettingsChange }: OpenAISettingsProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<OpenAISettings>(OpenAIService.getSettings());
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      OpenAIService.saveSettings(settings);
      onSettingsChange?.();
      setOpen(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (key: keyof OpenAISettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const availableModels = OpenAIService.getAvailableModels();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>OpenAI Settings</DialogTitle>
          <DialogDescription>
            Configure your OpenAI API key and preferences for the chatbot.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* API Key */}
          <div className="grid gap-2">
            <Label htmlFor="apiKey">OpenAI API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                placeholder="sk-..."
                value={settings.apiKey}
                onChange={(e) => handleSettingChange('apiKey', e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-10"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>

          {/* Model Selection */}
          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Select
              value={settings.model}
              onValueChange={(value) => handleSettingChange('model', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Streaming Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="streaming">Streaming</Label>
              <p className="text-xs text-muted-foreground">
                Enable real-time response streaming
              </p>
            </div>
            <Switch
              id="streaming"
              checked={settings.streaming}
              onCheckedChange={(checked) => handleSettingChange('streaming', checked)}
            />
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertDescription>
              Get your API key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                OpenAI Platform
              </a>
              . Usage will be charged to your OpenAI account.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !settings.apiKey.trim()}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}