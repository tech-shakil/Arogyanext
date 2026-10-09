import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, onSnapshot, query, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import { 
  Users, 
  AlertTriangle, 
  Stethoscope, 
  Clock, 
  Calendar, 
  Search, 
  X, 
  CheckCircle2, 
  UserPlus, 
  Loader2, 
  FileText,
  Activity,
  Flame,
  Building2,
  Trash2
} from 'lucide-react';

export default function ReceptionistPanel({ hospitalId }) {
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('');

  const [doctorsList, setDoctorsList] = useState([]);
  const [todaysPatients, setTodaysPatients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmergencyOnly, setFilterEmergencyOnly] = useState(false);

  const symptomPresets = [
    "Fever", "Cough & Cold", "Headache", "Chest Pain",
    "Abdominal Pain", "Diabetes Review", "Hypertension", "Acute Trauma"
  ];

  const handlePresetSymptom = (preset) => {
    if (symptoms.toLowerCase().includes(preset.toLowerCase())) return;
    setSymptoms(prev => prev ? `${prev}, ${preset}` : preset);
  };

  const generateTimeSlots = () => {
    return [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
      "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
      "04:00 PM", "04:30 PM", "05:00 PM"
    ];
  };

  useEffect(() => {
    if (!hospitalId) return;
    const fetchDoctors = async () => {
      try {
        const q = query(collection(db, 'doctors'), where("hospitalId", "==", hospitalId));
        const querySnapshot = await getDocs(q);
        setDoctorsList(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };
    fetchDoctors();
  }, [hospitalId]);

  useEffect(() => {
    if (!hospitalId) return;

    const todayStr = new Date().toISOString().split('T')[0];

    const q = query(
      collection(db, 'appointments'),
      where("hospitalId", "==", hospitalId),
      where("status", "==", "Waiting"),
      where("appointmentDate", "==", todayStr),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTodaysPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [hospitalId]);

  const handleSlotBooking = async (e) => {
    e.preventDefault();
    if (!timeSlot && !isEmergency) {
      alert("Please select an appointment time slot.");
      return;
    }

    setIsSubmitting(true);
    try {
      const tokenPrefix = isEmergency ? "E-" : "S-";
      const generatedToken = `${tokenPrefix}${Math.floor(Math.random() * 90) + 10}`;

      await addDoc(collection(db, 'appointments'), {
        tokenNumber: generatedToken,
        patientName: patientName.trim(),
        patientAge: patientAge.trim(),
        symptoms: symptoms.trim(),
        doctorName: selectedDoctor,
        hospitalId: hospitalId,
        isEmergency: isEmergency,
        status: "Waiting",
        appointmentDate: appointmentDate,
        timeSlot: isEmergency ? "IMMEDIATE" : timeSlot,
        timestamp: new Date()
      });

      setSuccessMessage(`Appointment confirmed for ${patientName.trim()} (${generatedToken}) at ${isEmergency ? 'IMMEDIATE (Priority)' : timeSlot}.`);
      setPatientName(''); 
      setPatientAge(''); 
      setSymptoms(''); 
      setTimeSlot(''); 
      setIsEmergency(false);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to register appointment. Please check connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointmentId, pName) => {
    const isConfirmed = window.confirm(`Cancel OPD appointment for ${pName || 'this patient'}? This will remove them from the queue.`);
    if (!isConfirmed) return;

    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status: 'Cancelled',
        cancelledAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Failed to cancel appointment. Please try again.");
    }
  };

  // Filter patients by search & emergency filter
  const filteredPatients = todaysPatients.filter(patient => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      patient.patientName?.toLowerCase().includes(q) ||
      patient.tokenNumber?.toLowerCase().includes(q);
    const matchesEmergency = !filterEmergencyOnly || patient.isEmergency;
    return matchesSearch && matchesEmergency;
  });

  const groupedQueues = {};
  doctorsList.forEach(doc => { groupedQueues[doc.name] = []; });
  filteredPatients.forEach(patient => {
    if (groupedQueues[patient.doctorName]) groupedQueues[patient.doctorName].push(patient);
    else groupedQueues[patient.doctorName] = [patient];
  });

  const emergencyCount = todaysPatients.filter(p => p.isEmergency).length;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans" style={{ background: 'var(--surface-app)' }}>
      <div className="max-w-7xl mx-auto">

        {/* --- HEADER --- */}
        <div className="mb-5 sm:mb-6 border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--blue-600)', letterSpacing: '0.04em' }}>
                Front Desk Operations
              </p>
              <span className="badge badge--positive text-[10px]">
                <Activity className="w-3 h-3" />
                OPD Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>Patient Intake & Triage Desk</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-semibold block" style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}>Hospital Facility</span>
              <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>{hospitalId}</span>
            </div>
            <div className="px-3 py-1.5 rounded-md border text-xs font-medium" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* --- QUICK STATS ROW --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 sm:mb-6">
          <div className="p-3.5 sm:p-4 rounded-lg border flex items-center justify-between" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
            <div>
              <p className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.03em' }}>Waiting Today</p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{todaysPatients.length}</p>
            </div>
            <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: 'var(--blue-50)' }}>
              <Users className="w-4 h-4" style={{ color: 'var(--blue-600)' }} />
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-lg border flex items-center justify-between" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
            <div>
              <p className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.03em' }}>Urgent Triage</p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5" style={{ color: emergencyCount > 0 ? 'var(--danger-500)' : 'var(--text-primary)' }}>{emergencyCount}</p>
            </div>
            <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: emergencyCount > 0 ? 'var(--danger-50)' : 'var(--surface-secondary)' }}>
              <AlertTriangle className="w-4 h-4" style={{ color: emergencyCount > 0 ? 'var(--danger-500)' : 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-lg border flex items-center justify-between" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
            <div>
              <p className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.03em' }}>Doctors on Duty</p>
              <p className="text-xl sm:text-2xl font-bold mt-0.5" style={{ color: 'var(--positive-500)' }}>{doctorsList.length}</p>
            </div>
            <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: 'var(--positive-50)' }}>
              <Stethoscope className="w-4 h-4" style={{ color: 'var(--positive-500)' }} />
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-lg border flex items-center justify-between" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
            <div>
              <p className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.03em' }}>Next Available Slot</p>
              <p className="text-sm sm:text-base font-bold mt-1" style={{ color: 'var(--blue-600)' }}>{generateTimeSlots()[0]}</p>
            </div>
            <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: 'var(--blue-50)' }}>
              <Clock className="w-4 h-4" style={{ color: 'var(--blue-600)' }} />
            </div>
          </div>
        </div>

        {/* --- MAIN WORKSPACE GRID --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">

          {/* PATIENT INTAKE FORM */}
          <div className="xl:col-span-1">
            <div className="p-4 sm:p-5 rounded-lg border" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
              <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <UserPlus className="w-4 h-4" style={{ color: 'var(--blue-600)' }} />
                  Register Patient Check-In
                </h2>
                {isEmergency && (
                  <span className="badge badge--danger text-[10px]">
                    <Flame className="w-3 h-3" />
                    Priority Mode
                  </span>
                )}
              </div>

              <form onSubmit={handleSlotBooking} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.03em' }}>
                    Patient Full Name <span style={{ color: 'var(--danger-500)' }}>*</span>
                  </label>
                  <input
                    type="text" required value={patientName} onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-3 py-2 rounded-md border outline-none text-sm transition-colors font-medium"
                    style={{ borderColor: 'var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.03em' }}>
                      Age <span style={{ color: 'var(--danger-500)' }}>*</span>
                    </label>
                    <input
                      type="number" required value={patientAge} onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="42"
                      className="w-full px-3 py-2 rounded-md border outline-none text-sm transition-colors font-medium"
                      style={{ borderColor: 'var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                      onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.03em' }}>
                      Primary Symptoms
                    </label>
                    <input
                      type="text" value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Fever, cough, body pain..."
                      className="w-full px-3 py-2 rounded-md border outline-none text-sm transition-colors font-medium"
                      style={{ borderColor: 'var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                      onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
                    />
                  </div>
                </div>

                {/* Quick Clinical Symptom Tags */}
                <div className="p-2.5 rounded-md border" style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)' }}>
                  <span className="text-[10px] font-semibold uppercase block mb-1.5" style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                    Quick Symptom Tags
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {symptomPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePresetSymptom(preset)}
                        className="px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer"
                        style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue-500)'; e.currentTarget.style.color = 'var(--blue-600)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.03em' }}>
                    Assign to Physician <span style={{ color: 'var(--danger-500)' }}>*</span>
                  </label>
                  <select
                    required value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border outline-none text-sm transition-colors font-medium cursor-pointer"
                    style={{ borderColor: 'var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                  >
                    <option value="" disabled>-- Select Doctor --</option>
                    {doctorsList.map((doc) => (
                      <option key={doc.id} value={doc.name}>
                        {doc.name} ({doc.specialty || 'General OPD'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-t pt-3 space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.03em' }}>
                      Appointment Date <span style={{ color: 'var(--danger-500)' }}>*</span>
                    </label>
                    <input
                      type="date" required value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border outline-none text-sm font-medium"
                      style={{ borderColor: 'var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  {!isEmergency && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.03em' }}>
                        Time Slot <span style={{ color: 'var(--danger-500)' }}>*</span>
                      </label>
                      <select
                        required value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border outline-none text-sm font-medium cursor-pointer"
                        style={{ borderColor: 'var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                      >
                        <option value="" disabled>-- Select Time Slot --</option>
                        {generateTimeSlots().map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Emergency Triage Toggle */}
                <div
                  onClick={() => setIsEmergency(!isEmergency)}
                  className="cursor-pointer border rounded-md p-3 flex items-start gap-3 transition-colors"
                  style={{
                    borderColor: isEmergency ? 'var(--danger-500)' : 'var(--border-default)',
                    background: isEmergency ? 'var(--danger-50)' : 'var(--surface-secondary)'
                  }}
                >
                  <div className="mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: isEmergency ? 'var(--danger-500)' : 'var(--border-strong)',
                      background: isEmergency ? 'var(--danger-500)' : 'var(--surface-primary)'
                    }}
                  >
                    {isEmergency && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs" style={{ color: isEmergency ? 'var(--danger-600)' : 'var(--text-primary)' }}>
                      Emergency Walk-In Case
                    </h3>
                    <p className="text-[11px] mt-0.5 leading-snug" style={{ color: isEmergency ? 'var(--danger-600)' : 'var(--text-tertiary)' }}>
                      Overrides standard slots, issues priority token (E-XX) and assigns to immediate doctor attention.
                    </p>
                  </div>
                </div>

                {successMessage && (
                  <div className="p-3 rounded-md text-xs font-medium border flex items-center gap-2" style={{ background: 'var(--positive-50)', borderColor: 'var(--positive-100)', color: 'var(--positive-600)' }}>
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <button
                  type="submit" disabled={isSubmitting}
                  className="w-full py-2.5 rounded-md font-semibold text-sm text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: isEmergency ? 'var(--danger-500)' : 'var(--blue-600)' }}
                  onMouseEnter={e => e.currentTarget.style.background = isEmergency ? 'var(--danger-600)' : 'var(--blue-700)'}
                  onMouseLeave={e => e.currentTarget.style.background = isEmergency ? 'var(--danger-500)' : 'var(--blue-600)'}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Registering...' : (isEmergency ? 'Issue Emergency Token' : 'Confirm & Dispatch Token')}
                </button>
              </form>
            </div>
          </div>

          {/* LIVE QUEUE CONSOLE */}
          <div className="xl:col-span-2 flex flex-col gap-4">

            {/* Queue Search & Filter Bar */}
            <div className="p-3 rounded-lg border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter queue by patient name or token number (e.g. S-12)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 text-xs rounded-md border outline-none font-medium"
                  style={{ borderColor: 'var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setFilterEmergencyOnly(!filterEmergencyOnly)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 border"
                style={{
                  background: filterEmergencyOnly ? 'var(--danger-500)' : 'var(--surface-secondary)',
                  borderColor: filterEmergencyOnly ? 'var(--danger-500)' : 'var(--border-default)',
                  color: filterEmergencyOnly ? 'white' : 'var(--text-secondary)'
                }}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Urgent Priority Only</span>
              </button>
            </div>

            {/* DOCTOR CABIN QUEUES */}
            {doctorsList.length === 0 ? (
              <div className="p-8 rounded-lg border text-center" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
                <Stethoscope className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No doctors registered for this facility.</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Please onboard clinical staff in the portal.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(groupedQueues).map(([doctorName, patients]) => (
                  <div key={doctorName} className="rounded-lg border flex flex-col h-96 overflow-hidden" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>

                    {/* Cabin Header */}
                    <div className="p-3 sm:p-3.5 border-b flex justify-between items-center" style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--blue-50)' }}>
                          <Stethoscope className="w-4 h-4" style={{ color: 'var(--blue-600)' }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-xs sm:text-sm truncate max-w-[180px]" style={{ color: 'var(--text-primary)' }}>
                            {doctorName}
                          </h3>
                          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>OPD Cabin Queue</span>
                        </div>
                      </div>
                      <span className={`badge ${patients.length > 0 ? 'badge--blue' : 'badge--neutral'} text-[10px]`}>
                        {patients.length} in queue
                      </span>
                    </div>

                    {/* Patient Queue List */}
                    <div className="flex-1 overflow-y-auto p-2.5 space-y-2" style={{ background: 'var(--surface-app)' }}>
                      {patients.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                          <Users className="w-6 h-6 mb-1 opacity-30" style={{ color: 'var(--text-muted)' }} />
                          <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>No patients waiting</p>
                        </div>
                      ) : (
                        patients
                          .sort((a, b) => (a.isEmergency === b.isEmergency ? (a.timeSlot > b.timeSlot ? 1 : -1) : a.isEmergency ? -1 : 1))
                          .map((patient) => {
                            const initials = patient.patientName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'PT';
                            return (
                              <div
                                key={patient.id}
                                className="p-2.5 rounded-md border flex justify-between items-center transition-colors"
                                style={{
                                  background: patient.isEmergency ? 'var(--danger-50)' : 'var(--surface-primary)',
                                  borderColor: patient.isEmergency ? 'var(--danger-100)' : 'var(--border-subtle)'
                                }}
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <div 
                                    className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0"
                                    style={{
                                      background: patient.isEmergency ? 'var(--danger-500)' : 'var(--blue-50)',
                                      color: patient.isEmergency ? 'white' : 'var(--blue-600)'
                                    }}
                                  >
                                    {initials}
                                  </div>

                                  <div className="truncate">
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-semibold text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                                        {patient.patientName}
                                      </p>
                                      {patient.isEmergency && (
                                        <span className="badge badge--danger text-[9px]">
                                          URGENT
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded" style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-default)', color: 'var(--blue-600)' }}>
                                        {patient.tokenNumber}
                                      </span>
                                      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                                        {patient.timeSlot}
                                      </span>
                                      {patient.scannedPrescriptionText && (
                                        <span className="badge badge--neutral text-[9px] flex items-center gap-0.5">
                                          <FileText className="w-2.5 h-2.5" />
                                          OCR
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleCancelAppointment(patient.id, patient.patientName)}
                                  className="p-1 rounded text-[11px] transition-colors cursor-pointer flex-shrink-0"
                                  style={{ color: 'var(--text-muted)' }}
                                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger-500)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                                  title="Cancel Appointment"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}