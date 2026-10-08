import { useState, useEffect } from 'react';
import { auth, db } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 
import { 
  ClipboardList, 
  Stethoscope, 
  PenTool, 
  Pill, 
  BarChart3, 
  Tv, 
  ShieldAlert, 
  LogOut, 
  ArrowLeft, 
  Menu, 
  X 
} from 'lucide-react';

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
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-studio-grid opacity-25"></div>
        <div className="text-center relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-blue-600 to-cyan-400 flex items-center justify-center font-black text-white text-2xl shadow-[0_0_50px_rgba(99,102,241,0.5)] border border-white/20 animate-pulse mb-6">
            ✚
          </div>
          <h2 className="text-xs font-mono font-bold tracking-[0.25em] text-slate-400 uppercase">
            INITIALIZING CLINICAL KERNEL...
          </h2>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showAuthScreen) {
      return (
        <div className="min-h-screen bg-[#030712] flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-studio-grid opacity-20 pointer-events-none"></div>
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-black/60 sticky top-0 z-50 backdrop-blur-2xl">
            <button 
              onClick={() => setShowAuthScreen(false)} 
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all border border-white/10 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Overview</span>
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>SECURE ACCESS PORTAL</span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-3 sm:p-4 z-10">
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
      icon: ClipboardList,
      allowedRoles: ['Receptionist', 'Hospital Admin', 'Super Admin'],
      activeClass: 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
    },
    {
      id: 'doctor',
      label: 'Doctor Workspace',
      icon: Stethoscope,
      allowedRoles: ['Doctor', 'Super Admin'],
      activeClass: 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
    },
    {
      id: 'smartPad',
      label: 'Smart Pad',
      icon: PenTool,
      allowedRoles: ['Doctor', 'Super Admin'],
      activeClass: 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
    },
    {
      id: 'pharmacy',
      label: 'E-Pharmacy',
      icon: Pill,
      allowedRoles: ['Pharmacist', 'Hospital Admin', 'Super Admin'],
      activeClass: 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
    },
    {
      id: 'hospitalAdmin',
      label: 'Analytics Hub',
      icon: BarChart3,
      allowedRoles: ['Hospital Admin', 'Super Admin'],
      activeClass: 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
    },
    {
      id: 'tv',
      label: 'TV Signage',
      icon: Tv,
      allowedRoles: ['Receptionist', 'Doctor', 'Pharmacist', 'Hospital Admin'],
      activeClass: 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
    },
    {
      id: 'admin',
      label: 'Founder Console',
      icon: ShieldAlert,
      allowedRoles: ['Super Admin'],
      activeClass: 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'
    }
  ];

  const visibleTabs = navigationTabs.filter(tab => tab.allowedRoles.includes(userProfile.role));

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-200 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* --- TOP NAVIGATION BAR (Apple Pro Studio Grade) --- */}
      <nav className="bg-black/70 border-b border-white/[0.08] px-4 sm:px-6 py-3 sticky top-0 z-50 print:hidden backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Brand Logo & Hospital ID */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-blue-600 to-cyan-400 flex items-center justify-center font-black text-white text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/20 select-none">
                  ✚
                </div>
                <div className="text-lg font-black tracking-tight text-white whitespace-nowrap">
                  Arogya<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Next</span>
                </div>
              </div>

              {userProfile.hospitalId && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
                  <span className="hidden sm:inline text-slate-500 text-[10px] uppercase font-mono">HOSP:</span>
                  <span className="text-indigo-300 font-bold tracking-wider">{userProfile.hospitalId}</span>
                </div>
              )}
            </div>

            {/* Desktop Navigation Tabs (Apple Pill Design) */}
            <div className="hidden md:flex space-x-1 ml-3 bg-white/[0.03] p-1 rounded-full border border-white/[0.06]">
              {visibleTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = currentView === tab.id;
                return (
                  <button 
                    key={tab.id}
                    onClick={() => setCurrentView(tab.id)} 
                    className={`px-3.5 py-1.5 rounded-full font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive ? tab.activeClass : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:flex items-center gap-2.5 mr-2 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-indigo-300">
                {(userProfile.fullName || user.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight truncate max-w-[140px]">
                  {userProfile.fullName || user.email}
                </span>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
                  {userProfile.role}
                </span>
              </div>
            </div>

            <button 
              onClick={handleLogout} 
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white/5 hover:bg-rose-500/10 hover:text-rose-300 text-slate-300 rounded-full text-xs sm:text-sm font-bold transition-all border border-white/10 hover:border-rose-500/30 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>

            {/* Mobile Menu Toggle for Navigation */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 animate-fadeIn">
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = currentView === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => { setCurrentView(tab.id); setMobileMenuOpen(false); }} 
                  className={`p-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 text-left cursor-pointer ${
                    isActive ? tab.activeClass : 'bg-white/[0.03] text-slate-400 border border-white/[0.06]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Mobile Horizontal Pill Bar (Always accessible on phones) */}
        {!mobileMenuOpen && (
          <div className="md:hidden mt-2.5 pt-2 border-t border-white/[0.06] flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = currentView === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id)} 
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive ? tab.activeClass : 'bg-white/[0.03] text-slate-400 border border-white/[0.06]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 relative bg-[#070B14] overflow-y-auto print:overflow-visible">
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