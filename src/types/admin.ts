export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'member';
  addedAt: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'member';
  invitedAt: string;
  status: 'pending' | 'expired';
}

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  teamName: string;
  members: TeamMember[];
  pendingInvites: PendingInvite[];
  createdAt: string;
  status: 'active' | 'inactive' | 'warning';
  accessToken?: string;
  accountId?: string;
}

export interface DashboardStats {
  totalAdmins: number;
  totalMembers: number;
  teamsAtCapacity: number;
  teamsOverCapacity: number;
}

export const MAX_TEAM_MEMBERS = 6;
