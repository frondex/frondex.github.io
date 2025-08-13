import React from 'react';
import { Crown, Settings, LogOut, Coins, Gift, HelpCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useCredits } from '@/hooks/useCredits';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface UserAccountDropdownProps {
  user: SupabaseUser;
  onUpgradeClick: () => void;
}

const UserAccountDropdown: React.FC<UserAccountDropdownProps> = ({ 
  user, 
  onUpgradeClick 
}) => {
  const { credits } = useCredits();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  const getUserDisplayName = () => {
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-3 h-10 px-3 bg-white/90 backdrop-blur-sm border shadow-sm hover:bg-gray-50"
        >
          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {getUserInitials()}
          </div>
          
          {/* User Info */}
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-medium text-gray-900 truncate max-w-32">
              {getUserDisplayName()}
            </span>
            <div className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-500" />
              <span className="text-xs text-gray-600">{credits} credits</span>
            </div>
          </div>

          {/* Upgrade Badge */}
          <Badge 
            variant="secondary" 
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-0.5 border-0"
          >
            <Crown className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-80 bg-white border shadow-lg z-50" 
        align="end"
        sideOffset={8}
      >
        {/* User Info Header */}
        <DropdownMenuLabel className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
              {getUserInitials()}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{getUserDisplayName()}</span>
              <span className="text-sm text-gray-500">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Credits Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Credits</span>
            <span className="text-lg font-bold text-gray-900">{credits}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((credits / 100) * 100, 100)}%` }}
            />
          </div>
          {credits < 20 && (
            <Badge variant="destructive" className="mb-2">
              Low balance
            </Badge>
          )}
          <Button 
            size="sm" 
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            onClick={onUpgradeClick}
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Pro
          </Button>
        </div>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuItem className="cursor-pointer p-3 hover:bg-gray-50">
          <Gift className="w-4 h-4 mr-3 text-gray-500" />
          <span>Get free credits</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer p-3 hover:bg-gray-50">
          <User className="w-4 h-4 mr-3 text-gray-500" />
          <span>Profile settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer p-3 hover:bg-gray-50">
          <Settings className="w-4 h-4 mr-3 text-gray-500" />
          <span>Account settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer p-3 hover:bg-gray-50">
          <HelpCircle className="w-4 h-4 mr-3 text-gray-500" />
          <span>Help Center</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          className="cursor-pointer p-3 hover:bg-gray-50 text-red-600 focus:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountDropdown;