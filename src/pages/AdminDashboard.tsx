import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useSocket } from '../SocketContext';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDashboard() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { socket } = useSocket();
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'fleet' | 'analytics'>('fleet');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: 'delete' | 'ban' | 'unban' | null;
    userId: string | null;
    userName: string;
  }>({ isOpen: false, action: null, userId: null, userName: '' });

  const [viewUserDialog, setViewUserDialog] = useState<{
    isOpen: boolean;
    user: any | null;
  }>({ isOpen: false, user: null });

  useEffect(() => {
    fetchData();
    if (socket) {
      socket.on('dashboard_update', () => fetchData());
    }
    return () => {
      socket?.off('dashboard_update');
    };
  }, [socket]);

  const fetchData = async () => {
    try {
      const userRes = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` }});
      if(userRes.ok) setUsers(await userRes.json());

      const statsRes = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` }});
      if(statsRes.ok) setStats(await statsRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = async () => {
    const { userId, action } = confirmDialog;
    if (!userId || !action) return;

    try {
      const parsedAction = action === 'ban' || action === 'unban' ? 'status' : 'delete';
      const parsedValue = action === 'ban' ? 'Banned' : action === 'unban' ? 'Active' : undefined;

      const res = await fetch('/api/admin/user-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId, action: parsedAction, value: parsedValue })
      });
      if (res.ok) {
        fetchData();
        if (viewUserDialog.user?._id === userId) {
          if (parsedAction === 'delete') setViewUserDialog({ isOpen: false, user: null });
          else setViewUserDialog({ isOpen: true, user: { ...viewUserDialog.user, status: parsedValue } });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      closeConfirmDialog();
    }
  };

  const openConfirmDialog = (action: 'delete' | 'ban' | 'unban', userId: string, userName: string) => {
    setConfirmDialog({ isOpen: true, action, userId, userName });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, action: null, userId: null, userName: '' });
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background max-w-7xl mx-auto w-full font-sans">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-2">
            Administrator Protocol
          </h1>
          <p className="text-[15px] text-on-surface-variant font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span> SYSTEM_ROOT // SUPERUSER
          </p>
        </div>
        
        <div className="flex bg-surface-container-low border border-outline-variant/60 rounded-xl overflow-hidden shadow-sm p-1">
           <button 
             onClick={() => setActiveTab('fleet')}
             className={`px-6 py-2.5 text-sm font-semibold transition-all rounded-lg ${activeTab === 'fleet' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}
           >
             User Control
           </button>
           <button 
             onClick={() => setActiveTab('analytics')}
             className={`px-6 py-2.5 text-sm font-semibold transition-all rounded-lg ${activeTab === 'analytics' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}`}
           >
             Logs & Metrics
           </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Active Users', val: stats.totalUsers, icon: 'group', id: 'USERS' },
            { label: 'Task Throughput', val: stats.tasks?.[0]?.value || 0, icon: 'task_alt', id: 'TASKS' },
            { label: 'Process Syncs', val: stats.activeRoutines || 0, icon: 'sync', id: 'SYNCS' },
            { label: 'Violations', val: users.filter(u => u.status === 'Banned').length, icon: 'gpp_bad', id: 'BANS' }
          ].map((stat, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} 
              className="bg-surface border border-outline-variant/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[160px]"
            >
               <div className="flex justify-between items-start mb-6">
                 <span className="material-symbols-outlined text-outline text-[24px]">{stat.icon}</span>
                 <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant px-2.5 py-1 bg-surface-container rounded border border-outline-variant/50">{stat.id}</span>
               </div>
               <div>
                  <div className="text-3xl font-bold tracking-tight text-on-surface mb-1">{stat.val}</div>
                  <div className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">{stat.label}</div>
               </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Content Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'fleet' ? (
          <motion.div key="fleet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-surface border border-outline-variant/60 rounded-3xl overflow-hidden shadow-sm">
             <div className="p-6 border-b border-outline-variant/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[20px]">dns</span>
                  <span className="font-semibold text-sm uppercase tracking-widest">System Operators</span>
                </div>
                <div className="relative w-full sm:w-80">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                  <input 
                     type="text" 
                     placeholder="Search by ID or Email..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full bg-surface-container-low border border-outline-variant/60 pl-11 pr-4 py-2.5 text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium rounded-xl shadow-sm placeholder:text-outline-variant"
                  />
                </div>
             </div>

             <div className="overflow-x-auto text-[13px]">
               <table className="w-full text-left border-collapse">
                 <thead className="bg-surface border-b border-outline-variant/50 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                   <tr>
                     <th className="px-6 py-4">Identification</th>
                     <th className="px-6 py-4">Clearance</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-outline-variant/30 bg-surface">
                   {filteredUsers.map(u => (
                     <tr key={u._id} className="hover:bg-surface-container-low/50 transition-colors">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-surface-container border border-outline-variant/50 flex items-center justify-center text-on-surface font-bold text-[14px] shadow-sm">
                             {u.fullName?.charAt(0).toUpperCase() || 'U'}
                           </div>
                           <div>
                             <div className="font-semibold text-on-surface">{u.fullName}</div>
                             <div className="text-xs text-on-surface-variant mt-0.5">{u.email}</div>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold border ${u.role === 'Admin' ? 'bg-primary-container text-primary border-primary/20' : 'bg-surface-container-high text-on-surface-variant border-outline-variant/50'}`}>
                           {u.role}
                         </span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full border border-background shadow-sm ${u.status === 'Active' ? 'bg-primary' : 'bg-error'}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${u.status === 'Active' ? 'text-on-surface' : 'text-error'}`}>{u.status}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2 text-on-surface-variant">
                           <button 
                             onClick={() => setViewUserDialog({ isOpen: true, user: u })}
                             className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container hover:text-on-surface transition-colors border border-transparent shadow-sm"
                             title="View Details"
                           >
                             <span className="material-symbols-outlined text-[18px]">visibility</span>
                           </button>
                           {u.role !== 'Admin' && (
                             <>
                               <button 
                                 onClick={() => openConfirmDialog(u.status === 'Active' ? 'ban' : 'unban', u._id, u.fullName)}
                                 className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container hover:text-on-surface transition-colors border border-transparent shadow-sm"
                                 title={u.status === 'Active' ? 'Ban User' : 'Unban User'}
                               >
                                 <span className="material-symbols-outlined text-[18px]">{u.status === 'Active' ? 'block' : 'check_circle'}</span>
                               </button>
                               <button 
                                 onClick={() => openConfirmDialog('delete', u._id, u.fullName)}
                                 className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-error-container hover:text-error transition-colors border border-transparent shadow-sm"
                                 title="Delete User"
                               >
                                 <span className="material-symbols-outlined text-[18px]">delete</span>
                               </button>
                             </>
                           )}
                         </div>
                       </td>
                     </tr>
                   ))}
                   {filteredUsers.length === 0 && (
                     <tr>
                       <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant text-[13px] font-medium">
                         No users found matching query "{searchQuery}"
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </motion.div>
        ) : (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-surface border border-outline-variant/60 rounded-3xl p-8 shadow-sm">
             <h3 className="text-xl font-bold text-on-surface mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-outline text-[24px]">receipt_long</span>
                System Logs
             </h3>
             
             <div className="space-y-4">
                {[
                   { type: 'SEC', msg: 'Zero-trust environment active.', id: 'Evnt-ax91' },
                   { type: 'NET', msg: 'WebSocket stream established.', id: 'Evnt-bx82' },
                   { type: 'SYS', msg: 'Cron jobs executing normally.', id: 'Evnt-cx73' }
                ].map((log, i) => (
                   <div key={i} className="flex gap-4 items-center p-4 border border-outline-variant/40 bg-surface-container-low rounded-2xl group shadow-sm transition-all hover:bg-surface-container">
                      <div className="px-2 py-1 bg-surface border border-outline-variant/60 rounded-md text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{log.type}</div>
                      <div className="flex-1 text-[13px] font-medium text-on-surface">{log.msg}</div>
                      <div className="text-[11px] font-mono font-medium text-outline-variant">{log.id}</div>
                   </div>
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={closeConfirmDialog}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-surface border border-outline-variant/60 rounded-3xl shadow-2xl overflow-hidden p-8"
            >
              <div className="flex items-start gap-5 mb-8">
                <div className={`w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center shrink-0 border ${confirmDialog.action === 'delete' ? 'bg-error-container text-error border-error/20' : confirmDialog.action === 'ban' ? 'bg-error-container text-error border-error/20' : 'bg-primary-container text-primary border-primary/20'}`}>
                  {confirmDialog.action === 'delete' ? <span className="material-symbols-outlined text-[24px]">delete</span> : confirmDialog.action === 'ban' ? <span className="material-symbols-outlined text-[24px]">block</span> : <span className="material-symbols-outlined text-[24px]">shield</span>}
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-bold text-on-surface tracking-tight">
                    {confirmDialog.action === 'delete' ? 'Delete User' : confirmDialog.action === 'ban' ? 'Ban User' : 'Unban User'}
                  </h3>
                  <p className="text-[13px] font-medium text-on-surface-variant mt-2 leading-relaxed">
                    {confirmDialog.action === 'delete' ? `Are you sure you want to permanently delete ${confirmDialog.userName}? This action cannot be undone.` : 
                     confirmDialog.action === 'ban' ? `Are you sure you want to suspend access for ${confirmDialog.userName}?` : 
                     `Are you sure you want to restore access for ${confirmDialog.userName}?`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant/50">
                <button 
                  onClick={closeConfirmDialog}
                  className="px-5 py-2.5 text-[13px] font-semibold text-on-surface bg-surface border border-outline-variant hover:bg-surface-container shadow-sm rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAction}
                  className={`px-5 py-2.5 text-[13px] font-semibold text-on-primary rounded-xl transition-all shadow-md ${
                    confirmDialog.action === 'delete' ? 'bg-error hover:bg-error/90' : 
                    confirmDialog.action === 'ban' ? 'bg-error hover:bg-error/90' : 
                    'bg-primary hover:bg-accent-hover'
                  }`}
                >
                  {confirmDialog.action === 'delete' ? 'Delete Permanently' : confirmDialog.action === 'ban' ? 'Ban User' : 'Unban User'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View User Modal */}
      <AnimatePresence>
        {viewUserDialog.isOpen && viewUserDialog.user && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setViewUserDialog({ isOpen: false, user: null })}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-surface border border-outline-variant/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/50 bg-surface/50 backdrop-blur-sm">
                 <h3 className="text-[15px] font-bold text-on-surface flex items-center gap-2 tracking-tight">
                    <span className="material-symbols-outlined text-outline text-[20px]">manage_accounts</span>
                    Operator Details
                 </h3>
                 <button onClick={() => setViewUserDialog({ isOpen: false, user: null })} className="text-outline hover:text-on-surface w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                 </button>
              </div>
              
              <div className="p-8 overflow-y-auto">
                 <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-surface-container border border-outline-variant/60 flex items-center justify-center text-on-surface text-2xl font-bold shadow-sm">
                       {viewUserDialog.user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                       <h2 className="text-xl font-bold text-on-surface tracking-tight">{viewUserDialog.user.fullName}</h2>
                       <p className="text-[13px] text-on-surface-variant font-medium mt-0.5">{viewUserDialog.user.email}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/50 shadow-sm flex flex-col justify-center items-center text-center">
                       <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Clearance Level</p>
                       <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border inline-block uppercase tracking-wider ${viewUserDialog.user.role === 'Admin' ? 'bg-primary-container border-primary/20 text-primary' : 'bg-surface border-outline-variant/50 text-on-surface'}`}>
                         {viewUserDialog.user.role}
                       </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/50 shadow-sm flex flex-col justify-center items-center text-center">
                       <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">System Status</p>
                       <div className="flex items-center justify-center gap-2">
                         <div className={`w-2.5 h-2.5 rounded-full border border-background shadow-sm ${viewUserDialog.user.status === 'Active' ? 'bg-primary' : 'bg-error'}`} />
                         <span className={`text-[11px] font-bold uppercase tracking-wider ${viewUserDialog.user.status === 'Active' ? 'text-on-surface' : 'text-error'}`}>{viewUserDialog.user.status}</span>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4 pt-2">
                    <h4 className="text-[11px] font-bold text-on-surface-variant border-b border-outline-variant/50 pb-2 uppercase tracking-widest">Technical Data</h4>
                    <div className="flex justify-between items-center py-1">
                       <span className="text-[13px] font-medium text-on-surface-variant">Record ID</span>
                       <span className="text-[11px] font-mono font-medium text-on-surface bg-surface-container-low border border-outline-variant/50 px-2 py-1 rounded-md shadow-sm">{viewUserDialog.user._id}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                       <span className="text-[13px] font-medium text-on-surface-variant">Registration Date</span>
                       <span className="text-[13px] font-semibold text-on-surface">
                         {new Date(viewUserDialog.user.createdAt || Date.now()).toLocaleDateString(undefined, {
                           year: 'numeric', month: 'short', day: 'numeric'
                         })}
                       </span>
                    </div>
                 </div>
              </div>
              
              {viewUserDialog.user.role !== 'Admin' && (
                <div className="p-6 border-t border-outline-variant/50 bg-surface/50 flex justify-end gap-3">
                   <button 
                     onClick={() => {
                        setViewUserDialog({ isOpen: false, user: null });
                        openConfirmDialog(viewUserDialog.user.status === 'Active' ? 'ban' : 'unban', viewUserDialog.user._id, viewUserDialog.user.fullName);
                     }}
                     className="px-5 py-2.5 text-[13px] font-semibold text-on-surface bg-surface hover:bg-surface-container border border-outline-variant/60 rounded-xl transition-all shadow-sm"
                   >
                     {viewUserDialog.user.status === 'Active' ? 'Ban User' : 'Unban User'}
                   </button>
                   <button 
                     onClick={() => {
                        setViewUserDialog({ isOpen: false, user: null });
                        openConfirmDialog('delete', viewUserDialog.user._id, viewUserDialog.user.fullName);
                     }}
                     className="px-5 py-2.5 text-[13px] font-semibold text-on-error bg-error hover:bg-error/90 rounded-xl transition-all shadow-md"
                   >
                     Delete User
                   </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
