import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { startRegistration } from '@simplewebauthn/browser';

export default function Register() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [useBiometrics, setUseBiometrics] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setQrCode(data.qrCode);
        if (useBiometrics) {
          setTimeout(() => {
            handleBiometricRegister();
          }, 500);
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('System Error: Provisioning failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricRegister = async () => {
    setRegLoading(true);
    setError('');
    try {
      const resOptions = await fetch('/api/auth/biometric/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const options = await resOptions.json();
      if (!resOptions.ok) throw new Error(options.error || 'Failed to fetch options');

      const attResp = await startRegistration({ optionsJSON: options });

      const resVerify = await fetch('/api/auth/biometric/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, body: attResp }),
      });
      const verifyData = await resVerify.json();

      if (verifyData.verified) {
        setBiometricEnabled(true);
      } else {
        throw new Error('Biometric verification failed');
      }
    } catch (err: any) {
      console.error(err);
      setError(`Auth Exception: ${err.message}`);
    } finally {
      setRegLoading(false);
    }
  };

  if (qrCode) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center p-6 selection:bg-primary-container selection:text-on-primary-container font-sans text-on-background">
        <div className="fixed top-6 left-6 z-50">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">eco</span>
            <span className="font-semibold text-sm tracking-tight text-on-surface-variant group-hover:text-on-surface transition-colors">Back to site</span>
          </Link>
        </div>
        
        <div className="w-full max-w-4xl relative z-10">
          <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface border border-outline-variant/50 rounded-3xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row gap-12 text-center md:text-left">
            <div className="flex-1 flex flex-col items-center md:items-start">
              <h2 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">Recovery Key</h2>
              <p className="text-[15px] text-on-surface-variant mb-8 leading-relaxed">Save your matrix QR for backup access.</p>
              <div className="bg-surface-container p-4 rounded-3xl border border-outline-variant/30 mb-8 mx-auto md:mx-0 shadow-sm flex items-center justify-center">
                 <img src={qrCode} alt="Access QR" className="w-[180px] h-[180px] mix-blend-darken" />
              </div>
              <a href={qrCode} download="OPERATOR_KEY.png" className="w-full py-3.5 text-sm font-semibold text-on-surface border border-outline-variant rounded-xl transition-all hover:bg-surface-container shadow-sm flex items-center justify-center gap-2">
                 <span className="material-symbols-outlined text-[18px]">download</span> Save Matrix
              </a>
            </div>
            
            <div className="w-px bg-outline-variant/50 hidden md:block" />
            <hr className="border-outline-variant/50 md:hidden w-full" />

            <div className="flex-1 flex flex-col items-center md:items-start justify-center">
              <h2 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">Hardware Passkey</h2>
              <p className="text-[15px] text-on-surface-variant mb-8 leading-relaxed">Bind system identity to your local device for seamless access.</p>
              
              <div className="w-16 h-16 bg-surface-container border border-outline-variant/50 flex items-center justify-center mb-8 rounded-2xl shadow-sm">
                <span className={`material-symbols-outlined text-[28px] ${biometricEnabled ? 'text-primary' : 'text-on-surface-variant'}`}>fingerprint</span>
              </div>

              {!biometricEnabled ? (
                <button 
                  onClick={handleBiometricRegister} disabled={regLoading}
                  className="w-full py-3.5 text-sm font-semibold bg-surface-container-low text-on-surface border border-outline-variant rounded-xl transition-all hover:bg-surface border-outline shadow-sm flex items-center justify-center gap-2"
                >
                  {regLoading ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : 'Register Passkey'}
                </button>
              ) : (
                <div className="w-full bg-primary-container border border-primary/20 text-on-primary-container p-3.5 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">lock</span> Hardware Locked
                </div>
              )}

              <button onClick={() => navigate('/login')} className="w-full py-3.5 text-sm font-semibold bg-primary text-on-primary rounded-xl transition-all hover:bg-accent-hover mt-6 shadow-md flex items-center justify-center gap-2">
                 Enter Workspace <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 selection:bg-primary-container selection:text-on-primary-container font-sans text-on-background">
      <div className="fixed top-6 left-6 z-50">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">eco</span>
          <span className="font-semibold text-sm tracking-tight text-on-surface-variant group-hover:text-on-surface transition-colors">Back to site</span>
        </Link>
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-surface border border-outline-variant/50 rounded-3xl p-8 md:p-10 shadow-xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">Create Account</h2>
            <div className="text-[15px] text-on-surface-variant">Deploy a new workspace identity.</div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-error-container border border-error/20 rounded-xl text-error text-sm font-medium flex items-start gap-3 shadow-sm overflow-hidden"
              >
                 <span className="material-symbols-outlined text-[18px] text-error shrink-0 mt-0.5">error</span>
                 <div>{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-2">Full Name</label>
              <div className="relative">
                <input 
                  type="text" required className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-sm font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm placeholder:text-outline-variant" placeholder="John Doe"
                  value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-2">Work Email</label>
              <div className="relative">
                <input 
                  type="email" required className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-sm font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm placeholder:text-outline-variant" placeholder="name@company.com"
                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-2">Password</label>
              <div className="relative">
                <input 
                  type="password" required className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-sm font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm placeholder:text-outline-variant font-mono tracking-widest" placeholder="••••••••"
                  value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/50">
               <label className="flex items-center gap-3 cursor-pointer group">
                 <div className={`relative w-5 h-5 rounded border bg-surface flex items-center justify-center transition-all ${useBiometrics ? 'border-primary bg-primary' : 'border-outline-variant group-hover:border-primary'}`}>
                   {useBiometrics && <span className="material-symbols-outlined text-[14px] text-on-primary">check</span>}
                   <input 
                     type="checkbox" className="sr-only"
                     checked={useBiometrics}
                     onChange={(e) => setUseBiometrics(e.target.checked)}
                   />
                 </div>
                 <div className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">Setup Passkey right after</div>
               </label>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary text-on-primary font-semibold rounded-xl transition-all hover:bg-accent-hover mt-4 shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-outline-variant/50 text-center">
             <div className="text-sm text-on-surface-variant">
               Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline border-b-transparent hover:border-primary ml-1 transition-all">Log in</Link>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
