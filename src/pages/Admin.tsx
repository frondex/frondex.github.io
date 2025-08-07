import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OpenAISettings } from "@/components/OpenAISettings";
import { AnamSettings } from "@/components/AnamSettings";
import { PrivateMarketsSettings } from "@/components/PrivateMarketsSettings";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin123") {
      setIsAuthenticated(true);
      setLoginError("");
      toast({
        title: "Welcome",
        description: "Successfully logged into admin panel.",
      });
    } else {
      setLoginError("Invalid credentials");
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
    }
  };

  const handleSettingsChange = (settingType: string) => {
    toast({
      title: "Settings Updated",
      description: `Your ${settingType} settings have been saved.`,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              {loginError && (
                <p className="text-sm text-red-600">{loginError}</p>
              )}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setIsAuthenticated(false);
                setUsername("");
                setPassword("");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                OpenAI Settings
              </CardTitle>
              <CardDescription>
                Configure OpenAI API key and model preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OpenAISettings onSettingsChange={() => handleSettingsChange("OpenAI")} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Anam Settings
              </CardTitle>
              <CardDescription>
                Configure Anam session token and avatar settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnamSettings onSettingsChange={() => handleSettingsChange("Anam")} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Private Markets Settings
              </CardTitle>
              <CardDescription>
                Configure Private Markets Intelligence Agent settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrivateMarketsSettings onSettingsChange={() => handleSettingsChange("Private Markets")} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;