import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { startAuthentication } from '@simplewebauthn/browser';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [method, setMethod] = useState<'password' | 'biometric'>('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(setCredentials({ user: data.user, token: data.token }));
        navigate('/');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('System Error: Connection refused.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const emailPrompt = prompt('Provide system identifier (email) for hardware link:');
      if (!emailPrompt) {
        setLoading(false);
        return;
      }
      
      const resOptions = await fetch('/api/auth/biometric/login-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailPrompt }),
      });
      const options = await resOptions.json();
      if (!resOptions.ok) throw new Error(options.error);

      const asseResp = await startAuthentication({ optionsJSON: options });

      const resVerify = await fetch('/api/auth/biometric/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailPrompt, body: asseResp }),
      });

      const verifyData = await resVerify.json();
      if (resVerify.ok && verifyData.user) {
        dispatch(setCredentials({ user: verifyData.user, token: verifyData.token }));
        navigate('/');
      } else {
        throw new Error(verifyData.error || 'Verification failed');
      }
    } catch (err: any) {
      console.error(err);
      setError(`Auth Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 selection:bg-primary-container selection:text-on-primary-container font-sans text-on-background">
      <div className="fixed top-6 left-6 z-50">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">eco</span>
          <span className="font-semibold text-sm tracking-tight text-on-surface-variant group-hover:text-on-surface transition-colors">Back to site</span>
        </Link>
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-surface border border-outline-variant/50 rounded-3xl p-8 md:p-10 shadow-xl"
        >
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">Welcome back</h2>
            <div className="text-[15px] text-on-surface-variant">Log in to your workspace.</div>
          </div>

          <div className="flex bg-surface-container border border-outline-variant/30 p-1 mb-8 rounded-xl shadow-sm max-w-xs mx-auto">
            <button 
              onClick={() => { setMethod('password'); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold tracking-wider rounded-lg transition-all ${method === 'password' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Standard
            </button>
            <button 
              onClick={() => { setMethod('biometric'); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold tracking-wider rounded-lg transition-all ${method === 'biometric' ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Passkey
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-error-container border border-error/20 rounded-xl text-error text-sm font-medium flex items-start gap-3 shadow-sm overflow-hidden"
              >
                 <span className="material-symbols-outlined text-[18px] text-error shrink-0 mt-0.5">error</span>
                 <div>{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {method === 'password' && (
            <motion.form 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={handlePasswordLogin} 
              className="space-y-5"
            >
              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-2">Work Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required 
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-sm font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm placeholder:text-outline-variant"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-2">Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    required 
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-sm font-medium text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm placeholder:text-outline-variant tracking-widest"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-primary text-on-primary font-semibold rounded-xl transition-all hover:bg-accent-hover mt-4 shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : 'Continue with Email'}
              </button>
            </motion.form>
          )}

          {method === 'biometric' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-6 text-center"
            >
              <div className="w-16 h-16 bg-surface-container border border-outline-variant/50 rounded-2xl flex items-center justify-center text-on-surface mb-6 shadow-sm">
                <span className="material-symbols-outlined text-[28px]">fingerprint</span>
              </div>
              <p className="text-sm text-on-surface-variant mb-8 max-w-[280px] leading-relaxed">
                Use your device's biometric sensor or passkey for faster, secure access without a password.
              </p>
              <button 
                onClick={handleBiometricLogin}
                disabled={loading}
                className="w-full py-3.5 bg-surface font-semibold border border-outline-variant text-on-surface rounded-xl transition-all hover:bg-surface-container shadow-sm flex justify-center items-center gap-2"
              >
                {loading ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : 'Use Passkey'}
              </button>
            </motion.div>
          )}

          <div className="mt-8 pt-6 border-t border-outline-variant/50 text-center">
             <div className="text-sm text-on-surface-variant">
               New to Joyce Study? <Link to="/register" className="text-primary font-semibold hover:underline border-b-transparent hover:border-primary ml-1 transition-all">Create an account</Link>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
