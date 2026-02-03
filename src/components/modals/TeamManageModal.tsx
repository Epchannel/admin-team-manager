import { useState } from 'react';
import { X, UserPlus, Trash2, AlertTriangle, Zap, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminAccount, TeamMember, MAX_TEAM_MEMBERS } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TeamCapacityBar } from '@/components/dashboard/TeamCapacityBar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TeamManageModalProps {
  isOpen: boolean;
  account: AdminAccount | null;
  onClose: () => void;
  onAddMember: (accountId: string, member: Omit<TeamMember, 'id' | 'addedAt'>) => void;
  onRemoveMember: (accountId: string, memberId: string) => void;
  onAutoDelete: (accountId: string) => void;
  isLoading?: boolean;
}

export function TeamManageModal({
  isOpen,
  account,
  onClose,
  onAddMember,
  onRemoveMember,
  onAutoDelete,
  isLoading,
}: TeamManageModalProps) {
  const [newMember, setNewMember] = useState({
    email: '',
    name: '',
    role: 'member' as 'owner' | 'member',
  });

  if (!account) return null;

  const isOverCapacity = account.members.length > MAX_TEAM_MEMBERS;

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMember(account.id, newMember);
    setNewMember({ email: '', name: '', role: 'member' });
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
            className="glass-card rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
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

            {/* Add Member Form */}
            <form onSubmit={handleAddMember} className="mb-6 p-4 rounded-lg bg-secondary/50">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Add New Member
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="flex gap-2">
                    <Select
                      value={newMember.role}
                      onValueChange={(value: 'owner' | 'member') =>
                        setNewMember({ ...newMember, role: value })
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="submit">Add</Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Members List */}
            <div className="space-y-2">
              <h3 className="font-medium mb-3">Team Members ({account.members.length})</h3>
              {account.members.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No members yet. Add the first member above.
                </p>
              ) : (
                <div className="space-y-2">
                  {account.members.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.name}</span>
                            {member.role === 'owner' && (
                              <Badge variant="secondary" className="text-xs">
                                <Crown className="w-3 h-3 mr-1" />
                                Owner
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{member.email}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveMember(account.id, member.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
