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
  X,
  ChevronRight,
  Building2,
  Loader2
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

  // --- Loading State ---
  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface-app)' }}>
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--blue-600)' }}>
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Loading workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  // --- Auth Screens ---
  if (!user) {
    if (showAuthScreen) {
      return (
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface-app)' }}>
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-default)', background: 'var(--surface-primary)' }}>
            <button 
              onClick={() => setShowAuthScreen(false)} 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-tertiary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="inline-flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
              <span className="status-dot status-dot--active"></span>
              <span>Secure Portal</span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <Auth />
          </div>
        </div>
      );
    }
    
    return <LandingPage onLoginClick={() => setShowAuthScreen(true)} />;
  }

  if (!userProfile) return null; 

  // --- Navigation Configuration ---
  const navigationTabs = [
    {
      id: 'receptionist',
      label: 'Reception',
      icon: ClipboardList,
      allowedRoles: ['Receptionist', 'Hospital Admin', 'Super Admin'],
    },
    {
      id: 'doctor',
      label: 'Doctor',
      icon: Stethoscope,
      allowedRoles: ['Doctor', 'Super Admin'],
    },
    {
      id: 'smartPad',
      label: 'Smart Pad',
      icon: PenTool,
      allowedRoles: ['Doctor', 'Super Admin'],
    },
    {
      id: 'pharmacy',
      label: 'Pharmacy',
      icon: Pill,
      allowedRoles: ['Pharmacist', 'Hospital Admin', 'Super Admin'],
    },
    {
      id: 'hospitalAdmin',
      label: 'Analytics',
      icon: BarChart3,
      allowedRoles: ['Hospital Admin', 'Super Admin'],
    },
    {
      id: 'tv',
      label: 'TV Display',
      icon: Tv,
      allowedRoles: ['Receptionist', 'Doctor', 'Pharmacist', 'Hospital Admin'],
    },
    {
      id: 'admin',
      label: 'Console',
      icon: ShieldAlert,
      allowedRoles: ['Super Admin'],
    }
  ];

  const visibleTabs = navigationTabs.filter(tab => tab.allowedRoles.includes(userProfile.role));

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--surface-app)', color: 'var(--text-primary)' }}>
      
      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="sticky top-0 z-50 print:hidden border-b" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-default)' }}>
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between">
          
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--blue-600)' }}>
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                ArogyaNext
              </span>
            </div>

            {/* Hospital ID */}
            {userProfile.hospitalId && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                <Building2 className="w-3.5 h-3.5" />
                <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{userProfile.hospitalId}</span>
              </div>
            )}

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-0.5">
              {visibleTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = currentView === tab.id;
                return (
                  <button 
                    key={tab.id}
                    onClick={() => setCurrentView(tab.id)} 
                    className="px-3 py-1.5 rounded-md font-medium text-[13px] transition-colors flex items-center gap-1.5 cursor-pointer"
                    style={{
                      background: isActive ? 'var(--blue-50)' : 'transparent',
                      color: isActive ? 'var(--blue-600)' : 'var(--text-tertiary)',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-tertiary)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User info (desktop) */}
            <div className="hidden sm:flex items-center gap-2 mr-1 pl-3 border-l" style={{ borderColor: 'var(--border-default)' }}>
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold" style={{ background: 'var(--blue-50)', color: 'var(--blue-600)' }}>
                {(userProfile.fullName || user.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[13px] font-semibold truncate max-w-[130px]" style={{ color: 'var(--text-primary)' }}>
                  {userProfile.fullName || user.email}
                </span>
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                  {userProfile.role}
                </span>
              </div>
            </div>

            {/* Log out */}
            <button 
              onClick={handleLogout} 
              className="px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer border"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-50)'; e.currentTarget.style.color = 'var(--danger-600)'; e.currentTarget.style.borderColor = 'var(--danger-100)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            {/* Mobile menu toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md cursor-pointer transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-tertiary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t px-4 py-3 animate-fadeIn" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-primary)' }}>
            <div className="grid grid-cols-2 gap-1.5">
              {visibleTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = currentView === tab.id;
                return (
                  <button 
                    key={tab.id}
                    onClick={() => { setCurrentView(tab.id); setMobileMenuOpen(false); }} 
                    className="p-2.5 rounded-md font-medium text-[13px] transition-colors flex items-center gap-2 text-left cursor-pointer"
                    style={{
                      background: isActive ? 'var(--blue-50)' : 'var(--surface-secondary)',
                      color: isActive ? 'var(--blue-600)' : 'var(--text-secondary)',
                      border: isActive ? '1px solid var(--blue-100)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            {/* Mobile user info */}
            <div className="sm:hidden mt-3 pt-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-semibold" style={{ background: 'var(--blue-50)', color: 'var(--blue-600)' }}>
                {(userProfile.fullName || user.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{userProfile.fullName || user.email}</span>
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{userProfile.role} · {userProfile.hospitalId}</span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto print:overflow-visible">
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