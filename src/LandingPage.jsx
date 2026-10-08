import { useState } from 'react';

export default function LandingPage({ onLoginClick }) {
  // --- MODAL & FORM STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState('form'); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Pre-filled with your data
  const [hospName, setHospName] = useState('');
  const [userName, setUserName] = useState('Md Shakil Akhtar');
  const [email, setEmail] = useState('');

  // --- INTERACTIVE PLAYGROUND STATES ---
  const [activePlaygroundTab, setActivePlaygroundTab] = useState('ocr');
  const [testLanguage, setTestLanguage] = useState('Hindi');
  const [testSpotsAway, setTestSpotsAway] = useState(2);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const sampleLanguages = [
    { name: 'English', native: 'English', text: 'Doctor, I have a persistent dry cough and slight fever for 3 days.', voice: 'Doctor, I have a persistent dry cough and slight fever for 3 days.', color: 'from-blue-500 to-indigo-600' },
    { name: 'Hindi', native: 'हिन्दी', text: 'डॉक्टर साहब, मुझे 3 दिनों से तेज़ बुखार और सिरदर्द है।', voice: 'Doctor sahab, mujhe teen dinon se tez bukhar aur sirdard hai.', color: 'from-amber-500 to-orange-600' },
    { name: 'Tamil', native: 'தமிழ்', text: 'மருத்துவரே, எனக்கு மூன்று நாட்களாக கடுமையான தலைவலி உள்ளது.', voice: 'Maruthuvare, enakku moondru naatkalaga kadumaiyana thalaivali ulladhu.', color: 'from-emerald-500 to-teal-600' },
    { name: 'Telugu', native: 'తెలుగు', text: 'డాక్టర్ గారు, నాకు మూడు రోజులుగా జ్వరం మరియు దగ్గు ఉంది.', voice: 'Doctor gaaru, naaku moodu rojula gaa jvaram mariyu daggu undhi.', color: 'from-cyan-500 to-blue-600' },
    { name: 'Marathi', native: 'मराठी', text: 'डॉक्टर, मला तीन दिवसांपासून खूप ताप आणि खोकला आहे.', voice: 'Doctor, mala teen divasanpasun khoop taap aani khokla aahe.', color: 'from-purple-500 to-pink-600' },
    { name: 'Bengali', native: 'বাংলা', text: 'ডাক্তারবাবু, আমার তিন দিন ধরে জ্বর এবং কাশি হচ্ছে।', voice: 'Doctorbabu, amar teen din dhore jwor ebong kashi hochhe.', color: 'from-rose-500 to-red-600' },
  ];

  const handleTestSpeech = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
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
    }, 3000); 
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-indigo-500/30 relative overflow-x-hidden">
      
      {/* Background Ambient Glow Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px]"></div>
        <div className="absolute top-[30%] -right-40 w-[600px] h-[600px] bg-purple-600/12 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[20%] left-1/3 w-[700px] h-[500px] bg-teal-600/10 rounded-full blur-[160px]"></div>
      </div>

      {/* --- POPUP DEMO MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md transition-all animate-fadeIn">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative max-h-[92vh] overflow-y-auto ring-1 ring-white/10">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm"
              aria-label="Close modal"
            >
              ✕
            </button>

            {modalState === 'form' ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <span>🏥 Free 6-Month Pilot</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Request Hospital Demo</h3>
                <p className="text-slate-400 mb-6 text-xs sm:text-sm">Experience live voice triage, AI token displays, and on-device OCR tailored to your clinic.</p>
                
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Hospital / Clinic Name</label>
                    <input 
                      type="text" required placeholder="e.g. Apollo Metro Care" 
                      value={hospName} onChange={(e) => setHospName(e.target.value)}
                      className="w-full bg-slate-950/80 border-2 border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contact Person</label>
                    <input 
                      type="text" required placeholder="Your Name" 
                      value={userName} onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-slate-950/80 border-2 border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Official Work Email</label>
                    <input 
                      type="email" required placeholder="admin@hospital.com" 
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/80 border-2 border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm outline-none transition-all focus:ring-4 focus:ring-indigo-500/10" 
                    />
                  </div>
                  <button type="submit" className="w-full py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/25 transition-all active:scale-98 mt-2">
                    Submit Request
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-3xl flex items-center justify-center mx-auto mb-4">
                  ✓
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Request Received!</h3>
                <p className="text-slate-400 text-sm">Our hospital onboarding engineers will reach out within 24 hours.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- NAVBAR --- */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand Logo with glowing medical emblem */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform ring-1 ring-white/20">
              ✚
            </div>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Arogya<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-300">Next</span>
              <span className="ml-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-black tracking-widest uppercase shadow-sm border border-blue-400/30">
                AI OS
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 font-semibold text-xs lg:text-sm text-slate-400">
            <button onClick={() => scrollToSection('features')} className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/80 transition-all cursor-pointer">Platform Features</button>
            <button onClick={() => scrollToSection('simulator')} className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/80 transition-all cursor-pointer">Interactive Simulator</button>
            <button onClick={() => scrollToSection('how-it-works')} className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/80 transition-all cursor-pointer">How It Works</button>
            <button onClick={() => scrollToSection('pricing')} className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-900/80 transition-all cursor-pointer">For Clinics</button>
          </div>

          {/* Action Buttons & Mobile Hamburger */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button 
              onClick={onLoginClick}
              className="px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm text-slate-200 hover:text-white hover:bg-slate-900 border border-slate-700/80 transition-all active:scale-95 shadow-sm"
            >
              Staff Portal
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:inline-flex px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition-all active:scale-95 border border-blue-400/30"
            >
              Book Free Demo
            </button>
            
            {/* Mobile Hamburger Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 py-4 space-y-2 backdrop-blur-xl animate-fadeIn">
            <button 
              onClick={() => scrollToSection('features')} 
              className="block w-full text-left py-2 px-3 rounded-lg text-slate-300 font-bold hover:bg-slate-900"
            >
              Platform Features
            </button>
            <button 
              onClick={() => scrollToSection('simulator')} 
              className="block w-full text-left py-2 px-3 rounded-lg text-slate-300 font-bold hover:bg-slate-900"
            >
              Live Simulator
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="block w-full text-left py-2 px-3 rounded-lg text-slate-300 font-bold hover:bg-slate-900"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('pricing')} 
              className="block w-full text-left py-2 px-3 rounded-lg text-slate-300 font-bold hover:bg-slate-900"
            >
              For Clinics & Pricing
            </button>
            <div className="pt-2 border-t border-slate-800">
              <button 
                onClick={() => { setMobileMenuOpen(false); setIsModalOpen(true); }}
                className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm shadow-md"
              >
                Book a Free Demo
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 md:pt-28 pb-16 sm:pb-24 text-center z-10">
        
        {/* Floating Live System Status Pill */}
        <div className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-4 py-1.5 rounded-full border border-blue-500/40 bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-purple-950/60 text-blue-300 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md shadow-xl shadow-blue-500/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Next-Generation OPD Operating System</span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-indigo-300 font-bold">14,200+ Patient Tokens Processed</span>
        </div>
        
        {/* Grand Typography with Luminous Gradient */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-6 sm:mb-8 leading-[1.08] sm:leading-tight">
          Zero wait times. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
            Infinite clinic efficiency.
          </span>
        </h1>
        
        {/* Rich Subtext */}
        <p className="max-w-2xl mx-auto text-sm sm:text-lg md:text-xl text-slate-300 mb-8 sm:mb-12 leading-relaxed px-2 font-normal">
          ArogyaNext connects patients, reception desks, doctor cabins, and pharmacies into one frictionless loop. From on-device paper OCR to real-time voice triage, we eliminate crowded waiting rooms.
        </p>
        
        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 sm:gap-5 max-w-md sm:max-w-none mx-auto w-full">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-2xl shadow-blue-600/40 hover:-translate-y-0.5 transition-all active:scale-95 border border-blue-400/40"
          >
            Start Free Clinic Pilot
          </button>
          <button 
            onClick={() => scrollToSection('simulator')}
            className="w-full sm:w-auto px-7 py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg border-2 border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white bg-slate-900/70 backdrop-blur-md transition-all active:scale-95 flex items-center justify-center gap-2.5"
          >
            <span>▶ Try Interactive Simulator</span>
          </button>
        </div>

        {/* --- TRUST & IMPACT METRICS RIBBON (Polished Glass Cards) --- */}
        <div className="mt-14 sm:mt-20 pt-8 border-t border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 max-w-5xl mx-auto">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-blue-500/20 shadow-lg text-left relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
            <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">85%</p>
            <p className="text-xs sm:text-sm text-white font-bold mt-1">Average Wait Time Cut</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Smooth flow from check-in to cabin</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-emerald-500/20 shadow-lg text-left relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">&lt;50ms</p>
            <p className="text-xs sm:text-sm text-white font-bold mt-1">Cloud Real-Time Sync</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Sub-second TV & doctor queue updates</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-purple-500/20 shadow-lg text-left relative overflow-hidden group hover:border-purple-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl"></div>
            <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">6 Lang</p>
            <p className="text-xs sm:text-sm text-white font-bold mt-1">Indian Regional Voice AI</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Zero literacy barrier for patients</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-amber-500/20 shadow-lg text-left relative overflow-hidden group hover:border-amber-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl"></div>
            <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">100%</p>
            <p className="text-xs sm:text-sm text-white font-bold mt-1">On-Device OCR Privacy</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Prescriptions read on device edge</p>
          </div>
        </div>
      </section>

      {/* --- INTERACTIVE LIVE FEATURE SIMULATOR --- */}
      <section id="simulator" className="py-16 sm:py-24 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 border-t border-slate-800/80 relative scroll-mt-20 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black uppercase tracking-wider mb-3">
              <span>⚡ Live Interactive Sandbox</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white">Experience ArogyaNext In Action</h2>
            <p className="text-slate-300 text-xs sm:text-base mt-2 max-w-xl mx-auto">Test out OCR extraction, multilingual regional speech triage, and smart proximity alerts live in your browser.</p>
          </div>

          <div className="bg-slate-900/90 border-2 border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            {/* Simulator Tabs */}
            <div className="flex border-b border-slate-800 pb-4 mb-6 gap-2 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActivePlaygroundTab('ocr')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activePlaygroundTab === 'ocr' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>📷</span>
                <span>On-Device ML Kit OCR</span>
              </button>
              <button 
                onClick={() => setActivePlaygroundTab('voice')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activePlaygroundTab === 'voice' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>🎙️</span>
                <span>6-Language Voice AI</span>
              </button>
              <button 
                onClick={() => setActivePlaygroundTab('proximity')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activePlaygroundTab === 'proximity' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>🎟️</span>
                <span>Proximity Audio Countdown</span>
              </button>
            </div>

            {/* TAB 1: OCR SIMULATOR */}
            {activePlaygroundTab === 'ocr' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Camera Capture</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">Google ML Kit Ready</span>
                    </div>
                    <div className="border-2 border-dashed border-indigo-500/50 rounded-2xl p-5 bg-gradient-to-b from-indigo-950/20 to-slate-950 flex flex-col items-center justify-center text-center relative overflow-hidden">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl mb-2">
                        📄
                      </div>
                      <p className="font-bold text-white text-sm">Paper Slip #Rx-8921</p>
                      <p className="text-[11px] text-slate-400 mt-1">Handwritten notes detected • Edge processing</p>
                      <div className="w-full h-1 bg-indigo-500/30 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-indigo-400 animate-pulse w-full"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-3 text-center">Patient photographs prescription at home; digitized before hospital arrival.</p>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-indigo-500/40 flex flex-col justify-between shadow-lg shadow-indigo-500/5">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span>✨</span> Extracted Digital Text
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">0.12s latency</span>
                    </div>
                    <div className="bg-slate-900/90 rounded-xl p-3.5 font-mono text-xs text-slate-200 border border-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                      {"[Prior Prescription Notes]:\n1. Tab. Dolo 650mg - 1x BD (3 Days)\n2. Cap. Amoxicillin 500mg - 1x TDS\n3. Syrup Ascoril LS - 5ml at bedtime\nDiagnosis: Acute bronchitis with mild fever"}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span>✓</span> Ready in Doctor Cabin
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Status: Synced</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MULTI-LANGUAGE VOICE SIMULATOR */}
            {activePlaygroundTab === 'voice' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tap a regional language to hear audio voice guidance:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {sampleLanguages.map((lang) => (
                    <button
                      key={lang.name}
                      onClick={() => setTestLanguage(lang.name)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        testLanguage === lang.name 
                          ? 'bg-gradient-to-b from-blue-900/50 to-indigo-950/80 border-blue-400 text-white shadow-lg shadow-blue-500/20' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <p className="text-sm font-black">{lang.native}</p>
                      <p className="text-[10px] text-slate-400">{lang.name}</p>
                    </button>
                  ))}
                </div>

                {(() => {
                  const currentSample = sampleLanguages.find(l => l.name === testLanguage) || sampleLanguages[0];
                  return (
                    <div className="bg-slate-950 p-5 rounded-2xl border border-blue-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                          <span>🎙️</span> Recognized Patient Speech ({currentSample.name}):
                        </span>
                        <p className="text-base sm:text-xl font-black text-white mt-1 leading-snug">"{currentSample.text}"</p>
                        <p className="text-xs text-slate-400 mt-1.5">
                          AI Mapped Cabin: <span className="text-emerald-400 font-bold">General Medicine / Pulmonology</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleTestSpeech(currentSample.voice)}
                        className={`px-5 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white flex items-center gap-2 flex-shrink-0 transition-all ${
                          isPlayingAudio ? 'bg-amber-600 animate-pulse' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 active:scale-95'
                        }`}
                      >
                        <span>🔊</span>
                        <span>{isPlayingAudio ? 'Speaking...' : 'Play Audio Voice'}</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 3: PROXIMITY SIMULATOR */}
            {activePlaygroundTab === 'proximity' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Simulate Patients Ahead: <span className="text-emerald-400 font-mono text-lg font-black">{testSpotsAway}</span>
                  </label>
                  <input 
                    type="range" min="0" max="4" value={testSpotsAway} 
                    onChange={(e) => setTestSpotsAway(parseInt(e.target.value))} 
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
                    <span className="text-emerald-400 font-bold">0 (Your Turn!)</span>
                    <span>1 spot</span>
                    <span>2 spots</span>
                    <span>3 spots</span>
                    <span>4 spots</span>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border transition-all ${
                  testSpotsAway === 0 
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.25)]' 
                    : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Smartphone Alert Preview
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Est. Wait: ~{testSpotsAway * 5} mins</span>
                  </div>
                  <h4 className="text-lg font-black text-white">
                    {testSpotsAway === 0 ? '🚨 Please Step into Doctor Cabin 1!' : `⏳ Token S-14: You are ${testSpotsAway} spot${testSpotsAway > 1 ? 's' : ''} away.`}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    {testSpotsAway === 0 
                      ? 'Doctor is waiting for consultation. Proceed directly to the examination cabin.' 
                      : 'Please make your way towards the hospital waiting lounge.'}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => handleTestSpeech(testSpotsAway === 0 ? "Token number S 14, please step into Cabin 1 now." : `Token S 14, you are ${testSpotsAway} spots away. Please head towards the lobby.`)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95"
                    >
                      <span>🔊</span>
                      <span>Speak Notification Aloud</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- PLATFORM FEATURES SECTION (Rich Color Palette & Custom Vector Emblems) --- */}
      <section id="features" className="bg-slate-950 py-16 sm:py-24 border-t border-slate-800/80 scroll-mt-20 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider mb-3">
              <span>💎 Enterprise Clinical Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white">Everything your hospital needs.</h2>
            <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto mt-2">Engineered from ground up to replace fragmented paper systems with synchronized intelligence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1: On-Device Prescription OCR */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-indigo-500/30 hover:border-indigo-400/70 transition-all group shadow-xl hover:-translate-y-1 relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white text-2xl mb-5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[10px] font-black uppercase tracking-wider mb-2.5 border border-indigo-500/30">Google ML Kit Edge</div>
              <h3 className="text-xl font-black text-white mb-2">On-Device Paper OCR</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">Patients take a photo of previous physical prescriptions. Local computer-vision models digitize handwritten notes, dosage history, and symptoms directly to the doctor's cabin screen.</p>
            </div>

            {/* Feature 2: Multi-Language Voice AI */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-blue-500/30 hover:border-blue-400/70 transition-all group shadow-xl hover:-translate-y-1 relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl mb-5 shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-300 text-[10px] font-black uppercase tracking-wider mb-2.5 border border-blue-500/30">6 Indian Languages</div>
              <h3 className="text-xl font-black text-white mb-2">Native Voice Intake</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">Patients describe their symptoms in English, Hindi, Tamil, Telugu, Marathi, or Bengali. Voice AI converts speech to clinical symptoms, eliminating literacy hurdles for elderly citizens.</p>
            </div>

            {/* Feature 3: Visual & Audio AI Symptom Triage */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-purple-500/30 hover:border-purple-400/70 transition-all group shadow-xl hover:-translate-y-1 relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white text-2xl mb-5 shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 text-[10px] font-black uppercase tracking-wider mb-2.5 border border-purple-500/30">Visual Body Map</div>
              <h3 className="text-xl font-black text-white mb-2">Visual & Audio AI Triage</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">Interactive body map areas, color-coded pain severity meters, and voice guidance help patients choose the appropriate specialty clinic without queueing at reception.</p>
            </div>

            {/* Feature 4: Live Queue Proximity Alerts */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-emerald-500/30 hover:border-emerald-400/70 transition-all group shadow-xl hover:-translate-y-1 relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl mb-5 shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-2.5 border border-emerald-500/30">Zero Lobby Crowding</div>
              <h3 className="text-xl font-black text-white mb-2">Smart Proximity Alerts</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">Patients receive real-time audio callouts on their phones when 4, 3, 2, or 1 spot away, allowing them to relax outside or in the cafeteria until their turn arrives.</p>
            </div>

            {/* Feature 5: Senior-Friendly Material 3 Design */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-amber-500/30 hover:border-amber-400/70 transition-all group shadow-xl hover:-translate-y-1 relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl mb-5 shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2.5 border border-amber-500/30">Universal Access</div>
              <h3 className="text-xl font-black text-white mb-2">Senior-First Accessibility</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">High-contrast typography, large touch targets, color-safe badges, and 1-tap voice readouts designed for ease of use across all age groups.</p>
            </div>

            {/* Feature 6: Voice-Enabled TV Signage & Analytics */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-pink-500/30 hover:border-pink-400/70 transition-all group shadow-xl hover:-translate-y-1 relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white text-2xl mb-5 shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-pink-500/10 text-pink-300 text-[10px] font-black uppercase tracking-wider mb-2.5 border border-pink-500/30">Broadcast Lobby Signage</div>
              <h3 className="text-xl font-black text-white mb-2">Smart TV Audio Signage</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">Turns waiting room TVs into intelligent signage with clinic chimes, multi-doctor queue boards, and marquee announcements synced in real time.</p>
            </div>

            {/* Feature 7: E-Pharmacy Sync (Full Width Banner) */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40 border-2 border-teal-500/40 md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 shadow-2xl relative overflow-hidden">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white text-3xl sm:text-4xl shadow-xl shadow-teal-500/30 flex-shrink-0">
                💊
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] sm:text-xs font-black tracking-widest uppercase mb-2 border border-teal-500/40">
                  Instant Revenue Channel
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">Direct E-Pharmacy Dispatch & Packing</h3>
                <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-4xl">
                  Doctors complete consultations and sync digital prescriptions with one click to the hospital pharmacy counter. Medication packets are prepared before the patient reaches the billing desk.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION (Polished Process Flow with Gradient Badges) --- */}
      <section id="how-it-works" className="py-16 sm:py-24 border-t border-slate-800/80 bg-slate-900/60 scroll-mt-20 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider mb-3">
              <span>🔄 Frictionless End-to-End Loop</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white">How ArogyaNext flows.</h2>
            <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto mt-2">A cohesive patient journey connecting homes, waiting lobbies, doctors, and pharmacy counters.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="relative p-6 sm:p-7 rounded-3xl bg-slate-950 border border-indigo-500/30 shadow-xl flex flex-col justify-between hover:border-indigo-400 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-mono font-black text-sm flex items-center justify-center shadow-inner">
                    01
                  </span>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Patient Intake</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mb-2">Scan & Voice Book</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Patient speaks in their native regional dialect or captures previous prescriptions using on-device ML Kit OCR.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-900 text-[11px] font-mono text-indigo-300">
                • Edge Camera Processing
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 sm:p-7 rounded-3xl bg-slate-950 border border-purple-500/30 shadow-xl flex flex-col justify-between hover:border-purple-400 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 font-mono font-black text-sm flex items-center justify-center shadow-inner">
                    02
                  </span>
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Specialty Routing</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mb-2">Visual AI Triage</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Interactive body map & pain meters match the right specialist cabin. A live queue token (e.g. S-14) is instantly generated.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-900 text-[11px] font-mono text-purple-300">
                • Priority Emergency Tagging
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 sm:p-7 rounded-3xl bg-slate-950 border border-emerald-500/30 shadow-xl flex flex-col justify-between hover:border-emerald-400 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-mono font-black text-sm flex items-center justify-center shadow-inner">
                    03
                  </span>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Queue Notice</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mb-2">Proximity Voice Alert</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Patient's phone provides spoken callouts at 2 spots away. The hospital lobby TV chimes token announcements aloud.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-900 text-[11px] font-mono text-emerald-300">
                • Zero Waiting Lobby Stress
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative p-6 sm:p-7 rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-xl flex flex-col justify-between hover:border-cyan-400 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 font-mono font-black text-sm flex items-center justify-center shadow-inner">
                    04
                  </span>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Cabin & Pharmacy</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mb-2">Consult & Dispense</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Doctor inspects extracted OCR notes, signs electronic Rx, and hospital pharmacy packs medicine for immediate pickup.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-900 text-[11px] font-mono text-cyan-300">
                • Integrated Revenue Loop
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-16 sm:py-24 border-t border-slate-800/80 bg-slate-950 scroll-mt-20 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-white">Transparent clinic pricing.</h2>
            <p className="text-slate-300 text-sm sm:text-lg max-w-xl mx-auto mt-2">Zero setup hardware overhead. Runs on existing phones, tablets, and smart TVs.</p>
          </div>

          <div className="max-w-md mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[2.5rem] blur-xl opacity-35 group-hover:opacity-60 transition duration-1000"></div>
            
            <div className="relative bg-slate-900 border-2 border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-center py-3">
                <p className="text-white font-black text-xs sm:text-sm tracking-widest uppercase">
                  ⭐ First 50 Clinics: 6-Month Pilot Included
                </p>
              </div>

              <div className="p-7 sm:p-9">
                <h3 className="text-2xl font-black text-white mb-1">Clinic Pro Plan</h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-6">Complete access to the entire ArogyaNext ecosystem.</p>
                
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white">₹999</span>
                  <span className="text-slate-400 text-sm font-semibold">/ month base</span>
                </div>
                
                <div className="bg-slate-950/80 rounded-xl p-3.5 mb-7 border border-slate-800 flex items-center justify-between">
                  <span className="text-blue-400 font-bold text-sm">+ ₹500 / month</span>
                  <span className="text-slate-400 text-xs font-medium">per active doctor cabin</span>
                </div>

                <ul className="space-y-3.5 mb-8 text-slate-200 text-xs sm:text-sm font-medium">
                  <li className="flex items-center"><span className="text-emerald-400 mr-2.5 text-base font-bold">✓</span> Unlimited Patient Token Bookings</li>
                  <li className="flex items-center"><span className="text-emerald-400 mr-2.5 text-base font-bold">✓</span> Doctor Cabin Workspace & Smart Pad</li>
                  <li className="flex items-center"><span className="text-emerald-400 mr-2.5 text-base font-bold">✓</span> On-Device Google ML Kit Paper Rx OCR</li>
                  <li className="flex items-center"><span className="text-emerald-400 mr-2.5 text-base font-bold">✓</span> Voice-Enabled Lobby Smart TV Signage</li>
                  <li className="flex items-center"><span className="text-emerald-400 mr-2.5 text-base font-bold">✓</span> 6-Language Regional Voice Triage</li>
                  <li className="flex items-center"><span className="text-emerald-400 mr-2.5 text-base font-bold">✓</span> E-Pharmacy Queue & Dispense Sync</li>
                </ul>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl shadow-blue-500/25 active:scale-98"
                >
                  Start Your 6-Month Pilot
                </button>
                <p className="text-center text-slate-500 text-[11px] mt-3 font-medium">
                  No credit card required • Dedicated setup engineer provided
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BOTTOM CTA --- */}
      <section className="py-20 sm:py-28 relative overflow-hidden border-t border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950/30 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-4 sm:mb-6">Ready to modernize your clinic?</h2>
          <p className="text-slate-300 text-sm sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto">Eliminate waiting room chaos and empower your staff with ArogyaNext today.</p>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="px-9 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-2xl shadow-blue-600/35 transition-all active:scale-95 border border-blue-400/40"
          >
            Schedule a Full Hospital Demo
          </button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 sm:py-12 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
              ✚
            </div>
            <div className="text-lg font-black text-white">
              Arogya<span className="text-blue-400">Next</span>
            </div>
          </div>
          <div className="text-slate-400 text-xs font-medium">
            © {new Date().getFullYear()} ArogyaNext Technologies. All rights reserved. • Built for Indian Healthcare
          </div>
        </div>
      </footer>

    </div>
  );
}