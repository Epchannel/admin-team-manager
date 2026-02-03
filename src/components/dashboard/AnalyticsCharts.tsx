import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { AdminAccount } from '@/types/admin';
import { TrendingUp, Users, Activity } from 'lucide-react';

interface AnalyticsChartsProps {
  accounts: AdminAccount[];
}

const COLORS = ['hsl(174, 72%, 50%)', 'hsl(38, 92%, 50%)', 'hsl(142, 72%, 45%)', 'hsl(0, 72%, 55%)', 'hsl(190, 72%, 40%)'];

export function AnalyticsCharts({ accounts }: AnalyticsChartsProps) {
  // Team distribution data
  const teamDistribution = accounts.map(acc => ({
    name: acc.teamName,
    members: acc.members.length,
    capacity: 6,
  }));

  // Member growth simulation (last 7 days)
  const today = new Date();
  const memberGrowth = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    const totalMembers = accounts.reduce((sum, acc) => sum + acc.members.length, 0);
    return {
      date: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
      members: Math.max(0, totalMembers - Math.floor(Math.random() * 3) * (6 - i)),
    };
  });

  // Status distribution
  const statusData = [
    { name: 'Active', value: accounts.filter(a => a.status === 'active').length, color: 'hsl(142, 72%, 45%)' },
    { name: 'Warning', value: accounts.filter(a => a.status === 'warning').length, color: 'hsl(38, 92%, 50%)' },
    { name: 'Inactive', value: accounts.filter(a => a.status === 'inactive').length, color: 'hsl(0, 72%, 55%)' },
  ].filter(d => d.value > 0);

  // Role distribution
  const totalOwners = accounts.reduce((sum, acc) => sum + acc.members.filter(m => m.role === 'owner').length, 0);
  const totalMembers = accounts.reduce((sum, acc) => sum + acc.members.filter(m => m.role === 'member').length, 0);

  const roleData = [
    { name: 'Owners', value: totalOwners },
    { name: 'Members', value: totalMembers },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Member Growth Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Member Growth</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={memberGrowth}>
              <defs>
                <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(174, 72%, 50%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(174, 72%, 50%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
              <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 10%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
              />
              <Area 
                type="monotone" 
                dataKey="members" 
                stroke="hsl(174, 72%, 50%)" 
                fillOpacity={1} 
                fill="url(#colorMembers)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Team Capacity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Team Capacity</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teamDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
              <XAxis type="number" domain={[0, 8]} stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12}
                width={100}
                tickFormatter={(value) => value.length > 12 ? value.substring(0, 12) + '...' : value}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 10%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="members" fill="hsl(174, 72%, 50%)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="capacity" fill="hsl(222, 47%, 20%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Admin Status</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 10%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          {statusData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Role Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Role Distribution</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {roleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 10%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          {roleData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
              <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
