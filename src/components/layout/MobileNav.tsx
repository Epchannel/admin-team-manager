import { LayoutGrid, Users, BarChart3, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddAdmin: () => void;
}

export function MobileNav({ activeTab, onTabChange, onAddAdmin }: MobileNavProps) {
  const tabs = [
    { id: 'admins', icon: LayoutGrid, label: 'Admins' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'activity', icon: Clock, label: 'Activity' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
        
        {/* Floating Add Button */}
        <Button
          size="icon"
          className="absolute -top-6 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full shadow-lg"
          onClick={onAddAdmin}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </nav>
  );
}
