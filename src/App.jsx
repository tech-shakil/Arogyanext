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
import TVDisplay from './TVDisplay';

export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); 
  const [currentView, setCurrentView] = useState('receptionist');
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [showAuthScreen, setShowAuthScreen] = useState(false); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4">
        <div className="text-center">
          <span className="text-5xl sm:text-6xl block mb-4 animate-bounce">⚕️</span>
          <h2 className="text-lg sm:text-xl font-bold tracking-widest text-slate-400 uppercase">Loading ArogyaNext...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showAuthScreen) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
          <div className="p-3 sm:p-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
            <button 
              onClick={() => setShowAuthScreen(false)} 
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors border border-slate-700 active:scale-95"
            >
              ← Back to Website
            </button>
            <div className="text-xs sm:text-sm font-bold text-slate-400">
              Staff Portal
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
            <Auth />
          </div>
        </div>
      );
    }
    
    return <LandingPage onLoginClick={() => setShowAuthScreen(true)} />;
  }

  if (!userProfile) return null; 

  const navigationTabs = [
    {
      id: 'receptionist',
      label: 'Receptionist',
      icon: '📋',
      allowedRoles: ['Receptionist', 'Hospital Admin', 'Super Admin'],
      activeClass: 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
    },
    {
      id: 'doctor',
      label: 'Doctor Workspace',
      icon: '🩺',
      allowedRoles: ['Doctor', 'Super Admin'],
      activeClass: 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
    },
    {
      id: 'smartPad',
      label: 'Smart Pad',
      icon: '✍️',
      allowedRoles: ['Doctor', 'Super Admin'],
      activeClass: 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
    },
    {
      id: 'pharmacy',
      label: 'E-Pharmacy',
      icon: '💊',
      allowedRoles: ['Pharmacist', 'Hospital Admin', 'Super Admin'],
      activeClass: 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
    },
    {
      id: 'hospitalAdmin',
      label: 'Analytics Hub',
      icon: '📊',
      allowedRoles: ['Hospital Admin', 'Super Admin'],
      activeClass: 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
    },
    {
      id: 'tv',
      label: 'TV Signage',
      icon: '📺',
      allowedRoles: ['Receptionist', 'Doctor', 'Pharmacist', 'Hospital Admin'],
      activeClass: 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
    },
    {
      id: 'admin',
      label: 'Founder Console',
      icon: '⚡',
      allowedRoles: ['Super Admin'],
      activeClass: 'bg-red-600/20 text-red-400 border border-red-500/30'
    }
  ];

  const visibleTabs = navigationTabs.filter(tab => tab.allowedRoles.includes(userProfile.role));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans flex flex-col">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-50 print:hidden">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo & Hospital ID */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-lg sm:text-xl font-black tracking-wider text-white flex flex-col leading-tight">
              <div>Arogya<span className="text-blue-500">Next</span></div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 tracking-widest uppercase truncate max-w-[130px] sm:max-w-none">
                {userProfile.hospitalId}
              </span>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden md:flex space-x-1.5 lg:space-x-2 ml-4">
              {visibleTabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id)} 
                  className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg font-medium text-xs lg:text-sm transition-colors flex items-center gap-1.5 ${
                    currentView === tab.id ? tab.activeClass : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:flex flex-col text-right mr-1">
              <span className="text-xs sm:text-sm font-bold text-white leading-none truncate max-w-[150px]">
                {userProfile.fullName || user.email}
              </span>
              <span className="text-[9px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">
                {userProfile.role}
              </span>
            </div>

            <button 
              onClick={handleLogout} 
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-lg text-xs sm:text-sm font-bold transition-colors border border-slate-700 hover:border-red-500/30 active:scale-95"
            >
              Log Out
            </button>

            {/* Mobile Menu Toggle for Navigation */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
            {visibleTabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setCurrentView(tab.id); setMobileMenuOpen(false); }} 
                className={`p-2.5 rounded-xl font-medium text-xs transition-all flex items-center gap-2 text-left ${
                  currentView === tab.id ? tab.activeClass : 'bg-slate-900/80 text-slate-400 border border-slate-800'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Mobile Horizontal Pill Bar (Always accessible on phones) */}
        {!mobileMenuOpen && (
          <div className="md:hidden mt-2.5 pt-2 border-t border-slate-800/60 flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {visibleTabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setCurrentView(tab.id)} 
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  currentView === tab.id ? tab.activeClass : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 relative bg-slate-900 overflow-y-auto print:overflow-visible">
        {currentView === 'receptionist' && <ReceptionistPanel hospitalId={userProfile.hospitalId} />}
        {currentView === 'doctor' && <DoctorPanel hospitalId={userProfile.hospitalId} doctorName={userProfile.fullName} />}
        {currentView === 'smartPad' && <SmartPrescriptionPanel hospitalId={userProfile.hospitalId} doctorName={userProfile.fullName} />}
        {currentView === 'pharmacy' && <PharmacyPanel hospitalId={userProfile.hospitalId} />}
        {currentView === 'hospitalAdmin' && <HospitalAdmin hospitalId={userProfile.hospitalId} />}
        {currentView === 'admin' && <AdminPanel />}
        {currentView === 'tv' && <TVDisplay hospitalId={userProfile.hospitalId} />}
      </main>

    </div>
  );
}