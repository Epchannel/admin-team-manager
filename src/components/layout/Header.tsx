import { Bot, Plus, Download, LogOut, RefreshCw, Timer, Zap, Activity, Keyboard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Notification } from '@/types/activity';
import { useAuth } from '@/hooks/useAuth';
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface TeamSlotInfo {
  teamName: string;
  slots: number;
}

interface HeaderProps {
  onAddAdmin: () => void;
  onQuickAddUsers: () => void;
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
  availableSlots?: number;
  teamSlots?: TeamSlotInfo[];
  onSyncAll?: () => void;
  onCheckHealth?: () => void;
  isSyncing?: boolean;
}

export function Header({ 
  onAddAdmin, 
  onQuickAddUsers,
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
  availableSlots = 0,
  teamSlots = [],
  onSyncAll,
  onCheckHealth,
  isSyncing,
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

          <div className="flex items-center gap-2">
            {/* Auto-refresh indicator - hidden on mobile */}
            {countdown !== undefined && (
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                <Timer className="w-3 h-3" />
                <span>{countdown}s</span>
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

            {/* Actions Dropdown - Groups Sync, Health, Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Activity className="w-4 h-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onAddAdmin}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Admin (N)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onSyncAll && (
                  <DropdownMenuItem onClick={onSyncAll} disabled={isSyncing}>
                    {isSyncing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Sync All (S)
                  </DropdownMenuItem>
                )}
                {onCheckHealth && (
                  <DropdownMenuItem onClick={onCheckHealth} disabled={isSyncing}>
                    <Activity className="w-4 h-4 mr-2" />
                    Health Check
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onExportCSV('admins')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Admins (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportCSV('users')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Users (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportJSON}>
                  <Download className="w-4 h-4 mr-2" />
                  Export All (JSON)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Keyboard Shortcuts - desktop only */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 hidden md:flex">
                  <Keyboard className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Phím tắt</h4>
                  <div className="space-y-1">
                    {KEYBOARD_SHORTCUTS.map((shortcut) => (
                      <div key={shortcut.key} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{shortcut.description}</span>
                        <kbd className="px-2 py-0.5 text-xs bg-muted rounded">{shortcut.key}</kbd>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <ThemeToggle />
            
            <NotificationCenter
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={onMarkAsRead}
              onMarkAllAsRead={onMarkAllAsRead}
              onClear={onClearNotification}
            />

            {/* Quick Add - Primary action with slot badge */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onQuickAddUsers} className="relative hidden md:flex">
                    <Zap className="w-4 h-4 mr-2" />
                    Quick Add
                    {availableSlots > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full bg-secondary text-secondary-foreground px-1">
                        {availableSlots}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Slots trống theo team:</p>
                    {teamSlots.length > 0 ? (
                      <div className="space-y-0.5 max-h-48 overflow-y-auto">
                        {teamSlots.map((team, idx) => (
                          <div key={idx} className="flex justify-between gap-4 text-xs">
                            <span className="truncate max-w-[150px]">{team.teamName}</span>
                            <span className={team.slots > 0 ? 'text-green-400' : 'text-muted-foreground'}>
                              {team.slots} slot{team.slots !== 1 ? 's' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Không có team nào</p>
                    )}
                    <p className="text-xs text-muted-foreground border-t pt-1 mt-1">
                      Tổng: {availableSlots} slots khả dụng
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>


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
