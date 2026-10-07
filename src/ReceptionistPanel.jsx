import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, onSnapshot, query, orderBy, where, doc, updateDoc } from 'firebase/firestore';

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
    "Fever 🌡️", "Cough & Cold 😷", "Headache 🤕", "Chest Pain 🫀", 
    "Stomach Pain 🤢", "Diabetes 🩸", "Hypertension 💓", "Injury 🩹"
  ];

  const handlePresetSymptom = (chip) => {
    const cleanChip = chip.split(' ')[0];
    if (symptoms.includes(cleanChip)) return;
    setSymptoms(prev => prev ? `${prev}, ${cleanChip}` : cleanChip);
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
      const q = query(collection(db, 'doctors'), where("hospitalId", "==", hospitalId));
      const querySnapshot = await getDocs(q);
      setDoctorsList(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
      alert("Please select a time slot.");
      return;
    }

    setIsSubmitting(true);
    try {
      const tokenPrefix = isEmergency ? "E-" : "S-";
      const generatedToken = `${tokenPrefix}${Math.floor(Math.random() * 90) + 10}`;

      await addDoc(collection(db, 'appointments'), {
        tokenNumber: generatedToken,
        patientName,
        patientAge,
        symptoms,
        doctorName: selectedDoctor,
        hospitalId: hospitalId,
        isEmergency: isEmergency,
        status: "Waiting",
        appointmentDate: appointmentDate, 
        timeSlot: isEmergency ? "IMMEDIATE" : timeSlot, 
        timestamp: new Date() 
      });

      setSuccessMessage(`Booked for ${appointmentDate} at ${isEmergency ? 'IMMEDIATE' : timeSlot}. Token: ${generatedToken}`);
      setPatientName(''); setPatientAge(''); setSymptoms(''); setTimeSlot(''); setIsEmergency(false);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error("Error booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    const isConfirmed = window.confirm("Are you sure you want to cancel this appointment? This cannot be undone.");
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
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- TOP HEADER & CLINIC METRICS --- */}
        <div className="mb-6 sm:mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Front Desk Control Center</h1>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">OPD Active</span>
            </div>
            <p className="text-slate-500 mt-1 text-xs sm:text-sm">Instant patient check-in, real-time doctor assignment & slot queue management</p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Facility Code</span>
              <span className="text-xs sm:text-sm font-mono font-black text-slate-800">{hospitalId}</span>
            </div>
            <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Today's Date</span>
              <span className="text-xs sm:text-sm font-bold text-slate-700">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* --- QUICK STATS ROW --- */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider">Waiting Today</p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5">{todaysPatients.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">⏳</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider">Emergency Walk-ins</p>
              <p className="text-xl sm:text-2xl font-black text-red-600 mt-0.5">{emergencyCount}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${emergencyCount > 0 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>🚨</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider">Doctors On Duty</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">{doctorsList.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">🩺</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider">Next Slot Time</p>
              <p className="text-base sm:text-lg font-black text-indigo-600 mt-0.5">{generateTimeSlots()[0]}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">⏱️</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          
          {/* --- SCHEDULE APPOINTMENT FORM --- */}
          <div className="xl:col-span-1 bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-slate-200/90 h-fit">
            <h2 className="text-base sm:text-lg font-black text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-600 w-7 h-7 rounded-lg flex items-center justify-center text-xs">📅</span>
                <span>Book Patient Check-In</span>
              </span>
              {isEmergency && (
                <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider animate-pulse">
                  Emergency Mode
                </span>
              )}
            </h2>

            <form onSubmit={handleSlotBooking} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Patient Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" required value={patientName} onChange={(e) => setPatientName(e.target.value)} 
                  placeholder="e.g. John Doe" 
                  className="w-full px-4 py-3 text-sm rounded-xl border-2 border-slate-300 bg-slate-50/70 hover:bg-white focus:bg-white text-slate-900 font-semibold placeholder:text-slate-500 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm" 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" required value={patientAge} onChange={(e) => setPatientAge(e.target.value)} 
                    placeholder="45" 
                    className="w-full px-4 py-3 text-sm rounded-xl border-2 border-slate-300 bg-slate-50/70 hover:bg-white focus:bg-white text-slate-900 font-semibold placeholder:text-slate-500 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm" 
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Symptoms
                  </label>
                  <input 
                    type="text" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} 
                    placeholder="Fever, cough, etc." 
                    className="w-full px-4 py-3 text-sm rounded-xl border-2 border-slate-300 bg-slate-50/70 hover:bg-white focus:bg-white text-slate-900 font-semibold placeholder:text-slate-500 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm" 
                  />
                </div>
              </div>

              {/* 1-Tap Symptom Suggestion Chips */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">⚡ 1-Tap Quick Symptoms:</span>
                <div className="flex flex-wrap gap-1.5">
                  {symptomPresets.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handlePresetSymptom(chip)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 border border-slate-200 transition-all active:scale-95 text-slate-700 shadow-xs"
                    >
                      +{chip}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assign to Doctor <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    required value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} 
                    className="w-full px-4 py-3 text-sm rounded-xl border-2 border-slate-300 bg-slate-50/70 hover:bg-white focus:bg-white text-slate-900 font-semibold focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm cursor-pointer appearance-none pr-10"
                  >
                    <option value="" disabled className="text-slate-400 font-normal">-- Select Doctor --</option>
                    {doctorsList.map((doc) => (
                      <option key={doc.id} value={doc.name} className="text-slate-900 font-medium">
                        {doc.name} ({doc.specialty || 'General'})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200/80 pt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Appointment Date <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" required value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} 
                    className="w-full px-4 py-3 text-sm rounded-xl border-2 border-slate-300 bg-slate-50/70 hover:bg-white focus:bg-white text-slate-900 font-semibold focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm" 
                  />
                </div>
                
                {!isEmergency && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Select Time Slot <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        required value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} 
                        className="w-full px-4 py-3 text-sm rounded-xl border-2 border-slate-300 bg-slate-50/70 hover:bg-white focus:bg-white text-slate-900 font-semibold focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm cursor-pointer appearance-none pr-10"
                      >
                        <option value="" disabled className="text-slate-400 font-normal">-- Select Time --</option>
                        {generateTimeSlots().map(slot => (
                          <option key={slot} value={slot} className="text-slate-900 font-medium">{slot}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Walk-In Toggle */}
              <div 
                onClick={() => setIsEmergency(!isEmergency)} 
                className={`cursor-pointer border-2 rounded-2xl p-3.5 flex items-center transition-all ${
                  isEmergency 
                    ? 'border-red-500 bg-red-50/80 shadow-md shadow-red-500/10' 
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 ${isEmergency ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-slate-400'}`}>
                  {isEmergency && <span className="font-black text-xs">✓</span>}
                </div>
                <div>
                  <h3 className={`font-black text-xs sm:text-sm ${isEmergency ? 'text-red-700' : 'text-slate-800'}`}>Emergency Walk-In Case</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Overrides slots, generates priority token (E-XX) & puts at front of queue</p>
                </div>
              </div>

              {successMessage && (
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl font-bold text-center text-xs sm:text-sm shadow-sm border border-emerald-200 animate-fadeIn">
                  ✅ {successMessage}
                </div>
              )}

              <button 
                type="submit" disabled={isSubmitting} 
                className={`w-full py-3.5 sm:py-4 rounded-xl font-black text-sm sm:text-base text-white transition-all active:scale-98 shadow-md ${
                  isSubmitting ? 'bg-slate-400' : (isEmergency ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30')
                }`}
              >
                {isSubmitting ? 'Generating Token...' : (isEmergency ? '🚨 Issue Emergency Token' : 'Confirm & Issue Token')}
              </button>
            </form>
          </div>

          {/* --- LIVE QUEUE DASHBOARD --- */}
          <div className="xl:col-span-2 flex flex-col">
            
            {/* Queue Search & Emergency Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search patient by name or token (e.g. S-14)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border-2 border-slate-300 bg-slate-50/70 focus:bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:border-indigo-600 outline-none transition-all shadow-sm"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterEmergencyOnly(!filterEmergencyOnly)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    filterEmergencyOnly 
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>🚨</span>
                  <span>Emergencies Only</span>
                </button>
              </div>
            </div>

            {doctorsList.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                No doctors registered yet. Please add a doctor in the portal.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 flex-1">
                {Object.entries(groupedQueues).map(([doctorName, patients]) => (
                  <div key={doctorName} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-96">
                    
                    {/* Cabin Header */}
                    <div className="bg-slate-900 p-3.5 sm:p-4 text-white flex justify-between items-center rounded-t-2xl border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-base">👨‍⚕️</span>
                        <div>
                          <h3 className="font-bold text-sm sm:text-base leading-tight truncate max-w-[170px] sm:max-w-none">{doctorName}</h3>
                          <span className="text-[10px] text-slate-400 font-mono">Cabin Waiting List</span>
                        </div>
                      </div>
                      <span className={`${patients.length > 0 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'} text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full`}>
                        {patients.length} Waiting
                      </span>
                    </div>

                    {/* Patient Cards List */}
                    <div className="flex-1 overflow-y-auto p-2.5 bg-slate-50 space-y-2">
                      {patients.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                          <span className="text-2xl mb-1 opacity-50">☕</span>
                          <p className="text-xs font-medium italic">No patients in queue</p>
                        </div>
                      ) : (
                        patients.sort((a, b) => (a.isEmergency === b.isEmergency ? (a.timeSlot > b.timeSlot ? 1 : -1) : a.isEmergency ? -1 : 1)).map((patient) => {
                          const initials = patient.patientName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'PT';
                          return (
                            <div 
                              key={patient.id} 
                              className={`p-3 rounded-xl border flex justify-between items-center transition-all hover:shadow-sm ${
                                patient.isEmergency ? 'bg-red-50/90 border-red-200' : 'bg-white border-slate-200 shadow-sm'
                              }`}
                            >
                              <div className="flex items-center space-x-3 truncate">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                                  patient.isEmergency ? 'bg-red-200 text-red-800' : 'bg-indigo-100 text-indigo-700'
                                }`}>
                                  {initials}
                                </div>
                                
                                <div className="truncate">
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-black text-slate-800 text-xs sm:text-sm truncate">
                                      {patient.patientName}
                                    </p>
                                    {patient.isEmergency && (
                                      <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-black uppercase tracking-wider animate-pulse">
                                        URGENT
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                                      {patient.tokenNumber}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">{patient.timeSlot}</span>
                                    {patient.scannedPrescriptionText && (
                                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1 py-0.2 rounded">
                                        📷 OCR Rx
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => handleCancelAppointment(patient.id)}
                                className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0 ml-2"
                                title="Cancel Appointment"
                              >
                                ✕
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