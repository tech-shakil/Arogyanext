import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, onSnapshot, orderBy, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  Building2, 
  Users, 
  Stethoscope, 
  Pill, 
  ShieldCheck, 
  ClipboardList, 
  Plus, 
  Trash2, 
  Loader2, 
  UserX,
  AlertCircle
} from 'lucide-react';

export default function AdminPanel() {
  const [allUsers, setAllUsers] = useState([]);
  const [hospitalsList, setHospitalsList] = useState([]);
  const [newHospitalName, setNewHospitalName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'hospitals'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => setHospitalsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, []);

  const handleCreateHospital = async (e) => {
    e.preventDefault();
    if (!newHospitalName.trim()) return;
    setIsCreating(true);
    const newId = `HOSP_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    await setDoc(doc(db, 'hospitals', newId), { 
      hospitalName: newHospitalName.trim(), 
      hospitalId: newId, 
      createdAt: new Date().toISOString() 
    });
    setNewHospitalName('');
    setIsCreating(false);
  };

  const handleDeleteHospital = async (id, name, hospitalIdCode) => {
    if(confirm(`Are you sure you want to delete ${name} (${hospitalIdCode})? All associated staff accounts will also be removed.`)) {
      await deleteDoc(doc(db, 'hospitals', id));
      // Cascade delete staff belonging to this hospital to avoid orphaned records
      const staffToDelete = allUsers.filter(u => u.hospitalId === hospitalIdCode);
      for (const staff of staffToDelete) {
        await deleteDoc(doc(db, 'users', staff.id));
        if (staff.role === 'Doctor') {
          await deleteDoc(doc(db, 'doctors', staff.id));
        }
      }
    }
  };

  const handleDeleteUser = async (uid, name, role) => {
    if(confirm(`Remove ${name} (${role})?`)) {
      await deleteDoc(doc(db, 'users', uid));
      if(role === 'Doctor') await deleteDoc(doc(db, 'doctors', uid));
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'Doctor': return Stethoscope;
      case 'Pharmacist': return Pill;
      case 'Hospital Admin': return ShieldCheck;
      default: return ClipboardList;
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch(role) {
      case 'Doctor': return 'badge--blue';
      case 'Pharmacist': return 'badge--positive';
      case 'Hospital Admin': return 'badge--warning';
      default: return 'badge--neutral';
    }
  };

  // Staff and personnel calculations tied to active hospitals
  const activeHospitalIds = new Set(hospitalsList.map(h => h.hospitalId));
  
  // Users belonging to registered, active hospitals (excluding super admin)
  const activeHospitalUsers = allUsers.filter(u => activeHospitalIds.has(u.hospitalId) && u.role !== 'Super Admin');
  
  // Clinical Doctors in active facilities
  const activeDoctors = activeHospitalUsers.filter(u => u.role === 'Doctor');
  
  // Hospital Staff (Receptionists, Pharmacists, Local Admins) excluding Doctors
  const activeSupportStaff = activeHospitalUsers.filter(u => u.role !== 'Doctor');
  
  // Total active personnel across all facilities
  const totalActivePersonnel = activeHospitalUsers.length;

  // Orphaned or unassigned user records (e.g., from deleted test facilities)
  const orphanedUsers = allUsers.filter(u => !activeHospitalIds.has(u.hospitalId) && u.role !== 'Super Admin');

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans" style={{ background: 'var(--surface-app)' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-5 sm:mb-6 border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="text-xs font-semibold uppercase mb-0.5" style={{ color: 'var(--blue-600)', letterSpacing: '0.04em' }}>
            Founder Console
          </p>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Platform Management</h1>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 sm:mb-6">
          <div className="p-4 rounded-lg border flex items-center justify-between" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
            <div>
              <p className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>Active Hospitals</p>
              <p className="text-2xl sm:text-3xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{hospitalsList.length}</p>
            </div>
            <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: 'var(--blue-50)' }}>
              <Building2 className="w-5 h-5" style={{ color: 'var(--blue-600)' }} />
            </div>
          </div>

          <div className="p-4 rounded-lg border flex items-center justify-between" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
            <div>
              <p className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>Clinical Doctors</p>
              <p className="text-2xl sm:text-3xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{activeDoctors.length}</p>
            </div>
            <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: 'var(--blue-50)' }}>
              <Stethoscope className="w-5 h-5" style={{ color: 'var(--blue-600)' }} />
            </div>
          </div>

          <div className="p-4 rounded-lg border flex items-center justify-between" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
            <div>
              <p className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>Hospital Staff</p>
              <p className="text-2xl sm:text-3xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{activeSupportStaff.length}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Reception, Pharmacy & Admin</p>
            </div>
            <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: 'var(--positive-50)' }}>
              <Users className="w-5 h-5" style={{ color: 'var(--positive-500)' }} />
            </div>
          </div>

          <div className="p-4 rounded-lg border flex items-center justify-between" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
            <div>
              <p className="text-[11px] font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>Active Personnel</p>
              <p className="text-2xl sm:text-3xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{totalActivePersonnel}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Across active facilities</p>
            </div>
            <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: 'var(--surface-secondary)' }}>
              <ShieldCheck className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          
          {/* REGISTER NEW CLIENT */}
          <div className="lg:col-span-1">
            <div className="p-4 sm:p-5 rounded-lg border" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Plus className="w-4 h-4" style={{ color: 'var(--blue-600)' }} />
                Register New Client
              </h2>
              
              <form onSubmit={handleCreateHospital} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase mb-1" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.03em' }}>Hospital Name</label>
                  <input 
                    type="text" required value={newHospitalName} onChange={(e) => setNewHospitalName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-md border outline-none text-sm transition-colors font-medium"
                    style={{ borderColor: 'var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
                    placeholder="e.g. Apollo Hospital"
                  />
                </div>
                
                <button 
                  type="submit" disabled={isCreating}
                  className="w-full py-2.5 rounded-md font-semibold text-sm text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'var(--blue-600)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-700)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--blue-600)'}
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {isCreating ? 'Provisioning...' : 'Deploy Hospital Tenant'}
                </button>
              </form>
            </div>
          </div>

          {/* REGISTERED HOSPITALS & STAFF */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold flex items-center justify-between" style={{ color: 'var(--text-primary)' }}>
              <span>Registered Hospitals ({hospitalsList.length})</span>
            </h2>

            {hospitalsList.length === 0 ? (
              <div className="p-8 rounded-lg border text-center" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No hospital tenants deployed yet.</p>
              </div>
            ) : (
              hospitalsList.map(hospital => {
                const hospitalStaff = allUsers.filter(u => u.hospitalId === hospital.hospitalId);

                return (
                  <div key={hospital.id} className="rounded-lg border overflow-hidden" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
                    {/* Hospital Header */}
                    <div className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-secondary)' }}>
                      <div>
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{hospital.hospitalName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}>Code:</span>
                          <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--positive-50)', color: 'var(--positive-600)', border: '1px solid var(--positive-100)' }}>
                            {hospital.hospitalId}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="badge badge--blue text-[10px]">
                          <Users className="w-3 h-3" />
                          {hospitalStaff.length} Staff Members
                        </span>
                        
                        <button 
                          onClick={() => handleDeleteHospital(hospital.id, hospital.hospitalName, hospital.hospitalId)}
                          className="px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 border"
                          style={{ borderColor: 'var(--danger-100)', color: 'var(--danger-500)', background: 'var(--danger-50)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-500)'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--danger-50)'; e.currentTarget.style.color = 'var(--danger-500)' }}
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {/* Staff List */}
                    <div className="p-3 sm:p-4">
                      {hospitalStaff.length === 0 ? (
                        <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                          <span className="status-dot status-dot--neutral animate-pulse-dot"></span>
                          Waiting for staff registrations using code <span className="font-mono font-bold text-xs">{hospital.hospitalId}</span>
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {hospitalStaff.map(staff => {
                            const RoleIcon = getRoleIcon(staff.role);
                            return (
                              <div key={staff.id} className="p-2.5 rounded-md border group flex flex-col justify-between" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-subtle)' }}>
                                <div>
                                  <p className="font-medium text-xs truncate" style={{ color: 'var(--text-primary)' }}>{staff.fullName || 'Unnamed'}</p>
                                  <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{staff.email}</p>
                                </div>
                                
                                <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                                  <span className={`badge ${getRoleBadgeStyle(staff.role)} text-[9px]`}>
                                    <RoleIcon className="w-3 h-3" />
                                    {staff.role}
                                  </span>
                                  
                                  <button
                                    onClick={() => handleDeleteUser(staff.id, staff.fullName, staff.role)}
                                    className="text-[10px] font-medium transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer flex items-center gap-0.5"
                                    style={{ color: 'var(--danger-500)' }}
                                  >
                                    <UserX className="w-3 h-3" />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* UNASSIGNED / LEGACY STAFF (if any from previous test deletions) */}
            {orphanedUsers.length > 0 && (
              <div className="rounded-lg border p-4 mt-6" style={{ background: 'var(--surface-primary)', borderColor: 'var(--warning-100)' }}>
                <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" style={{ color: 'var(--warning-500)' }} />
                    <h3 className="text-xs font-semibold uppercase" style={{ color: 'var(--text-primary)', letterSpacing: '0.03em' }}>
                      Unassigned Accounts ({orphanedUsers.length})
                    </h3>
                  </div>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Accounts tied to deleted or invalid hospital IDs
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {orphanedUsers.map(staff => (
                    <div key={staff.id} className="p-2.5 rounded-md border flex flex-col justify-between" style={{ background: 'var(--surface-secondary)', borderColor: 'var(--border-subtle)' }}>
                      <div>
                        <p className="font-medium text-xs truncate" style={{ color: 'var(--text-primary)' }}>{staff.fullName || 'Unnamed'}</p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{staff.email}</p>
                        <p className="text-[9px] font-mono mt-1" style={{ color: 'var(--text-tertiary)' }}>ID: {staff.hospitalId || 'None'}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                        <span className="badge badge--neutral text-[9px]">{staff.role}</span>
                        <button
                          onClick={() => handleDeleteUser(staff.id, staff.fullName, staff.role)}
                          className="text-[10px] font-medium cursor-pointer flex items-center gap-0.5"
                          style={{ color: 'var(--danger-500)' }}
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}