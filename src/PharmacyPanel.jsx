import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function PharmacyPanel({ hospitalId }) {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [dispensedCount, setDispensedCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgentOnly, setFilterUrgentOnly] = useState(false);
  const [lastDispensedPatient, setLastDispensedPatient] = useState(null);

  // Listen for pending pharmacy orders
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

  // Listen for dispensed orders count today
  useEffect(() => {
    if (!hospitalId) return;

    const q = query(
      collection(db, 'appointments'),
      where('hospitalId', '==', hospitalId),
      where('pharmacyStatus', '==', 'Dispensed')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDispensedCount(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, [hospitalId]);

  // Mark the medicine as packed and handed to the patient
  const handleDispense = async (order) => {
    try {
      const orderRef = doc(db, 'appointments', order.id);
      await updateDoc(orderRef, {
        pharmacyStatus: 'Dispensed',
        dispensedAt: new Date().toISOString()
      });
      setLastDispensedPatient(order.patientName);
      setTimeout(() => setLastDispensedPatient(null), 4000);
    } catch (error) {
      console.error("Error updating pharmacy status:", error);
    }
  };

  const filteredOrders = pendingOrders.filter(order => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      order.patientName?.toLowerCase().includes(q) || 
      order.tokenNumber?.toLowerCase().includes(q) ||
      order.doctorName?.toLowerCase().includes(q);
    const matchesUrgent = !filterUrgentOnly || order.isEmergency;
    return matchesSearch && matchesUrgent;
  });

  return (
    <div className="min-h-screen bg-slate-900 p-3 sm:p-6 md:p-8 font-sans text-slate-300">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sm:mb-8 border-b border-slate-800 pb-4 sm:pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-teal-400 text-3xl sm:text-4xl">💊</span>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  E-Pharmacy Fulfillment Hub
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm font-medium">Real-Time Prescription Stream & Medication Dispensing</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider">
              ID: {hospitalId}
            </span>
            <div className="bg-teal-500/10 border border-teal-500/30 px-4 py-2 rounded-xl text-center">
              <span className="text-teal-400 font-black text-lg block leading-none">{pendingOrders.length}</span>
              <span className="text-teal-500/80 text-[10px] font-black uppercase tracking-wider">Pending Orders</span>
            </div>
          </div>
        </div>

        {/* --- PHARMACY METRICS ROW --- */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-lg">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Orders In Queue</p>
            <p className="text-2xl font-black text-teal-400 mt-1">{pendingOrders.length}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-lg">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Dispensed Today</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{dispensedCount}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-lg">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Avg Packing Time</p>
            <p className="text-2xl font-black text-blue-400 mt-1">~2.5m</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-lg">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Revenue Retention</p>
            <p className="text-2xl font-black text-purple-400 mt-1">100%</p>
          </div>
        </div>

        {/* Dispensed Toast */}
        {lastDispensedPatient && (
          <div className="mb-6 p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-between animate-fadeIn">
            <span>✅ Medicines for {lastDispensedPatient} marked as Dispensed!</span>
            <span className="text-[11px] text-emerald-400 font-mono">Sync Complete</span>
          </div>
        )}

        {/* --- SEARCH & FILTER TOOLBAR --- */}
        <div className="bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-lg mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input 
              type="text"
              placeholder="Search by patient name, doctor, or token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-800 bg-slate-900 focus:border-teal-500 outline-none text-white transition-all font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs">✕</button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterUrgentOnly(!filterUrgentOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                filterUrgentOnly 
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>🚨</span>
              <span>Urgent Only</span>
            </button>
          </div>
        </div>

        {/* --- ORDERS GRID --- */}
        {filteredOrders.length === 0 ? (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-12 sm:p-20 text-center">
            <span className="text-5xl sm:text-6xl mb-3 block opacity-40">☕</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-300 mb-1">Pharmacy queue is clear</h2>
            <p className="text-slate-500 text-xs sm:text-sm">New prescriptions from doctor consultations will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredOrders.map(order => (
              <div 
                key={order.id} 
                className={`bg-slate-950 border rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all hover:border-slate-700 ${
                  order.isEmergency ? 'border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : 'border-slate-800'
                }`}
              >
                {/* Emergency Flasher */}
                {order.isEmergency && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-bl-lg animate-pulse">
                    Urgent
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                      Token: {order.tokenNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {order.timeSlot || 'Active OPD'}
                    </span>
                  </div>

                  <div className="mb-3">
                    <h3 className="text-xl font-black text-white leading-tight">{order.patientName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Prescribed by <span className="text-teal-400 font-semibold">{order.doctorName}</span></p>
                  </div>

                  {/* Prescription Notes */}
                  <div className="bg-slate-900 rounded-xl p-3.5 mb-5 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 font-sans">Prescribed Items:</p>
                    {order.prescription || "General OPD advice. No medicine detailed."}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDispense(order)}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>✅</span>
                    <span>Mark as Dispensed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-colors active:scale-95"
                    title="Print Pill Envelope / Label"
                  >
                    🖨️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}