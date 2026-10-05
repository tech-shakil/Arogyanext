import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function PharmacyPanel({ hospitalId }) {
  const [pendingOrders, setPendingOrders] = useState([]);

  // Listen for any appointments that have a pending pharmacy order IN THIS HOSPITAL
  useEffect(() => {
    if (!hospitalId) return;

    const q = query(
      collection(db, 'appointments'),
      where('hospitalId', '==', hospitalId),
      where('pharmacyStatus', '==', 'Pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingOrders(orders);
    });

    return () => unsubscribe();
  }, [hospitalId]);

  // Mark the medicine as packed and handed to the patient
  const handleDispense = async (id) => {
    try {
      const orderRef = doc(db, 'appointments', id);
      await updateDoc(orderRef, {
        pharmacyStatus: 'Dispensed'
      });
    } catch (error) {
      console.error("Error updating pharmacy status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-3 sm:p-6 md:p-8 font-sans text-slate-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-10 border-b border-slate-800 pb-4 sm:pb-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center">
              <span className="text-teal-500 text-3xl sm:text-5xl mr-3">💊</span>
              E-Pharmacy Hub
            </h1>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm font-medium tracking-wide">Live Prescription Synchronization</p>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="text-left sm:text-right">
              <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                ID: {hospitalId}
              </span>
            </div>

            <div className="bg-teal-500/10 border border-teal-500/30 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-center">
              <p className="text-teal-400 font-bold text-xl sm:text-2xl">{pendingOrders.length}</p>
              <p className="text-teal-500/70 text-[10px] sm:text-xs font-black uppercase tracking-widest">Pending</p>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        {pendingOrders.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center">
            <span className="text-4xl sm:text-6xl mb-3 sm:mb-4 block opacity-50">☕</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-400 mb-1 sm:mb-2">Queue is clear</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Waiting for doctors to send new prescriptions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {pendingOrders.map(order => (
              <div key={order.id} className="bg-slate-800 border-t-4 border-t-teal-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden group">
                
                {/* Emergency Flasher */}
                {order.isEmergency && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-bl-lg">
                    Urgent
                  </div>
                )}

                <div className="mb-3 sm:mb-4">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5 sm:mb-1">Patient</p>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{order.patientName}</h3>
                  <p className="text-xs sm:text-sm text-teal-400 font-medium">Prescribed by {order.doctorName}</p>
                </div>

                <div className="bg-slate-900 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-700">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center">
                    <span className="mr-1.5">📝</span> Medicine List
                  </p>
                  <p className="text-slate-300 font-medium text-xs sm:text-sm whitespace-pre-wrap">
                    {order.prescription || "No specific medicines detailed. See physical notes."}
                  </p>
                </div>

                <button 
                  onClick={() => handleDispense(order.id)}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black py-3 sm:py-4 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-95"
                >
                  Mark as Dispensed ✅
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}