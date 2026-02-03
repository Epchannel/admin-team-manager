import { useState, useCallback, useEffect } from 'react';
import { AdminAccount, TeamMember, PendingInvite, DashboardStats, MAX_TEAM_MEMBERS } from '@/types/admin';
import * as api from '@/lib/api';
import { toast } from 'sonner';

const generateId = () => Math.random().toString(36).substring(2, 9);

// Transform API admin to frontend AdminAccount
const transformApiAdmin = (apiAdmin: api.ApiAdmin): AdminAccount => ({
  id: apiAdmin.id,
  email: apiAdmin.user.email,
  name: apiAdmin.user.email.split('@')[0], // Extract name from email
  teamName: apiAdmin.teamName || `Team ${apiAdmin.id}`,
  status: (apiAdmin.teamMembers?.length || 0) > MAX_TEAM_MEMBERS ? 'warning' : 'active',
  createdAt: new Date().toISOString(),
  accessToken: apiAdmin.accessToken,
  accountId: apiAdmin.account.id,
  members: (apiAdmin.teamMembers || []).map(m => ({
    id: m.id,
    email: m.email,
    name: m.name || m.email.split('@')[0],
    role: m.role === 'owner' ? 'owner' : 'member',
    addedAt: m.addedAt || new Date().toISOString(),
  })),
  pendingInvites: [],
});

// Transform frontend AdminAccount to API format
const transformToApiAdmin = (account: AdminAccount): api.ApiAdmin => ({
  id: account.id,
  user: { email: account.email },
  account: { id: account.accountId || account.id },
  accessToken: account.accessToken || '',
  teamMembers: account.members.map(m => ({
    id: m.id,
    email: m.email,
    name: m.name,
    role: m.role,
    addedAt: m.addedAt,
  })),
  teamName: account.teamName,
});

export function useAdminAccounts() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all admins on mount
  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getAdmins();
      if (response.success) {
        const transformedAccounts = response.data.map(transformApiAdmin);
        
        // Fetch pending invites for each admin
        const accountsWithInvites = await Promise.all(
          transformedAccounts.map(async (account) => {
            if (account.accessToken && account.accountId) {
              try {
                const invitesResponse = await api.getPendingInvites(
                  account.accountId,
                  account.accessToken
                );
                if (invitesResponse.success) {
                  return {
                    ...account,
                    pendingInvites: invitesResponse.data.map(inv => ({
                      id: inv.id,
                      email: inv.email,
                      name: inv.email.split('@')[0],
                      role: inv.role === 'owner' ? 'owner' as const : 'member' as const,
                      invitedAt: inv.invitedAt,
                      status: inv.status,
                    })),
                  };
                }
              } catch {
                // Silently fail for invite fetching
              }
            }
            return account;
          })
        );
        
        setAccounts(accountsWithInvites);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch admins';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const getStats = useCallback((): DashboardStats => {
    const totalAdmins = accounts.length;
    const totalMembers = accounts.reduce((sum, acc) => sum + acc.members.length, 0);
    const teamsAtCapacity = accounts.filter(acc => acc.members.length === MAX_TEAM_MEMBERS).length;
    const teamsOverCapacity = accounts.filter(acc => acc.members.length > MAX_TEAM_MEMBERS).length;

    return { totalAdmins, totalMembers, teamsAtCapacity, teamsOverCapacity };
  }, [accounts]);

  const addAccount = useCallback(async (account: Omit<AdminAccount, 'id' | 'createdAt' | 'members' | 'pendingInvites'>) => {
    setIsLoading(true);
    try {
      const newAdmin: Omit<api.ApiAdmin, 'teamMembers'> = {
        id: generateId(),
        user: { email: account.email },
        account: { id: account.accountId || generateId() },
        accessToken: account.accessToken || '',
        teamName: account.teamName,
      };
      
      const response = await api.createAdmin(newAdmin);
      if (response.success) {
        const transformedAccount = transformApiAdmin(response.data);
        setAccounts(prev => [...prev, transformedAccount]);
        toast.success('Admin account added successfully');
        return transformedAccount;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add admin';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAccount = useCallback(async (id: string, updates: Partial<AdminAccount>) => {
    setIsLoading(true);
    try {
      const currentAccount = accounts.find(acc => acc.id === id);
      if (!currentAccount) throw new Error('Account not found');

      // Update team name if changed
      if (updates.teamName && updates.teamName !== currentAccount.teamName) {
        await api.updateTeamName(id, updates.teamName);
      }

      // Update full admin if other fields changed
      const updatedAccount = { ...currentAccount, ...updates };
      await api.updateAdmin(id, transformToApiAdmin(updatedAccount));

      setAccounts(prev => prev.map(acc => 
        acc.id === id ? { ...acc, ...updates } : acc
      ));
      toast.success('Account updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update account';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [accounts]);

  const deleteAccount = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await api.deleteAdmin(id);
      setAccounts(prev => prev.filter(acc => acc.id !== id));
      toast.success('Account deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMember = useCallback(async (accountId: string, member: Omit<TeamMember, 'id' | 'addedAt'>) => {
    setIsLoading(true);
    try {
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) throw new Error('Account not found');

      const newMember: TeamMember = {
        ...member,
        id: generateId(),
        addedAt: new Date().toISOString(),
      };

      const updatedMembers = [...account.members, newMember];
      
      // Update via API
      await api.updateTeamMembers(accountId, updatedMembers.map(m => ({
        id: m.id,
        email: m.email,
        name: m.name,
        role: m.role,
        addedAt: m.addedAt,
      })));

      setAccounts(prev => prev.map(acc => {
        if (acc.id === accountId) {
          if (updatedMembers.length > MAX_TEAM_MEMBERS) {
            toast.warning(`Team exceeds ${MAX_TEAM_MEMBERS} members! Auto-delete API will be triggered.`);
          }
          return {
            ...acc,
            members: updatedMembers,
            status: updatedMembers.length > MAX_TEAM_MEMBERS ? 'warning' : acc.status,
          };
        }
        return acc;
      }));
      toast.success('Member added successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add member';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [accounts]);

  const removeMember = useCallback(async (accountId: string, memberId: string) => {
    setIsLoading(true);
    try {
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) throw new Error('Account not found');

      // Try to remove via ChatGPT proxy if we have tokens
      if (account.accessToken && account.accountId) {
        try {
          await api.removeTeamMember(account.accountId, account.accessToken, memberId);
        } catch {
          // Fall back to local update if proxy fails
        }
      }

      const newMembers = account.members.filter(m => m.id !== memberId);
      await api.updateTeamMembers(accountId, newMembers.map(m => ({
        id: m.id,
        email: m.email,
        name: m.name,
        role: m.role,
        addedAt: m.addedAt,
      })));

      setAccounts(prev => prev.map(acc => {
        if (acc.id === accountId) {
          return {
            ...acc,
            members: newMembers,
            status: newMembers.length <= MAX_TEAM_MEMBERS ? 'active' : 'warning',
          };
        }
        return acc;
      }));
      toast.success('Member removed successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove member';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [accounts]);

  const importFromJson = useCallback(async (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      const importedAccounts: AdminAccount[] = Array.isArray(data) ? data : [data];
      
      setIsLoading(true);
      
      for (const acc of importedAccounts) {
        const newAdmin: Omit<api.ApiAdmin, 'teamMembers'> = {
          id: generateId(),
          user: { email: acc.email },
          account: { id: acc.accountId || generateId() },
          accessToken: acc.accessToken || '',
          teamName: acc.teamName,
        };
        
        try {
          await api.createAdmin(newAdmin);
        } catch {
          // Continue with other imports
        }
      }
      
      // Refresh the list
      await fetchAdmins();
      toast.success(`Imported ${importedAccounts.length} account(s) successfully`);
    } catch {
      toast.error('Invalid JSON format');
    } finally {
      setIsLoading(false);
    }
  }, [fetchAdmins]);

  const sendInvite = useCallback(async (accountId: string, invite: Omit<PendingInvite, 'id' | 'invitedAt' | 'status'>) => {
    setIsLoading(true);
    try {
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) throw new Error('Account not found');

      // Send via ChatGPT proxy if available
      if (account.accessToken && account.accountId) {
        await api.sendInvite(
          account.accountId,
          account.accessToken,
          [invite.email],
          invite.role === 'owner' ? 'owner' : 'standard-user'
        );
      }

      const newInvite: PendingInvite = {
        ...invite,
        id: generateId(),
        invitedAt: new Date().toISOString(),
        status: 'pending',
      };

      setAccounts(prev => prev.map(acc => {
        if (acc.id === accountId) {
          return {
            ...acc,
            pendingInvites: [...acc.pendingInvites, newInvite],
          };
        }
        return acc;
      }));
      toast.success('Invite sent successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send invite';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [accounts]);

  const cancelInvite = useCallback(async (accountId: string, inviteId: string) => {
    setIsLoading(true);
    try {
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) throw new Error('Account not found');

      const invite = account.pendingInvites.find(inv => inv.id === inviteId);
      
      // Cancel via ChatGPT proxy if available
      if (account.accessToken && account.accountId && invite) {
        try {
          await api.cancelInvite(account.accountId, account.accessToken, invite.email);
        } catch {
          // Continue with local update
        }
      }

      setAccounts(prev => prev.map(acc => {
        if (acc.id === accountId) {
          return {
            ...acc,
            pendingInvites: acc.pendingInvites.filter(inv => inv.id !== inviteId),
          };
        }
        return acc;
      }));
      toast.success('Invite cancelled');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel invite';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [accounts]);

  const resendInvite = useCallback(async (accountId: string, inviteId: string) => {
    setIsLoading(true);
    try {
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) throw new Error('Account not found');

      const invite = account.pendingInvites.find(inv => inv.id === inviteId);
      
      // Resend via ChatGPT proxy
      if (account.accessToken && account.accountId && invite) {
        await api.sendInvite(
          account.accountId,
          account.accessToken,
          [invite.email],
          invite.role === 'owner' ? 'owner' : 'standard-user'
        );
      }

      setAccounts(prev => prev.map(acc => {
        if (acc.id === accountId) {
          return {
            ...acc,
            pendingInvites: acc.pendingInvites.map(inv => 
              inv.id === inviteId 
                ? { ...inv, invitedAt: new Date().toISOString(), status: 'pending' as const }
                : inv
            ),
          };
        }
        return acc;
      }));
      toast.success('Invite resent');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend invite';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [accounts]);

  const triggerAutoDelete = useCallback(async (accountId: string) => {
    setIsLoading(true);
    try {
      const account = accounts.find(acc => acc.id === accountId);
      if (!account || account.members.length <= MAX_TEAM_MEMBERS) {
        setIsLoading(false);
        return;
      }

      const sortedMembers = [...account.members].sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      );
      
      const membersToKeep = sortedMembers.slice(sortedMembers.length - MAX_TEAM_MEMBERS);
      const membersToDelete = sortedMembers.slice(0, sortedMembers.length - MAX_TEAM_MEMBERS);

      // Delete excess members via API
      for (const member of membersToDelete) {
        if (account.accessToken && account.accountId) {
          try {
            await api.removeTeamMember(account.accountId, account.accessToken, member.id);
          } catch {
            // Continue with other deletions
          }
        }
      }

      // Update team members in API
      await api.updateTeamMembers(accountId, membersToKeep.map(m => ({
        id: m.id,
        email: m.email,
        name: m.name,
        role: m.role,
        addedAt: m.addedAt,
      })));

      // Log the auto-delete action
      await api.addCronLog({
        adminId: accountId,
        adminEmail: account.email,
        checkType: 'manual',
        memberCount: membersToKeep.length,
        status: 'success',
      });

      setAccounts(prev => prev.map(acc => {
        if (acc.id === accountId) {
          toast.info(`Auto-deleted ${membersToDelete.length} member(s) (newest first)`);
          return {
            ...acc,
            members: membersToKeep,
            status: 'active',
          };
        }
        return acc;
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to trigger auto-delete';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [accounts]);

  const refreshFromChatGPT = useCallback(async (accountId: string) => {
    setIsLoading(true);
    try {
      const account = accounts.find(acc => acc.id === accountId);
      if (!account?.accessToken || !account?.accountId) {
        throw new Error('Account missing access token or account ID');
      }

      // Fetch fresh data from ChatGPT
      const [membersResponse, invitesResponse] = await Promise.all([
        api.getTeamMembersFromChatGPT(account.accountId, account.accessToken),
        api.getPendingInvites(account.accountId, account.accessToken),
      ]);

      const freshMembers: TeamMember[] = membersResponse.success 
        ? membersResponse.data.map(m => ({
            id: m.id,
            email: m.email,
            name: m.name || m.email.split('@')[0],
            role: m.role === 'owner' ? 'owner' : 'member',
            addedAt: m.addedAt || new Date().toISOString(),
          }))
        : account.members;

      const freshInvites: PendingInvite[] = invitesResponse.success
        ? invitesResponse.data.map(inv => ({
            id: inv.id,
            email: inv.email,
            name: inv.email.split('@')[0],
            role: inv.role === 'owner' ? 'owner' : 'member',
            invitedAt: inv.invitedAt,
            status: inv.status,
          }))
        : account.pendingInvites;

      // Update local state
      setAccounts(prev => prev.map(acc => {
        if (acc.id === accountId) {
          return {
            ...acc,
            members: freshMembers,
            pendingInvites: freshInvites,
            status: freshMembers.length > MAX_TEAM_MEMBERS ? 'warning' : 'active',
          };
        }
        return acc;
      }));

      // Sync to backend
      await api.updateTeamMembers(accountId, freshMembers.map(m => ({
        id: m.id,
        email: m.email,
        name: m.name,
        role: m.role,
        addedAt: m.addedAt,
      })));

      toast.success('Synced with ChatGPT successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync with ChatGPT';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [accounts]);

  return {
    accounts,
    isLoading,
    error,
    getStats,
    addAccount,
    updateAccount,
    deleteAccount,
    addMember,
    removeMember,
    importFromJson,
    triggerAutoDelete,
    sendInvite,
    cancelInvite,
    resendInvite,
    refreshFromChatGPT,
    refetch: fetchAdmins,
  };
}
