import { useState, useEffect } from 'react';
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
  Clock,
  CheckCircle,
  XCircle,
  Play,
  RefreshCw,
  Timer
} from 'lucide-react';
import { ActivityLog, ActivityType } from '@/types/activity';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCronStatus, CronLog } from '@/hooks/useCronStatus';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ActivityLogsProps {
  logs: ActivityLog[];
}

export function ActivityLogs({ logs }: ActivityLogsProps) {
  const { cronStatus, cronLogs, isLoading, triggerCronRun, fetchCronStatus, fetchCronLogs } = useCronStatus();

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

  const formatRelativeTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: vi });
    } catch {
      return timestamp;
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchCronStatus(), fetchCronLogs()]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6"
    >
      <Tabs defaultValue="activity" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="activity" className="gap-2">
              <Clock className="w-4 h-4" />
              Activity Logs
            </TabsTrigger>
            <TabsTrigger value="cron" className="gap-2">
              <Timer className="w-4 h-4" />
              Cron Status
            </TabsTrigger>
          </TabsList>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <TabsContent value="activity">
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
        </TabsContent>

        <TabsContent value="cron" className="space-y-4">
          {/* Cron Status Card */}
          {cronStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {cronStatus.running ? (
                    <Play className="w-4 h-4 text-success" />
                  ) : (
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">Status</span>
                </div>
                <Badge variant={cronStatus.running ? 'default' : 'secondary'}>
                  {cronStatus.running ? 'Running' : 'Idle'}
                </Badge>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Last Run</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {cronStatus.lastRun ? formatRelativeTime(cronStatus.lastRun) : 'Never'}
                </p>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Interval</span>
                </div>
                <p className="text-sm text-muted-foreground">{cronStatus.interval}</p>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">Stats</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-success">{cronStatus.stats.successfulChecks} ✓</span>
                  <span className="text-destructive">{cronStatus.stats.failedChecks} ✗</span>
                  <span className="text-muted-foreground">{cronStatus.stats.totalChecks} total</span>
                </div>
              </div>
            </div>
          )}

          {/* Trigger Button */}
          <div className="flex justify-end">
            <Button onClick={triggerCronRun} disabled={isLoading || cronStatus?.running}>
              <Play className="w-4 h-4 mr-2" />
              Trigger Manual Run
            </Button>
          </div>

          {/* Cron Logs */}
          <div>
            <h4 className="text-sm font-medium mb-3">Recent Cron Logs</h4>
            <ScrollArea className="h-[250px]">
              {cronLogs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No cron logs yet
                </div>
              ) : (
                <div className="space-y-2">
                  {cronLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {log.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {log.adminEmail || log.adminId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.memberCount} members • {log.checkType}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                          {log.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatRelativeTime(log.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
