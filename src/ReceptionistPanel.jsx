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

  const groupedQueues = {};
  doctorsList.forEach(doc => { groupedQueues[doc.name] = []; });
  todaysPatients.forEach(patient => {
    if (groupedQueues[patient.doctorName]) groupedQueues[patient.doctorName].push(patient);
    else groupedQueues[patient.doctorName] = [patient];
  });

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Front Desk Control Center</h1>
            <p className="text-slate-500 mt-0.5 sm:mt-1 text-xs sm:text-sm">Schedule appointments and monitor today's active slots</p>
          </div>
          <div className="text-left sm:text-right">
             <span className="bg-slate-800 text-white px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-widest">
               ID: {hospitalId}
             </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          
          <div className="xl:col-span-1 bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-slate-100 h-fit">
            <h2 className="text-lg sm:text-xl font-bold text-slate-700 mb-4 sm:mb-6 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">📅</span>
              Schedule Appointment
            </h2>

            <form onSubmit={handleSlotBooking} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1">Patient Name</label>
                <input type="text" required value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="e.g. John Doe" className="w-full px-3.5 py-2.5 text-sm rounded-lg border focus:border-indigo-500 focus:ring-2 outline-none transition-all" />
              </div>
              
              <div className="flex gap-3 sm:gap-4">
                <div className="w-1/3">
                  <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1">Age</label>
                  <input type="number" required value={patientAge} onChange={(e) => setPatientAge(e.target.value)} placeholder="e.g. 45" className="w-full px-3.5 py-2.5 text-sm rounded-lg border focus:border-indigo-500 focus:ring-2 outline-none transition-all" />
                </div>
                <div className="w-2/3">
                  <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1">Symptoms</label>
                  <input type="text" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Fever, cough, etc." className="w-full px-3.5 py-2.5 text-sm rounded-lg border focus:border-indigo-500 focus:ring-2 outline-none transition-all" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1">Assign to Doctor</label>
                <select required value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-lg border focus:border-indigo-500 focus:ring-2 outline-none bg-white transition-all">
                  <option value="" disabled>-- Select Doctor --</option>
                  {doctorsList.map((doc) => <option key={doc.id} value={doc.name}>{doc.name} ({doc.specialty})</option>)}
                </select>
              </div>

              <div className="border-t border-slate-100 pt-3 sm:pt-4 mt-2">
                <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1">Appointment Date</label>
                <input type="date" required value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-lg border focus:border-indigo-500 focus:ring-2 outline-none transition-all mb-3 sm:mb-4" />
                
                {!isEmergency && (
                  <>
                    <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1">Select Time Slot</label>
                    <select required value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-lg border focus:border-indigo-500 focus:ring-2 outline-none bg-white transition-all">
                      <option value="" disabled>-- Select Time --</option>
                      {generateTimeSlots().map(slot => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                  </>
                )}
              </div>

              <div onClick={() => setIsEmergency(!isEmergency)} className={`cursor-pointer border-2 rounded-xl p-3 flex items-center transition-all mt-3 ${isEmergency ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${isEmergency ? 'bg-red-500 border-red-500' : 'bg-white border-slate-300'}`}>
                  {isEmergency && <span className="text-white font-bold text-xs">✓</span>}
                </div>
                <div>
                  <h3 className={`font-bold text-xs sm:text-sm ${isEmergency ? 'text-red-700' : 'text-slate-700'}`}>Emergency Walk-In</h3>
                  <p className="text-[10px] text-slate-500">Overrides slots and pushes to top of queue</p>
                </div>
              </div>

              {successMessage && <div className="bg-indigo-50 text-indigo-700 p-3 rounded-lg font-bold text-center text-xs sm:text-sm shadow-sm border border-indigo-100">✅ {successMessage}</div>}

              <button type="submit" disabled={isSubmitting} className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base text-white transition-all mt-3 active:scale-98 ${isSubmitting ? 'bg-slate-400' : (isEmergency ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200')}`}>
                {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>

          <div className="xl:col-span-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-700 mb-4 sm:mb-6 flex items-center">
              <span className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">☀️</span>
              Today's Live Queue
            </h2>
            
            {doctorsList.length === 0 ? (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 text-center text-slate-500 text-sm">
                No doctors registered yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {Object.entries(groupedQueues).map(([doctorName, patients]) => (
                  <div key={doctorName} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-80 sm:h-96">
                    
                    <div className="bg-slate-800 p-3.5 sm:p-4 text-white flex justify-between items-center rounded-t-2xl">
                      <h3 className="font-bold text-sm sm:text-base truncate max-w-[180px] sm:max-w-none">{doctorName}</h3>
                      <span className={`${patients.length > 0 ? 'bg-blue-500' : 'bg-slate-600'} text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full`}>
                        {patients.length} Today
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 bg-slate-50">
                      {patients.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs sm:text-sm text-slate-400 italic">No appointments for today</div>
                      ) : (
                        <div className="space-y-2">
                          {patients.sort((a, b) => a.timeSlot > b.timeSlot ? 1 : -1).map((patient) => (
                            <div key={patient.id} className={`p-2.5 sm:p-3 rounded-lg border flex justify-between items-center group ${patient.isEmergency ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                              
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <span className={`w-auto px-2 h-9 sm:h-10 rounded-lg flex items-center justify-center font-bold text-[10px] sm:text-xs ${patient.isEmergency ? 'bg-red-200 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                  {patient.timeSlot}
                                </span>
                                
                                <div>
                                  <p className="font-bold text-slate-800 text-xs sm:text-sm">
                                    {patient.patientName} {patient.isEmergency && "🚨"}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-slate-400">Token: {patient.tokenNumber}</p>
                                </div>
                              </div>
                              
                              {/* Cancel Button visible on mobile touch screen without hover */}
                              <button 
                                onClick={() => handleCancelAppointment(patient.id)}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 sm:p-2 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                                title="Cancel Appointment"
                              >
                                ❌
                              </button>
                              
                            </div>
                          ))}
                        </div>
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