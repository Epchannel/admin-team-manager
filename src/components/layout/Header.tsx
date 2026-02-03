import { Bot, Plus, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onAddAdmin: () => void;
  onImportJson: () => void;
}

export function Header({ onAddAdmin, onImportJson }: HeaderProps) {
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
