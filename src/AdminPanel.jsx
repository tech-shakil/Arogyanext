import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, onSnapshot, orderBy, doc, setDoc, deleteDoc } from 'firebase/firestore';

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
    if (!newHospitalName) return;
    setIsCreating(true);
    const newId = `HOSP_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    await setDoc(doc(db, 'hospitals', newId), { hospitalName: newHospitalName, hospitalId: newId });
    setNewHospitalName('');
    setIsCreating(false);
  };

  const handleDeleteHospital = async (id, name) => {
    if(confirm(`Are you sure you want to delete ${name}?`)) await deleteDoc(doc(db, 'hospitals', id));
  };

  const handleDeleteUser = async (uid, name, role) => {
    if(confirm(`Remove ${name} (${role})?`)) {
        await deleteDoc(doc(db, 'users', uid));
        if(role === 'Doctor') await deleteDoc(doc(db, 'doctors', uid));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-slate-300 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="mb-12 border-b border-slate-800 pb-8">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold uppercase tracking-[0.2em] text-xs mb-2">
            Founder's Control Center
          </p>
          <h1 className="text-4xl font-black text-white tracking-tight">SaaS Platform Overview</h1>
        </div>

        {/* METRIC MATRIX ARCHITECTURE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-blue-500/30 to-transparent shadow-[0_0_30px_rgba(59,130,246,0.05)]">
            <div className="bg-slate-950 h-full w-full rounded-[23px] p-6 relative overflow-hidden">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Active Hospitals</h3>
              <p className="text-5xl font-black text-white">{hospitalsList.length}</p>
            </div>
          </div>

          <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-purple-500/30 to-transparent shadow-[0_0_30px_rgba(168,85,247,0.05)]">
            <div className="bg-slate-950 h-full w-full rounded-[23px] p-6 relative overflow-hidden">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Doctors</h3>
              <p className="text-5xl font-black text-white">{allUsers.filter(u => u.role === 'Doctor').length}</p>
            </div>
          </div>

          <div className="relative group rounded-3xl p-[1px] bg-gradient-to-b from-emerald-500/30 to-transparent shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            <div className="bg-slate-950 h-full w-full rounded-[23px] p-6 relative overflow-hidden">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Staff Users</h3>
              <p className="text-5xl font-black text-white">{allUsers.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: INITIALIZATION PIPELINE */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-blue-500/40 via-transparent to-transparent sticky top-24">
              <div className="bg-slate-950 rounded-[23px] p-8 relative overflow-hidden">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-3 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
                  Register New Client
                </h2>
                
                <form onSubmit={handleCreateHospital} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hospital Name</label>
                    <input 
                      type="text" required value={newHospitalName} onChange={(e) => setNewHospitalName(e.target.value)}
                      className="w-full px-5 py-4 rounded-xl border border-slate-800 bg-slate-900 focus:border-blue-500 outline-none text-white transition-all" 
                      placeholder="e.g. Apollo Hospital"
                    />
                  </div>
                  
                  <button 
                    type="submit" disabled={isCreating}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-black py-4 rounded-xl transition-all shadow-md disabled:opacity-50 mt-2"
                  >
                    {isCreating ? 'Generating Workspace...' : 'Generate Access Code'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: MANAGED TENANT WORKSPACES */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Registered Workspaces</h2>
            
            {hospitalsList.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center">
                <span className="text-5xl block mb-4 opacity-30">🏥</span>
                <p className="text-slate-400 font-medium">No hospitals registered yet. Create one on the left.</p>
              </div>
            ) : (
              hospitalsList.map(hospital => {
                const hospitalStaff = allUsers.filter(u => u.hospitalId === hospital.hospitalId);

                return (
                  <div key={hospital.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all">
                    <div className="bg-slate-900 border-b border-slate-800 px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-black text-xl text-white tracking-wide">{hospital.hospitalName}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Code:</span>
                          <span className="text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono text-sm">
                            {hospital.hospitalId}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                          {hospitalStaff.length} Active Staff
                        </span>
                        
                        <button 
                          onClick={() => handleDeleteHospital(hospital.id, hospital.hospitalName)}
                          className="bg-red-500/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                        >
                          Delete Hospital
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      {hospitalStaff.length === 0 ? (
                        <p className="text-sm text-slate-500 italic flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-2 animate-pulse"></span>
                          Waiting for staff to register using this code...
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {hospitalStaff.map(staff => (
                            <div key={staff.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between relative group">
                              <div>
                                <p className="font-bold text-slate-200 truncate">{staff.fullName}</p>
                                <p className="text-xs text-slate-500 mb-3 truncate">{staff.email}</p>
                              </div>
                              
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded inline-block ${
                                  staff.role === 'Doctor' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                  staff.role === 'Pharmacist' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                                  staff.role === 'Hospital Admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                  'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}>
                                  {staff.role}
                                </span>
                                
                                <button
                                  onClick={() => handleDeleteUser(staff.id, staff.fullName, staff.role)}
                                  className="text-red-400 hover:text-red-500 text-xs font-bold transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}