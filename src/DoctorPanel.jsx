import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { 
  Stethoscope, 
  Scan, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Pill, 
  FileText,
  Clipboard,
  Search,
  ArrowRight,
  XCircle
} from 'lucide-react';

export default function DoctorPanel({ hospitalId, doctorName }) {
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [currentStatus, setCurrentStatus] = useState("Active");
  const [queueSearch, setQueueSearch] = useState("");
  const consultationRef = useRef(null);
  const [completedToast, setCompletedToast] = useState("");

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

    const appointmentsRef = collection(db, 'appointments');
    const isMaster = hospitalId === 'SYSTEM_MASTER';

    const q = isMaster
      ? query(appointmentsRef, where("status", "in", ["Waiting", "In Consultation"]))
      : query(appointmentsRef, where("hospitalId", "==", hospitalId), where("status", "in", ["Waiting", "In Consultation"]));

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

  // 4. Complete Consultation & Send to Pharmacy
  const handleComplete = async (sendToPharmacy = true) => {
    if (!currentPatient) return;
    const patientName = currentPatient.patientName || "Patient";
    const tokenNumber = currentPatient.tokenNumber || "";
    const pId = currentPatient.id;

    try {
      const ocrPrescription = getPatientOcrText(currentPatient);
      const finalPrescription = prescriptionText.trim() 
        || ocrPrescription 
        || (sendToPharmacy ? "Consultation Completed — Routine Dispensation / Advice" : "");

      const updateData = { 
        status: 'Completed',
        prescription: finalPrescription, 
        pharmacyStatus: sendToPharmacy ? 'Pending' : 'Skipped',
        completedAt: new Date().toISOString()
      };

      if (sendToPharmacy) {
        updateData.sentToPharmacyAt = new Date().toISOString();
      }

      const hospToSave = currentPatient.hospitalId || hospitalId;
      if (hospToSave) {
        updateData.hospitalId = hospToSave;
      }

      await updateDoc(doc(db, 'appointments', pId), updateData);
      
      // Reset doctor status safely
      if (doctorName) {
        await handleStatusChange("Active").catch(e => console.warn(e));
      }
      if (hospToSave) {
        await setDoc(doc(db, 'queue', hospToSave), {
          activeDoctor: doctorName || 'Doctor',
          status: 'Available',
          lastUpdated: new Date()
        }, { merge: true }).catch(e => console.warn(e));
      }
      
      setCurrentPatient(null);
      setPrescriptionText("");
      setCompletedToast(
        sendToPharmacy 
          ? `Dispatched prescription for ${patientName} (${tokenNumber}) to Pharmacy!`
          : `Consultation completed for ${patientName} (${tokenNumber}).`
      );
      setTimeout(() => setCompletedToast(""), 6000);
    } catch (err) {
      console.error("Error completing consultation:", err);
      alert("Error completing consultation: " + (err.message || err));
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

  const filteredWaiting = waitingPatients.filter(p => 
    !queueSearch || 
    p.patientName?.toLowerCase().includes(queueSearch.toLowerCase()) || 
    p.tokenNumber?.toLowerCase().includes(queueSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-5 font-sans" style={{ background: 'var(--surface-app)' }}>
      
      {/* QUEUE COLUMN */}
      <div className={`w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 rounded-lg border p-4 flex flex-col ${
        currentPatient ? 'order-2 lg:order-1' : 'order-1'
      }`} style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
        
        {/* Doctor Identity & Status */}
        <div className="mb-4 border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Your Workspace</h2>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Dr. {doctorName}</p>
            </div>
            {currentPatient && (
              <span className="badge badge--positive text-[10px]">
                <span className="status-dot status-dot--active"></span>
                In Session
              </span>
            )}
          </div>
          
          {/* Status Toggle */}
          <div className="p-0.5 rounded-md flex border" style={{ borderColor: 'var(--border-default)', background: 'var(--surface-secondary)' }}>
            <button 
              onClick={() => handleStatusChange("Active")}
              className="flex-1 py-1.5 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              style={{ 
                background: currentStatus === "Active" ? 'var(--positive-50)' : 'transparent',
                color: currentStatus === "Active" ? 'var(--positive-600)' : 'var(--text-tertiary)',
                border: currentStatus === "Active" ? '1px solid var(--positive-100)' : '1px solid transparent'
              }}
            >
              <span className="status-dot status-dot--active"></span>
              <span>Active</span>
            </button>
            <button 
              onClick={() => handleStatusChange("Away")}
              className="flex-1 py-1.5 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              style={{ 
                background: currentStatus === "Away" ? 'var(--warning-50)' : 'transparent',
                color: currentStatus === "Away" ? 'var(--warning-600)' : 'var(--text-tertiary)',
                border: currentStatus === "Away" ? '1px solid var(--warning-100)' : '1px solid transparent'
              }}
            >
              <span className="status-dot status-dot--away"></span>
              <span>Away</span>
            </button>
          </div>
        </div>

        {/* Active Patient Banner in Queue */}
        {currentPatient && (
          <div className="mb-3 p-2.5 rounded-md border flex items-center justify-between" style={{ background: 'var(--positive-50)', borderColor: 'var(--positive-100)' }}>
            <div className="flex items-center gap-2 truncate">
              <span className="status-dot status-dot--active animate-pulse-dot"></span>
              <div className="truncate">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--positive-600)' }}>{currentPatient.patientName}</p>
                <p className="text-[10px] font-mono" style={{ color: 'var(--positive-500)' }}>Token: {currentPatient.tokenNumber}</p>
              </div>
            </div>
            <button 
              onClick={() => consultationRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="px-2 py-1 rounded text-[11px] font-semibold transition-colors flex-shrink-0 cursor-pointer"
              style={{ background: 'var(--positive-500)', color: 'white' }}
            >
              View
            </button>
          </div>
        )}

        {/* Queue Header & Search */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="section-header">Waiting Queue ({waitingPatients.length})</h3>
            {waitingPatients.some(p => p.isEmergency) && (
              <span className="badge badge--danger text-[10px]">
                <AlertTriangle className="w-3 h-3" />
                Emergency
              </span>
            )}
          </div>
          
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Filter by name or token..."
              value={queueSearch}
              onChange={(e) => setQueueSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-md border outline-none transition-colors"
              style={{ borderColor: 'var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
            />
          </div>
        </div>
        
        {/* Queue List */}
        <div className="flex-1 max-h-80 lg:max-h-none overflow-y-auto space-y-1.5 pr-0.5">
          {filteredWaiting.length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center">
              <Clipboard className="w-8 h-8 mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>No patients waiting</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Patients will appear here when checked in</p>
            </div>
          ) : (
            filteredWaiting.map(patient => (
              <div 
                key={patient.id} 
                className="p-2.5 rounded-md border transition-colors flex justify-between items-center"
                style={{ 
                  borderColor: patient.isEmergency ? 'var(--danger-100)' : 'var(--border-subtle)',
                  background: patient.isEmergency ? 'var(--danger-50)' : 'var(--surface-primary)',
                  borderLeft: patient.isEmergency ? '3px solid var(--danger-500)' : '3px solid var(--blue-500)'
                }}
              >
                <div className="pr-2 truncate">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-xs truncate" style={{ color: 'var(--text-primary)' }}>{patient.patientName}</p>
                    {patient.isEmergency && (
                      <span className="badge badge--danger text-[9px]">Urgent</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--blue-50)', color: 'var(--blue-600)', border: '1px solid var(--blue-100)' }}>
                      {patient.tokenNumber}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{patient.patientAge}y</span>
                    {getPatientOcrText(patient) && (
                      <span className="badge badge--blue text-[9px]">
                        <Scan className="w-2.5 h-2.5" />
                        OCR
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  disabled={currentPatient !== null}
                  onClick={() => handleCallNext(patient)}
                  className="px-2.5 py-1.5 rounded-md font-semibold text-[11px] transition-colors flex-shrink-0 cursor-pointer flex items-center gap-1"
                  style={{ 
                    background: currentPatient ? 'var(--surface-tertiary)' : (patient.isEmergency ? 'var(--danger-500)' : 'var(--blue-600)'),
                    color: currentPatient ? 'var(--text-muted)' : 'white',
                    cursor: currentPatient ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span>Call In</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CONSULTATION WORKSPACE */}
      <div 
        ref={consultationRef}
        className={`w-full lg:flex-1 rounded-lg border p-4 sm:p-5 lg:p-6 flex flex-col ${
          currentPatient ? 'order-1 lg:order-2' : 'order-2'
        }`}
        style={{ 
          background: 'var(--surface-primary)', 
          borderColor: currentPatient ? 'var(--blue-200)' : 'var(--border-default)' 
        }}
      >
        <h2 className="text-base font-bold mb-4 pb-3 border-b flex items-center justify-between" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }}>
          <span className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4" style={{ color: 'var(--blue-600)' }} />
            <span>Consultation</span>
          </span>
          {currentPatient && (
            <span className="badge badge--positive text-[10px]">
              <span className="status-dot status-dot--active animate-pulse-dot"></span>
              In Session
            </span>
          )}
        </h2>

        {completedToast && (
          <div className="mb-4 p-3 rounded-md border text-xs font-semibold flex items-center gap-2 animate-fadeIn" style={{ background: 'var(--positive-50)', borderColor: 'var(--positive-100)', color: 'var(--positive-600)' }}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{completedToast}</span>
          </div>
        )}

        {currentPatient ? (
          <div className="flex-1 flex flex-col">
            {/* Patient Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4 p-3.5 sm:p-4 rounded-md border" style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)' }}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge badge--positive text-[10px]">Active Patient</span>
                  {currentPatient.isEmergency && (
                    <span className="badge badge--danger text-[10px]">
                      <AlertTriangle className="w-3 h-3" />
                      Priority
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {currentPatient.patientName} <span className="text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>({currentPatient.patientAge || 'N/A'} yrs)</span>
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="section-header text-[10px]">Symptoms:</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded border" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
                    {currentPatient.symptoms || "General Consultation"}
                  </span>
                  {currentPatient.appointmentDate && (
                    <span className="text-[11px] flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-tertiary)', color: 'var(--text-tertiary)' }}>
                      <Calendar className="w-3 h-3" />
                      {currentPatient.appointmentDate}
                    </span>
                  )}
                  {currentPatient.timeSlot && (
                    <span className="text-[11px] flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-tertiary)', color: 'var(--text-tertiary)' }}>
                      <Clock className="w-3 h-3" />
                      {currentPatient.timeSlot}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-2">
                <div>
                  <p className="section-header text-[10px] sm:text-right">Token</p>
                  <p className="text-xl font-bold font-mono px-2.5 py-0.5 rounded-md" style={{ background: 'var(--blue-50)', color: 'var(--blue-600)', border: '1px solid var(--blue-100)' }}>
                    {currentPatient.tokenNumber}
                  </p>
                </div>
                <button
                  onClick={handleCancelConsultation}
                  className="text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                  style={{ color: 'var(--danger-500)' }}
                >
                  <XCircle className="w-3 h-3" />
                  Return to Queue
                </button>
              </div>
            </div>

            {/* OCR Card */}
            {getPatientOcrText(currentPatient) ? (
              <div className="mb-4 p-3 rounded-md border" style={{ background: 'var(--blue-50)', borderColor: 'var(--blue-200)' }}>
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--blue-600)' }}>
                    <Scan className="w-3.5 h-3.5" />
                    Scanned Paper Prescription (OCR)
                  </span>
                  <button 
                    type="button" 
                    onClick={handleAppendScannedNotes}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                    style={{ background: 'var(--blue-600)', color: 'white' }}
                  >
                    Insert into Prescription
                  </button>
                </div>
                <div className="rounded-md p-2.5 border text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed" style={{ background: 'var(--surface-primary)', borderColor: 'var(--blue-100)', color: 'var(--text-secondary)' }}>
                  {getPatientOcrText(currentPatient)}
                </div>
              </div>
            ) : (
              <div className="mb-4 p-2.5 rounded-md border text-xs flex items-center justify-between" style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-tertiary)' }}>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  No paper prescription scanned
                </span>
                <span className="text-[10px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>OCR Ready</span>
              </div>
            )}

            {/* Quick Medications */}
            <div className="mb-3">
              <span className="section-header block text-[10px] mb-1.5">Quick Medications</span>
              <div className="flex flex-wrap gap-1 mb-2">
                {medicinePresets.map((med) => (
                  <button
                    key={med}
                    type="button"
                    onClick={() => handleAppendMedicine(med)}
                    className="px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer"
                    style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue-50)'; e.currentTarget.style.color = 'var(--blue-600)'; e.currentTarget.style.borderColor = 'var(--blue-200)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-secondary)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                  >
                    + {med.split(' ')[1]}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {instructionPresets.map((inst) => (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => handleAppendInstruction(inst)}
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer"
                    style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-subtle)', color: 'var(--text-tertiary)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-tertiary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-primary)'; }}
                  >
                    + {inst}
                  </button>
                ))}
              </div>
            </div>

            {/* Prescription Textarea */}
            <div className="flex-1 flex flex-col mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className="section-header text-[10px] flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5" style={{ color: 'var(--positive-500)' }} />
                  E-Prescription
                </label>
                {prescriptionText && (
                  <button onClick={() => setPrescriptionText("")} className="text-[11px] cursor-pointer transition-colors" style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--danger-500)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >Clear</button>
                )}
              </div>
              <textarea 
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                placeholder="Type medicines or use quick prescription chips above..."
                rows={4}
                className="w-full min-h-[100px] p-3 rounded-md border outline-none resize-y font-mono text-sm leading-relaxed transition-colors"
                style={{ borderColor: 'var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.background = 'var(--surface-primary)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.background = 'var(--surface-secondary)'; }}
              ></textarea>
              <p className="text-[11px] mt-1.5 font-medium flex items-center" style={{ color: 'var(--text-tertiary)' }}>
                <span className="status-dot status-dot--active mr-1.5"></span>
                Prescription auto-syncs to pharmacy on completion.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={() => handleComplete(true)}
                className="flex-1 py-3 rounded-md font-semibold text-sm text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
                style={{ background: 'var(--positive-500)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--positive-600)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--positive-500)'}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete & Send to Pharmacy</span>
              </button>
              <button 
                onClick={() => handleComplete(false)}
                className="py-3 px-3 rounded-md font-medium text-xs border transition-colors cursor-pointer flex items-center justify-center gap-1"
                style={{ borderColor: 'var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-tertiary)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-secondary)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                title="Complete visit without sending prescription to pharmacy"
              >
                <span>Discharge Only</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 sm:py-16">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-4" style={{ background: 'var(--surface-tertiary)' }}>
              <Stethoscope className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Ready for Patients</h3>
            <p className="text-sm max-w-xs" style={{ color: 'var(--text-tertiary)' }}>Call the next patient from the waiting queue to begin consultation.</p>
          </div>
        )}
      </div>

    </div>
  );
}