import { motion } from 'framer-motion';
import { 
  UserPlus, 
  UserMinus, 
  Shield, 
  Trash2, 
  Edit, 
  Zap, 
  FileJson, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { ActivityLog, ActivityType } from '@/types/activity';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityLogsProps {
  logs: ActivityLog[];
}

export function ActivityLogs({ logs }: ActivityLogsProps) {
  const getIcon = (type: ActivityType) => {
    switch (type) {
      case 'member_added':
        return <UserPlus className="w-4 h-4 text-success" />;
      case 'member_removed':
        return <UserMinus className="w-4 h-4 text-destructive" />;
      case 'admin_created':
        return <Shield className="w-4 h-4 text-primary" />;
      case 'admin_deleted':
        return <Trash2 className="w-4 h-4 text-destructive" />;
      case 'admin_updated':
        return <Edit className="w-4 h-4 text-primary" />;
      case 'auto_delete_triggered':
        return <Zap className="w-4 h-4 text-warning" />;
      case 'json_imported':
        return <FileJson className="w-4 h-4 text-primary" />;
      case 'team_at_capacity':
      case 'team_over_capacity':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Activity Logs</h3>
      </div>

      <ScrollArea className="h-[400px]">
        {logs.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No activity yet
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-4">
              {logs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 relative"
                >
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center z-10 shrink-0">
                    {getIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0 pb-4">
                    <p className="text-sm">{log.message}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{formatTime(log.timestamp)}</span>
                      {log.adminName && (
                        <>
                          <span>•</span>
                          <span>{log.adminName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </motion.div>
  );
}
