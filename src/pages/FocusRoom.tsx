import React, { useState, useEffect } from 'react';
import { useSocket } from '../SocketContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function FocusRoom() {
  const { socket, isConnected } = useSocket();
  const [roomId, setRoomId] = useState('global');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [participants, setParticipants] = useState(1);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join_focus_room', roomId);

    const handleUserJoined = () => {
      setParticipants((p) => p + 1);
      toast.success('Someone joined the focus room!');
    };

    const handleSync = (data: any) => {
      if (data.action === 'START_TIMER') {
        setIsRunning(true);
        setTimeLeft(data.payload.timeLeft);
      } else if (data.action === 'PAUSE_TIMER') {
        setIsRunning(false);
        setTimeLeft(data.payload.timeLeft);
      } else if (data.action === 'RESET_TIMER') {
        setIsRunning(false);
        setTimeLeft(data.payload.timeLeft);
      }
    };

    socket.on('user_joined_focus', handleUserJoined);
    socket.on('focus_action_received', handleSync);

    return () => {
      socket.off('user_joined_focus', handleUserJoined);
      socket.off('focus_action_received', handleSync);
    };
  }, [socket, roomId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
         setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0) {
      setIsRunning(false);
      toast.info('Focus session complete!');
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => {
    const action = isRunning ? 'PAUSE_TIMER' : 'START_TIMER';
    setIsRunning(!isRunning);
    if (socket) {
      socket.emit('focus_sync_action', { roomId, action, payload: { timeLeft } });
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
    if (socket) {
      socket.emit('focus_sync_action', { roomId, action: 'RESET_TIMER', payload: { timeLeft: 25 * 60 } });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-background max-w-5xl mx-auto w-full min-h-[80vh] flex flex-col items-center justify-center font-sans">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-2">Live Focus Room</h1>
        <p className="text-[15px] text-on-surface-variant font-medium">Study with others in real-time. {isConnected ? <span className="text-primary font-semibold">● Connected</span> : <span className="text-error font-semibold">● Offline</span>}</p>
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant/60 text-on-surface rounded-full text-[13px] font-semibold shadow-sm">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">group</span>
          {participants} {participants === 1 ? 'Person' : 'People'} Studying
        </div>
      </motion.div>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface border border-outline-variant/60 w-full max-w-sm rounded-[3rem] aspect-square flex flex-col items-center justify-center shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 border-[6px] border-surface-container-low rounded-[3rem] m-2 pointer-events-none"></div>
        <div 
           className="absolute inset-0 border-[6px] border-primary rounded-[3rem] m-2 transition-all duration-1000 ease-linear opacity-20 pointer-events-none" 
           style={{ clipPath: 'none'} as any}
        ></div>
        
        <div className="relative z-10 flex flex-col items-center">
           <span className="text-7xl md:text-8xl font-mono font-bold text-on-surface tracking-tighter mb-6">{formatTime(timeLeft)}</span>
           <div className="flex gap-3">
              <button onClick={toggleTimer} className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.1)_inset] hover:bg-accent-hover transition-all active:scale-95">
                 <span className="material-symbols-outlined text-[28px]">{isRunning ? 'pause' : 'play_arrow'}</span>
              </button>
              <button onClick={resetTimer} className="w-14 h-14 rounded-2xl bg-surface-container-low text-on-surface border border-outline-variant/60 flex items-center justify-center shadow-sm hover:bg-surface-container transition-all active:scale-95">
                 <span className="material-symbols-outlined text-[24px] text-on-surface-variant">refresh</span>
              </button>
           </div>
        </div>
      </motion.div>

      <div className="mt-12 w-full max-w-sm bg-surface/50 border border-outline-variant/50 rounded-2xl p-6 text-center">
         <h3 className="text-[13px] font-bold uppercase tracking-widest text-on-surface mb-2">Room: {roomId}</h3>
         <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">Any changes you make to the timer will be synchronized with everyone else in this room over WebSockets.</p>
      </div>
    </div>
  );
}
