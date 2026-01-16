import { BountyStatus } from '@/config/wagmi';

interface StatusBadgeProps {
  status: number;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusConfig = (status: number) => {
    switch (status) {
      case BountyStatus.Open:
        return {
          label: 'Open',
          classes: 'bg-green-900/50 text-green-400 border-green-700',
        };
      case BountyStatus.Claimed:
        return {
          label: 'Claimed',
          classes: 'bg-yellow-900/50 text-yellow-400 border-yellow-700',
        };
      case BountyStatus.Submitted:
        return {
          label: 'Submitted',
          classes: 'bg-blue-900/50 text-blue-400 border-blue-700',
        };
      case BountyStatus.Approved:
        return {
          label: 'Approved',
          classes: 'bg-purple-900/50 text-purple-400 border-purple-700',
        };
      case BountyStatus.Refunded:
        return {
          label: 'Refunded',
          classes: 'bg-slate-800 text-slate-400 border-slate-700',
        };
      case BountyStatus.Disputed:
        return {
          label: 'Disputed',
          classes: 'bg-red-900/50 text-red-400 border-red-700',
        };
      default:
        return {
          label: 'Unknown',
          classes: 'bg-slate-800 text-slate-400 border-slate-700',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  );
}
