export type ActivityType = 
  | 'member_added'
  | 'member_removed'
  | 'admin_created'
  | 'admin_deleted'
  | 'admin_updated'
  | 'auto_delete_triggered'
  | 'json_imported'
  | 'team_at_capacity'
  | 'team_over_capacity';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: string;
  adminId?: string;
  adminName?: string;
  details?: Record<string, any>;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ScheduledTask {
  id: string;
  name: string;
  type: 'auto_delete' | 'backup' | 'report';
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
}
