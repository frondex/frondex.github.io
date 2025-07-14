import { useState } from "react";
import { Settings, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FlowithSettings as FlowithSettingsType, FlowithService } from "@/lib/flowith";

interface FlowithSettingsProps {
  onSettingsChange: (settings: FlowithSettingsType) => void;
  currentSettings?: FlowithSettingsType;
}

const FlowithSettings = ({ onSettingsChange, currentSettings }: FlowithSettingsProps) => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<FlowithSettingsType>(
    currentSettings || {
      apiToken: 'flo_2f05bddeeae758a564068e9755c530e237462eb560d103a4fec0697273fbc67e',
      kbIds: [],
      model: 'gpt-4o-mini',
      stream: true
    }
  );

  const handleSave = () => {
    FlowithService.saveSettings(settings);
    onSettingsChange(settings);
    setOpen(false);
  };

  const handleKbIdsChange = (value: string) => {
    const kbIds = value.split(',').map(id => id.trim()).filter(id => id.length > 0);
    setSettings(prev => ({ ...prev, kbIds }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Flowith API Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiToken">API Token</Label>
            <Input
              id="apiToken"
              type="password"
              value={settings.apiToken}
              onChange={(e) => setSettings(prev => ({ ...prev, apiToken: e.target.value }))}
              placeholder="flo_..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kbIds">Knowledge Base IDs (comma-separated)</Label>
            <Input
              id="kbIds"
              value={settings.kbIds.join(', ')}
              onChange={(e) => handleKbIdsChange(e.target.value)}
              placeholder="kb1, kb2, kb3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={settings.model}
              onChange={(e) => setSettings(prev => ({ ...prev, model: e.target.value }))}
              placeholder="gpt-4o-mini"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="stream">Enable Streaming</Label>
            <Switch
              id="stream"
              checked={settings.stream}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, stream: checked }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlowithSettings;