import { useState } from "react";
import { Settings, Database, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { PrivateMarketsService, type PrivateMarketsSettings } from "@/lib/private-markets";

interface PrivateMarketsSettingsProps {
  onSettingsChange?: () => void;
}

export function PrivateMarketsSettings({ onSettingsChange }: PrivateMarketsSettingsProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<PrivateMarketsSettings>(PrivateMarketsService.getSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      PrivateMarketsService.saveSettings(settings);
      onSettingsChange?.();
      setOpen(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = (key: keyof PrivateMarketsSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const checkApiHealth = async () => {
    setIsHealthy(null);
    const healthy = await PrivateMarketsService.checkHealth(settings.apiUrl);
    setIsHealthy(healthy);
  };

  const responseFormatOptions = [
    { id: 'conversational', name: 'Conversational', description: 'Natural, detailed responses' },
    { id: 'structured', name: 'Structured', description: 'Organized data format' },
    { id: 'brief', name: 'Brief', description: 'Concise, quick answers' }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Database className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Private Markets Intelligence Settings
          </DialogTitle>
          <DialogDescription>
            Configure your connection to the Private Markets Intelligence Agent for specialized financial data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* API URL */}
          <div className="grid gap-2">
            <Label htmlFor="apiUrl" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              API URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="apiUrl"
                type="url"
                value={settings.apiUrl}
                onChange={(e) => handleSettingChange('apiUrl', e.target.value)}
                placeholder="https://merry-creativity-production.up.railway.app"
              />
              <Button variant="outline" size="sm" onClick={checkApiHealth}>
                Test
              </Button>
            </div>
            {isHealthy !== null && (
              <p className={`text-xs ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                {isHealthy ? '✓ API is healthy' : '✗ API is not responding'}
              </p>
            )}
          </div>

          {/* User ID */}
          <div className="grid gap-2">
            <Label htmlFor="userId" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              User ID
            </Label>
            <Input
              id="userId"
              value={settings.userId}
              onChange={(e) => handleSettingChange('userId', e.target.value)}
              placeholder="user-123"
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for your conversations and session management.
            </p>
          </div>

          {/* App ID */}
          <div className="grid gap-2">
            <Label htmlFor="appId">App ID</Label>
            <Input
              id="appId"
              value={settings.appId}
              onChange={(e) => handleSettingChange('appId', e.target.value)}
              placeholder="frondex-chat"
            />
            <p className="text-xs text-muted-foreground">
              Application identifier for multi-app support.
            </p>
          </div>

          {/* Response Format */}
          <div className="grid gap-2">
            <Label htmlFor="responseFormat">Response Format</Label>
            <Select
              value={settings.responseFormat}
              onValueChange={(value: 'conversational' | 'structured' | 'brief') => 
                handleSettingChange('responseFormat', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select response format" />
              </SelectTrigger>
              <SelectContent>
                {responseFormatOptions.map((format) => (
                  <SelectItem key={format.id} value={format.id}>
                    <div>
                      <div className="font-medium">{format.name}</div>
                      <div className="text-xs text-muted-foreground">{format.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Max Results */}
          <div className="grid gap-2">
            <Label htmlFor="maxResults">
              Max Results: {settings.maxResults}
            </Label>
            <Slider
              id="maxResults"
              min={1}
              max={20}
              step={1}
              value={[settings.maxResults]}
              onValueChange={(value) => handleSettingChange('maxResults', value[0])}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of entities to return per query.
            </p>
          </div>

          {/* Include Charts Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="includeCharts">Include Visualizations</Label>
              <p className="text-xs text-muted-foreground">
                Enable chart and visualization suggestions
              </p>
            </div>
            <Switch
              id="includeCharts"
              checked={settings.includeCharts}
              onCheckedChange={(checked) => handleSettingChange('includeCharts', checked)}
            />
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertDescription>
              <strong>Private Markets Intelligence Agent</strong> provides specialized access to 
              private equity, venture capital, and hedge fund data with conversational context 
              and rich structured responses.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !settings.apiUrl.trim()}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}