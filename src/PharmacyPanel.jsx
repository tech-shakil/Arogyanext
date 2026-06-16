import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

// NEW: Accept hospitalId as a prop!
export default function PharmacyPanel({ hospitalId }) {
  const [pendingOrders, setPendingOrders] = useState([]);

  // Listen for any appointments that have a pending pharmacy order IN THIS HOSPITAL
  useEffect(() => {
    if (!hospitalId) return; // Safety check

    const q = query(
      collection(db, 'appointments'),
      where('hospitalId', '==', hospitalId), // 🔒 MAGIC LINE: Locks data to this hospital
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
    <div className="min-h-screen bg-slate-900 p-8 font-sans text-slate-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-black text-white flex items-center">
              <span className="text-teal-500 text-5xl mr-4">💊</span>
              E-Pharmacy Hub
            </h1>
            <p className="text-slate-400 mt-2 font-medium tracking-wide">Live Prescription Synchronization</p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* NEW: Display the Hospital ID so the Pharmacist knows they are in the right workspace */}
            <div className="hidden md:block text-right">
              <span className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest">
                ID: {hospitalId}
              </span>
            </div>

            <div className="bg-teal-500/10 border border-teal-500/30 px-6 py-3 rounded-2xl text-center">
              <p className="text-teal-400 font-bold text-2xl">{pendingOrders.length}</p>
              <p className="text-teal-500/70 text-xs font-black uppercase tracking-widest">Pending</p>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        {pendingOrders.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-16 text-center">
            <span className="text-6xl mb-4 block opacity-50">☕</span>
            <h2 className="text-2xl font-bold text-slate-400 mb-2">Queue is clear</h2>
            <p className="text-slate-500">Waiting for doctors to send new prescriptions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingOrders.map(order => (
              <div key={order.id} className="bg-slate-800 border-t-4 border-t-teal-500 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                
                {/* Emergency Flasher */}
                {order.isEmergency && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                    Urgent
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Patient</p>
                  <h3 className="text-2xl font-black text-white">{order.patientName}</h3>
                  <p className="text-sm text-teal-400 font-medium">Prescribed by {order.doctorName}</p>
                </div>

                <div className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-700">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                    <span className="mr-2">📝</span> Medicine List
                  </p>
                  <p className="text-slate-300 font-medium whitespace-pre-wrap">
                    {order.prescription || "No specific medicines detailed. See physical notes."}
                  </p>
                </div>

                <button 
                  onClick={() => handleDispense(order.id)}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-teal-500/20 active:scale-95"
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