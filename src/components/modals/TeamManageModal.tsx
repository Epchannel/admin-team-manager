import { useState } from 'react';
import { X, UserPlus, Trash2, AlertTriangle, Zap, Crown, Mail, Clock, RefreshCw, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { AdminAccount, TeamMember, PendingInvite, MAX_TEAM_MEMBERS } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TeamCapacityBar } from '@/components/dashboard/TeamCapacityBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TeamManageModalProps {
  isOpen: boolean;
  account: AdminAccount | null;
  onClose: () => void;
  onAddMember: (accountId: string, member: Omit<TeamMember, 'id' | 'addedAt'>) => void;
  onRemoveMember: (accountId: string, memberId: string) => void;
  onAutoDelete: (accountId: string) => void;
  onSendInvite?: (accountId: string, invite: Omit<PendingInvite, 'id' | 'invitedAt' | 'status'>) => void;
  onCancelInvite?: (accountId: string, inviteId: string) => void;
  onResendInvite?: (accountId: string, inviteId: string) => void;
  isLoading?: boolean;
}

export function TeamManageModal({
  isOpen,
  account,
  onClose,
  onAddMember,
  onRemoveMember,
  onAutoDelete,
  onSendInvite,
  onCancelInvite,
  onResendInvite,
  isLoading,
}: TeamManageModalProps) {
  const [newMember, setNewMember] = useState({
    email: '',
    name: '',
    role: 'member' as 'owner' | 'member',
  });

  const [newInvite, setNewInvite] = useState({
    email: '',
    name: '',
    role: 'member' as 'owner' | 'member',
  });

  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  if (!account) return null;

  const isOverCapacity = account.members.length > MAX_TEAM_MEMBERS;
  const pendingInvites = account.pendingInvites || [];

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMember(account.id, newMember);
    setNewMember({ email: '', name: '', role: 'member' });
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSendInvite) {
      onSendInvite(account.id, newInvite);
      setNewInvite({ email: '', name: '', role: 'member' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{account.teamName}</h2>
                <p className="text-sm text-muted-foreground">Managed by {account.name}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {isOverCapacity && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive">Team Over Capacity</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This team has {account.members.length - MAX_TEAM_MEMBERS} member(s) over the limit.
                      Trigger auto-delete to remove the newest members.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onAutoDelete(account.id)}
                    disabled={isLoading}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Auto-Delete
                  </Button>
                </div>
              </motion.div>
            )}

            <div className="mb-6">
              <TeamCapacityBar memberCount={account.members.length} />
            </div>

            <Tabs defaultValue="members" className="space-y-4">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="members" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Team Members ({account.members.length})
                </TabsTrigger>
                <TabsTrigger value="invites" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Pending Invites ({pendingInvites.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-4">
                {/* Add Member Form */}
                <form onSubmit={handleAddMember} className="p-4 rounded-lg bg-secondary/50">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add New Member
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="memberName">Name</Label>
                      <Input
                        id="memberName"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        placeholder="Member name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberEmail">Email</Label>
                      <Input
                        id="memberEmail"
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        placeholder="member@company.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberRole">Role</Label>
                      <Select
                        value={newMember.role}
                        onValueChange={(value: 'owner' | 'member') =>
                          setNewMember({ ...newMember, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4 mr-2" />
                        )}
                        {isLoading ? 'Adding...' : 'Add'}
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Members Table */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30">
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {account.members.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No members yet. Add the first member above.
                          </TableCell>
                        </TableRow>
                      ) : (
                        account.members.map((member, index) => (
                          <motion.tr
                            key={member.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="border-b border-border hover:bg-secondary/20 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                                  {member.name.charAt(0)}
                                </div>
                                <span className="font-medium">{member.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {member.email}
                            </TableCell>
                            <TableCell>
                              {member.role === 'owner' ? (
                                <Badge variant="secondary" className="text-xs">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Owner
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Member
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(member.addedAt), 'dd/MM/yyyy HH:mm')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={async () => {
                                  setDeletingMemberId(member.id);
                                  await onRemoveMember(account.id, member.id);
                                  setDeletingMemberId(null);
                                }}
                                disabled={deletingMemberId === member.id || isLoading}
                              >
                                {deletingMemberId === member.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="invites" className="space-y-4">
                {/* Send Invite Form */}
                {onSendInvite && (
                  <form onSubmit={handleSendInvite} className="p-4 rounded-lg bg-secondary/50">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send New Invite
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="inviteName">Name</Label>
                        <Input
                          id="inviteName"
                          value={newInvite.name}
                          onChange={(e) => setNewInvite({ ...newInvite, name: e.target.value })}
                          placeholder="Invitee name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inviteEmail">Email</Label>
                        <Input
                          id="inviteEmail"
                          type="email"
                          value={newInvite.email}
                          onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                          placeholder="invitee@company.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inviteRole">Role</Label>
                        <Select
                          value={newInvite.role}
                          onValueChange={(value: 'owner' | 'member') =>
                            setNewInvite({ ...newInvite, role: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          {isLoading ? 'Sending...' : 'Send Invite'}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Pending Invites Table */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30">
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Invited Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingInvites.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No pending invites. Send an invite above.
                          </TableCell>
                        </TableRow>
                      ) : (
                        pendingInvites.map((invite, index) => (
                          <motion.tr
                            key={invite.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="border-b border-border hover:bg-secondary/20 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                                  {invite.name.charAt(0)}
                                </div>
                                <span className="font-medium">{invite.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {invite.email}
                            </TableCell>
                            <TableCell>
                              {invite.role === 'owner' ? (
                                <Badge variant="secondary" className="text-xs">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Owner
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Member
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(invite.invitedAt), 'dd/MM/yyyy HH:mm')}
                              </div>
                            </TableCell>
                            <TableCell>
                              {invite.status === 'pending' ? (
                                <Badge className="bg-warning/20 text-warning border-warning/30">
                                  Pending
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  Expired
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {onResendInvite && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={() => onResendInvite(account.id, invite.id)}
                                    title="Resend Invite"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </Button>
                                )}
                                {onCancelInvite && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => onCancelInvite(account.id, invite.id)}
                                    title="Cancel Invite"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
