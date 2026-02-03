import { useState } from 'react';
import { Users, UserCheck, AlertTriangle, Shield, Search, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { useAdminAccounts } from '@/hooks/useAdminAccounts';
import { AdminAccount } from '@/types/admin';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AdminCard } from '@/components/dashboard/AdminCard';
import { UsersTable } from '@/components/dashboard/UsersTable';
import { AddAdminModal } from '@/components/modals/AddAdminModal';
import { EditAdminModal } from '@/components/modals/EditAdminModal';
import { ImportJsonModal } from '@/components/modals/ImportJsonModal';
import { TeamManageModal } from '@/components/modals/TeamManageModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  } = useAdminAccounts();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);
  const [managingTeam, setManagingTeam] = useState<AdminAccount | null>(null);

  const stats = getStats();

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.teamName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <Header
        onAddAdmin={() => setShowAddModal(true)}
        onImportJson={() => setShowImportModal(true)}
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

        {/* Tabs for Admin Cards vs Users Table */}
        <Tabs defaultValue="admins" className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="admins" className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                Admin Accounts
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <TableIcon className="w-4 h-4" />
                All Users
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="admins" className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search admins, emails, or team names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

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
                  isLoading={isLoading}
                />
              ))}
            </div>

            {filteredAccounts.length === 0 && (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No admin accounts found</h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Add your first admin account to get started'}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users">
            <UsersTable accounts={accounts} onRemoveMember={removeMember} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <AddAdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addAccount}
      />

      <EditAdminModal
        isOpen={!!editingAccount}
        account={editingAccount}
        onClose={() => setEditingAccount(null)}
        onSubmit={updateAccount}
      />

      <ImportJsonModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={importFromJson}
      />

      <TeamManageModal
        isOpen={!!managingTeam}
        account={managingTeam}
        onClose={() => setManagingTeam(null)}
        onAddMember={addMember}
        onRemoveMember={removeMember}
        onAutoDelete={triggerAutoDelete}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Index;
