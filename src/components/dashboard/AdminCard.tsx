import { motion } from 'framer-motion';
import { MoreVertical, Users, Trash2, Edit, Zap, AlertTriangle, RefreshCw, Clock, ShieldCheck, ShieldX } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useLanguage } from '@/hooks/useLanguage';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AdminCardProps {
  account: AdminAccount;
  index: number;
  onEdit: (account: AdminAccount) => void;
  onDelete: (id: string) => void;
  onManageTeam: (account: AdminAccount) => void;
  onAutoDelete: (id: string) => void;
  onRefresh?: (id: string) => void;
  lastCheck?: string | null;
  isLoading?: boolean;
  // Bulk selection
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  showCheckbox?: boolean;
}

export function AdminCard({
  account,
  index,
  onEdit,
  onDelete,
  onManageTeam,
  onAutoDelete,
  onRefresh,
  lastCheck,
  isLoading,
  isSelected,
  onSelect,
  showCheckbox,
}: AdminCardProps) {
  const { language, t } = useLanguage();
  const isOverCapacity = account.members.length > MAX_TEAM_MEMBERS;

  const formatLastCheck = (timestamp: string | null | undefined) => {
    if (!timestamp) return null;
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: language === 'vi' ? vi : enUS 
      });
    } catch {
      return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300 ${
        isOverCapacity ? 'border-destructive/50' : ''
      } ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Bulk Selection Checkbox */}
          {showCheckbox && onSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(account.id, !!checked)}
              className="mt-1"
            />
          )}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{account.name}</h3>
              {isOverCapacity && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {t('card.overLimit')}
                </Badge>
              )}
              {/* Token Health Badge */}
              {account.tokenHealth && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge 
                        variant={account.tokenHealth.isValid ? 'default' : 'destructive'}
                        className={`text-xs ${account.tokenHealth.isValid ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : ''}`}
                      >
                        {account.tokenHealth.isValid ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <ShieldX className="w-3 h-3" />
                        )}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {account.tokenHealth.isValid 
                        ? t('card.tokenValid')
                        : `${t('card.tokenError')}: ${account.tokenHealth.error || 'Unknown'}`
                      }
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
              {t('card.editAccount')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onManageTeam(account)}>
              <Users className="w-4 h-4 mr-2" />
              {t('card.manageTeam')}
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
                  {t('card.triggerAutoDelete')}
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(account.id)}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('card.deleteAccount')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-primary">{account.teamName}</p>
        {lastCheck && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{t('card.checked')} {formatLastCheck(lastCheck)}</span>
          </div>
        )}
      </div>

      <TeamCapacityBar memberCount={account.members.length} />

      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          {account.members.slice(0, 5).map((member) => (
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
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRefresh(account.id)}
              disabled={isLoading}
              className="text-xs"
              title={t('card.sync')}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              {t('card.sync')}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onManageTeam(account)}
            className="text-xs"
          >
            {t('card.manageTeam')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
