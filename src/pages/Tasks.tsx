import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Task {
  id: number;
  title: string;
  description: string;
  isDone: boolean;
  dueDate: string;
  hasReminder?: boolean;
  reminderOffset?: number;
  reminderType?: 'in-app' | 'email' | 'both';
}

export default function Tasks() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    dueDate: string;
    hasReminder: boolean;
    reminderOffset: number;
    reminderType: 'in-app' | 'email' | 'both';
  }>({ 
    title: '', 
    description: '', 
    dueDate: '',
    hasReminder: false,
    reminderOffset: 15,
    reminderType: 'in-app'
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/study/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
      hasReminder: task.hasReminder || false,
      reminderOffset: task.reminderOffset || 15,
      reminderType: task.reminderType || 'in-app'
    });
    setShowAdd(true);
  };

  const handleCloseModal = () => {
    setShowAdd(false);
    setEditingTask(null);
    setFormData({ 
      title: '', 
      description: '', 
      dueDate: '',
      hasReminder: false,
      reminderOffset: 15,
      reminderType: 'in-app'
    });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingTask ? `/api/study/tasks/${editingTask.id}` : '/api/study/tasks';
    const method = editingTask ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      if(res.ok) {
        toast.success(editingTask ? 'Task Updated' : 'Task Created');
        handleCloseModal();
        fetchTasks();
      }
    } catch (err) {
      toast.error('Sync Failure');
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const res = await fetch(`/api/study/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) {
        toast.success('Task deleted');
        fetchTasks();
      }
    } catch (e) {
      toast.error('Deletion error');
    }
  };

  const toggleTask = async (id: number, isDone: boolean) => {
    const newStatus = !isDone;
    try {
      const res = await fetch(`/api/study/tasks/${id}`, {
        method: 'PATCH',
        headers: {  'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isDone: newStatus })
      });

      if(res.ok) {
        if (newStatus) toast.success('Task Completed');
        fetchTasks();
      }
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  return (
    <div className="bg-background max-w-7xl mx-auto w-full font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
         <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-2">
              My Tasks
            </h1>
            <p className="text-[15px] text-on-surface-variant font-medium">Manage your assignments and academic backlogs.</p>
         </div>
         <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.1)_inset] hover:bg-accent-hover transition-colors w-full md:w-auto justify-center text-sm">
           <span className="material-symbols-outlined text-[18px]">add</span>
           Create Task
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
         {/* Active Tasks */}
         <div className="flex flex-col gap-5">
            <h3 className="font-semibold text-[11px] uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/50 pb-2 mb-2 flex items-center gap-2">
               To Do <span className="px-1.5 py-0.5 rounded bg-surface-container-low border border-outline-variant/60 text-[10px] text-on-surface">{tasks.filter(t => !t.isDone).length}</span>
            </h3>
            
            <AnimatePresence>
               {tasks.filter(t => !t.isDone).map(task => (
                 <motion.div 
                   key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                   className="bg-surface border border-outline-variant/60 rounded-2xl p-5 shadow-sm group flex flex-col sm:flex-row items-start gap-4 transition-all hover:bg-surface-container-low/50"
                 >
                    <button onClick={() => toggleTask(task.id, task.isDone)} className="mt-1 flex-shrink-0 text-outline hover:text-primary transition-colors cursor-pointer w-5 h-5 rounded-full border-2 border-outline hover:border-primary flex items-center justify-center">
                    </button>
                    <div className="flex-1 w-full">
                       <h4 className="font-semibold text-on-surface mb-1.5 leading-snug tracking-tight">{task.title}</h4>
                       <p className="text-[13px] text-on-surface-variant mb-4 leading-relaxed line-clamp-2">{task.description}</p>
                       <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-0">
                         {task.dueDate && (
                           <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-container-low rounded-md border border-outline-variant/50 w-max">
                             <span className="material-symbols-outlined text-[14px] text-on-surface-variant">calendar_today</span>
                             <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">
                                {new Date(task.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                             </span>
                           </div>
                         )}
                         {task.hasReminder && (
                           <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 text-primary rounded-md w-max border border-primary/20" title={`Reminder: ${task.reminderType}`}>
                             <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                             <span className="text-[11px] font-semibold uppercase tracking-wider">{task.reminderOffset && task.reminderOffset >= 60 ? (task.reminderOffset === 1440 ? '1d' : `${task.reminderOffset/60}h`) : `${task.reminderOffset}m`}</span>
                           </div>
                         )}
                       </div>
                    </div>
                    <div className="flex gap-1.5 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-start mt-4 sm:mt-0">
                       <button onClick={() => handleOpenEdit(task)} className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-transparent">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                       </button>
                       <button onClick={() => deleteTask(task.id)} className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/50 rounded-lg transition-colors border border-transparent">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                       </button>
                    </div>
                 </motion.div>
               ))}
               {tasks.filter(t => !t.isDone).length === 0 && (
                 <div className="p-10 text-center text-on-surface-variant border-2 border-dashed border-outline-variant/50 rounded-3xl bg-surface/50">
                    <span className="material-symbols-outlined text-[32px] opacity-40 mb-3 block">check_circle</span>
                    <p className="font-medium text-[13px] tracking-wide">You are all caught up.</p>
                 </div>
               )}
            </AnimatePresence>
         </div>

         {/* Completed Tasks */}
         <div className="flex flex-col gap-5">
            <h3 className="font-semibold text-[11px] uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/50 pb-2 mb-2 flex items-center gap-2">Completed</h3>
            <div className="flex flex-col gap-3">
               {tasks.filter(t => t.isDone).map(task => (
                 <div key={task.id} className="bg-surface border border-outline-variant/40 rounded-2xl p-4 shadow-sm group flex items-start gap-4 transition-all opacity-60 hover:opacity-100">
                    <button onClick={() => toggleTask(task.id, task.isDone)} className="mt-0.5 flex-shrink-0 text-primary cursor-pointer w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center bg-primary">
                       <span className="material-symbols-outlined text-[12px] text-white font-bold">check</span>
                    </button>
                    <div className="flex-1 line-through decoration-outline-variant text-on-surface-variant">
                       <h4 className="font-medium text-[15px]">{task.title}</h4>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="w-8 h-8 flex items-center justify-center text-outline hover:text-error hover:bg-error-container/50 rounded-lg transition-colors sm:opacity-0 group-hover:opacity-100">
                       <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-surface w-full max-w-lg relative z-10 rounded-3xl shadow-2xl border border-outline-variant/60 p-8 overflow-hidden">
              <div className="flex justify-between items-center mb-8 border-b border-outline-variant/50 pb-6">
                <h2 className="text-xl font-bold tracking-tight text-on-surface">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
                <button onClick={handleCloseModal} className="text-outline hover:text-on-surface hover:bg-surface-container transition-colors w-8 h-8 rounded-full flex items-center justify-center">
                   <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <form onSubmit={handleAddTask} className="space-y-5">
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant mb-2 block uppercase tracking-widest">Title</label>
                  <input type="text" required placeholder="E.g. Read Chapter 5" className="w-full bg-surface-container-low border border-outline-variant/60 px-4 py-2.5 text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium placeholder:text-outline-variant rounded-xl shadow-sm" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant mb-2 block uppercase tracking-widest">Description <span className="text-outline-variant normal-case tracking-normal">(Optional)</span></label>
                  <textarea placeholder="Add any extra notes..." className="w-full bg-surface-container-low border border-outline-variant/60 px-4 py-3 text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium placeholder:text-outline-variant rounded-xl shadow-sm min-h-[100px] resize-y" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant mb-2 block uppercase tracking-widest">Due Date</label>
                  <input type="datetime-local" className="w-full bg-surface-container-low border border-outline-variant/60 px-4 py-2.5 text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium placeholder:text-outline-variant rounded-xl shadow-sm" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                </div>
                <div className="pt-2">
                   <label className="flex items-center gap-3 cursor-pointer group mb-4">
                     <div className={`relative w-4 h-4 rounded border flex items-center justify-center transition-colors shadow-sm ${formData.hasReminder ? 'bg-primary border-primary' : 'bg-surface border-outline-variant group-hover:border-primary'}`}>
                       {formData.hasReminder && <span className="material-symbols-outlined text-[12px] text-white font-bold">check</span>}
                       <input 
                         type="checkbox" className="sr-only"
                         checked={formData.hasReminder}
                         onChange={(e) => setFormData({...formData, hasReminder: e.target.checked})}
                       />
                     </div>
                     <span className="text-[13px] font-semibold text-on-surface group-hover:text-primary transition-colors">Set Reminder</span>
                   </label>
                   
                   <AnimatePresence>
                     {formData.hasReminder && (
                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden mt-2">
                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                         <div>
                           <label className="text-[10px] font-bold text-on-surface-variant mb-2 block uppercase tracking-widest">Remind me</label>
                           <select 
                             className="w-full bg-surface border border-outline-variant/60 px-3 py-2 text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded-lg font-medium shadow-sm"
                             value={formData.reminderOffset}
                             onChange={(e) => setFormData({...formData, reminderOffset: Number(e.target.value)})}
                           >
                             <option value={15}>15 minutes before</option>
                             <option value={30}>30 minutes before</option>
                             <option value={60}>1 hour before</option>
                             <option value={1440}>1 day before</option>
                           </select>
                         </div>
                         
                         <div>
                           <label className="text-[10px] font-bold text-on-surface-variant mb-2 block uppercase tracking-widest">Notification Type</label>
                           <select 
                             className="w-full bg-surface border border-outline-variant/60 px-3 py-2 text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all rounded-lg font-medium shadow-sm"
                             value={formData.reminderType}
                             onChange={(e) => setFormData({...formData, reminderType: e.target.value as 'in-app' | 'email' | 'both'})}
                           >
                             <option value="in-app">In-App Notification</option>
                             <option value="email">Email Alert</option>
                             <option value="both">Both (In-App & Email)</option>
                           </select>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
                <div className="flex gap-3 pt-6 border-t border-outline-variant/50 mt-6 bg-surface/50">
                  <button type="button" onClick={handleCloseModal} className="flex-1 px-5 py-2.5 text-[13px] border border-outline-variant/60 text-on-surface bg-surface hover:bg-surface-container font-semibold rounded-xl transition-all shadow-sm">Cancel</button>
                  <button type="submit" className="flex-1 px-5 py-2.5 text-[13px] bg-primary text-on-primary font-semibold rounded-xl transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.1)_inset] hover:bg-accent-hover">{editingTask ? 'Save Changes' : 'Create Task'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
