import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface IdleItem {
  id: number;
  type: 'asset' | 'location';
  name: string;
  lastUsed: string;
  location: string;
  daysIdle: number;
}

interface IdleNotificationsProps {
  idleItems: IdleItem[];
  onDismiss?: (id: number) => void;
  onViewDetails?: (id: number, type: 'asset' | 'location') => void;
}

const IdleToast: React.FC<{ item: IdleItem; toastId: string | number }> = ({ item, toastId }) => (
  <div
    className="max-w-xs w-64 bg-orange-50 border border-orange-200 rounded-lg shadow-lg p-4 flex flex-col cursor-pointer hover:bg-orange-100 transition"
    onClick={() => {
      toast.dismiss(toastId);
      window.location.assign(item.type === 'asset' ? `/items/${item.id}` : `/location/${item.id}`);
    }}
    tabIndex={0}
    role="button"
    aria-label={`View details for ${item.name}`}
  >
    <div className="flex items-center gap-2 text-orange-700 font-semibold">
      <AlertTriangle className="w-5 h-5" />
      <span>{item.name}</span>
    </div>
    <div className="text-sm text-gray-700">
      Idle for <b>{item.daysIdle} days</b>
      <br />
      <span className="text-xs text-gray-500">Location: {item.location}</span>
    </div>
  </div>
);

const IdleNotifications: React.FC<IdleNotificationsProps> = ({ idleItems }) => {
  const [shownIds, setShownIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    idleItems.forEach((item) => {
      if (item.daysIdle >= 30 && !shownIds.has(item.id)) {
        toast.custom((t) => (
          <IdleToast item={item} toastId={t} />
        ), {
          duration: 10000,
        });
        setShownIds((prev) => new Set(prev).add(item.id));
      }
    });
    // Only want to run when idleItems changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idleItems]);

  return <></>;
};

export default IdleNotifications; 