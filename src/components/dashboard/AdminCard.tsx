import { motion } from 'framer-motion';
import { MoreVertical, Users, Trash2, Edit, Zap, AlertTriangle } from 'lucide-react';
import { AdminAccount, MAX_TEAM_MEMBERS } from '@/types/admin';
import { TeamCapacityBar } from './TeamCapacityBar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface AdminCardProps {
  account: AdminAccount;
  index: number;
  onEdit: (account: AdminAccount) => void;
  onDelete: (id: string) => void;
  onManageTeam: (account: AdminAccount) => void;
  onAutoDelete: (id: string) => void;
  isLoading?: boolean;
}

export function AdminCard({
  account,
  index,
  onEdit,
  onDelete,
  onManageTeam,
  onAutoDelete,
  isLoading,
}: AdminCardProps) {
  const isOverCapacity = account.members.length > MAX_TEAM_MEMBERS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300 ${
        isOverCapacity ? 'border-destructive/50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{account.name}</h3>
              {isOverCapacity && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Over Limit
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{account.email}</p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(account)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onManageTeam(account)}>
              <Users className="w-4 h-4 mr-2" />
              Manage Team
            </DropdownMenuItem>
            {isOverCapacity && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onAutoDelete(account.id)}
                  className="text-warning"
                  disabled={isLoading}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Trigger Auto-Delete
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(account.id)}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-primary">{account.teamName}</p>
      </div>

      <TeamCapacityBar memberCount={account.members.length} />

      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          {account.members.slice(0, 5).map((member, i) => (
            <div
              key={member.id}
              className="w-7 h-7 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs font-medium"
              title={member.name}
            >
              {member.name.charAt(0)}
            </div>
          ))}
          {account.members.length > 5 && (
            <div className="w-7 h-7 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-xs font-medium text-primary">
              +{account.members.length - 5}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onManageTeam(account)}
          className="text-xs"
        >
          Manage Team
        </Button>
      </div>
    </motion.div>
  );
}
