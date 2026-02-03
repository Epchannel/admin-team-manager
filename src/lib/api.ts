// API Client for GPT Business Manager Backend
const API_BASE_URL = 'https://gpt.epmmo.com';

// Types matching API responses
export interface ApiUser {
  email: string;
}

export interface ApiAccount {
  id: string;
}

export interface ApiTeamMember {
  id: string;
  email: string;
  name?: string;
  role: 'owner' | 'member' | 'standard-user';
  addedAt?: string;
}

export interface ApiAdmin {
  id: string;
  user: ApiUser;
  account: ApiAccount;
  accessToken: string;
  teamMembers: ApiTeamMember[];
  teamName?: string;
}

export interface ApiPendingInvite {
  id: string;
  email: string;
  role: string;
  invitedAt: string;
  status: 'pending' | 'expired';
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  cronJob: {
    running: boolean;
    lastRun: string;
    stats: {
      totalChecks: number;
      successfulChecks: number;
      failedChecks: number;
    };
  };
}

export interface CronStatusResponse {
  success: boolean;
  running: boolean;
  lastRun: string;
  stats: {
    totalChecks: number;
    successfulChecks: number;
    failedChecks: number;
  };
  interval: string;
}

export interface CronLogEntry {
  id: number;
  adminId: string;
  adminEmail?: string;
  checkType: 'manual' | 'auto' | 'auto_remove';
  memberCount: number;
  status: 'success' | 'failed';
  createdAt: string;
  message?: string;
  errorMessage?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
  message?: string;
}

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Health Check
export const healthCheck = () => 
  apiFetch<HealthCheckResponse>('/health');

// Admin Management
export const getAdmins = () =>
  apiFetch<ApiResponse<ApiAdmin[]>>('/api/admins');

export const getAdmin = (adminId: string) =>
  apiFetch<ApiResponse<ApiAdmin>>(`/api/admins/${adminId}`);

export const createAdmin = (admin: Omit<ApiAdmin, 'teamMembers'>) =>
  apiFetch<ApiResponse<ApiAdmin>>('/api/admins', {
    method: 'POST',
    body: JSON.stringify(admin),
  });

export const updateAdmin = (adminId: string, admin: Partial<ApiAdmin>) =>
  apiFetch<ApiResponse<ApiAdmin>>(`/api/admins/${adminId}`, {
    method: 'PUT',
    body: JSON.stringify(admin),
  });

export const deleteAdmin = (adminId: string) =>
  apiFetch<ApiResponse<null>>(`/api/admins/${adminId}`, {
    method: 'DELETE',
  });

export const updateTeamMembers = (adminId: string, teamMembers: ApiTeamMember[]) =>
  apiFetch<ApiResponse<ApiAdmin>>(`/api/admins/${adminId}/members`, {
    method: 'PUT',
    body: JSON.stringify({ teamMembers }),
  });

export const updateTeamName = (adminId: string, teamName: string) =>
  apiFetch<ApiResponse<ApiAdmin>>(`/api/admins/${adminId}/teamname`, {
    method: 'PUT',
    body: JSON.stringify({ teamName }),
  });

// ChatGPT Proxy API
export const getTeamMembersFromChatGPT = (
  accountId: string,
  accessToken: string,
  params?: { offset?: number; limit?: number; query?: string }
) =>
  apiFetch<ApiResponse<ApiTeamMember[]>>(
    `/api/proxy/accounts/${accountId}/users?${new URLSearchParams({
      offset: String(params?.offset || 0),
      limit: String(params?.limit || 25),
      query: params?.query || '',
    })}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

export const getPendingInvites = (accountId: string, accessToken: string) =>
  apiFetch<ApiResponse<ApiPendingInvite[]>>(
    `/api/proxy/accounts/${accountId}/invites`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

export const sendInvite = (
  accountId: string,
  accessToken: string,
  emails: string[],
  role: string = 'standard-user'
) =>
  apiFetch<ApiResponse<null>>(
    `/api/proxy/accounts/${accountId}/invites`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ email_addresses: emails, role }),
    }
  );

export const cancelInvite = (
  accountId: string,
  accessToken: string,
  email: string
) =>
  apiFetch<ApiResponse<null>>(
    `/api/proxy/accounts/${accountId}/invites`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ email_address: email }),
    }
  );

export const removeTeamMember = (
  accountId: string,
  accessToken: string,
  userId: string
) =>
  apiFetch<ApiResponse<null>>(
    `/api/proxy/accounts/${accountId}/users/${userId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

export const checkAccountStatus = (accessToken: string) =>
  apiFetch<ApiResponse<unknown>>(
    '/api/proxy/accounts/check',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

// Cron Job API
export const getCronStatus = () =>
  apiFetch<CronStatusResponse>('/api/cron-status');

export const getCronLogs = (adminId?: string, limit: number = 50) =>
  adminId
    ? apiFetch<ApiResponse<CronLogEntry[]>>(`/api/cron-logs/${adminId}?limit=${limit}`)
    : apiFetch<ApiResponse<CronLogEntry[]>>(`/api/cron-logs?limit=${limit}`);

export const addCronLog = (log: {
  adminId: string;
  adminEmail: string;
  checkType: 'manual' | 'auto' | 'auto_remove';
  memberCount: number;
  status: 'success' | 'failed';
}) =>
  apiFetch<ApiResponse<CronLogEntry>>('/api/cron-logs', {
    method: 'POST',
    body: JSON.stringify(log),
  });

export const triggerCronRun = () =>
  apiFetch<ApiResponse<null>>('/api/cron-run', {
    method: 'POST',
  });

// Auto-Add Feature - Automatically distribute emails to teams with available slots
export interface AutoAddResult {
  success: boolean;
  summary: {
    totalRequested: number;
    successCount: number;
    failedCount: number;
  };
  results: {
    success: Array<{ email: string; adminId: string; teamName: string }>;
    assignments: Array<{ email: string; adminId: string; teamName: string }>;
    failed?: Array<{ email: string; reason: string }>;
  };
}

export const autoAddUsers = (emails: string[]) =>
  apiFetch<AutoAddResult>('/api/auto-add', {
    method: 'POST',
    body: JSON.stringify({ emails }),
  });

// Sync API - Sync members and pending invites from ChatGPT API
export interface SyncResult {
  success: boolean;
  summary: {
    syncedAdmins: number;
    failedAdmins: number;
    totalMembers: number;
    totalPendingInvites: number;
  };
  results: {
    success: Array<{
      adminId: string;
      email: string;
      memberCount: number;
      pendingInvitesCount: number;
    }>;
    failed: Array<{
      adminId: string;
      email: string;
      error: string;
    }>;
  };
}

export const syncAdmin = (adminId?: string) =>
  apiFetch<SyncResult>('/api/sync', {
    method: 'POST',
    body: JSON.stringify(adminId ? { adminId } : {}),
  });
