import { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 

import LandingPage from './LandingPage';
import Auth from './Auth'; 
import ReceptionistPanel from './ReceptionistPanel';
import DoctorPanel from './DoctorPanel';
import SmartPrescriptionPanel from './SmartPrescriptionPanel';
import PharmacyPanel from './PharmacyPanel';
import HospitalAdmin from './HospitalAdmin';
import AdminPanel from './AdminPanel';
import TVDisplay from './TVDisplay'; // <-- TV Display Imported Here

export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); 
  const [currentView, setCurrentView] = useState('receptionist');
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [showAuthScreen, setShowAuthScreen] = useState(false); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
          if (userDoc.exists()) {
            const profile = userDoc.data();
            setUserProfile(profile);
            
            if (profile.role === 'Doctor') setCurrentView('doctor');
            else if (profile.role === 'Pharmacist') setCurrentView('pharmacy');
            else if (profile.role === 'Hospital Admin') setCurrentView('hospitalAdmin');
            else if (profile.role === 'Super Admin') setCurrentView('admin');
            else setCurrentView('receptionist'); 
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
        setUser(currentUser);
        setShowAuthScreen(false); 
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setIsAuthenticating(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
    setUserProfile(null);
    setCurrentView('receptionist'); 
  };

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <span className="text-6xl block mb-4 animate-bounce">⚕️</span>
          <h2 className="text-xl font-bold tracking-widest text-slate-400 uppercase">Loading ArogyaNext...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showAuthScreen) {
      return (
        <div className="relative">
          <button 
            onClick={() => setShowAuthScreen(false)} 
            className="absolute top-6 left-6 z-50 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700 transition-colors"
          >
            ← Back to Website
          </button>
          <Auth />
        </div>
      );
    }
    
    return <LandingPage onLoginClick={() => setShowAuthScreen(true)} />;
  }

  if (!userProfile) return null; 

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans flex flex-col overflow-hidden">
      
      <nav className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 print:hidden">
        <div className="flex items-center space-x-8">
          
          <div className="text-xl font-black tracking-wider text-white flex flex-col leading-tight">
            <div>Arogya<span className="text-blue-500">Next</span></div>
            <span className="text-[10px] text-slate-500 tracking-widest uppercase">{userProfile.hospitalId}</span>
          </div>

          <div className="hidden md:flex space-x-2">
            
            {['Receptionist', 'Hospital Admin', 'Super Admin'].includes(userProfile.role) && (
              <button 
                onClick={() => setCurrentView('receptionist')} 
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${currentView === 'receptionist' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                Receptionist
              </button>
            )}

            {['Doctor', 'Super Admin'].includes(userProfile.role) && (
              <>
                <button 
                  onClick={() => setCurrentView('doctor')} 
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${currentView === 'doctor' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-800 text-slate-400'}`}
                >
                  Doctor Workspace
                </button>
                <button 
                  onClick={() => setCurrentView('smartPad')} 
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${currentView === 'smartPad' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800 text-slate-400'}`}
                >
                  Smart Pad (Tablet)
                </button>
              </>
            )}

            {['Pharmacist', 'Hospital Admin', 'Super Admin'].includes(userProfile.role) && (
              <button 
                onClick={() => setCurrentView('pharmacy')} 
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${currentView === 'pharmacy' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                E-Pharmacy
              </button>
            )}

            {['Hospital Admin', 'Super Admin'].includes(userProfile.role) && (
              <button 
                onClick={() => setCurrentView('hospitalAdmin')} 
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${currentView === 'hospitalAdmin' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                Analytics Hub
              </button>
            )}

            {/* 📺 NEW: TV DISPLAY BUTTON FOR EVERYONE TO TEST WITH */}
            {userProfile.role !== 'Super Admin' && (
              <button 
                onClick={() => setCurrentView('tv')} 
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center ${currentView === 'tv' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                <span className="mr-2">📺</span> TV Signage
              </button>
            )}

            {userProfile.role === 'Super Admin' && (
              <button 
                onClick={() => setCurrentView('admin')} 
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${currentView === 'admin' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                Founder Console
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex flex-col text-right mr-2">
            <span className="text-sm font-bold text-white leading-none">{userProfile.fullName || user.email}</span>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">{userProfile.role}</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="px-4 py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-lg text-sm font-bold transition-colors border border-slate-700 hover:border-red-500/30"
          >
            Log Out
          </button>
        </div>
      </nav>

      <main className="flex-1 relative bg-slate-900 overflow-y-auto print:overflow-visible">
        {currentView === 'receptionist' && <ReceptionistPanel hospitalId={userProfile.hospitalId} />}
        {currentView === 'doctor' && <DoctorPanel hospitalId={userProfile.hospitalId} doctorName={userProfile.fullName} />}
        {currentView === 'smartPad' && <SmartPrescriptionPanel hospitalId={userProfile.hospitalId} doctorName={userProfile.fullName} />}
        {currentView === 'pharmacy' && <PharmacyPanel hospitalId={userProfile.hospitalId} />}
        {currentView === 'hospitalAdmin' && <HospitalAdmin hospitalId={userProfile.hospitalId} />}
        {currentView === 'admin' && <AdminPanel />}
        
        {/* 📺 TV DISPLAY COMPONENT RENDER */}
        {currentView === 'tv' && <TVDisplay hospitalId={userProfile.hospitalId} />}
      </main>

    </div>
  );
}