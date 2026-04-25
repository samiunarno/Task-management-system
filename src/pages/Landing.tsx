import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { title: 'Cognitive Organization', desc: 'Structure your learning materials using intuitive, organic mental models.', icon: 'neurology', id: 'STUDY_01' },
    { title: 'Progress Tracking', desc: 'Visualize your academic journey with clear, insightful progression charts.', icon: 'monitoring', id: 'TRACK_02' },
    { title: 'Dynamic Schedules', desc: 'Seamlessly adapt your routines to your energy levels and cognitive peak times.', icon: 'bolt', id: 'SYNC_03' },
    { title: 'Secure Vault', desc: 'Ensure your private research and notes are stored securely and locally.', icon: 'lock', id: 'SEC_04' },
  ];

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary-container selection:text-on-primary-container font-sans text-on-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">eco</span>
            <span className="font-bold text-xl tracking-tight text-on-surface">Joyce Study</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors tracking-wide">Features</a>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-on-surface hover:text-primary transition-colors tracking-wide">Log in</Link>
              <Link to="/register" className="text-sm font-semibold bg-primary text-on-primary px-5 py-2.5 rounded-full hover:bg-primary/90 transition-transform active:scale-95 shadow-sm">Get Started</Link>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 -mr-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors flex items-center justify-center transform active:scale-95 cursor-pointer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile Nav Drops */}
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden absolute top-20 left-0 right-0 bg-surface border-b border-outline-variant/50 px-6 py-6 flex flex-col gap-6 shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-on-surface-variant hover:text-primary transition-colors">Features</a>
            <hr className="border-outline-variant/50" />
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-on-surface hover:text-primary transition-colors">Log in</Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold bg-primary text-on-primary text-center px-4 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-sm">Get Started for free</Link>
          </motion.div>
        )}
      </nav>

      <main className="pt-20">
        {/* Split Hero */}
        <div className="min-h-[85vh] grid md:grid-cols-2 relative">
          {/* Left Hero Pane */}
          <div className="flex flex-col justify-center px-6 lg:px-16 xl:px-24 py-16 md:py-24 max-w-3xl mx-auto md:max-w-none w-full">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container text-on-surface rounded-full text-xs font-semibold mb-8 border border-primary-container shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                V 4.0 Operational
              </div>
              <h1 className="text-[3.5rem] md:text-[5rem] lg:text-[6rem] font-bold leading-[0.95] tracking-tight mb-8 text-on-background">
                Focus,<br/> Mastered.
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant max-w-md lg:max-w-lg mb-12 leading-relaxed">
                A professional environment engineered for deep work and structured learning. Manage tasks, synchronize your routine, and minimize cognitive friction.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link to="/register" className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-on-primary font-semibold rounded-xl transition-all hover:bg-accent-hover shadow-lg hover:shadow-xl w-full sm:w-auto text-base">
                  Start Your Journey <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                <Link to="/login" className="flex items-center justify-center gap-2 px-8 py-4 bg-surface text-on-surface font-semibold border border-outline-variant rounded-xl transition-all hover:bg-surface-variant hover:border-outline shadow-sm w-full sm:w-auto text-base">
                  Log In Workspace
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right Hero Pane (Visual) */}
          <div className="hidden md:flex bg-surface-container relative items-center justify-center p-12 lg:p-24 overflow-hidden border-l border-outline-variant/50">
            {/* SaaS Visual abstraction */}
            <motion.div 
               initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.9 }} 
               animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }} 
               transition={{ duration: 0.8, delay: 0.2 }}
               className="w-full max-w-lg aspect-square relative"
            >
               {/* Floating elements */}
               <div className="absolute top-10 left-0 bg-surface border border-outline-variant rounded-2xl p-6 shadow-xl w-64 transform -rotate-3 z-20">
                  <div className="w-10 h-10 rounded-full bg-primary-container mb-4 flex items-center justify-center"><span className="material-symbols-outlined text-primary">check</span></div>
                  <div className="h-2 w-3/4 bg-surface-variant rounded-full mb-2"></div>
                  <div className="h-2 w-1/2 bg-surface-variant rounded-full"></div>
               </div>
               
               <div className="absolute bottom-10 right-0 bg-primary text-on-primary rounded-2xl p-6 shadow-xl w-72 transform rotate-2 z-20 flex items-center gap-4">
                  <div className="w-12 h-12 bg-on-primary/20 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-on-primary">hourglass_bottom</span></div>
                  <div>
                    <div className="text-sm font-semibold opacity-80 uppercase tracking-widest">Deep Work</div>
                    <div className="text-2xl font-bold tracking-tight">45:00</div>
                  </div>
               </div>

               {/* Background abstract shape */}
               <div className="absolute inset-4 rounded-[3rem] border border-outline-variant bg-surface shadow-2xl flex flex-col p-6 overflow-hidden">
                  <div className="flex justify-between items-center border-b border-outline-variant pb-4">
                    <div className="flex gap-1"><div className="w-3 h-3 rounded-full bg-outline-variant"></div><div className="w-3 h-3 rounded-full bg-outline-variant"></div><div className="w-3 h-3 rounded-full bg-outline-variant"></div></div>
                  </div>
                  <div className="pt-6 flex-1 flex flex-col gap-4">
                     <div className="h-32 bg-surface-container rounded-xl w-full"></div>
                     <div className="flex gap-4">
                        <div className="h-24 max-w-xs bg-surface-variant rounded-xl w-2/3"></div>
                        <div className="h-24 flex-1 bg-surface-variant rounded-xl w-1/3"></div>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        </div>

        {/* Feature Grid */}
        <section id="features" className="py-24 lg:py-32 px-6 lg:px-12 max-w-7xl mx-auto border-t border-outline-variant/30">
          <div className="max-w-xl mb-16 md:mb-24">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">Features</h2>
            <h3 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-on-surface">Equipped for uncompromising performance.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 md:gap-y-16">
            {features.map((feat, idx) => (
              <div key={idx} className="group relative">
                <div className="mb-6 w-14 h-14 bg-surface border border-outline-variant rounded-2xl flex items-center justify-center text-on-surface shadow-sm group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                   <span className="material-symbols-outlined">{feat.icon}</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{feat.id}</div>
                <h4 className="text-2xl font-semibold mb-3 text-on-surface tracking-tight">{feat.title}</h4>
                <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Metrics Bar */}
        <div className="border-y border-outline-variant/50 bg-surface">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 lg:grid-cols-4 divide-x divide-outline-variant/50">
            {[
              { label: 'Uptime', value: '99.9%' },
              { label: 'Sessions', value: '10K+' },
              { label: 'Security', value: 'AES-256' },
              { label: 'Latency', value: '<50ms' },
            ].map((stat, i) => (
              <div key={i} className="py-12 px-6 flex flex-col justify-center">
                <div className="text-[2.5rem] md:text-5xl font-bold text-on-surface mb-1 tracking-tight">{stat.value}</div>
                <div className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 bg-surface-container">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline">eco</span>
              <span className="font-semibold text-lg text-on-surface-variant tracking-tight">Joyce Study</span>
            </div>
            <div className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              © 2026 Joyce Platform. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

