import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function TVDisplay({ hospitalId }) {
  const [appointments, setAppointments] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
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
          announceToken(appt.tokenNumber, appt.doctorName);
          announcedTokens.current.add(appt.id);
        }
      });
    });

    return () => unsubscribe();
  }, [hospitalId]);

  // TTS Engine
  const announceToken = (token, doctor) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = `Token number ${token.replace('-', ' ')}, please proceed to ${doctor}'s cabin.`;
      msg.rate = 0.85; 
      msg.pitch = 1;
      window.speechSynthesis.speak(msg);
    }
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

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col overflow-hidden selection:bg-transparent">
      
      {/* HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 px-8 py-6 flex justify-between items-center shadow-xl z-10">
        <div className="flex items-center">
          <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center text-3xl mr-4 border border-blue-500/30">
            🏥
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-wider text-white">Live Patient Queue</h1>
            <p className="text-blue-400 font-bold tracking-widest uppercase text-xs mt-1">Facility: {hospitalId}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="flex-1 p-8 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        {Object.keys(groupedByDoctor).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <span className="text-8xl mb-6 block animate-pulse">☕</span>
            <h2 className="text-3xl font-bold">Waiting Room is Empty</h2>
            <p className="text-slate-500 mt-2 text-xl font-medium">No active consultations at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {Object.entries(groupedByDoctor).map(([docName, data]) => (
              <div key={docName} className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col relative">
                
                {/* Doctor Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 border-b border-slate-700/50 flex items-center">
                  <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center text-3xl mr-5 shadow-inner">
                    👨‍⚕️
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">{docName}</h2>
                    <p className="text-slate-400 font-bold tracking-widest uppercase text-xs mt-1">Attending Physician</p>
                  </div>
                </div>

                <div className="p-8 flex-1 grid grid-cols-2 gap-8">
                  {/* LEFT: Currently Serving */}
                  <div className="flex flex-col items-center justify-center bg-slate-950/50 rounded-3xl border border-slate-800 p-6 relative overflow-hidden group">
                    {data.active && (
                      <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none"></div>
                    )}
                    <h3 className="text-slate-500 font-black uppercase tracking-widest mb-6 text-sm">Now Serving</h3>
                    {data.active ? (
                      <>
                        <div className="text-8xl font-black text-emerald-400 mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                          {data.active.tokenNumber}
                        </div>
                        <div className="text-2xl font-bold text-white max-w-full truncate px-4 bg-slate-900 py-2 rounded-xl border border-slate-800">
                          {data.active.patientName}
                        </div>
                      </>
                    ) : (
                      <div className="text-6xl font-black text-slate-800">--</div>
                    )}
                  </div>

                  {/* RIGHT: Next in Line */}
                  <div className="flex flex-col bg-slate-950/50 rounded-3xl border border-slate-800 p-6">
                    <h3 className="text-slate-500 font-black uppercase tracking-widest mb-6 border-b border-slate-800/50 pb-4 text-sm flex items-center">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
                      Next in Line
                    </h3>
                    <div className="flex-1 overflow-hidden space-y-3">
                      {data.waiting.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-slate-600 font-bold text-lg italic">Queue is clear.</p>
                        </div>
                      ) : (
                        data.waiting.slice(0, 4).map((waiter) => (
                          <div key={waiter.id} className="flex justify-between items-center bg-slate-900/80 p-4 rounded-2xl border border-slate-800/50">
                            <span className="font-bold text-slate-300 truncate max-w-[60%] text-lg">{waiter.patientName}</span>
                            <span className="font-black text-blue-400 text-xl bg-blue-500/10 px-3 py-1 rounded-lg">{waiter.tokenNumber}</span>
                          </div>
                        ))
                      )}
                      {data.waiting.length > 4 && (
                        <div className="text-center text-slate-500 text-sm font-bold pt-4 border-t border-slate-800/50 mt-2">
                          + {data.waiting.length - 4} more waiting
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

      {/* FOOTER */}
      <div className="bg-slate-950 p-4 border-t border-slate-800 text-center">
        <p className="text-slate-600 font-black tracking-widest uppercase text-[10px]">
          Powered by ArogyaNext AI Systems
        </p>
      </div>

    </div>
  );
}