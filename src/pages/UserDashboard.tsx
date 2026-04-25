import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, logout } from '../store';
import { useSocket } from '../SocketContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface AIReport {
  report: string;
  improvements: string[];
  suggestedTasks: string[];
  moodScore: string;
}

export default function UserDashboard() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const [tasks, setTasks] = useState<any[]>([]);
  const [report, setReport] = useState<AIReport | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);

  useEffect(() => {
    fetchData();

    if (socket) {
      socket.on('study_update', () => fetchData());
      socket.on('account_status_changed', (data: { status: string }) => {
        if (data.status !== 'Active') {
          setSecurityAlert(`CRITICAL ALERT: Account status restricted to ${data.status.toUpperCase()}. Terminating session.`);
          setTimeout(() => dispatch(logout()), 5000);
        }
      });
    }

    return () => {
      socket?.off('study_update');
      socket?.off('account_status_changed');
    };
  }, [socket]);

  const fetchData = async () => {
    try {
      const taskRes = await fetch('/api/study/tasks', { headers: { 'Authorization': `Bearer ${token}` }});
      if(taskRes.ok) setTasks(await taskRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const generateAIReport = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch('/api/study/ai-report', { headers: { 'Authorization': `Bearer ${token}` }});
      if(res.ok) setReport(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAI(false);
    }
  };

  const taskStats = [
    { name: 'Completed', value: tasks.filter(t => t.isDone).length },
    { name: 'Pending', value: tasks.filter(t => !t.isDone).length },
  ];

  const COLORS = ['#10b981', '#f1f5f9'];

  return (
    <div className="bg-background max-w-7xl mx-auto w-full font-sans">
      <AnimatePresence>
        {securityAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-4 bg-error-container text-error flex items-start gap-3 rounded-2xl shadow-sm border border-error/20 overflow-hidden"
          >
            <span className="material-symbols-outlined mt-0.5 text-error shrink-0">error</span>
            <div>
              <h3 className="text-sm font-bold tracking-tight mb-1">System Intervention</h3>
              <p className="text-sm font-medium">{securityAlert}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
         <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-2">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Operator'}
            </h1>
            <p className="text-[15px] text-on-surface-variant">Here is your daily workspace overview and telemetry.</p>
         </div>
         <button 
           onClick={generateAIReport} 
           disabled={loadingAI} 
           className="flex items-center gap-2 px-5 py-2.5 bg-surface text-on-surface border border-outline-variant rounded-xl font-semibold hover:bg-surface-container shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed group text-sm"
         >
           <span className={`material-symbols-outlined text-[18px] text-primary group-hover:text-accent-hover transition-colors ${loadingAI ? 'animate-spin' : ''}`}>
             {loadingAI ? 'progress_activity' : 'model_training'}
           </span>
           {loadingAI ? 'Generating Insights...' : 'Analyze Workspace'}
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
         {/* Task Efficiency */}
         <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-surface border border-outline-variant/60 rounded-3xl p-6 shadow-sm flex-1 flex flex-col">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="font-semibold text-on-surface text-sm uppercase tracking-widest">Efficiency</h3>
                  <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center">
                     <span className="material-symbols-outlined text-outline text-[18px]">analytics</span>
                  </div>
               </div>

               <div className="flex-1 relative min-h-[220px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={taskStats} 
                        innerRadius="75%" 
                        outerRadius="95%" 
                        paddingAngle={2} 
                        dataKey="value" 
                        stroke="none" 
                        cornerRadius={6}
                      >
                        {taskStats.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} />)}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-outline-variant)', background: 'var(--color-surface)', color: 'var(--color-on-surface)', fontSize: '12px', fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '8px 12px' }} 
                        itemStyle={{ color: 'var(--color-on-surface)' }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-4xl font-bold text-on-surface tracking-tighter">
                      {Math.round((taskStats[0].value / (taskStats[0].value + taskStats[1].value || 1)) * 100) || 0}<span className="text-xl text-on-surface-variant font-medium">%</span>
                    </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-outline-variant/50">
                  <div className="bg-surface-container-low rounded-xl p-4 flex flex-col items-center justify-center text-center">
                     <div className="text-[10px] text-on-surface-variant font-bold mb-1 uppercase tracking-widest">Completed</div>
                     <div className="text-2xl font-bold text-primary">{taskStats[0].value}</div>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-4 flex flex-col items-center justify-center text-center">
                     <div className="text-[10px] text-on-surface-variant font-bold mb-1 uppercase tracking-widest">Pending</div>
                     <div className="text-2xl font-bold text-on-surface">{taskStats[1].value}</div>
                  </div>
               </div>
            </div>
         </div>

         {/* AI Insights Main Panel */}
         <div className="lg:col-span-2 bg-surface border border-outline-variant/60 rounded-3xl overflow-hidden flex flex-col min-h-[500px] shadow-sm relative">
            <div className="border-b border-outline-variant/50 bg-surface/50 backdrop-blur-sm p-5 flex items-center justify-between z-10 shrink-0">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-primary-container text-primary flex items-center justify-center">
                     <span className="material-symbols-outlined text-[18px]">psychology</span>
                 </div>
                 <h2 className="font-semibold text-sm text-on-surface uppercase tracking-widest">AI Synthesis</h2>
               </div>
               {report && (
                 <div className="px-3 py-1.5 bg-surface-container border border-outline-variant text-on-surface font-semibold text-[11px] rounded-md flex items-center gap-2 shadow-sm tracking-wider uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    Index Score: {report.moodScore}
                 </div>
               )}
            </div>

            <div className="flex-1 relative p-8 md:p-10 overflow-y-auto bg-surface">
               <AnimatePresence>
                   {loadingAI && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-surface/80 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6"
                      >
                         <span className="material-symbols-outlined text-[40px] text-primary animate-spin mb-4">progress_activity</span>
                         <div className="text-sm font-semibold text-on-surface-variant tracking-wider uppercase">Processing Telemetry</div>
                      </motion.div>
                   )}
               </AnimatePresence>

               {!report ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-on-surface-variant">
                   <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center mb-6 border border-outline-variant/50 shadow-sm">
                     <span className="material-symbols-outlined text-[32px] text-outline">data_exploration</span>
                   </div>
                   <h3 className="text-xl font-bold text-on-surface mb-2 tracking-tight">Awaiting Input</h3>
                   <p className="text-[13px] max-w-[280px] text-on-surface-variant/80 leading-relaxed font-medium">
                     Generate a synthesis report to evaluate current metrics and receive automated pathing.
                   </p>
                 </div>
               ) : (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-10">
                   <div>
                     <p className="text-2xl font-medium tracking-tight text-on-surface leading-snug">
                       "{report.report}"
                     </p>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-outline-variant/50">
                     <div className="flex flex-col">
                       <h4 className="font-semibold text-[11px] text-on-surface-variant mb-4 flex items-center gap-2 uppercase tracking-widest">
                          <span className="material-symbols-outlined text-[16px]">tune</span> Identified Optimization
                       </h4>
                       <div className="space-y-3 flex-1">
                         {report.improvements.map((imp, i) => (
                           <div key={i} className="p-4 bg-surface-container-low border border-outline-variant/50 rounded-2xl text-[13px] font-medium text-on-surface leading-normal shadow-sm">
                             {imp}
                           </div>
                         ))}
                       </div>
                     </div>
                     <div className="flex flex-col">
                       <h4 className="font-semibold text-[11px] text-on-surface-variant mb-4 flex items-center gap-2 uppercase tracking-widest">
                          <span className="material-symbols-outlined text-[16px]">add_task</span> Proposed Pathing
                       </h4>
                       <div className="space-y-3 flex-1">
                         {report.suggestedTasks.map((todo, i) => (
                           <div key={i} className="p-4 bg-surface-container-low border border-outline-variant/50 rounded-2xl text-[13px] font-medium text-on-surface leading-normal flex items-start gap-3 shadow-sm">
                              <span className="material-symbols-outlined text-primary mt-0.5 text-[18px]">adjust</span>
                              <span>{todo}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                 </motion.div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
