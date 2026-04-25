import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface RoutineItem {
  id: number;
  type: 'Class' | 'Study' | 'Lunch' | 'Sleep';
  courseName: string;
  isImportant: boolean;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
}

export default function Routine() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineItem | null>(null);
  const [formData, setFormData] = useState({
    type: 'Study',
    courseName: '',
    isImportant: false,
    startTime: '',
    endTime: '',
    dayOfWeek: 'Monday'
  });

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const res = await fetch('/api/study/routines', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) {
        const data = await res.json();
        setRoutines(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEdit = (routine: RoutineItem) => {
    setEditingRoutine(routine);
    setFormData({
      type: routine.type,
      courseName: routine.courseName,
      isImportant: routine.isImportant,
      startTime: routine.startTime,
      endTime: routine.endTime,
      dayOfWeek: routine.dayOfWeek
    });
    setShowAdd(true);
  };

  const handleCloseModal = () => {
    setShowAdd(false);
    setEditingRoutine(null);
    setFormData({ type: 'Study', courseName: '', isImportant: false, startTime: '', endTime: '', dayOfWeek: 'Monday'});
  };

  const handleAddRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingRoutine ? `/api/study/routines/${editingRoutine.id}` : '/api/study/routines';
    const method = editingRoutine ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if(res.ok) {
        toast.success(editingRoutine ? 'Block updated' : 'Block scheduled');
        handleCloseModal();
        fetchRoutines();
      }
    } catch (err) {
      toast.error('Sync failure');
    }
  };

  const deleteRoutine = async (id: number) => {
    if (!confirm('Are you sure you want to delete this block?')) return;
    try {
      const res = await fetch(`/api/study/routines/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
      if(res.ok) {
        toast.success('Block removed');
        fetchRoutines();
      }
    } catch (e) {}
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getIcon = (type: string) => {
    switch (type) {
      case 'Class': return <span className="material-symbols-outlined text-[16px]">school</span>;
      case 'Lunch': return <span className="material-symbols-outlined text-[16px]">restaurant</span>;
      case 'Sleep': return <span className="material-symbols-outlined text-[16px]">bedtime</span>;
      default: return <span className="material-symbols-outlined text-[16px]">menu_book</span>;
    }
  };

  return (
    <div className="bg-background max-w-full w-full font-sans">
      <div className="max-w-[1600px] mx-auto w-full px-6 md:px-10 lg:px-14 py-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-2">Weekly Routine</h1>
            <p className="text-[15px] text-on-surface-variant font-medium">Manage your academic schedule and timeblocks.</p>
          </div>
          
          <button onClick={() => setShowAdd(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.1)_inset] hover:bg-accent-hover transition-colors w-full lg:w-auto text-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Schedule Block
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-6">
          {days.map((day) => (
            <div key={day} className="bg-surface-container-low rounded-3xl border border-outline-variant/60 flex flex-col min-h-[500px] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-outline-variant/50 bg-surface/50 backdrop-blur-sm text-center shrink-0">
                 <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">{day.substring(0, 3)}</span>
              </div>
              <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto bg-surface">
                {routines.filter(r => r.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime)).map(routine => (
                  <motion.div 
                    layout key={routine.id}
                    className={`p-4 rounded-2xl group flex flex-col items-start gap-3 transition-all shadow-sm border ${routine.isImportant ? 'bg-error-container/50 text-on-error-container border-error/30' : 'bg-surface-container-low text-on-surface border-outline-variant/50 hover:bg-surface-container'}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border ${routine.isImportant ? 'bg-error text-white border-error' : 'bg-surface text-on-surface border-outline-variant/60'}`}>
                        {getIcon(routine.type)}
                      </div>
                      <div className="flex gap-1 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(routine)} className="w-7 h-7 flex items-center justify-center rounded-md text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                        <button onClick={() => deleteRoutine(routine.id)} className="w-7 h-7 flex items-center justify-center rounded-md text-on-surface-variant hover:text-error hover:bg-error-container/50 transition-colors"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                      </div>
                    </div>
                    
                    <div className="w-full">
                      <h3 className={`text-[14px] font-semibold mb-1 truncate leading-tight tracking-tight ${routine.isImportant ? 'text-on-error-container' : 'text-on-surface'}`}>
                        {routine.courseName || routine.type}
                      </h3>
                      <div className={`text-[11px] font-medium tracking-wide ${routine.isImportant ? 'text-on-error-container/80' : 'text-on-surface-variant'}`}>
                        {routine.startTime} - {routine.endTime}
                      </div>
                    </div>

                    {routine.isImportant && (
                      <span className="material-symbols-outlined absolute top-3 right-3 text-error/30 text-3xl pointer-events-none" style={{ fontVariationSettings: "'FILL' 1" }}>priority_high</span>
                    )}
                  </motion.div>
                ))}
                {routines.filter(r => r.dayOfWeek === day).length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center p-4 opacity-70">
                     <div className="w-10 h-10 border-2 border-dashed border-outline-variant/50 rounded-xl mb-3 flex items-center justify-center text-outline-variant bg-surface-container-low">
                         <span className="material-symbols-outlined text-[20px]">add</span>
                     </div>
                     <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">No blocks</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-surface w-full max-w-xl relative z-10 rounded-3xl shadow-2xl p-8 border border-outline-variant/60">
              <div className="flex justify-between items-center mb-8 border-b border-outline-variant/50 pb-6">
                <h2 className="text-xl font-bold tracking-tight text-on-surface">{editingRoutine ? 'Edit Schedule Block' : 'New Schedule Block'}</h2>
                <button onClick={handleCloseModal} className="text-outline hover:text-on-surface hover:bg-surface-container transition-colors w-8 h-8 rounded-full flex items-center justify-center">
                   <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <form onSubmit={handleAddRoutine} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-5 z-20 relative">
                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant mb-2 block uppercase tracking-widest">Type</label>
                    <div className="relative">
                       <select className="w-full bg-surface-container-low border border-outline-variant/60 px-4 py-2.5 text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium rounded-xl shadow-sm appearance-none" value={formData.type} onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}>
                         <option value="Class">Class / Lecture</option>
                         <option value="Study">Deep Work</option>
                         <option value="Lunch">Break / Rest</option>
                         <option value="Sleep">Sleep Cycle</option>
                       </select>
                       <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none text-[18px]">expand_more</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant mb-2 block uppercase tracking-widest">Subject</label>
                    <input type="text" required placeholder="E.g. Mathematics" className="w-full bg-surface-container-low border border-outline-variant/60 px-4 py-2.5 text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium placeholder:text-outline-variant rounded-xl shadow-sm" value={formData.courseName} onChange={(e) => setFormData({ ...formData, courseName: e.target.value })} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant mb-2 block uppercase tracking-widest">Start Time</label>
                    <input type="time" required className="w-full bg-surface-container-low border border-outline-variant/60 px-4 py-2.5 text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium placeholder:text-outline-variant rounded-xl shadow-sm [&::-webkit-calendar-picker-indicator]:opacity-50" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant mb-2 block uppercase tracking-widest">End Time</label>
                    <input type="time" required className="w-full bg-surface-container-low border border-outline-variant/60 px-4 py-2.5 text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium placeholder:text-outline-variant rounded-xl shadow-sm [&::-webkit-calendar-picker-indicator]:opacity-50" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant mb-2 block uppercase tracking-widest">Day Target</label>
                    <div className="relative">
                      <select className="w-full bg-surface-container-low border border-outline-variant/60 px-4 py-2.5 text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium appearance-none rounded-xl shadow-sm" value={formData.dayOfWeek} onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}>
                        {days.map(d => <option key={d} value={d}>{d.substring(0,3)}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none text-[18px]">expand_more</span>
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-4 p-5 border border-outline-variant/60 bg-surface-container-low rounded-2xl cursor-pointer hover:bg-surface-container transition-colors shadow-sm mt-8 group">
                  <div className={`relative w-4 h-4 rounded border flex items-center justify-center transition-colors shadow-sm ${formData.isImportant ? 'bg-error border-error' : 'bg-surface border-outline-variant group-hover:border-error/50'}`}>
                    {formData.isImportant && <span className="material-symbols-outlined text-[12px] text-white font-bold">check</span>}
                    <input type="checkbox" className="sr-only" checked={formData.isImportant} onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })} />
                  </div>
                  <div>
                    <div className={`text-[13px] font-semibold uppercase tracking-widest mb-0.5 transition-colors ${formData.isImportant ? 'text-error' : 'text-on-surface'}`}>High Priority</div>
                    <div className="text-[11px] text-on-surface-variant font-medium">Flag this block as critically important</div>
                  </div>
                </label>

                <div className="flex gap-3 pt-6 border-t border-outline-variant/50 mt-8 bg-surface">
                  <button type="button" onClick={handleCloseModal} className="flex-1 px-5 py-2.5 border border-outline-variant/60 text-[13px] text-on-surface bg-surface hover:bg-surface-container font-semibold rounded-xl transition-colors shadow-sm text-center">Cancel</button>
                  <button type="submit" className="flex-1 px-5 py-2.5 bg-primary text-on-primary text-[13px] font-semibold rounded-xl transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.1)_inset] hover:bg-accent-hover text-center">{editingRoutine ? 'Save Block' : 'Schedule Block'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
