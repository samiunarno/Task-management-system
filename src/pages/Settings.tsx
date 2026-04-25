import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, logout } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({ fullName: '', email: '', profilePhoto: '' });
  const [notiSettings, setNotiSettings] = useState({ email: true, inApp: true, reminderAdvanceMinutes: 30 });
  const [deactiveDays, setDeactiveDays] = useState(7);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await fetch('/api/user/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setProfile(data);
    setFormData({ fullName: data.fullName, email: data.email, profilePhoto: data.profilePhoto || '' });
    if (data.notificationSettings) {
      setNotiSettings(data.notificationSettings);
    }
  };

  const handleUpdateNoti = async () => {
    try {
      const res = await fetch(`/api/notifications/${user?.id}/settings`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ settings: notiSettings })
      });
      if (res.ok) {
        setStatus('Notification settings synchronized.');
        setTimeout(() => setStatus(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/user/update', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setStatus('Profile updated successfully!');
      setTimeout(() => setStatus(''), 3000);
      fetchProfile();
    }
  };

  const handleDeactivate = async () => {
    const res = await fetch('/api/user/request-deactive', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ days: deactiveDays })
    });
    if (res.ok) {
      setStatus('Deactivation request sent to Admin.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure? This action is permanent.')) {
      await fetch('/api/admin/user-action', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ userId: user?.id, action: 'delete' })
      });
      dispatch(logout());
      navigate('/login');
    }
  };

  if (!profile) return <div className="text-center py-20 font-sans text-sm font-bold opacity-50 uppercase tracking-widest text-on-surface">Loading Systems...</div>;

  return (
    <div className="bg-background max-w-7xl mx-auto w-full font-sans">
      <div className="flex flex-col lg:flex-row items-baseline justify-between mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-2">Configuration</h1>
          <p className="text-[15px] text-on-surface-variant font-medium">Manage your profile and security preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 border-none bg-transparent">
        {/* Left Column: QR & Profile Card */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="p-6 md:p-8 rounded-3xl bg-surface-container-low border border-outline-variant/60 flex flex-col items-center text-center shadow-sm">
            <div className="w-24 h-24 rounded-2xl bg-surface border border-outline-variant/50 mb-5 flex flex-col items-center justify-center overflow-hidden shadow-sm">
              {formData.profilePhoto ? (
                <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[32px] text-outline-variant">person</span>
              )}
            </div>
            <h3 className="text-xl font-bold text-on-surface tracking-tight">{profile.fullName}</h3>
            <span className="mt-3 text-[10px] font-bold uppercase tracking-widest bg-surface border border-outline-variant/60 text-on-surface-variant px-3 py-1 rounded-full shadow-sm">
              {profile.role}
            </span>
          </div>

          <div className="p-6 md:p-8 rounded-3xl bg-surface-container-low border border-outline-variant/60 shadow-sm flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-5 font-bold text-[11px] text-on-surface-variant uppercase tracking-widest">
              <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
              OPTICAL ACCESS KEY
            </div>
            
            <div className="bg-surface p-4 rounded-2xl border border-outline-variant/50 mb-5 shadow-sm">
              <img src={profile.qrCode} alt="Login QR" className="w-40 h-40 mix-blend-darken" />
            </div>
            
            <p className="text-[13px] font-medium text-on-surface-variant mb-6 leading-relaxed max-w-[250px]">
              Scan this cipher to bypass primary authentication from any trusted secondary device.
            </p>
            
            <a 
              href={profile.qrCode} 
              download="my-studyflow-qr.png"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-surface border border-outline-variant/60 text-[13px] text-on-surface font-semibold rounded-xl transition-colors hover:bg-surface-container shadow-sm w-full"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Download Signal
            </a>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <AnimatePresence>
            {status && (
              <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="bg-primary/10 text-primary px-5 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest border border-primary/20 flex flex-row items-center gap-3 shadow-sm">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                {status}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-6 md:p-8 rounded-3xl bg-surface-container-low border border-outline-variant/60 shadow-sm">
            <h3 className="text-2xl font-bold tracking-tight text-on-surface mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              Communication Protocols
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-surface rounded-2xl border border-outline-variant/50 shadow-sm">
                <div className="flex items-start gap-4 text-on-surface">
                  <span className="material-symbols-outlined text-on-surface-variant mt-0.5 text-[20px]">mail</span>
                  <div>
                    <div className="font-semibold text-[13px] tracking-wide mb-0.5 text-on-surface uppercase">System Emails</div>
                    <div className="text-[11px] font-medium text-on-surface-variant">Route updates to {formData.email}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setNotiSettings({ ...notiSettings, email: !notiSettings.email })}
                  className={`w-12 h-6 rounded-full border transition-colors relative shadow-inner ${notiSettings.email ? 'bg-primary border-primary' : 'bg-surface border-outline-variant'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all shadow-sm ${notiSettings.email ? 'bg-white right-0.5' : 'bg-outline-variant left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-5 bg-surface rounded-2xl border border-outline-variant/50 shadow-sm">
                <div className="flex items-start gap-4 text-on-surface">
                  <span className="material-symbols-outlined text-on-surface-variant mt-0.5 text-[20px]">smartphone</span>
                  <div>
                    <div className="font-semibold text-[13px] tracking-wide mb-0.5 text-on-surface uppercase">WebSocket Telemetry</div>
                    <div className="text-[11px] font-medium text-on-surface-variant">Real-time application alerts</div>
                  </div>
                </div>
                <button 
                  onClick={() => setNotiSettings({ ...notiSettings, inApp: !notiSettings.inApp })}
                  className={`w-12 h-6 rounded-full border transition-colors relative shadow-inner ${notiSettings.inApp ? 'bg-primary border-primary' : 'bg-surface border-outline-variant'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all shadow-sm ${notiSettings.inApp ? 'bg-white right-0.5' : 'bg-outline-variant left-0.5'}`} />
                </button>
              </div>

              <div className="p-5 bg-surface rounded-2xl border border-outline-variant/50 shadow-sm">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest block mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">schedule</span> Pre-emptive Warning Interval
                </label>
                <div className="flex items-center gap-5">
                  <input 
                    type="range" 
                    min="5" 
                    max="120" 
                    step="5"
                    className="flex-1 h-2 bg-surface-container-low rounded-full appearance-none cursor-pointer accent-primary"
                    value={notiSettings.reminderAdvanceMinutes}
                    onChange={(e) => setNotiSettings({ ...notiSettings, reminderAdvanceMinutes: parseInt(e.target.value) })}
                  />
                  <div className="w-20 text-center font-bold text-[13px] uppercase tracking-wider text-on-surface bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/60 shadow-sm">
                    {notiSettings.reminderAdvanceMinutes} m
                  </div>
                </div>
              </div>

              <button 
                onClick={handleUpdateNoti}
                className="flex items-center justify-center gap-2 px-5 py-2.5 border border-outline-variant/60 text-[13px] text-on-surface bg-surface hover:bg-surface-container font-semibold rounded-xl transition-colors shadow-sm w-full mt-2"
              >
                Synchronize Configuration
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-3xl bg-surface-container-low border border-outline-variant/60 shadow-sm">
            <h3 className="text-2xl font-bold tracking-tight text-on-surface mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
              Operator Identity
            </h3>
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Full Designation</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/60 rounded-xl text-[13px] font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Communication Vector</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant/60 rounded-xl text-[13px] font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Avatar URL Target</label>
                <input 
                  type="text" 
                  placeholder="https://content-server.io/avatar.png"
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant/60 rounded-xl text-[13px] font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm placeholder:text-outline-variant"
                  value={formData.profilePhoto}
                  onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                />
              </div>
              <button 
                type="submit" 
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-[13px] font-semibold rounded-xl transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.1)_inset] hover:bg-accent-hover w-full sm:w-auto mt-2"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                Commit Updates
              </button>
            </form>
          </div>

          <div className="p-6 md:p-8 rounded-3xl bg-error-container/20 border border-error/30 shadow-sm">
            <h3 className="text-2xl font-bold tracking-tight text-error mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-error">warning</span>
              Destructive Operations
            </h3>
            
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 pb-6 border-b border-error/20">
                <div>
                  <h4 className="text-[13px] font-semibold text-on-error-container uppercase tracking-wide mb-1">Suspend Network Access</h4>
                  <p className="text-[12px] font-medium text-on-error-container/70 max-w-sm leading-relaxed">Requires command approval. Authentication will be blocked during suspension.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                  <div className="relative">
                     <select 
                       className="w-full sm:w-auto px-4 py-2.5 bg-surface border border-error/30 rounded-xl text-[13px] font-semibold tracking-wide text-error focus:outline-none focus:border-error shadow-sm appearance-none pr-10"
                       value={deactiveDays}
                       onChange={(e) => setDeactiveDays(parseInt(e.target.value))}
                     >
                       {[7, 15, 30, 90].map(d => <option key={d} value={d}>{d} Days</option>)}
                     </select>
                     <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-error pointer-events-none text-[18px]">expand_more</span>
                  </div>
                  <button 
                    onClick={handleDeactivate}
                    className="flex items-center justify-center px-4 py-2.5 border border-error/30 text-error text-[13px] font-semibold rounded-xl hover:bg-error/10 transition-colors shadow-sm"
                  >
                    Submit Request
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <h4 className="text-[13px] font-semibold text-on-error-container uppercase tracking-wide mb-1">Wipe All Data</h4>
                  <p className="text-[12px] font-medium text-on-error-container/70 max-w-sm leading-relaxed">Irreversible deletion of all user records, analytics, and settings.</p>
                </div>
                <button 
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-error text-white text-[13px] font-semibold rounded-xl hover:bg-error/90 transition-colors shadow-sm w-full md:w-auto"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Eradicate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
