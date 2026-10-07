import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';

export default function DoctorPanel({ hospitalId, doctorName }) {
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [currentStatus, setCurrentStatus] = useState("Active");
  const [queueSearch, setQueueSearch] = useState("");

  const medicinePresets = [
    "Tab. Paracetamol 650mg (1-0-1 PC)",
    "Cap. Amoxicillin 500mg (1-1-1 PC)",
    "Tab. Azithromycin 500mg (1-0-0 PC)",
    "Tab. Pantoprazole 40mg (1-0-0 AC)",
    "Tab. Cetirizine 10mg (0-0-1 HS)",
    "Syp. Ascoril D (5ml TDS)",
    "ORS Sachet (1 pkt in 1L water SOS)"
  ];

  const instructionPresets = [
    "After food (PC)", "Before food (AC)", "For 3 days", "For 5 days", "SOS (as needed)", "Drink warm fluids", "Review in 3 days"
  ];

  const handleAppendMedicine = (med) => {
    setPrescriptionText(prev => prev.trim() ? `${prev}\n• ${med}` : `• ${med}`);
  };

  const handleAppendInstruction = (inst) => {
    setPrescriptionText(prev => prev.trim() ? `${prev} - ${inst}` : `Note: ${inst}`);
  };

  // 1. Fetch Waiting Patients
  useEffect(() => {
    if (!hospitalId || !doctorName) return;

    const q = query(
      collection(db, 'appointments'), 
      where("hospitalId", "==", hospitalId),
      where("doctorName", "==", doctorName),
      where("status", "==", "Waiting")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      // Sort by token to maintain queue order
      const patients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      patients.sort((a, b) => a.tokenInt - b.tokenInt);
      setWaitingPatients(patients);
    });

    return () => unsub();
  }, [hospitalId, doctorName]);

  // 2. Manual Status Toggle
  const handleStatusChange = async (newStatus) => {
    setCurrentStatus(newStatus);
    try {
      await setDoc(doc(db, 'doctor_status', doctorName), {
        status: newStatus,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const handleCallNext = async (patient) => {
    try {
      // Update appointment status
      await updateDoc(doc(db, 'appointments', patient.id), { status: 'In Consultation' });
      
      // Update doctor's global status so the app knows they are busy
      await setDoc(doc(db, 'doctor_status', doctorName), {
        status: 'In Consultation',
        currentToken: patient.tokenNumber
      }, { merge: true });

      setCurrentPatient(patient);
      setPrescriptionText(""); 
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async () => {
    if (!currentPatient) return;
    try {
      await updateDoc(doc(db, 'appointments', currentPatient.id), { 
        status: 'Completed',
        prescription: prescriptionText, 
        pharmacyStatus: prescriptionText.trim() !== "" ? 'Pending' : 'Skipped' 
      });
      
      // Reset doctor status
      await handleStatusChange("Active");
      
      setCurrentPatient(null);
      setPrescriptionText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAppendScannedNotes = () => {
    if (!currentPatient?.scannedPrescriptionText) return;
    const note = `[Previous Prescription Notes]:\n${currentPatient.scannedPrescriptionText}`;
    setPrescriptionText(prev => prev.trim() ? `${prev}\n\n${note}` : note);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-3 sm:p-6 md:p-8 flex flex-col lg:flex-row gap-6 text-slate-300 font-sans">
      
      {/* QUEUE COLUMN */}
      <div className="w-full lg:w-1/3 bg-slate-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-800 flex flex-col shadow-xl relative overflow-hidden">
        {/* Status Toggle Header */}
        <div className="mb-4 sm:mb-6 border-b border-slate-800 pb-4 sm:pb-6">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Your Workspace</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">Dr. {doctorName}</p>
            </div>
          </div>
          
          <div className="bg-slate-900 p-1 rounded-xl flex border border-slate-700">
            <button 
              onClick={() => handleStatusChange("Active")}
              className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${currentStatus === "Active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "text-slate-500 hover:text-slate-300"}`}
            >
              🟢 Active
            </button>
            <button 
              onClick={() => handleStatusChange("Away")}
              className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${currentStatus === "Away" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]" : "text-slate-500 hover:text-slate-300"}`}
            >
              ☕ Away
            </button>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">
              Waiting Queue ({waitingPatients.length})
            </h3>
            {waitingPatients.some(p => p.isEmergency) && (
              <span className="text-[10px] font-black text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full animate-pulse">
                🚨 Emergency In Queue
              </span>
            )}
          </div>
          
          <input
            type="text"
            placeholder="Filter queue by name/token..."
            value={queueSearch}
            onChange={(e) => setQueueSearch(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:border-blue-500 outline-none"
          />
        </div>
        
        <div className="flex-1 max-h-80 lg:max-h-none overflow-y-auto space-y-2.5 sm:space-y-3 pr-1">
          {waitingPatients
            .filter(p => !queueSearch || p.patientName?.toLowerCase().includes(queueSearch.toLowerCase()) || p.tokenNumber?.toLowerCase().includes(queueSearch.toLowerCase()))
            .length === 0 ? (
            <div className="text-center py-8 sm:py-10 opacity-50">
              <span className="text-3xl sm:text-4xl block mb-2">☕</span>
              <p className="text-xs sm:text-sm font-medium">No patients waiting.</p>
            </div>
          ) : (
            waitingPatients
              .filter(p => !queueSearch || p.patientName?.toLowerCase().includes(queueSearch.toLowerCase()) || p.tokenNumber?.toLowerCase().includes(queueSearch.toLowerCase()))
              .map(patient => (
              <div 
                key={patient.id} 
                className={`bg-slate-900 p-3 sm:p-3.5 rounded-xl border-l-4 transition-all hover:bg-slate-850 ${
                  patient.isEmergency 
                    ? 'border-l-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] border-t border-r border-b border-red-500/20' 
                    : 'border-l-blue-500 border-slate-800/80'
                } flex justify-between items-center`}
              >
                <div className="pr-2 truncate">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-white text-xs sm:text-sm truncate">{patient.patientName}</p>
                    {patient.isEmergency && (
                      <span className="text-[9px] text-red-400 font-black uppercase px-1 py-0.2 bg-red-500/20 rounded">Urgent</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">{patient.tokenNumber}</span>
                    <span className="text-[10px] text-slate-500">{patient.patientAge}y</span>
                    {patient.scannedPrescriptionText && (
                      <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-1.5 py-0.2 rounded">
                        📷 OCR Rx
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  disabled={currentPatient !== null}
                  onClick={() => handleCallNext(patient)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 flex-shrink-0 ${
                    currentPatient 
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                      : (patient.isEmergency ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 animate-pulse' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20')
                  }`}
                >
                  Call In
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ACTIVE CONSULTATION COLUMN */}
      <div className="w-full lg:w-2/3 bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-700 shadow-2xl flex flex-col relative overflow-hidden">
        <h2 className="text-xl sm:text-2xl font-black text-white mb-4 sm:mb-6 border-b border-slate-800 pb-3 sm:pb-4 flex items-center justify-between">
          <span className="flex items-center">
            <span className="text-blue-500 mr-2 sm:mr-3">🩺</span> Active Consultation Workspace
          </span>
          {currentPatient && (
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              ● IN CONSULTATION
            </span>
          )}
        </h2>

        {currentPatient ? (
          <div className="flex-1 flex flex-col z-10">
            {/* Patient Header Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 sm:mb-5 bg-slate-950 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-800 shadow-inner">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Patient Details</p>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5">
                  {currentPatient.patientName} <span className="text-xs font-medium text-slate-400">({currentPatient.patientAge} yrs)</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Symptoms:</span>
                  <span className="text-xs text-slate-200 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-medium">
                    {currentPatient.symptoms || "General OPD Checkup"}
                  </span>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Calling Token</p>
                <p className="text-2xl sm:text-3xl font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20 inline-block font-mono">
                  {currentPatient.tokenNumber}
                </p>
              </div>
            </div>

            {/* 📷 SCANNED PRESCRIPTION OCR CARD (From Patient Mobile App) */}
            {currentPatient.scannedPrescriptionText && (
              <div className="mb-4 sm:mb-5 p-3.5 sm:p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40 relative">
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                    <span>📷</span> Patient Scanned Paper Rx (ML Kit OCR)
                  </span>
                  <button 
                    type="button"
                    onClick={handleAppendScannedNotes}
                    className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-1"
                  >
                    <span>+</span> Insert into Notes
                  </button>
                </div>
                <div className="bg-slate-950/90 rounded-lg p-2.5 border border-indigo-950 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-28 overflow-y-auto leading-relaxed">
                  {currentPatient.scannedPrescriptionText}
                </div>
              </div>
            )}

            {/* 1-Tap Medicine & Instruction Preset Chips */}
            <div className="mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">⚡ 1-Tap Quick Medications:</span>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {medicinePresets.map((med) => (
                  <button
                    key={med}
                    type="button"
                    onClick={() => handleAppendMedicine(med)}
                    className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 border border-slate-700 transition-colors active:scale-95"
                  >
                    + {med.split(' ')[1]}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {instructionPresets.map((inst) => (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => handleAppendInstruction(inst)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 transition-colors"
                  >
                    + {inst}
                  </button>
                ))}
              </div>
            </div>

            {/* E-Prescription Input */}
            <div className="flex-1 flex flex-col mb-4 sm:mb-6">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center">
                  <span className="mr-1.5">💊</span> Digital E-Prescription & Advice
                </label>
                {prescriptionText && (
                  <button onClick={() => setPrescriptionText("")} className="text-[11px] text-slate-500 hover:text-red-400 transition-colors">Clear</button>
                )}
              </div>
              <textarea 
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                placeholder="Type medicines or click 1-tap chips above..."
                rows={4}
                className="w-full min-h-[110px] bg-slate-950 text-white p-3.5 sm:p-4 rounded-xl border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-y font-mono text-xs sm:text-sm leading-relaxed transition-colors shadow-inner"
              ></textarea>
              <p className="text-[11px] text-slate-500 mt-1.5 font-medium flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-2 flex-shrink-0"></span>
                Prescription syncs to hospital E-Pharmacy counter automatically upon completion.
              </p>
            </div>

            <button 
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 sm:py-4 rounded-xl text-base shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <span>✅</span>
              <span>Finish Consultation & Sync to Pharmacy</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 sm:py-16 opacity-40">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-800 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <span className="text-4xl sm:text-6xl">📋</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Workspace is Clear</h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm px-4">Call the next patient from the waiting queue on the left to begin consultation.</p>
          </div>
        )}
      </div>

    </div>
  );
}