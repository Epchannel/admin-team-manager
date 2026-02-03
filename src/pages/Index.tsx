import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, UserCheck, AlertTriangle, Shield, Search, 
  LayoutGrid, Table as TableIcon, BarChart3, Clock, Trash2, Loader2
} from 'lucide-react';
import { useAdminAccounts } from '@/hooks/useAdminAccounts';
import { useNotifications } from '@/hooks/useNotifications';
import { useCronStatus } from '@/hooks/useCronStatus';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminAccount } from '@/types/admin';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AdminCard } from '@/components/dashboard/AdminCard';
import { UsersTable } from '@/components/dashboard/UsersTable';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { ActivityLogs } from '@/components/dashboard/ActivityLogs';
import { AdvancedFilters, FilterOptions, defaultFilters } from '@/components/dashboard/AdvancedFilters';
import { AddAdminModal } from '@/components/modals/AddAdminModal';
import { EditAdminModal } from '@/components/modals/EditAdminModal';
import { TeamManageModal } from '@/components/modals/TeamManageModal';
import { QuickAddUsersModal } from '@/components/modals/QuickAddUsersModal';
import { exportToCSV, exportToJSON } from '@/utils/exportData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Index = () => {
  const {
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
    sendInvite,
    cancelInvite,
    resendInvite,
    refreshFromChatGPT,
    syncAllAdmins,
    checkAllTokenHealth,
    refetch,
  } = useAdminAccounts();

  const { getLastCheckForAdmin } = useCronStatus();

  const {
    notifications,
    activityLogs,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    addNotification,
  } = useNotifications();

  // Track previous account data for change detection
  const prevAccountsRef = useRef<string>('');

  // Auto-refresh with change detection
  const { countdown, isRefreshing, manualRefresh } = useAutoRefresh(
    accounts,
    refetch,
    {
      enabled: true,
      interval: 30000, // 30 seconds
      onDataChange: () => {
        addNotification('info', 'Dữ liệu đã cập nhật', 'Có thay đổi mới từ backend');
      },
    }
  );

  // Detect changes and show notification
  useEffect(() => {
    const currentHash = JSON.stringify(accounts.map(a => ({
      id: a.id,
      membersCount: a.members.length,
      status: a.status,
    })));

    if (prevAccountsRef.current && prevAccountsRef.current !== currentHash) {
      toast.info('Dữ liệu đã được cập nhật từ backend');
    }
    
    prevAccountsRef.current = currentHash;
  }, [accounts]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);
  const [managingTeam, setManagingTeam] = useState<AdminAccount | null>(null);
  const [activeTab, setActiveTab] = useState('admins');
  
  // Bulk selection state
  const [selectedAdmins, setSelectedAdmins] = useState<Set<string>>(new Set());
  const [showBulkMode, setShowBulkMode] = useState(false);

  // Mobile detection
  const isMobile = useIsMobile();

  // Search input ref for keyboard shortcut focus
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSyncAll: syncAllAdmins,
    onAddAdmin: () => setShowAddModal(true),
    onSearch: () => searchInputRef.current?.focus(),
    onQuickAdd: () => setShowQuickAddModal(true),
    onEscape: () => {
      setEditingAccount(null);
      setManagingTeam(null);
      setShowAddModal(false);
      setShowQuickAddModal(false);
      setShowBulkMode(false);
      setSelectedAdmins(new Set());
    },
  });

  const stats = getStats();

  // Calculate available slots across all teams (max 6 per team)
  const MAX_TEAM_MEMBERS = 6;
  const teamSlots = accounts.map((acc) => ({
    teamName: acc.teamName || acc.email,
    slots: Math.max(0, MAX_TEAM_MEMBERS - acc.members.length),
  }));
  const availableSlots = teamSlots.reduce((total, t) => total + t.slots, 0);

  // Apply filters
  const filteredAccounts = accounts.filter((acc) => {
    // Search filter
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.teamName.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = filters.status === 'all' || acc.status === filters.status;

    // Member count filter
    const matchesMinMembers = !filters.minMembers || acc.members.length >= parseInt(filters.minMembers);
    const matchesMaxMembers = !filters.maxMembers || acc.members.length <= parseInt(filters.maxMembers);

    return matchesSearch && matchesStatus && matchesMinMembers && matchesMaxMembers;
  });

  const handleExportCSV = (type: 'admins' | 'users') => {
    exportToCSV(accounts, type);
    toast.success(`Exported ${type} to CSV`);
  };

  const handleExportJSON = () => {
    exportToJSON(accounts);
    toast.success('Exported all data to JSON');
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  // Bulk selection handlers
  const handleSelectAdmin = useCallback((id: string, selected: boolean) => {
    setSelectedAdmins(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedAdmins.size === filteredAccounts.length) {
      setSelectedAdmins(new Set());
    } else {
      setSelectedAdmins(new Set(filteredAccounts.map(a => a.id)));
    }
  }, [filteredAccounts, selectedAdmins.size]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedAdmins.size === 0) return;
    
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xoá ${selectedAdmins.size} admin đã chọn?`
    );
    
    if (!confirmDelete) return;

    for (const id of selectedAdmins) {
      await deleteAccount(id);
    }
    
    setSelectedAdmins(new Set());
    setShowBulkMode(false);
    toast.success(`Đã xoá ${selectedAdmins.size} admin`);
  }, [selectedAdmins, deleteAccount]);

  return (
    <div className="min-h-screen bg-background">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <Header
        onAddAdmin={() => setShowAddModal(true)}
        onQuickAddUsers={() => setShowQuickAddModal(true)}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onClearNotification={clearNotification}
        countdown={countdown}
        isRefreshing={isRefreshing}
        onManualRefresh={manualRefresh}
        availableSlots={availableSlots}
        teamSlots={teamSlots}
        onSyncAll={syncAllAdmins}
        onCheckHealth={checkAllTokenHealth}
        isSyncing={isLoading}
      />

      <main className="container mx-auto px-4 py-8 relative">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Admins"
            value={stats.totalAdmins}
            icon={Shield}
            delay={0}
          />
          <StatsCard
            title="Total Members"
            value={stats.totalMembers}
            icon={Users}
            delay={0.1}
          />
          <StatsCard
            title="Teams at Capacity"
            value={stats.teamsAtCapacity}
            icon={UserCheck}
            variant="warning"
            delay={0.2}
          />
          <StatsCard
            title="Over Capacity"
            value={stats.teamsOverCapacity}
            icon={AlertTriangle}
            variant={stats.teamsOverCapacity > 0 ? 'danger' : 'default'}
            delay={0.3}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Hide TabsList on mobile - use MobileNav instead */}
          <div className="hidden md:flex items-center justify-between gap-4 flex-wrap">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="admins" className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                Admin Accounts
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <TableIcon className="w-4 h-4" />
                All Users
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Clock className="w-4 h-4" />
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="admins" className="space-y-6">
            {/* Search & Filters & Bulk Actions */}
            <div className="flex gap-4 flex-wrap items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search admins, emails, or team names... (press /)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <AdvancedFilters 
                filters={filters} 
                onFiltersChange={setFilters} 
                onReset={handleResetFilters}
              />
              
              {/* Bulk Mode Toggle */}
              <Button
                variant={showBulkMode ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => {
                  setShowBulkMode(!showBulkMode);
                  if (showBulkMode) setSelectedAdmins(new Set());
                }}
              >
                {showBulkMode ? 'Cancel' : 'Bulk Select'}
              </Button>
            </div>

            {/* Bulk Actions Bar */}
            {showBulkMode && (
              <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedAdmins.size === filteredAccounts.length && filteredAccounts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm">
                    {selectedAdmins.size > 0 
                      ? `Đã chọn ${selectedAdmins.size} admin`
                      : 'Chọn tất cả'
                    }
                  </span>
                </div>
                
                {selectedAdmins.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Xoá {selectedAdmins.size} admin
                  </Button>
                )}
              </div>
            )}

            {/* Admin Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAccounts.map((account, index) => (
                <AdminCard
                  key={account.id}
                  account={account}
                  index={index}
                  onEdit={setEditingAccount}
                  onDelete={deleteAccount}
                  onManageTeam={setManagingTeam}
                  onAutoDelete={triggerAutoDelete}
                  onRefresh={refreshFromChatGPT}
                  lastCheck={getLastCheckForAdmin(account.id)}
                  isLoading={isLoading}
                  showCheckbox={showBulkMode}
                  isSelected={selectedAdmins.has(account.id)}
                  onSelect={handleSelectAdmin}
                />
              ))}
            </div>

            {filteredAccounts.length === 0 && (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No admin accounts found</h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery || Object.values(filters).some(v => v && v !== 'all')
                    ? 'Try adjusting your search or filters'
                    : 'Add your first admin account to get started'}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users">
            <UsersTable accounts={accounts} onRemoveMember={removeMember} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsCharts accounts={accounts} />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLogs logs={activityLogs} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <AddAdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addAccount}
        isLoading={isLoading}
      />

      <EditAdminModal
        isOpen={!!editingAccount}
        account={editingAccount}
        onClose={() => setEditingAccount(null)}
        onSubmit={updateAccount}
      />
      <TeamManageModal
        isOpen={!!managingTeam}
        account={managingTeam}
        onClose={() => setManagingTeam(null)}
        onAddMember={addMember}
        onRemoveMember={removeMember}
        onAutoDelete={triggerAutoDelete}
        onSendInvite={sendInvite}
        onCancelInvite={cancelInvite}
        onResendInvite={resendInvite}
        isLoading={isLoading}
      />

      <QuickAddUsersModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onSuccess={refetch}
      />

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onQuickAdd={() => setShowQuickAddModal(true)}
          availableSlots={availableSlots}
        />
      )}

      {/* Add bottom padding on mobile to account for nav */}
      {isMobile && <div className="h-20" />}
    </div>
  );
};

export default Index;
