import { useState, useCallback } from 'react';
import { AdminAccount, TeamMember, DashboardStats, MAX_TEAM_MEMBERS } from '@/types/admin';
import { toast } from 'sonner';

const generateId = () => Math.random().toString(36).substring(2, 9);

const initialAccounts: AdminAccount[] = [
  {
    id: '1',
    email: 'admin1@company.com',
    name: 'Admin One',
    teamName: 'Development Team',
    status: 'active',
    createdAt: new Date().toISOString(),
    members: [
      { id: '1', email: 'dev1@company.com', name: 'Developer 1', role: 'member', addedAt: new Date().toISOString() },
      { id: '2', email: 'dev2@company.com', name: 'Developer 2', role: 'member', addedAt: new Date().toISOString() },
      { id: '3', email: 'dev3@company.com', name: 'Developer 3', role: 'member', addedAt: new Date().toISOString() },
    ],
  },
  {
    id: '2',
    email: 'admin2@company.com',
    name: 'Admin Two',
    teamName: 'Marketing Team',
    status: 'warning',
    createdAt: new Date().toISOString(),
    members: [
      { id: '4', email: 'mark1@company.com', name: 'Marketer 1', role: 'member', addedAt: new Date().toISOString() },
      { id: '5', email: 'mark2@company.com', name: 'Marketer 2', role: 'member', addedAt: new Date().toISOString() },
      { id: '6', email: 'mark3@company.com', name: 'Marketer 3', role: 'member', addedAt: new Date().toISOString() },
      { id: '7', email: 'mark4@company.com', name: 'Marketer 4', role: 'member', addedAt: new Date().toISOString() },
      { id: '8', email: 'mark5@company.com', name: 'Marketer 5', role: 'member', addedAt: new Date().toISOString() },
      { id: '9', email: 'mark6@company.com', name: 'Marketer 6', role: 'member', addedAt: new Date().toISOString() },
    ],
  },
];

export function useAdminAccounts() {
  const [accounts, setAccounts] = useState<AdminAccount[]>(initialAccounts);
  const [isLoading, setIsLoading] = useState(false);

  const getStats = useCallback((): DashboardStats => {
    const totalAdmins = accounts.length;
    const totalMembers = accounts.reduce((sum, acc) => sum + acc.members.length, 0);
    const teamsAtCapacity = accounts.filter(acc => acc.members.length === MAX_TEAM_MEMBERS).length;
    const teamsOverCapacity = accounts.filter(acc => acc.members.length > MAX_TEAM_MEMBERS).length;

    return { totalAdmins, totalMembers, teamsAtCapacity, teamsOverCapacity };
  }, [accounts]);

  const addAccount = useCallback((account: Omit<AdminAccount, 'id' | 'createdAt' | 'members'>) => {
    const newAccount: AdminAccount = {
      ...account,
      id: generateId(),
      createdAt: new Date().toISOString(),
      members: [],
    };
    setAccounts(prev => [...prev, newAccount]);
    toast.success('Admin account added successfully');
    return newAccount;
  }, []);

  const updateAccount = useCallback((id: string, updates: Partial<AdminAccount>) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === id ? { ...acc, ...updates } : acc
    ));
    toast.success('Account updated successfully');
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
    toast.success('Account deleted successfully');
  }, []);

  const addMember = useCallback((accountId: string, member: Omit<TeamMember, 'id' | 'addedAt'>) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        const newMember: TeamMember = {
          ...member,
          id: generateId(),
          addedAt: new Date().toISOString(),
        };
        const newMembers = [...acc.members, newMember];
        
        if (newMembers.length > MAX_TEAM_MEMBERS) {
          toast.warning(`Team exceeds ${MAX_TEAM_MEMBERS} members! Auto-delete API will be triggered.`);
        }
        
        return {
          ...acc,
          members: newMembers,
          status: newMembers.length > MAX_TEAM_MEMBERS ? 'warning' : acc.status,
        };
      }
      return acc;
    }));
    toast.success('Member added successfully');
  }, []);

  const removeMember = useCallback((accountId: string, memberId: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        const newMembers = acc.members.filter(m => m.id !== memberId);
        return {
          ...acc,
          members: newMembers,
          status: newMembers.length <= MAX_TEAM_MEMBERS ? 'active' : 'warning',
        };
      }
      return acc;
    }));
    toast.success('Member removed successfully');
  }, []);

  const importFromJson = useCallback((jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      const importedAccounts: AdminAccount[] = Array.isArray(data) ? data : [data];
      
      const processedAccounts = importedAccounts.map(acc => ({
        ...acc,
        id: generateId(),
        createdAt: new Date().toISOString(),
        members: acc.members || [],
        status: (acc.members?.length || 0) > MAX_TEAM_MEMBERS ? 'warning' : 'active',
      })) as AdminAccount[];

      setAccounts(prev => [...prev, ...processedAccounts]);
      toast.success(`Imported ${processedAccounts.length} account(s) successfully`);
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  }, []);

  const triggerAutoDelete = useCallback(async (accountId: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId && acc.members.length > MAX_TEAM_MEMBERS) {
        const sortedMembers = [...acc.members].sort(
          (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );
        const deletedCount = sortedMembers.length - MAX_TEAM_MEMBERS;
        toast.info(`Auto-deleted ${deletedCount} member(s) (newest first)`);
        return {
          ...acc,
          members: sortedMembers.slice(deletedCount),
          status: 'active',
        };
      }
      return acc;
    }));
    setIsLoading(false);
  }, []);

  return {
    accounts,
    isLoading,
    getStats,
    addAccount,
    updateAccount,
    deleteAccount,
    addMember,
    removeMember,
    importFromJson,
    triggerAutoDelete,
  };
}
