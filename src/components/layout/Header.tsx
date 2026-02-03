import { Bot, Plus, FileJson, Download, LogOut, RefreshCw, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Notification } from '@/types/activity';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  onAddAdmin: () => void;
  onImportJson: () => void;
  onExportCSV: (type: 'admins' | 'users') => void;
  onExportJSON: () => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotification: (id: string) => void;
  countdown?: number;
  isRefreshing?: boolean;
  onManualRefresh?: () => void;
}

export function Header({ 
  onAddAdmin, 
  onImportJson,
  onExportCSV,
  onExportJSON,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotification,
  countdown,
  isRefreshing,
  onManualRefresh,
}: HeaderProps) {
  const { signOut } = useAuth();

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 glow-effect">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ChatGPT Admin Manager</h1>
              <p className="text-sm text-muted-foreground">Manage your admin accounts & teams</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-refresh indicator */}
            {countdown !== undefined && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Timer className="w-3 h-3" />
                <span>Auto-refresh: {countdown}s</span>
                {onManualRefresh && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onManualRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                )}
              </div>
            )}

            <ThemeToggle />
            
            <NotificationCenter
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={onMarkAsRead}
              onMarkAllAsRead={onMarkAllAsRead}
              onClear={onClearNotification}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExportCSV('admins')}>
                  Export Admins (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportCSV('users')}>
                  Export Users (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportJSON}>
                  Export All (JSON)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" onClick={onImportJson}>
              <FileJson className="w-4 h-4 mr-2" />
              Import JSON
            </Button>
            <Button onClick={onAddAdmin}>
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      A
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">Admin</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
