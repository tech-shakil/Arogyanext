import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function TVDisplay({ hospitalId }) {
  const [appointments, setAppointments] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastAnnounced, setLastAnnounced] = useState(null);
  const announcedTokens = useRef(new Set());

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Hospital Queue
  useEffect(() => {
    if (!hospitalId) return;

    const q = query(
      collection(db, 'appointments'),
      where("hospitalId", "==", hospitalId),
      where("status", "in", ["Waiting", "In Consultation"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeAppts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      activeAppts.sort((a, b) => a.tokenInt - b.tokenInt);
      setAppointments(activeAppts);

      // Trigger Voice Announcement
      activeAppts.forEach(appt => {
        if (appt.status === "In Consultation" && !announcedTokens.current.has(appt.id)) {
          announceToken(appt.tokenNumber, appt.doctorName, appt.patientName);
          announcedTokens.current.add(appt.id);
        }
      });
    });

    return () => unsubscribe();
  }, [hospitalId]);

  // TTS Engine with Visual Toast
  const announceToken = (token, doctor, patientName) => {
    setLastAnnounced({ token, doctor, patientName, timestamp: Date.now() });

    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = `Token number ${token.replace('-', ' ')}, please proceed to ${doctor}'s cabin.`;
      msg.rate = 0.85; 
      msg.pitch = 1;
      window.speechSynthesis.speak(msg);
    }

    // Auto-dismiss the visual announcement banner after 7 seconds
    setTimeout(() => {
      setLastAnnounced((prev) => (prev && prev.token === token ? null : prev));
    }, 7000);
  };

  // Group by Doctor
  const groupedByDoctor = appointments.reduce((acc, appt) => {
    if (!acc[appt.doctorName]) {
      acc[appt.doctorName] = { active: null, waiting: [] };
    }
    if (appt.status === "In Consultation") {
      acc[appt.doctorName].active = appt;
    } else {
      acc[appt.doctorName].waiting.push(appt);
    }
    return acc;
  }, {});

  const hours = currentTime.toLocaleTimeString([], { hour: '2-digit', hour12: true }).split(' ')[0];
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const ampm = currentTime.toLocaleTimeString([], { hour: '2-digit' }).slice(-2);
  const colonVisible = currentTime.getSeconds() % 2 === 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-transparent relative overflow-hidden">
      
      {/* --- LIVE CALLING ANNOUNCEMENT BANNER (Animated Toast) --- */}
      {lastAnnounced && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-xl animate-call-attention">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 p-[2px] rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.5)]">
            <div className="bg-slate-950/95 backdrop-blur-md px-6 py-4 rounded-[14px] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl animate-bounce">📢</span>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-emerald-400">Calling Now</p>
                  <p className="text-lg font-black text-white">
                    Token <span className="text-emerald-400 text-xl font-mono">{lastAnnounced.token}</span> → {lastAnnounced.doctor}
                  </p>
                </div>
              </div>
              
              {/* Soundwave animation bars */}
              <div className="flex items-end space-x-1 h-6 px-2">
                <span className="w-1 bg-emerald-400 rounded-full animate-sound-1"></span>
                <span className="w-1 bg-emerald-400 rounded-full animate-sound-2"></span>
                <span className="w-1 bg-emerald-400 rounded-full animate-sound-3"></span>
                <span className="w-1 bg-emerald-400 rounded-full animate-sound-4"></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 sm:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xl z-10">
        <div className="flex items-center">
          <div className="w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600/30 to-purple-600/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mr-3 sm:mr-4 border border-blue-500/40 shadow-inner">
            🏥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-black tracking-wider text-white">Live Patient Queue</h1>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-blue-400 font-bold tracking-widest uppercase text-[9px] sm:text-xs mt-0.5 sm:mt-1 flex items-center gap-1.5">
              <span>Facility: {hospitalId}</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">LIVE DISPLAY</span>
            </p>
          </div>
        </div>

        {/* Digital Clock with Blinking Colon */}
        <div className="text-left sm:text-right">
          <p className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            {hours}
            <span className={`transition-opacity duration-200 ${colonVisible ? 'opacity-100 text-blue-400' : 'opacity-20 text-slate-600'}`}>:</span>
            {minutes}
            <span className="text-xs sm:text-sm font-sans font-bold text-slate-400 ml-1.5 uppercase">{ampm}</span>
          </p>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] sm:text-xs mt-0.5 sm:mt-1">
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="flex-1 p-3 sm:p-6 md:p-8 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        {Object.keys(groupedByDoctor).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center">
            <span className="text-6xl sm:text-8xl mb-4 block animate-float">☕</span>
            <h2 className="text-2xl sm:text-3xl font-bold">Waiting Room is Empty</h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-lg font-medium">No active patient queues at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-8">
            {Object.entries(groupedByDoctor).map(([docName, data]) => (
              <div 
                key={docName} 
                className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col relative transition-all hover:border-slate-700"
              >
                
                {/* Doctor Cabin Header */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/10 text-blue-400 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mr-3 sm:mr-5 shadow-inner flex-shrink-0 border border-blue-500/20">
                      👨‍⚕️
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white">{docName}</h2>
                      <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px] sm:text-xs mt-0.5">Attending Physician</p>
                    </div>
                  </div>
                  
                  <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Cabin Open
                  </span>
                </div>

                <div className="p-4 sm:p-6 md:p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  
                  {/* LEFT: Currently Serving (Neon Animated Card) */}
                  <div className={`flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border p-4 sm:p-6 relative overflow-hidden transition-all min-h-[180px] sm:min-h-[220px] ${
                    data.active 
                      ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-emerald-500/60 animate-neon-pulse' 
                      : 'bg-slate-950/60 border-slate-800'
                  }`}>
                    
                    {/* Ambient Glow */}
                    {data.active && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/20 blur-[50px] rounded-full pointer-events-none"></div>
                    )}
                    
                    <div className="flex items-center gap-2 mb-2 sm:mb-4">
                      {data.active && (
                        <div className="flex items-end space-x-0.5 h-3.5">
                          <span className="w-0.5 bg-emerald-400 rounded-full animate-sound-1"></span>
                          <span className="w-0.5 bg-emerald-400 rounded-full animate-sound-2"></span>
                          <span className="w-0.5 bg-emerald-400 rounded-full animate-sound-3"></span>
                        </div>
                      )}
                      <h3 className="text-emerald-400 font-black uppercase tracking-widest text-[11px] sm:text-xs">
                        {data.active ? 'Now Serving' : 'Awaiting Patient'}
                      </h3>
                    </div>

                    {data.active ? (
                      <>
                        <div className="text-5xl sm:text-7xl lg:text-8xl font-black font-mono text-emerald-400 mb-2 sm:mb-4 drop-shadow-[0_0_25px_rgba(16,185,129,0.6)] animate-call-attention">
                          {data.active.tokenNumber}
                        </div>
                        <div className="text-base sm:text-xl font-bold text-white max-w-full truncate px-4 py-1.5 sm:py-2 rounded-xl bg-slate-900/90 border border-emerald-500/30 shadow-lg text-center">
                          {data.active.patientName}
                        </div>
                      </>
                    ) : (
                      <div className="text-4xl sm:text-6xl font-black font-mono text-slate-700">--</div>
                    )}
                  </div>

                  {/* RIGHT: Next in Line */}
                  <div className="flex flex-col bg-slate-950/60 rounded-2xl sm:rounded-3xl border border-slate-800 p-4 sm:p-6">
                    <h3 className="text-slate-400 font-black uppercase tracking-widest mb-3 sm:mb-4 border-b border-slate-800/80 pb-2 sm:pb-3 text-xs sm:text-sm flex items-center justify-between">
                      <span className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                        Next in Line
                      </span>
                      <span className="text-[10px] text-blue-400 font-mono">
                        {data.waiting.length} in queue
                      </span>
                    </h3>

                    <div className="flex-1 space-y-2 sm:space-y-2.5 overflow-hidden">
                      {data.waiting.length === 0 ? (
                        <div className="h-full flex items-center justify-center py-6">
                          <p className="text-slate-600 font-bold text-xs sm:text-sm italic">Queue is clear.</p>
                        </div>
                      ) : (
                        data.waiting.slice(0, 4).map((waiter, idx) => (
                          <div 
                            key={waiter.id} 
                            className="flex justify-between items-center bg-slate-900/90 p-2.5 sm:p-3 rounded-xl border border-slate-800/80 transition-transform hover:translate-x-1"
                          >
                            <div className="flex items-center gap-2 truncate max-w-[65%]">
                              <span className="text-[10px] text-slate-500 font-mono font-bold w-4">{idx + 1}.</span>
                              <span className="font-bold text-slate-200 text-xs sm:text-sm truncate">{waiter.patientName}</span>
                            </div>
                            <span className="font-black font-mono text-blue-400 text-xs sm:text-base bg-blue-500/10 px-2 sm:px-2.5 py-0.5 rounded-lg border border-blue-500/20">
                              {waiter.tokenNumber}
                            </span>
                          </div>
                        ))
                      )}

                      {data.waiting.length > 4 && (
                        <div className="text-center text-slate-500 text-xs font-bold pt-2 border-t border-slate-800/50">
                          + {data.waiting.length - 4} more patients waiting
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- LIVE MARQUEE BROADCAST TICKER --- */}
      <div className="bg-slate-900 border-t border-slate-800 py-2.5 px-4 overflow-hidden relative z-20 flex items-center shadow-2xl">
        <div className="flex items-center bg-blue-600 text-white font-black text-[10px] sm:text-xs uppercase px-2.5 py-1 rounded-md tracking-wider mr-3 flex-shrink-0 shadow-sm">
          <span>NOTICE</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="animate-marquee font-medium text-xs sm:text-sm text-slate-300 space-x-12">
            <span>📢 Welcome to ArogyaNext Smart Health System</span>
            <span>•</span>
            <span>Tokens are called aloud with digital voice announcements</span>
            <span>•</span>
            <span>Please proceed directly to the doctor's cabin when your token is called</span>
            <span>•</span>
            <span>Emergency and urgent care cases are prioritized automatically</span>
            <span>•</span>
            <span>Thank you for your patience and cooperation</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-600 font-medium">
        <span>© ArogyaNext AI Operating System</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Audio Sync: Active
        </span>
      </div>

    </div>
  );
}