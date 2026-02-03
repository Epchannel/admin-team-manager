import { useState, useCallback } from 'react';
import { Notification, ActivityLog, ActivityType } from '@/types/activity';

const generateId = () => Math.random().toString(36).substring(2, 9);

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Team Over Capacity',
    message: 'Marketing Team has exceeded the 6 member limit',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
  },
  {
    id: '2',
    type: 'success',
    title: 'Member Added',
    message: 'Developer 3 was added to Development Team',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: true,
  },
  {
    id: '3',
    type: 'info',
    title: 'Import Complete',
    message: '2 admin accounts imported successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
  },
];

const initialActivityLogs: ActivityLog[] = [
  {
    id: '1',
    type: 'member_added',
    message: 'Developer 3 was added to Development Team',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    adminName: 'Admin One',
  },
  {
    id: '2',
    type: 'team_over_capacity',
    message: 'Marketing Team exceeded capacity (7/6 members)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    adminName: 'Admin Two',
  },
  {
    id: '3',
    type: 'admin_created',
    message: 'New admin account created: Admin Two',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: '4',
    type: 'json_imported',
    message: 'Imported 2 admin accounts from JSON',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: '5',
    type: 'auto_delete_triggered',
    message: 'Auto-delete removed 1 member from Marketing Team',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    adminName: 'Admin Two',
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string
  ) => {
    const newNotification: Notification = {
      id: generateId(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addActivityLog = useCallback((
    type: ActivityType,
    message: string,
    adminName?: string,
    details?: Record<string, any>
  ) => {
    const newLog: ActivityLog = {
      id: generateId(),
      type,
      message,
      timestamp: new Date().toISOString(),
      adminName,
      details,
    };
    setActivityLogs(prev => [newLog, ...prev]);
  }, []);

  return {
    notifications,
    activityLogs,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    addActivityLog,
  };
}
