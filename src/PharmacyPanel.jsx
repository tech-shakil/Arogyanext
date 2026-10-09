import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { 
  Pill, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Package, 
  Printer,
  X as XIcon,
  Stethoscope,
  User
} from 'lucide-react';

export default function PharmacyPanel({ hospitalId }) {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [dispensedCount, setDispensedCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgentOnly, setFilterUrgentOnly] = useState(false);
  const [lastDispensedPatient, setLastDispensedPatient] = useState(null);

  // Resilient real-time listener for pharmacy orders
  useEffect(() => {
    const appointmentsRef = collection(db, 'appointments');
    const isMaster = !hospitalId || hospitalId === 'SYSTEM_MASTER';

    // If hospitalId is provided and specific, filter by hospitalId; otherwise listen across facilities
    const q = isMaster
      ? query(appointmentsRef)
      : query(appointmentsRef, where('hospitalId', '==', hospitalId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allAppts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter pending orders (resilient to casing and completed consultation flow)
      const pending = allAppts.filter(order => {
        const pStatus = (order.pharmacyStatus || '').toLowerCase();
        
        // Explicitly marked as pending
        if (pStatus === 'pending') return true;
        
        // Completed consultations with prescription that haven't been dispensed yet and were not skipped
        if (order.status === 'Completed' && pStatus !== 'dispensed' && pStatus !== 'skipped') {
          return Boolean(order.prescription || order.scannedPrescriptionText || order.ocrText);
        }
        
        return false;
      });

      // Sort pending orders: Emergencies first, then chronological
      pending.sort((a, b) => {
        if (a.isEmergency && !b.isEmergency) return -1;
        if (!a.isEmergency && b.isEmergency) return 1;
        const timeA = a.sentToPharmacyAt || a.completedAt || a.timestamp || 0;
        const timeB = b.sentToPharmacyAt || b.completedAt || b.timestamp || 0;
        return timeA < timeB ? -1 : 1;
      });

      // Count dispensed orders
      const dispensed = allAppts.filter(order => {
        const pStatus = (order.pharmacyStatus || '').toLowerCase();
        return pStatus === 'dispensed';
      });

      setPendingOrders(pending);
      setDispensedCount(dispensed.length);
    }, (error) => {
      console.error("Pharmacy orders listener error:", error);
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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans" style={{ background: 'var(--surface-app)' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-5 sm:mb-6 border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Pill className="w-5 h-5" style={{ color: 'var(--positive-500)' }} />
              Pharmacy
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Prescription fulfillment & medication dispensing</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold border" style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
              {hospitalId}
            </span>
            <div className="px-3 py-1.5 rounded-md text-center border" style={{ background: 'var(--blue-50)', borderColor: 'var(--blue-100)' }}>
              <span className="font-bold text-base block leading-none" style={{ color: 'var(--blue-600)' }}>{pendingOrders.length}</span>
              <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--blue-500)', letterSpacing: '0.03em' }}>Pending</span>
            </div>
          </div>
        </div>

        {/* --- METRICS --- */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 sm:mb-6">
          <div className="p-3 sm:p-4 rounded-lg border flex items-center justify-between" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
            <div>
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>In Queue</p>
              <p className="text-lg sm:text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{pendingOrders.length}</p>
            </div>
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--blue-50)' }}>
              <Package className="w-4 h-4" style={{ color: 'var(--blue-600)' }} />
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-lg border flex items-center justify-between" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
            <div>
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>Dispensed</p>
              <p className="text-lg sm:text-xl font-bold mt-0.5" style={{ color: 'var(--positive-500)' }}>{dispensedCount}</p>
            </div>
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--positive-50)' }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--positive-500)' }} />
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-lg border flex items-center justify-between" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
            <div>
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>Avg Time</p>
              <p className="text-lg sm:text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>~2.5m</p>
            </div>
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--surface-tertiary)' }}>
              <Clock className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-lg border flex items-center justify-between" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
            <div>
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>Fill Rate</p>
              <p className="text-lg sm:text-xl font-bold mt-0.5" style={{ color: 'var(--positive-500)' }}>100%</p>
            </div>
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--positive-50)' }}>
              <Pill className="w-4 h-4" style={{ color: 'var(--positive-500)' }} />
            </div>
          </div>
        </div>

        {/* Success Toast */}
        {lastDispensedPatient && (
          <div className="mb-4 p-3 rounded-md border text-xs font-medium flex items-center justify-between animate-fadeIn" style={{ background: 'var(--positive-50)', borderColor: 'var(--positive-100)', color: 'var(--positive-600)' }}>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Medicines for {lastDispensedPatient} marked as dispensed
            </span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--positive-500)' }}>Synced</span>
          </div>
        )}

        {/* --- SEARCH & FILTER --- */}
        <div className="p-3 rounded-lg border mb-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search by patient, doctor, or token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-md border outline-none transition-colors font-medium"
              style={{ borderColor: 'var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setFilterUrgentOnly(!filterUrgentOnly)}
            className="px-3 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer border"
            style={{ 
              background: filterUrgentOnly ? 'var(--danger-500)' : 'var(--surface-secondary)',
              color: filterUrgentOnly ? 'white' : 'var(--text-secondary)',
              borderColor: filterUrgentOnly ? 'var(--danger-500)' : 'var(--border-default)'
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Urgent Only</span>
          </button>
        </div>

        {/* --- ORDERS --- */}
        {filteredOrders.length === 0 ? (
          <div className="rounded-lg border p-12 sm:p-16 text-center" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
            <Package className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>No pending orders</h2>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>New prescriptions from doctor consultations will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map(order => (
              <div 
                key={order.id} 
                className="rounded-lg border p-4 flex flex-col justify-between transition-colors"
                style={{ 
                  background: 'var(--surface-primary)', 
                  borderColor: order.isEmergency ? 'var(--danger-100)' : 'var(--border-default)' 
                }}
              >
                {/* Urgent badge */}
                {order.isEmergency && (
                  <div className="mb-2">
                    <span className="badge badge--danger text-[10px] font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      Urgent
                    </span>
                  </div>
                )}

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--blue-50)', color: 'var(--blue-600)', border: '1px solid var(--blue-100)' }}>
                      {order.tokenNumber}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                      {order.timeSlot || 'OPD'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{order.patientName}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    Prescribed by <span className="font-medium" style={{ color: 'var(--blue-600)' }}>{order.doctorName}</span>
                  </p>
                </div>

                {/* Prescription */}
                <div className="rounded-md p-3 mb-4 border font-mono text-xs whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed" style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <p className="section-header text-[10px] mb-1 font-sans">Prescribed Items</p>
                  {order.prescription || "General advice. No medicine detailed."}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDispense(order)}
                    className="flex-1 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    style={{ background: 'var(--positive-500)', color: 'white' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--positive-600)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--positive-500)'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Dispensed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-2.5 rounded-md border text-xs font-semibold transition-colors cursor-pointer"
                    style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)', background: 'var(--surface-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-tertiary)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-secondary)'}
                    title="Print Label"
                  >
                    <Printer className="w-3.5 h-3.5" />
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