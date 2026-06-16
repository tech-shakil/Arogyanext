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

  return (
    <div className="min-h-screen bg-slate-900 p-8 flex space-x-6 text-slate-300 font-sans">
      
      {/* LEFT COLUMN: WAITING QUEUE */}
      <div className="w-1/3 bg-slate-950 rounded-3xl p-6 border border-slate-800 flex flex-col shadow-xl relative overflow-hidden">
        {/* Status Toggle Header */}
        <div className="mb-6 border-b border-slate-800 pb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-black text-white">Your Workspace</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Dr. {doctorName}</p>
            </div>
          </div>
          
          <div className="bg-slate-900 p-1 rounded-xl flex border border-slate-700">
            <button 
              onClick={() => handleStatusChange("Active")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${currentStatus === "Active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "text-slate-500 hover:text-slate-300"}`}
            >
              🟢 Active
            </button>
            <button 
              onClick={() => handleStatusChange("Away")}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${currentStatus === "Away" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]" : "text-slate-500 hover:text-slate-300"}`}
            >
              ☕ Away
            </button>
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Waiting Queue ({waitingPatients.length})</h3>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {waitingPatients.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <span className="text-4xl block mb-2">☕</span>
              <p className="text-sm font-medium">No patients waiting.</p>
            </div>
          ) : (
            waitingPatients.map(patient => (
              <div key={patient.id} className={`bg-slate-900 p-4 rounded-2xl border-l-4 ${patient.isEmergency ? 'border-l-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-l-blue-500'} flex justify-between items-center transition-all hover:bg-slate-800`}>
                <div>
                  <p className="font-bold text-white">{patient.patientName}</p>
                  <p className="text-xs text-slate-500 mt-1">Token: <span className="font-bold text-blue-400">{patient.tokenNumber}</span></p>
                  {patient.isEmergency && <p className="text-[10px] text-red-500 font-black mt-1 uppercase tracking-widest animate-pulse">Emergency</p>}
                </div>
                <button 
                  disabled={currentPatient !== null}
                  onClick={() => handleCallNext(patient)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${currentPatient ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 hover:-translate-y-0.5'}`}
                >
                  Call In
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: ACTIVE CONSULTATION */}
      <div className="w-2/3 bg-slate-900 rounded-3xl p-8 border border-slate-700 shadow-2xl flex flex-col relative overflow-hidden">
        <h2 className="text-2xl font-black text-white mb-8 border-b border-slate-800 pb-4 flex items-center">
          <span className="text-blue-500 mr-3">🩺</span> Active Consultation
        </h2>

        {currentPatient ? (
          <div className="flex-1 flex flex-col z-10">
            <div className="flex justify-between items-start mb-8 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-inner">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Patient Name</p>
                <h3 className="text-3xl font-black text-white mb-4">{currentPatient.patientName} <span className="text-sm font-medium text-slate-500">({currentPatient.patientAge} yrs)</span></h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Reported Symptoms</p>
                <p className="text-md text-slate-300 bg-slate-900 p-3 rounded-xl inline-block border border-slate-800">
                  {currentPatient.symptoms || "No symptoms logged"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Live Token</p>
                <p className="text-4xl font-black text-blue-500 bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20">{currentPatient.tokenNumber}</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col mb-8">
              <label className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center">
                <span className="mr-2">💊</span> Digital E-Prescription
              </label>
              <textarea 
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                placeholder="Type medicines here (e.g. Paracetamol 500mg - 1x morning, 1x night)..."
                className="flex-1 w-full bg-slate-950 text-white p-6 rounded-2xl border border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none font-medium leading-relaxed transition-colors shadow-inner"
              ></textarea>
              <p className="text-xs text-slate-500 mt-2 font-medium flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-2"></span>
                Prescription will be instantly synced to the hospital E-Pharmacy upon completion.
              </p>
            </div>

            <button 
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black py-4 rounded-2xl text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-1"
            >
              Finish Consultation & Sync
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <span className="text-6xl">📋</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Workspace is Clear</h3>
            <p className="text-slate-400 max-w-sm">Call the next patient from the waiting queue on the left to begin the consultation.</p>
          </div>
        )}
      </div>

    </div>
  );
}