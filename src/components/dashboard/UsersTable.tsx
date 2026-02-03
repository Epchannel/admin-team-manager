import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, Trash2, Mail, Calendar, Shield } from 'lucide-react';
import { AdminAccount, TeamMember } from '@/types/admin';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UserWithAdmin extends TeamMember {
  adminId: string;
  adminName: string;
  adminEmail: string;
  teamName: string;
}

interface UsersTableProps {
  accounts: AdminAccount[];
  onRemoveMember: (accountId: string, memberId: string) => void;
}

type SortField = 'name' | 'email' | 'adminName' | 'addedAt';
type SortDirection = 'asc' | 'desc';

export function UsersTable({ accounts, onRemoveMember }: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('addedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Flatten all members with their admin info
  const allUsers: UserWithAdmin[] = accounts.flatMap((account) =>
    account.members.map((member) => ({
      ...member,
      adminId: account.id,
      adminName: account.name,
      adminEmail: account.email,
      teamName: account.teamName,
    }))
  );

  // Filter users
  const filteredUsers = allUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.teamName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'email':
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
        break;
      case 'adminName':
        aValue = a.adminName.toLowerCase();
        bValue = b.adminName.toLowerCase();
        break;
      case 'addedAt':
        aValue = new Date(a.addedAt).getTime();
        bValue = new Date(b.addedAt).getTime();
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">All Users</h2>
          <p className="text-sm text-muted-foreground">
            {sortedUsers.length} users across {accounts.length} teams
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users, emails, or admins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('name')}
              >
                Username <SortIcon field="name" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('email')}
              >
                Email <SortIcon field="email" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('adminName')}
              >
                Admin <SortIcon field="adminName" />
              </TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Role</TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('addedAt')}
              >
                Join Date <SortIcon field="addedAt" />
              </TableHead>
              <TableHead className="w-[60px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No users found matching your search' : 'No users yet'}
                </TableCell>
              </TableRow>
            ) : (
              sortedUsers.map((user, index) => (
                <motion.tr
                  key={`${user.adminId}-${user.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="border-b border-border hover:bg-secondary/30 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium">{user.adminName}</p>
                        <p className="text-xs text-muted-foreground">{user.adminEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.teamName}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === 'owner' ? 'default' : 'outline'}
                      className={user.role === 'owner' ? 'bg-primary/20 text-primary border-primary/30' : ''}
                    >
                      {user.role === 'owner' ? 'Owner' : 'Member'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(user.addedAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveMember(user.adminId, user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Showing {sortedUsers.length} of {allUsers.length} users
        </span>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="h-auto py-1 px-2"
          >
            Clear search
          </Button>
        )}
      </div>
    </motion.div>
  );
}
