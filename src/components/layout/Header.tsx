import { Bot, Plus, FileJson, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { Notification } from '@/types/activity';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
}: HeaderProps) {
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
          </div>
        </div>
      </div>
    </header>
  );
}
