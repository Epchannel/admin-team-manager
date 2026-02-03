import { MAX_TEAM_MEMBERS } from '@/types/admin';

interface TeamCapacityBarProps {
  memberCount: number;
}

export function TeamCapacityBar({ memberCount }: TeamCapacityBarProps) {
  const percentage = Math.min((memberCount / MAX_TEAM_MEMBERS) * 100, 100);
  const isOver = memberCount > MAX_TEAM_MEMBERS;
  const isAtCapacity = memberCount === MAX_TEAM_MEMBERS;

  const getColor = () => {
    if (isOver) return 'bg-destructive';
    if (isAtCapacity) return 'bg-warning';
    if (percentage >= 80) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Team Capacity</span>
        <span className={isOver ? 'text-destructive font-medium' : 'text-muted-foreground'}>
          {memberCount}/{MAX_TEAM_MEMBERS}
          {isOver && ` (+${memberCount - MAX_TEAM_MEMBERS})`}
        </span>
      </div>
      <div className="capacity-bar">
        <div
          className={`capacity-fill ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
