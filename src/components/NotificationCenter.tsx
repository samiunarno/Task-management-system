import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { useSocket } from '../SocketContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationCenter() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (token && user) {
      fetchNotifications();
    }

    if (socket) {
      socket.on('new_notification', (notif: any) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }

    return () => {
      socket?.off('new_notification');
    };
  }, [token, user, socket]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications/${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const dismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative">
       <button 
         onClick={() => setIsOpen(!isOpen)}
         className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors cursor-pointer active:scale-95 duration-200 relative mr-1"
       >
         <span className="material-symbols-outlined">notifications</span>
         {unreadCount > 0 && (
           <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full outline outline-2 outline-surface"></span>
         )}
       </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-surface border border-outline-variant/30 z-50 overflow-hidden shadow-xl rounded-2xl"
            >
              <div className="bg-surface p-4 border-b border-outline-variant/30 flex justify-between items-center">
                <span className="font-headline font-bold text-on-surface text-lg">Notifications</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-on-primary px-2.5 py-1 rounded-full">{notifications.length} New</span>
              </div>

              <div className="max-h-96 overflow-y-auto bg-background">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center text-secondary flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[48px] opacity-20 mb-4">notifications_paused</span>
                    <p className="text-sm font-medium">You're all caught up.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n._id}
                      className={`p-4 border-b border-outline-variant/30 last:border-0 hover:bg-surface transition-colors relative group flex gap-3 ${!n.isRead ? 'bg-surface-container-lowest' : 'opacity-60'}`}
                    >
                      {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md" />}
                      <div className="mt-1 shrink-0 text-primary">
                         <span className="material-symbols-outlined text-[20px]">{n.type === 'ALERT' ? 'warning' : 'notifications'}</span>
                      </div>
                      <div className="flex justify-between items-start gap-3 flex-1 flex-col sm:flex-row">
                        <div className="flex flex-col gap-1.5 flex-1 w-full">
                          <p className="font-medium text-sm text-on-surface leading-snug">{n.message}</p>
                          <span className="text-[11px] font-bold text-outline uppercase tracking-wider block">
                            {new Date(n.createdAt).toLocaleTimeString([], {timeStyle: 'short'})}
                          </span>
                        </div>
                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity self-end sm:self-start">
                          <button 
                            onClick={(e) => dismiss(n._id, e)}
                            className="p-1.5 hover:bg-error-container text-secondary hover:text-on-error-container rounded-lg transition-colors flex items-center justify-center"
                            title="Dismiss action"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                          {!n.isRead && (
                             <button 
                                onClick={(e) => markAsRead(n._id, e)}
                                className="p-1.5 hover:bg-primary-container text-secondary hover:text-on-primary-container rounded-lg transition-colors flex items-center justify-center"
                                title="Acknowledge event"
                             >
                                <span className="material-symbols-outlined text-[16px]">check</span>
                             </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-surface-container border-t border-outline-variant/30 flex justify-between items-center">
                <button 
                   onClick={() => { setIsOpen(false); navigate('/settings'); }}
                   className="text-xs font-bold uppercase tracking-wider text-secondary hover:text-on-surface transition-colors flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-surface-container-high"
                >
                   <span className="material-symbols-outlined text-[16px]">settings</span> PREFS
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary animate-pulse rounded-full" />
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">SYNCED</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
