import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { 
  Stethoscope, 
  Scan, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  User, 
  Pill, 
  Sparkles, 
  FileText,
  ClipboardList
} from 'lucide-react';

export default function DoctorPanel({ hospitalId, doctorName }) {
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [currentStatus, setCurrentStatus] = useState("Active");
  const [queueSearch, setQueueSearch] = useState("");
  const consultationRef = useRef(null);

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

  const normalizeDoc = (name) => (name || "").toLowerCase().replace(/^dr\.?\s*/i, "").trim();

  // Helper to extract OCR text from any possible field key
  const getPatientOcrText = (patient) => {
    if (!patient) return "";
    return patient.scannedPrescriptionText 
      || patient.ocrText 
      || patient.scannedText 
      || patient.extractedOcr 
      || patient.prescriptionOcr 
      || patient.extractedText 
      || patient.paperPrescriptionOcr
      || "";
  };

  // 1. Fetch Waiting AND Currently Consulting Patients (Persistent Sync)
  useEffect(() => {
    if (!hospitalId || !doctorName) return;

    const q = query(
      collection(db, 'appointments'), 
      where("hospitalId", "==", hospitalId),
      where("status", "in", ["Waiting", "In Consultation"])
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const myDoctorNorm = normalizeDoc(doctorName);

      // Filter patients assigned to this doctor (resilient to case or prefix differences)
      const doctorPatients = all.filter(p => {
        if (!p.doctorName) return true; // Unassigned emergency fallback
        return normalizeDoc(p.doctorName) === myDoctorNorm || p.doctorName.toLowerCase() === doctorName.toLowerCase();
      });

      // Split waiting queue and active consultation
      const waiting = doctorPatients
        .filter(p => p.status === "Waiting")
        .sort((a, b) => {
          if (a.isEmergency && !b.isEmergency) return -1;
          if (!a.isEmergency && b.isEmergency) return 1;
          return (a.tokenInt || 0) - (b.tokenInt || 0);
        });

      const active = doctorPatients.find(p => p.status === "In Consultation");

      setWaitingPatients(waiting);

      // Persistently maintain active patient even across tab switches or reloads
      if (active) {
        setCurrentPatient(active);
      } else {
        setCurrentPatient(null);
      }
    }, (err) => {
      console.error("Queue listener error:", err);
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

  // 3. Call In Patient
  const handleCallNext = async (patient) => {
    try {
      // Set state locally for instant UI response
      setCurrentPatient(patient);
      setPrescriptionText("");

      // Update appointment status to 'In Consultation' in Firestore
      await updateDoc(doc(db, 'appointments', patient.id), { 
        status: 'In Consultation',
        consultationStartedAt: new Date().toISOString()
      });
      
      // Update doctor's status
      await setDoc(doc(db, 'doctor_status', doctorName), {
        status: 'In Consultation',
        currentToken: patient.tokenNumber,
        currentPatientName: patient.patientName,
        currentPatientId: patient.id,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      // Update TV queue announcement
      await setDoc(doc(db, 'queue', hospitalId), {
        activeDoctor: doctorName,
        activeToken: patient.tokenNumber,
        status: 'Calling',
        lastUpdated: new Date()
      }, { merge: true });

      // Auto-scroll on mobile to make consultation workspace immediately visible
      setTimeout(() => {
        consultationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } catch (err) {
      console.error("Error calling patient:", err);
    }
  };

  // 4. Complete Consultation
  const handleComplete = async () => {
    if (!currentPatient) return;
    try {
      await updateDoc(doc(db, 'appointments', currentPatient.id), { 
        status: 'Completed',
        prescription: prescriptionText, 
        pharmacyStatus: prescriptionText.trim() !== "" ? 'Pending' : 'Skipped',
        completedAt: new Date().toISOString()
      });
      
      // Reset doctor status
      await handleStatusChange("Active");
      await setDoc(doc(db, 'queue', hospitalId), {
        activeDoctor: doctorName,
        status: 'Available',
        lastUpdated: new Date()
      }, { merge: true });
      
      setCurrentPatient(null);
      setPrescriptionText("");
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Cancel / Return Patient Back to Waiting Queue
  const handleCancelConsultation = async () => {
    if (!currentPatient) return;
    try {
      await updateDoc(doc(db, 'appointments', currentPatient.id), { 
        status: 'Waiting' 
      });
      await handleStatusChange("Active");
      setCurrentPatient(null);
      setPrescriptionText("");
    } catch (err) {
      console.error("Error cancelling consultation:", err);
    }
  };

  const handleAppendScannedNotes = () => {
    const ocr = getPatientOcrText(currentPatient);
    if (!ocr) return;
    const note = `[Previous Prescription Notes (OCR)]:\n${ocr}`;
    setPrescriptionText(prev => prev.trim() ? `${prev}\n\n${note}` : note);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-3 sm:p-6 md:p-8 flex flex-col lg:flex-row gap-6 text-slate-300 font-sans">
      
      {/* QUEUE COLUMN (On mobile, placed below consultation if patient is currently active) */}
      <div className={`w-full lg:w-1/3 bg-slate-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-800 flex flex-col shadow-xl relative overflow-hidden transition-all ${
        currentPatient ? 'order-2 lg:order-1' : 'order-1'
      }`}>
        {/* Status Toggle Header */}
        <div className="mb-4 sm:mb-6 border-b border-slate-800 pb-4 sm:pb-6">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Your Workspace</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">Dr. {doctorName}</p>
            </div>
            {currentPatient && (
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-pulse">
                ● Busy
              </span>
            )}
          </div>
          
          <div className="bg-slate-900 p-1 rounded-xl flex border border-slate-700">
            <button 
              onClick={() => handleStatusChange("Active")}
              className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${currentStatus === "Active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "text-slate-500 hover:text-slate-300"}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Active</span>
            </button>
            <button 
              onClick={() => handleStatusChange("Away")}
              className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${currentStatus === "Away" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]" : "text-slate-500 hover:text-slate-300"}`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Away</span>
            </button>
          </div>
        </div>

        {/* Active Consultation Banner inside Queue Column */}
        {currentPatient && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
              <div className="truncate">
                <p className="text-xs font-black text-emerald-300 truncate">{currentPatient.patientName}</p>
                <p className="text-[10px] text-emerald-500 font-mono">Token: {currentPatient.tokenNumber}</p>
              </div>
            </div>
            <button 
              onClick={() => consultationRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all flex-shrink-0"
            >
              View Active
            </button>
          </div>
        )}

        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">
              Waiting Queue ({waitingPatients.length})
            </h3>
            {waitingPatients.some(p => p.isEmergency) && (
              <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3 h-3 text-rose-400" />
                <span>Emergency In Queue</span>
              </span>
            )}
          </div>
          
          <input
            type="text"
            placeholder="Filter queue by name/token..."
            value={queueSearch}
            onChange={(e) => setQueueSearch(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:border-blue-500 outline-none"
          />
        </div>
        
        <div className="flex-1 max-h-80 lg:max-h-none overflow-y-auto space-y-2.5 sm:space-y-3 pr-1">
          {waitingPatients
            .filter(p => !queueSearch || p.patientName?.toLowerCase().includes(queueSearch.toLowerCase()) || p.tokenNumber?.toLowerCase().includes(queueSearch.toLowerCase()))
            .length === 0 ? (
            <div className="text-center py-8 sm:py-10 opacity-50 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-2 text-slate-400">
                <ClipboardList className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-400">No patients waiting in queue.</p>
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
                    {getPatientOcrText(patient) && (
                      <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-1.5 py-0.2 rounded font-mono inline-flex items-center gap-1">
                        <Scan className="w-2.5 h-2.5 text-indigo-400" />
                        <span>OCR Rx</span>
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

      {/* ACTIVE CONSULTATION COLUMN (On mobile, prioritized to top when patient is called in) */}
      <div 
        ref={consultationRef}
        className={`w-full lg:w-2/3 bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-700 shadow-2xl flex flex-col relative overflow-hidden transition-all ${
          currentPatient ? 'order-1 lg:order-2 ring-2 ring-blue-500/30' : 'order-2'
        }`}
      >
        <h2 className="text-xl sm:text-2xl font-black text-white mb-4 sm:mb-6 border-b border-slate-800 pb-3 sm:pb-4 flex items-center justify-between">
          <span className="flex items-center gap-2.5">
            <Stethoscope className="w-5 h-5 text-blue-400" />
            <span>Active Consultation Workspace</span>
          </span>
          {currentPatient && (
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>IN CONSULTATION</span>
            </span>
          )}
        </h2>

        {currentPatient ? (
          <div className="flex-1 flex flex-col z-10">
            {/* Patient Header Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 sm:mb-5 bg-slate-950 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-800 shadow-inner">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    ● Active Patient
                  </span>
                  {currentPatient.isEmergency && (
                    <span className="text-[10px] text-rose-400 font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 animate-pulse inline-flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                      <span>Priority Emergency</span>
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {currentPatient.patientName} <span className="text-xs font-medium text-slate-400">({currentPatient.patientAge || 'Age N/A'} yrs)</span>
                </h3>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Symptoms:</span>
                  <span className="text-xs text-slate-200 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-medium">
                    {currentPatient.symptoms || "General OPD Consultation"}
                  </span>
                  {currentPatient.appointmentDate && (
                    <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{currentPatient.appointmentDate}</span>
                    </span>
                  )}
                  {currentPatient.timeSlot && (
                    <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{currentPatient.timeSlot}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest sm:text-right">Calling Token</p>
                  <p className="text-2xl sm:text-3xl font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20 inline-block font-mono">
                    {currentPatient.tokenNumber}
                  </p>
                </div>
                <button
                  onClick={handleCancelConsultation}
                  className="text-xs text-red-400 hover:text-red-300 font-bold underline transition-colors pt-1"
                  title="Return patient to queue if called accidentally"
                >
                  Cancel / Return to Queue
                </button>
              </div>
            </div>

            {/* 📷 SCANNED PRESCRIPTION OCR CARD (From Patient Mobile App / ML Kit) */}
            {getPatientOcrText(currentPatient) ? (
              <div className="mb-4 sm:mb-5 p-3.5 sm:p-4 rounded-xl bg-indigo-950/40 border-2 border-indigo-500/40 relative shadow-lg shadow-indigo-500/10">
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                    <Scan className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Patient Scanned Paper Rx (ML Kit OCR)</span>
                  </span>
                  <button 
                    type="button" 
                    onClick={handleAppendScannedNotes}
                    className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <span>+</span> Insert into Prescription
                  </button>
                </div>
                <div className="bg-slate-950/90 rounded-lg p-3 border border-indigo-900/60 text-xs sm:text-sm text-slate-200 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed shadow-inner">
                  {getPatientOcrText(currentPatient)}
                </div>
              </div>
            ) : (
              <div className="mb-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>No paper prescription scanned for this checkup</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">ML Kit OCR Ready</span>
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
                <label className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-teal-400" />
                  <span>Digital E-Prescription & Advice</span>
                </label>
                {prescriptionText && (
                  <button onClick={() => setPrescriptionText("")} className="text-[11px] text-slate-500 hover:text-red-400 transition-colors">Clear</button>
                )}
              </div>
              <textarea 
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                placeholder="Type medicines or click quick prescribing chips above..."
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
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 sm:py-4 rounded-xl text-base shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Finish Consultation & Sync to Pharmacy</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 sm:py-16 opacity-40">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-800/80 border border-slate-700/60 rounded-3xl flex items-center justify-center mb-4 sm:mb-6 text-slate-400 shadow-inner">
              <Stethoscope className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-1 sm:mb-2 tracking-tight">Cabin is Ready</h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm px-4">Call the next patient from the waiting queue on the left to begin consultation.</p>
          </div>
        )}
      </div>

    </div>
  );
}