import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';

export default function DoctorPanel({ hospitalId, doctorName }) {
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [currentStatus, setCurrentStatus] = useState("Active");

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

        <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-4">
          Waiting Queue ({waitingPatients.length})
        </h3>
        
        <div className="flex-1 max-h-80 lg:max-h-none overflow-y-auto space-y-3 sm:space-y-4 pr-1">
          {waitingPatients.length === 0 ? (
            <div className="text-center py-8 sm:py-10 opacity-50">
              <span className="text-3xl sm:text-4xl block mb-2">☕</span>
              <p className="text-xs sm:text-sm font-medium">No patients waiting.</p>
            </div>
          ) : (
            waitingPatients.map(patient => (
              <div key={patient.id} className={`bg-slate-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-l-4 ${patient.isEmergency ? 'border-l-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-l-blue-500'} flex justify-between items-center transition-all hover:bg-slate-800`}>
                <div className="pr-2">
                  <p className="font-bold text-white text-sm sm:text-base">{patient.patientName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-500">Token: <span className="font-bold text-blue-400">{patient.tokenNumber}</span></p>
                    {patient.scannedPrescriptionText && (
                      <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-1.5 py-0.2 rounded">
                        📷 OCR Rx
                      </span>
                    )}
                  </div>
                  {patient.isEmergency && <p className="text-[9px] sm:text-[10px] text-red-500 font-black mt-1 uppercase tracking-widest animate-pulse">Emergency</p>}
                </div>
                <button 
                  disabled={currentPatient !== null}
                  onClick={() => handleCallNext(patient)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 flex-shrink-0 ${currentPatient ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'}`}
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
        <h2 className="text-xl sm:text-2xl font-black text-white mb-6 sm:mb-8 border-b border-slate-800 pb-3 sm:pb-4 flex items-center">
          <span className="text-blue-500 mr-2 sm:mr-3">🩺</span> Active Consultation
        </h2>

        {currentPatient ? (
          <div className="flex-1 flex flex-col z-10">
            {/* Patient Header Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5 sm:mb-6 bg-slate-950 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-800 shadow-inner">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Patient Name</p>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3">
                  {currentPatient.patientName} <span className="text-sm font-medium text-slate-500">({currentPatient.patientAge} yrs)</span>
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Reported Symptoms</p>
                <p className="text-sm sm:text-md text-slate-300 bg-slate-900 p-2.5 sm:p-3 rounded-xl inline-block border border-slate-800">
                  {currentPatient.symptoms || "No symptoms logged"}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Live Token</p>
                <p className="text-2xl sm:text-4xl font-black text-blue-500 bg-blue-500/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-blue-500/20 inline-block font-mono">
                  {currentPatient.tokenNumber}
                </p>
              </div>
            </div>

            {/* 📷 SCANNED PRESCRIPTION OCR CARD (From Patient Mobile App) */}
            {currentPatient.scannedPrescriptionText && (
              <div className="mb-5 sm:mb-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                    <span>📷</span> On-Device OCR Scanned Paper Rx (ML Kit)
                  </span>
                  <button 
                    type="button"
                    onClick={handleAppendScannedNotes}
                    className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-1"
                  >
                    <span>+</span> Insert into E-Prescription
                  </button>
                </div>
                <div className="bg-slate-950/90 rounded-xl p-3 border border-indigo-950 text-xs sm:text-sm text-slate-300 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                  {currentPatient.scannedPrescriptionText}
                </div>
              </div>
            )}

            {/* E-Prescription Input */}
            <div className="flex-1 flex flex-col mb-6 sm:mb-8">
              <label className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center">
                <span className="mr-2">💊</span> Digital E-Prescription
              </label>
              <textarea 
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                placeholder="Type medicines here (e.g. Paracetamol 500mg - 1x morning, 1x night)..."
                rows={4}
                className="w-full min-h-[120px] bg-slate-950 text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-y font-medium text-sm sm:text-base leading-relaxed transition-colors shadow-inner"
              ></textarea>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-2 font-medium flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-2 flex-shrink-0"></span>
                Prescription will sync to hospital E-Pharmacy upon completion.
              </p>
            </div>

            <button 
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-98"
            >
              Finish Consultation & Sync
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