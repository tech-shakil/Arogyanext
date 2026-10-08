import { useState } from 'react';
import {
  Activity,
  Stethoscope,
  Scan,
  Mic,
  Volume2,
  ShieldCheck,
  Zap,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Tv,
  Pill,
  HeartHandshake,
  Play,
  Radio,
  FileText,
  Check,
  X,
  Building2,
  PhoneCall,
  Share2,
  Cpu,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Flame,
  Fingerprint
} from 'lucide-react';

export default function LandingPage({ onLoginClick }) {
  // --- MODAL & FORM STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState('form');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form states
  const [hospName, setHospName] = useState('');
  const [userName, setUserName] = useState('Md Shakil Akhtar');
  const [email, setEmail] = useState('');

  // --- INTERACTIVE CONSOLE / PLAYGROUND STATES ---
  const [consoleMode, setConsoleMode] = useState('doctor'); // 'doctor' | 'patient' | 'voice'
  const [testLanguage, setTestLanguage] = useState('Hindi');
  const [testSpotsAway, setTestSpotsAway] = useState(2);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [rxCopied, setRxCopied] = useState(false);

  const sampleLanguages = [
    { name: 'English', native: 'English', text: 'Doctor, I have had a dry cough and slight fever for three days.', voice: 'Doctor, I have had a dry cough and slight fever for three days.', dialect: 'Standard Indian English' },
    { name: 'Hindi', native: 'हिन्दी', text: 'डॉक्टर साहब, मुझे 3 दिनों से तेज़ बुखार और सिरदर्द है।', voice: 'Doctor sahab, mujhe teen dinon se tez bukhar aur sirdard hai.', dialect: 'Standard Hindi' },
    { name: 'Tamil', native: 'தமிழ்', text: 'மருத்துவரே, எனக்கு மூன்று நாட்களாக கடுமையான தலைவலி உள்ளது.', voice: 'Maruthuvare, enakku moondru naatkalaga kadumaiyana thalaivali ulladhu.', dialect: 'Tamil Nadu Regional' },
    { name: 'Telugu', native: 'తెలుగు', text: 'డాక్టర్ గారు, నాకు మూడు రోజులుగా జ్వరం మరియు దగ్గు ఉంది.', voice: 'Doctor gaaru, naaku moodu rojula gaa jvaram mariyu daggu undhi.', dialect: 'Andhra / Telangana' },
    { name: 'Marathi', native: 'मराठी', text: 'डॉक्टर, मला तीन दिवसांपासून खूप ताप आणि खोकला आहे.', voice: 'Doctor, mala teen divasanpasun khoop taap aani khokla aahe.', dialect: 'Maharashtra Regional' },
    { name: 'Bengali', native: 'বাংলা', text: 'ডাক্তারবাবু, আমার তিন দিন ধরে জ্বর এবং কাশি হচ্ছে।', voice: 'Doctorbabu, amar teen din dhore jwor ebong kashi hochhe.', dialect: 'West Bengal Regional' },
  ];

  const handleTestSpeech = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    setModalState('success');
    setTimeout(() => {
      setIsModalOpen(false);
      setModalState('form');
      setHospName('');
      setEmail('');
    }, 2800);
  };

  const currentSample = sampleLanguages.find(l => l.name === testLanguage) || sampleLanguages[0];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden antialiased">
      
      {/* Studio Ambient Aura (Apple/Nike Deep Stage Glow) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-indigo-600/18 via-blue-600/10 to-transparent rounded-full blur-[140px]"></div>
        <div className="absolute top-[35%] -left-48 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px]"></div>
        <div className="absolute top-[60%] -right-48 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[160px]"></div>
        <div className="absolute inset-0 bg-studio-grid opacity-35"></div>
      </div>

      {/* --- POPUP DEMO MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl transition-all animate-fadeIn">
          <div className="bg-[#090D16] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative max-h-[92vh] overflow-y-auto specular-border">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {modalState === 'form' ? (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[11px] font-semibold tracking-wide mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Complimentary 6-Month Pilot</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">Request Hospital Pilot</h3>
                <p className="text-slate-400 mb-6 text-xs sm:text-sm leading-relaxed">
                  Experience frictionless OPD telemetry, multilingual speech triage, and on-device ML Kit OCR in your clinic.
                </p>
                
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">Hospital or Clinic Name</label>
                    <input 
                      type="text" required placeholder="e.g. Apollo Metro Care" 
                      value={hospName} onChange={(e) => setHospName(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/15 focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">Lead Contact Name</label>
                    <input 
                      type="text" required placeholder="Your Full Name" 
                      value={userName} onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/15 focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">Work Email</label>
                    <input 
                      type="email" required placeholder="director@hospital.com" 
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/15 focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full py-4 rounded-xl font-extrabold text-sm text-black bg-white hover:bg-slate-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
                  >
                    <span>Deploy 6-Month Pilot</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Pilot Dispatched</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">Our clinical implementation team will contact you within 24 hours.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- APPLE-GRADE FLOATING TRANSLUCENT NAVIGATION BAR --- */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-2xl bg-black/60 border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand Mark with Glowing Sapphire Monogram */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-blue-600 to-cyan-400 flex items-center justify-center font-black text-white text-base shadow-[0_0_25px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-transform border border-white/20">
              ✚
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Arogya<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">Next</span>
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-bold text-slate-300 tracking-widest uppercase">
                Clinical OS
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links (Apple Clean Typography) */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3 text-xs lg:text-sm font-semibold text-slate-400">
            <button onClick={() => scrollToSection('telemetry-console')} className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer">
              Clinical Console
            </button>
            <button onClick={() => scrollToSection('features')} className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer">
              Capabilities
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer">
              Flow Architecture
            </button>
            <button onClick={() => scrollToSection('pricing')} className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer">
              For Clinics
            </button>
          </div>

          {/* Action Buttons (Apple High-Contrast Button) */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <button 
              onClick={onLoginClick}
              className="px-4 py-2 rounded-full font-bold text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/10 transition-all active:scale-95"
            >
              Staff Portal
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2 sm:py-2.5 rounded-full font-extrabold text-xs sm:text-sm text-black bg-white hover:bg-slate-100 shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all active:scale-95"
            >
              Book Pilot
            </button>
            
            {/* Mobile Hamburger Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <div className="text-lg">☰</div>}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 border-b border-white/10 px-5 py-5 space-y-3 backdrop-blur-2xl animate-fadeIn">
            <button 
              onClick={() => scrollToSection('telemetry-console')} 
              className="block w-full text-left py-2.5 px-3 rounded-xl text-slate-300 font-bold hover:bg-white/5"
            >
              Clinical Console
            </button>
            <button 
              onClick={() => scrollToSection('features')} 
              className="block w-full text-left py-2.5 px-3 rounded-xl text-slate-300 font-bold hover:bg-white/5"
            >
              Platform Capabilities
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="block w-full text-left py-2.5 px-3 rounded-xl text-slate-300 font-bold hover:bg-white/5"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('pricing')} 
              className="block w-full text-left py-2.5 px-3 rounded-xl text-slate-300 font-bold hover:bg-white/5"
            >
              Clinic Pricing
            </button>
            <div className="pt-3 border-t border-white/10">
              <button 
                onClick={() => { setMobileMenuOpen(false); setIsModalOpen(true); }}
                className="w-full text-center py-3.5 rounded-full bg-white text-black font-extrabold text-sm shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Book a Free Pilot
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION (Apple / Nike Typographic Precision) --- */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 md:pt-48 pb-16 sm:pb-24 text-center z-10">
        
        {/* Floating Telemetry Beacon Pill */}
        <div className="inline-flex items-center gap-2.5 mb-8 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-slate-200 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-2xl shadow-[0_0_30px_rgba(99,102,241,0.15)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
          <span className="font-mono text-emerald-400 text-xs uppercase tracking-wider">LIVE TELEMETRY</span>
          <span className="text-white/20">•</span>
          <span className="text-slate-300">Next-Generation Outpatient Operating System</span>
        </div>
        
        {/* Monumental Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-[-0.035em] mb-6 sm:mb-8 leading-[1.05] max-w-5xl mx-auto">
          Clinical flow. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-cyan-300">
            Engineered for zero wait.
          </span>
        </h1>
        
        {/* Authoritative Subtext */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-300 mb-10 sm:mb-12 leading-relaxed px-2 font-normal">
          ArogyaNext seamlessly unifies reception desks, doctor consultation cabins, patient smartphones, and hospital pharmacies into a zero-latency operating loop.
        </p>
        
        {/* Call to Actions (Apple Signature Pill + Glass Button) */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-5 max-w-md sm:max-w-none mx-auto w-full">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-9 py-4 rounded-full font-black text-base sm:text-lg bg-white text-black hover:bg-slate-100 shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
          >
            <span>Start Free Clinic Pilot</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scrollToSection('telemetry-console')}
            className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-base sm:text-lg border border-white/15 hover:border-white/30 text-white bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Live Console</span>
          </button>
        </div>

        {/* --- PERFORMANCE TELEMETRY STRIP (Nike Speed Metrics) --- */}
        <div className="mt-16 sm:mt-24 pt-10 border-t border-white/[0.08] grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          
          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-left relative overflow-hidden group hover:border-blue-500/40 transition-all specular-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">WAIT REDUCTION</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">85%</p>
            <p className="text-xs text-slate-300 font-semibold mt-1">OPD Wait Time Cut</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Smooth flow from check-in to cabin</p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-left relative overflow-hidden group hover:border-emerald-500/40 transition-all specular-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">LATENCY SYNC</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">&lt; 35ms</p>
            <p className="text-xs text-slate-300 font-semibold mt-1">Real-Time Cloud Sync</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Sub-second TV and cabin queue sync</p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-left relative overflow-hidden group hover:border-violet-500/40 transition-all specular-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">ACCESSIBILITY</span>
              <Mic className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">6 Dialects</p>
            <p className="text-xs text-slate-300 font-semibold mt-1">Indian Regional Voice AI</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Zero literacy barrier for patients</p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-left relative overflow-hidden group hover:border-cyan-500/40 transition-all specular-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">DATA PRIVACY</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">100%</p>
            <p className="text-xs text-slate-300 font-semibold mt-1">On-Device Edge OCR</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Google ML Kit local processing</p>
          </div>

        </div>
      </section>

      {/* --- CENTERPIECE: THE CLINICAL COMMAND CONSOLE (Apple Hardware Mockup & Live Sandbox) --- */}
      <section id="telemetry-console" className="py-20 sm:py-28 relative scroll-mt-20 z-10 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-widest mb-4">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interactive Telemetry Terminal</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
              Experience the Clinical OS.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-xl mx-auto">
              Test on-device OCR extraction, multilingual regional speech recognition, and smart proximity alerts live in this interactive console.
            </p>
          </div>

          {/* Obsidian Console Bezel (Apple Studio Hardware Finish) */}
          <div className="bg-[#090D16] border border-white/15 rounded-3xl p-3 sm:p-6 shadow-[0_30px_90px_rgba(0,0,0,0.9)] relative overflow-hidden specular-border">
            
            {/* Top Hardware Chrome (macOS Dots & Dynamic Pill) */}
            <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-white/[0.08] px-2 sm:px-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
                <span className="ml-3 hidden sm:inline-block font-mono text-[11px] text-slate-500 uppercase tracking-widest">
                  arogyanext-core // v4.2.0
                </span>
              </div>

              {/* Dynamic Island Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 font-mono text-[11px] text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>HOSP_METRO_AI</span>
                <span className="text-white/20">•</span>
                <span className="text-emerald-400 font-bold">24ms LATENCY</span>
              </div>
            </div>

            {/* Console View Switcher (Doctor Cabin, Voice Intake, Proximity Radar) */}
            <div className="mt-4 sm:mt-6 mb-6 flex space-x-2 border-b border-white/[0.08] pb-4 overflow-x-auto no-scrollbar px-2">
              <button 
                onClick={() => setConsoleMode('doctor')}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  consoleMode === 'doctor'
                    ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>Doctor Workstation (OCR)</span>
              </button>

              <button 
                onClick={() => setConsoleMode('voice')}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  consoleMode === 'voice'
                    ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>6-Language Voice AI</span>
              </button>

              <button 
                onClick={() => setConsoleMode('patient')}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  consoleMode === 'patient'
                    ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>Smart Proximity Pass</span>
              </button>
            </div>

            {/* --- CONSOLE VIEW 1: DOCTOR WORKSTATION & OCR COMPARISON --- */}
            {consoleMode === 'doctor' && (
              <div className="p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left: Physical Prescription Paper Slip */}
                <div className="lg:col-span-5 bg-black/60 rounded-2xl border border-white/10 p-5 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400"></div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Scan className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Camera Input #Rx-8921</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                        EDGE ML KIT
                      </span>
                    </div>

                    {/* Paper Rx Graphic with Scanning Laser Bar */}
                    <div className="relative border border-white/10 rounded-xl p-5 bg-gradient-to-b from-white/[0.04] to-transparent overflow-hidden">
                      {/* Laser Line */}
                      <div className="absolute inset-x-0 h-0.5 bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-float"></div>

                      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                        <div>
                          <p className="font-bold text-sm text-white">City Health Clinic</p>
                          <p className="text-[10px] text-slate-400 font-mono">Patient: Rajesh Kumar • Age: 42</p>
                        </div>
                        <span className="text-xs font-mono text-slate-500">12/04/2026</span>
                      </div>

                      <div className="space-y-2 font-mono text-[11px] text-slate-300">
                        <p className="text-indigo-300">1. Tab. Dolo 650mg - 1 BD x 3d</p>
                        <p className="text-cyan-300">2. Cap. Amoxicillin 500mg - 1 TDS x 5d</p>
                        <p className="text-indigo-300">3. Syrup Ascoril LS - 5ml at bedtime</p>
                        <p className="text-slate-400 mt-2 text-[10px]">Diagnosis: Acute bronchitis with mild fever</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-4 text-center">
                    Patient photographs physical prescription at home; digitized before hospital arrival.
                  </p>
                </div>

                {/* Right: Doctor Cabin Ingestion HUD */}
                <div className="lg:col-span-7 bg-white/[0.02] rounded-2xl border border-indigo-500/30 p-5 flex flex-col justify-between shadow-[0_0_40px_rgba(99,102,241,0.08)]">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="font-mono text-xs uppercase tracking-wider text-white font-bold">
                          Doctor Cabin Screen (In-Consultation)
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        0.14s Extracted
                      </span>
                    </div>

                    {/* Extracted Structured Card */}
                    <div className="bg-black/70 rounded-xl p-4 border border-white/10 font-mono text-xs text-slate-200 leading-relaxed shadow-inner">
                      <div className="text-indigo-400 font-bold mb-2 flex items-center justify-between">
                        <span>[PARSED CLINICAL DOSAGE DATA]</span>
                        <span className="text-[10px] text-slate-400">Confidence: 99.4%</span>
                      </div>
                      <div className="space-y-1.5 text-slate-300">
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="font-semibold text-white">Dolo 650 (Paracetamol)</span>
                          <span className="text-slate-400 text-[11px]">1 Tab BD (Morning / Night)</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/5">
                          <span className="font-semibold text-white">Amoxicillin 500mg</span>
                          <span className="text-slate-400 text-[11px]">1 Cap TDS (After Meals)</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="font-semibold text-white">Ascoril LS Syrup</span>
                          <span className="text-slate-400 text-[11px]">5 ml Night</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ready to sync with E-Pharmacy</span>
                    </span>

                    <button 
                      onClick={() => {
                        setRxCopied(true);
                        setTimeout(() => setRxCopied(false), 2000);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-full font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95"
                    >
                      {rxCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Inserted into Cabin Rx!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>+ Insert into Active Rx</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* --- CONSOLE VIEW 2: 6-LANGUAGE REGIONAL VOICE AI --- */}
            {consoleMode === 'voice' && (
              <div className="p-2 sm:p-4 space-y-6">
                <div>
                  <label className="text-xs text-slate-400 font-mono uppercase tracking-widest block mb-3">
                    Select Indian Language Dialect:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {sampleLanguages.map((lang) => (
                      <button
                        key={lang.name}
                        onClick={() => setTestLanguage(lang.name)}
                        className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                          testLanguage === lang.name 
                            ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-[1.02]' 
                            : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <p className="text-base font-black">{lang.native}</p>
                        <p className={`text-[10px] font-mono mt-0.5 ${testLanguage === lang.name ? 'text-slate-700' : 'text-slate-500'}`}>
                          {lang.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speech Recognition Result Card */}
                <div className="bg-black/60 rounded-2xl border border-white/15 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 specular-border">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                      <span className="font-mono text-[11px] uppercase tracking-wider text-indigo-400 font-bold">
                        AI Speech Acoustic Model ({currentSample.dialect})
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-white leading-snug">
                      "{currentSample.text}"
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-xs text-slate-400">
                        Mapped Department: <strong className="text-emerald-400 font-bold">General Medicine (Cabin 1)</strong>
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-xs text-slate-400">
                        Urgency Score: <strong className="text-cyan-400 font-bold">Moderate (Normal Queue)</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTestSpeech(currentSample.voice)}
                    className={`px-6 py-4 rounded-full font-extrabold text-xs sm:text-sm flex items-center gap-2.5 flex-shrink-0 transition-all cursor-pointer ${
                      isPlayingAudio 
                        ? 'bg-amber-400 text-black shadow-[0_0_30px_rgba(251,191,36,0.4)] animate-pulse' 
                        : 'bg-white text-black hover:bg-slate-100 shadow-[0_0_30px_rgba(255,255,255,0.25)] active:scale-95'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isPlayingAudio ? 'Speaking Voice...' : 'Play Spoken Voice'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* --- CONSOLE VIEW 3: SMART PROXIMITY PASS --- */}
            {consoleMode === 'patient' && (
              <div className="p-2 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Proximity Slider Control */}
                <div className="bg-black/60 p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Queue Simulation</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
                      LIVE RADAR
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xs font-bold text-slate-300">Patients Ahead of You:</span>
                      <span className="text-3xl font-black text-white font-mono">{testSpotsAway}</span>
                    </div>
                    <input 
                      type="range" min="0" max="4" value={testSpotsAway} 
                      onChange={(e) => setTestSpotsAway(parseInt(e.target.value))} 
                      className="w-full accent-white cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
                      <span className="text-emerald-400 font-bold">0 (Your Turn)</span>
                      <span>1 spot</span>
                      <span>2 spots</span>
                      <span>3 spots</span>
                      <span>4 spots</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Patients don't crowd the corridor. Audio countdown chime triggers on phone at 2 spots away.
                  </p>
                </div>

                {/* Smartphone Pass Preview */}
                <div className={`p-6 rounded-2xl border transition-all specular-border ${
                  testSpotsAway === 0 
                    ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_50px_rgba(16,185,129,0.25)]' 
                    : 'bg-black/60 border-white/15'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Smartphone Lock-Screen Alert
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Est. Wait: ~{testSpotsAway * 4} mins</span>
                  </div>

                  <h4 className="text-xl font-black text-white tracking-tight">
                    {testSpotsAway === 0 
                      ? 'Token S-14: Please Step into Cabin 1!' 
                      : `Token S-14: You are ${testSpotsAway} spot${testSpotsAway > 1 ? 's' : ''} away.`}
                  </h4>

                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {testSpotsAway === 0 
                      ? 'Doctor is waiting for consultation. Proceed directly to Cabin 1.' 
                      : 'You may relax in the garden or cafeteria. Your phone will chime when ready.'}
                  </p>

                  <div className="mt-5">
                    <button 
                      onClick={() => handleTestSpeech(testSpotsAway === 0 ? "Token number S 14, please step into Cabin 1 now." : `Token S 14, you are ${testSpotsAway} spots away. Please head towards the lobby.`)}
                      className="px-5 py-3 rounded-full bg-white text-black hover:bg-slate-100 font-extrabold text-xs transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Speak Phone Alert Aloud</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </section>

      {/* --- BENTO GRID: ENTERPRISE PLATFORM CAPABILITIES --- */}
      <section id="features" className="py-20 sm:py-32 border-t border-white/[0.08] relative scroll-mt-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-widest mb-4">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Full-Spectrum Outpatient Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
              Engineered for seamless hospitals.
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto mt-3 leading-relaxed">
              Replace fragmented clipboards, paper queues, and shouting in waiting rooms with an end-to-end synchronized clinical operating system.
            </p>
          </div>

          {/* Asymmetric Apple Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Bento Card 1: On-Device Paper OCR */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] hover:border-indigo-500/50 transition-all group specular-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  <Scan className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] font-mono uppercase tracking-wider mb-3 border border-indigo-500/20">
                  ML Kit Computer Vision
                </div>
                <h3 className="text-xl font-black text-white mb-2">On-Device Paper Prescription OCR</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Patients capture prior handwritten prescriptions on their camera. Edge neural networks parse medicine names, dosages, and history directly into the doctor's cabin screen.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.08] font-mono text-[11px] text-slate-500">
                • 100% On-Device Privacy Guaranteed
              </div>
            </div>

            {/* Bento Card 2: 6 Regional Indian Languages */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] hover:border-blue-500/50 transition-all group specular-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <Mic className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 text-[10px] font-mono uppercase tracking-wider mb-3 border border-blue-500/20">
                  Multilingual Acoustic AI
                </div>
                <h3 className="text-xl font-black text-white mb-2">Native Regional Voice Intake</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Patients describe symptoms in Hindi, Tamil, Telugu, Marathi, Bengali, or English. Acoustic models convert speech to structured clinical tags, removing literacy hurdles.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.08] font-mono text-[11px] text-slate-500">
                • Zero Typing Required for Elderly
              </div>
            </div>

            {/* Bento Card 3: Visual & Audio AI Triage */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] hover:border-violet-500/50 transition-all group specular-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 text-[10px] font-mono uppercase tracking-wider mb-3 border border-violet-500/20">
                  Visual Body Mapping
                </div>
                <h3 className="text-xl font-black text-white mb-2">Automated Specialty Triage</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Patients tap affected anatomical regions on an interactive 3D anatomy map. The system automatically routes them to the correct specialist cabin without reception line wait.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.08] font-mono text-[11px] text-slate-500">
                • Emergency Priority Triage Flagging
              </div>
            </div>

            {/* Bento Card 4: Real-time Proximity Audio Alert */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/50 transition-all group specular-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <Radio className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-mono uppercase tracking-wider mb-3 border border-emerald-500/20">
                  Corridor Zero-Crowding
                </div>
                <h3 className="text-xl font-black text-white mb-2">Smart Proximity Audio Alerts</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Real-time audio notification speaks to the patient's phone when 2 spots away. Patients sit outside in open air or the cafeteria until their token is called into the examination room.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.08] font-mono text-[11px] text-slate-500">
                • Sub-35ms WebSocket Delivery
              </div>
            </div>

            {/* Bento Card 5: Smart TV Signage Display */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] hover:border-cyan-500/50 transition-all group specular-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <Tv className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-mono uppercase tracking-wider mb-3 border border-cyan-500/20">
                  Lobby Hardware Broadcast
                </div>
                <h3 className="text-xl font-black text-white mb-2">Voice-Enabled Smart TV Board</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Turn any Android TV or browser display into an automated chime board. Announces active patient tokens in bilingual audio with synchronized ticker announcements.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.08] font-mono text-[11px] text-slate-500">
                • Zero Extra Hardware Needed
              </div>
            </div>

            {/* Bento Card 6: Universal Senior Accessibility */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] hover:border-amber-500/50 transition-all group specular-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-mono uppercase tracking-wider mb-3 border border-amber-500/20">
                  Universal Usability
                </div>
                <h3 className="text-xl font-black text-white mb-2">Senior-Grade Human Interface</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Ultra-clear high contrast typography, 48px+ touch targets, color-safe badges, and instant 1-tap spoken confirmations designed for all ages and literacy levels.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.08] font-mono text-[11px] text-slate-500">
                • WCAG AAA Accessibility Calibrated
              </div>
            </div>

            {/* Full Width Hero Card: Instant E-Pharmacy Fulfillment Loop */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-950/30 via-slate-900/60 to-indigo-950/30 border border-indigo-500/30 md:col-span-2 lg:col-span-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8 specular-border shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-2xl flex-shrink-0 shadow-[0_0_30px_rgba(99,102,241,0.4)]">
                  <Pill className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono uppercase tracking-widest mb-1.5 border border-indigo-500/30">
                    Integrated Revenue Channel
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Direct E-Pharmacy Dispatch & Fulfillment</h3>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl mt-1">
                    When the doctor signs off an electronic prescription, the medicine list instantly beams to the hospital pharmacy counter. Pharmacists prepare the packaged medicine before the patient even reaches the cash desk.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm bg-white text-black hover:bg-slate-100 flex-shrink-0 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 cursor-pointer"
              >
                Explore Pharmacy Sync
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS: THE KINETIC FLOW (Nike Speed Pipeline) --- */}
      <section id="how-it-works" className="py-20 sm:py-32 border-t border-white/[0.08] relative scroll-mt-20 z-10 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-16 sm:mb-24">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-widest mb-4">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zero-Friction Outpatient Pipeline</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
              How ArogyaNext flows.
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-xl mx-auto mt-3">
              Four synchronized milestones connecting homes, waiting corridors, doctor cabins, and hospital counters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            
            {/* Step 01 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-black/60 border border-white/10 hover:border-indigo-500/50 transition-all flex flex-col justify-between specular-border group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-white font-mono font-black text-sm flex items-center justify-center">
                    01
                  </span>
                  <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-widest font-semibold">INTAKE</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mb-2">Scan & Voice Book</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Patient speaks in their native regional language or scans past prescriptions with on-device ML Kit OCR.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.08] text-[11px] font-mono text-slate-500">
                • Edge Neural Digitization
              </div>
            </div>

            {/* Step 02 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-black/60 border border-white/10 hover:border-violet-500/50 transition-all flex flex-col justify-between specular-border group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-white font-mono font-black text-sm flex items-center justify-center">
                    02
                  </span>
                  <span className="text-[11px] font-mono text-violet-400 uppercase tracking-widest font-semibold">ROUTING</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mb-2">Visual AI Triage</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Interactive anatomical map and symptom severity meters match the right specialist cabin. Live queue token S-14 is generated.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.08] text-[11px] font-mono text-slate-500">
                • Emergency Priority Filter
              </div>
            </div>

            {/* Step 03 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-black/60 border border-white/10 hover:border-emerald-500/50 transition-all flex flex-col justify-between specular-border group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-white font-mono font-black text-sm flex items-center justify-center">
                    03
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-semibold">COUNTDOWN</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mb-2">Proximity Voice Alert</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Patient's smartphone gives a spoken callout at 2 spots away. The hospital lobby TV board announces the token aloud.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.08] text-[11px] font-mono text-slate-500">
                • Zero Corridor Congestion
              </div>
            </div>

            {/* Step 04 */}
            <div className="p-6 sm:p-7 rounded-3xl bg-black/60 border border-white/10 hover:border-cyan-500/50 transition-all flex flex-col justify-between specular-border group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-white font-mono font-black text-sm flex items-center justify-center">
                    04
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">DISPENSE</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mb-2">Cabin & E-Pharmacy</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Doctor consults with instant OCR context, signs electronic Rx, and hospital pharmacy packs medicine for immediate pickup.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.08] text-[11px] font-mono text-slate-500">
                • Closed Revenue Cycle
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- PRICING SECTION (Apple Pro Hardware Tier Card) --- */}
      <section id="pricing" className="py-20 sm:py-32 border-t border-white/[0.08] relative scroll-mt-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
              Transparent clinic pricing.
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-xl mx-auto mt-3">
              Zero upfront hardware investment. Runs immediately on existing smartphones, tablets, and smart TVs.
            </p>
          </div>

          <div className="max-w-lg mx-auto relative group">
            {/* Luminous Specular Aura */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-70 transition duration-1000"></div>
            
            <div className="relative bg-[#090D16] border border-white/20 rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)] specular-border">
              
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-center py-3">
                <p className="text-white font-black text-xs sm:text-sm tracking-widest uppercase">
                  ★ First 50 Clinics: 6-Month Full Pilot Included
                </p>
              </div>

              <div className="p-8 sm:p-10">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Clinic Pro Plan</h3>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 mb-6">Complete access to the entire ArogyaNext ecosystem.</p>
                
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white tracking-tight">₹999</span>
                  <span className="text-slate-400 text-sm font-semibold">/ month base</span>
                </div>
                
                <div className="bg-white/[0.03] rounded-2xl p-4 mb-8 border border-white/10 flex items-center justify-between">
                  <span className="text-indigo-300 font-bold text-sm">+ ₹500 / month</span>
                  <span className="text-slate-400 text-xs">per active doctor cabin</span>
                </div>

                <ul className="space-y-3.5 mb-9 text-slate-200 text-xs sm:text-sm font-medium">
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 flex-shrink-0" /> Unlimited Patient Token Bookings</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 flex-shrink-0" /> Doctor Cabin Workspace & Smart Pad</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 flex-shrink-0" /> On-Device Google ML Kit Paper Rx OCR</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 flex-shrink-0" /> Voice-Enabled Lobby Smart TV Signage</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 flex-shrink-0" /> 6-Language Regional Voice Triage Engine</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-emerald-400 mr-3 flex-shrink-0" /> E-Pharmacy Queue & Dispense Sync</li>
                </ul>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 rounded-full font-extrabold text-sm text-black bg-white hover:bg-slate-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.25)] active:scale-[0.98] cursor-pointer"
                >
                  Deploy 6-Month Clinic Pilot
                </button>
                <p className="text-center text-slate-500 text-[11px] mt-3 font-medium">
                  Zero credit card required • Dedicated onboarding engineer provided
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* --- BOTTOM CTA (Apple Minimalist Finish) --- */}
      <section className="py-24 sm:py-32 relative overflow-hidden border-t border-white/[0.08] bg-gradient-to-b from-transparent to-black z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-6 tracking-tight">
            Ready to transform your clinic?
          </h2>
          <p className="text-slate-400 text-sm sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto">
            Eliminate waiting room chaos and empower your medical staff with ArogyaNext today.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="px-10 py-5 rounded-full font-black text-base sm:text-lg bg-white text-black hover:bg-slate-100 shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all active:scale-95 cursor-pointer"
          >
            Schedule a Full Hospital Demo
          </button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/[0.08] bg-black py-12 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              ✚
            </div>
            <div className="text-lg font-black text-white">
              Arogya<span className="text-indigo-400">Next</span>
            </div>
          </div>
          <div className="text-slate-500 text-xs font-medium">
            © {new Date().getFullYear()} ArogyaNext Technologies. All rights reserved. • Engineered for Indian Healthcare
          </div>
        </div>
      </footer>

    </div>
  );
}