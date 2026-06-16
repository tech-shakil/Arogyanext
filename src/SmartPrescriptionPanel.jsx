import { useState, useRef, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';

export default function SmartPrescriptionPanel({ hospitalId, doctorName }) {
  // --- DATABASE STATE ---
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);

  // --- UI & LETTERHEAD STATE ---
  const [letterheadBg, setLetterheadBg] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");

  // Alignment States
  const [marginTop, setMarginTop] = useState(25); 
  const [signBottom, setSignBottom] = useState(10); 
  const [maskLines, setMaskLines] = useState(false); 

  const signCanvasRef = useRef(null);
  const signContextRef = useRef(null);

  // --- 0. LOAD SAVED LETTERHEAD ON BOOT ---
  useEffect(() => {
    // Make letterhead save specifically for this doctor/hospital combo
    const savedLetterhead = localStorage.getItem(`arogya_letterhead_${hospitalId}_${doctorName}`);
    if (savedLetterhead) {
      setLetterheadBg(savedLetterhead);
    }
  }, [hospitalId, doctorName]);

  // --- 1. THE MULTI-TENANT & DOCTOR-SPECIFIC LOCK ---
  useEffect(() => {
    if (!hospitalId || !doctorName) return;

    // Filter by Hospital AND Status AND specifically THIS DOCTOR!
    const q = query(
      collection(db, 'appointments'), 
      where("hospitalId", "==", hospitalId), 
      where("status", "==", "Waiting"),
      where("doctorName", "==", doctorName) // 🔒 Locked to the logged-in doctor!
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setWaitingPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [hospitalId, doctorName]); 

  // --- SET LIVE CLOCK & SIGNATURE PAD ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }));
    }, 1000);

    if (signCanvasRef.current) {
      const canvas = signCanvasRef.current;
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      canvas.style.width = `${canvas.offsetWidth}px`;
      canvas.style.height = `${canvas.offsetHeight}px`;

      const context = canvas.getContext("2d");
      context.scale(2, 2);
      context.lineCap = "round";
      context.strokeStyle = "#0f172a"; 
      context.lineWidth = 2.5;
      signContextRef.current = context;
    }
    return () => clearInterval(timer);
  }, [currentPatient]);

  // --- 2. CALL NEXT PATIENT LOGIC ---
  const handleCallNext = async (patient) => {
    try {
      await updateDoc(doc(db, 'appointments', patient.id), { status: 'In Consultation' });
      
      await setDoc(doc(db, 'queue', hospitalId), {
        currentToken: patient.tokenNumber,
        doctorStatus: patient.isEmergency ? 'Emergency Duty' : 'Active',
        currentDoctor: doctorName, // Pass the doctor's name to the TV
        updatedAt: new Date()
      }, { merge: true });

      setCurrentPatient(patient);
      setPrescriptionText(""); 
    } catch (err) {
      console.error(err);
    }
  };

  // --- 3. COMPLETE & SEND TO PHARMACY ---
  const handleCompleteAndPrint = async () => {
    if (!currentPatient) return;
    try {
      await updateDoc(doc(db, 'appointments', currentPatient.id), { 
        status: 'Completed',
        prescription: prescriptionText, 
        doctorName: doctorName,
        pharmacyStatus: prescriptionText.trim() !== "" ? 'Pending' : 'Skipped' 
      });
      
      window.print();

      setCurrentPatient(null);
      setPrescriptionText("");
    } catch (err) {
      console.error(err);
    }
  };

  // --- LETTERHEAD UPLOAD LOGIC ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (upload) => {
        const base64Image = upload.target.result;
        setLetterheadBg(base64Image);
        localStorage.setItem(`arogya_letterhead_${hospitalId}_${doctorName}`, base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLetterhead = () => {
    setLetterheadBg(null);
    localStorage.removeItem(`arogya_letterhead_${hospitalId}_${doctorName}`);
  };

  // --- SIGNATURE LOGIC ---
  const startSigning = ({ nativeEvent }) => {
    if (!currentPatient) return;
    nativeEvent.preventDefault();
    const offsetX = nativeEvent.offsetX || nativeEvent.touches?.[0]?.clientX - signCanvasRef.current.getBoundingClientRect().left;
    const offsetY = nativeEvent.offsetY || nativeEvent.touches?.[0]?.clientY - signCanvasRef.current.getBoundingClientRect().top;
    signContextRef.current.beginPath();
    signContextRef.current.moveTo(offsetX, offsetY);
    setIsSigning(true);
  };

  const drawSignature = ({ nativeEvent }) => {
    if (!isSigning) return;
    nativeEvent.preventDefault();
    const offsetX = nativeEvent.offsetX || nativeEvent.touches?.[0]?.clientX - signCanvasRef.current.getBoundingClientRect().left;
    const offsetY = nativeEvent.offsetY || nativeEvent.touches?.[0]?.clientY - signCanvasRef.current.getBoundingClientRect().top;
    signContextRef.current.lineTo(offsetX, offsetY);
    signContextRef.current.stroke();
  };

  const stopSigning = () => {
    if (signContextRef.current) {
      signContextRef.current.closePath();
      setIsSigning(false);
    }
  };

  const clearSignature = () => {
    if (signCanvasRef.current) {
      const canvas = signCanvasRef.current;
      signContextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 flex flex-col md:flex-row gap-8 font-sans text-slate-300 print:bg-white print:p-0">
      
      {/* LEFT SIDE: Doctor Controls */}
      <div className="w-full md:w-1/3 flex flex-col gap-6 print:hidden">
        
        {/* DOCTOR IDENTITY CARD (Replaced the Dropdown!) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              👨‍⚕️
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Attending Physician</p>
              <h2 className="text-xl font-black text-white">{doctorName}</h2>
              <p className="text-xs text-blue-400 font-medium mt-0.5 flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                Active Workspace
              </p>
            </div>
          </div>
        </div>

        {/* THE LIVE WAITING ROOM */}
        {!currentPatient ? (
          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 flex-1 flex flex-col">
            <h2 className="text-xl font-black text-white mb-6 border-b border-slate-800 pb-4">
              Your Queue ({waitingPatients.length})
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4">
              {waitingPatients.length === 0 ? (
                <div className="text-center mt-10">
                  <span className="text-4xl block mb-3 opacity-50">☕</span>
                  <p className="text-slate-500 font-medium">No patients assigned to you right now.</p>
                </div>
              ) : (
                waitingPatients.map(patient => (
                  <div key={patient.id} className={`bg-slate-900 p-4 rounded-xl border-l-4 ${patient.isEmergency ? 'border-l-red-500' : 'border-l-blue-500'} flex justify-between items-center`}>
                    <div>
                      <p className="font-bold text-white text-md">{patient.patientName}</p>
                      <p className="text-xs text-slate-500">Token: <span className="font-bold text-slate-300">{patient.tokenNumber}</span></p>
                    </div>
                    <button 
                      onClick={() => handleCallNext(patient)}
                      className="px-4 py-2 rounded-lg font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                    >
                      Call In
                    </button>
                  </div>
                ))
              )}
            </div>
            
            {/* Letterhead Settings */}
            <div className="mt-6 border-t border-slate-800 pt-6">
              {!letterheadBg ? (
                <label className="block w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors">
                  <span className="text-sm font-medium text-slate-300">📁 Upload Blank Letterhead</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              ) : (
                <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-emerald-500/30">
                  <span className="text-sm font-medium text-emerald-400">✅ Letterhead Saved</span>
                  <button onClick={handleRemoveLetterhead} className="text-xs text-red-400 hover:underline">Remove</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ACTIVE CONSULTATION CONTROLS */
          <>
            <div className="bg-slate-950 p-6 rounded-3xl border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Active Patient</p>
                  <h3 className="text-2xl font-black text-white">{currentPatient.patientName}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Token</p>
                  <p className="text-xl font-black text-blue-500">{currentPatient.tokenNumber}</p>
                </div>
              </div>
              <button onClick={() => setCurrentPatient(null)} className="text-xs text-red-400 hover:text-red-300 underline">
                Cancel Consultation
              </button>
            </div>

            <div className="flex-1 bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col">
              <h3 className="text-white font-bold mb-4 flex items-center"><span className="mr-2">💊</span> Medicines</h3>
              <textarea 
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                placeholder="Type medicines here..."
                className="flex-1 bg-slate-900 text-white border border-slate-700 rounded-xl p-4 resize-none focus:border-blue-500 outline-none"
              />
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Alignment & Display</h4>
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Top Text Position</span><span className="text-blue-400">{marginTop}%</span></div>
                <input type="range" min="10" max="50" value={marginTop} onChange={(e) => setMarginTop(e.target.value)} className="w-full accent-blue-500" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Signature Position</span><span className="text-blue-400">{signBottom}%</span></div>
                <input type="range" min="2" max="30" value={signBottom} onChange={(e) => setSignBottom(e.target.value)} className="w-full accent-blue-500" />
              </div>
              <label className="flex items-center space-x-3 cursor-pointer mt-4">
                <input type="checkbox" checked={maskLines} onChange={(e) => setMaskLines(e.target.checked)} className="w-4 h-4 accent-blue-500" />
                <span className="text-sm">Mask Background Lines</span>
              </label>
            </div>

            <button onClick={handleCompleteAndPrint} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-lg transition-all">
              ✅ Finish, Send & Print
            </button>
          </>
        )}
      </div>

      {/* RIGHT SIDE: The Live Smart Letterhead */}
      <div className="w-full md:w-2/3 flex justify-center items-start print:w-full print:block">
        
        <div 
          className="bg-white w-full max-w-[800px] aspect-[1/1.414] shadow-2xl relative print:shadow-none print:max-w-none text-black overflow-hidden"
          style={{
            backgroundImage: letterheadBg ? `url(${letterheadBg})` : 'none',
            backgroundSize: 'contain', 
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top center',
            backgroundColor: '#ffffff'
          }}
        >
          {!currentPatient && (
            <div className="absolute inset-0 bg-slate-100/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 print:hidden">
              <span className="text-6xl mb-4">🩺</span>
              <h2 className="text-2xl font-bold text-slate-800">No Patient Selected</h2>
              <p className="text-slate-500 font-medium mt-2">Call a patient from the queue to begin.</p>
            </div>
          )}

          {!letterheadBg && currentPatient && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none print:hidden">
              <p className="text-slate-300 text-2xl font-bold opacity-50">Upload Letterhead to Preview</p>
            </div>
          )}

          {currentPatient && (
            <>
              {/* AUTO-GENERATED DATA OVERLAY */}
              <div 
                className={`absolute left-8 right-8 transition-all duration-200 ${maskLines ? 'bg-white/95 p-4 rounded-lg shadow-[0_0_15px_rgba(255,255,255,1)]' : ''}`}
                style={{ top: `${marginTop}%` }}
              >
                <div className="flex justify-between border-b-2 border-slate-200 pb-2 mb-4">
                  <div>
                    <p className="font-bold text-lg">{currentPatient.patientName}</p>
                    <p className="text-sm text-slate-600">
                      {currentPatient.patientAge ? `${currentPatient.patientAge} Yrs | ` : ''} 
                      {currentPatient.gender || 'Token: ' + currentPatient.tokenNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">Date: {currentDateTime.split(',')[0]}</p>
                    <p className="text-sm text-slate-600">Time: {currentDateTime.split(',')[1]}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-2xl font-serif font-black text-slate-800 mb-2 opacity-30">Rx</h4>
                  <p className="whitespace-pre-wrap text-lg font-medium leading-relaxed text-slate-900">
                    {prescriptionText}
                  </p>
                </div>
              </div>

              {/* Bottom Right Section: The Live Signature Pad */}
              <div 
                className={`absolute right-12 w-64 flex flex-col items-end transition-all duration-200 ${maskLines ? 'bg-white/95 p-2 rounded-lg' : ''}`}
                style={{ bottom: `${signBottom}%` }}
              >
                <div className="w-full h-32 bg-slate-50 border border-slate-300 rounded-lg relative print:border-none print:bg-transparent">
                  <button onClick={clearSignature} className="absolute -top-6 right-0 text-xs text-red-500 font-bold print:hidden hover:underline z-20">
                    Clear Sign
                  </button>
                  
                  <canvas
                    ref={signCanvasRef}
                    onPointerDown={startSigning}
                    onPointerMove={drawSignature}
                    onPointerUp={stopSigning}
                    onPointerLeave={stopSigning}
                    className="w-full h-full cursor-crosshair touch-none absolute inset-0 z-10"
                  />
                  
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none print:hidden">
                    <p className="text-slate-300 text-sm font-bold opacity-50">Sign Here</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-800 mt-2 text-center w-full border-t border-slate-800 pt-1">
                  {doctorName || 'Authorized Signature'}
                </p>
              </div>
            </>
          )}

        </div>
      </div>

    </div>
  );
}