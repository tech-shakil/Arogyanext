import { useState } from 'react';

export default function LandingPage({ onLoginClick }) {
  // --- MODAL & FORM STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState('form'); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Pre-filled with your data!
  const [hospName, setHospName] = useState('');
  const [userName, setUserName] = useState('Md Shakil Akhtar');
  const [email, setEmail] = useState('');

  // --- INTERACTIVE PLAYGROUND STATES ---
  const [activePlaygroundTab, setActivePlaygroundTab] = useState('ocr');
  const [testLanguage, setTestLanguage] = useState('Hindi');
  const [testSpotsAway, setTestSpotsAway] = useState(2);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const sampleLanguages = [
    { name: 'English', native: 'English', text: 'Doctor, I have a persistent dry cough and slight fever for 3 days.', voice: 'Doctor, I have a persistent dry cough and slight fever for 3 days.' },
    { name: 'Hindi', native: 'हिन्दी', text: 'डॉक्टर साहब, मुझे 3 दिनों से तेज़ बुखार और सिरदर्द है।', voice: 'Doctor sahab, mujhe teen dinon se tez bukhar aur sirdard hai.' },
    { name: 'Tamil', native: 'தமிழ்', text: 'மருத்துவரே, எனக்கு மூன்று நாட்களாக கடுமையான தலைவலி உள்ளது.', voice: 'Maruthuvare, enakku moondru naatkalaga kadumaiyana thalaivali ulladhu.' },
    { name: 'Telugu', native: 'తెలుగు', text: 'డాక్టర్ గారు, నాకు మూడు రోజులుగా జ్వరం మరియు దగ్గు ఉంది.', voice: 'Doctor gaaru, naaku moodu rojula gaa jvaram mariyu daggu undhi.' },
    { name: 'Marathi', native: 'मराठी', text: 'डॉक्टर, मला तीन दिवसांपासून खूप ताप आणि खोकला आहे.', voice: 'Doctor, mala teen divasanpasun khoop taap aani khokla aahe.' },
    { name: 'Bengali', native: 'বাংলা', text: 'ডাক্তারবাবু, আমার তিন দিন ধরে জ্বর এবং কাশি হচ্ছে।', voice: 'Doctorbabu, amar teen din dhore jwor ebong kashi hochhe.' },
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

  // Smooth scroll function for the navigation links
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle the Demo Form Submission
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
    <div className="min-h-screen bg-slate-900 font-sans text-slate-300 selection:bg-blue-500/30 relative overflow-x-hidden">
      
      {/* --- POPUP DEMO MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg text-lg transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>

            {modalState === 'form' ? (
              <>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Request a Demo</h3>
                <p className="text-slate-400 mb-6 text-xs sm:text-sm">Leave your details and our team will set up your hospital's custom ArogyaNext workspace.</p>
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <input 
                    type="text" required placeholder="Hospital / Clinic Name" 
                    value={hospName} onChange={(e) => setHospName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors" 
                  />
                  <input 
                    type="text" required placeholder="Your Name" 
                    value={userName} onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors" 
                  />
                  <input 
                    type="email" required placeholder="Work Email" 
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm transition-colors" 
                  />
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-98">
                    Submit Request
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Request Sent!</h3>
                <p className="text-slate-400 text-sm">Our onboarding team will contact you within 24 hours.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- NAVBAR --- */}
      <nav className="border-b border-slate-800 bg-slate-950/75 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            className="text-xl sm:text-2xl font-black tracking-wider text-white flex items-center cursor-pointer select-none" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Arogya<span className="text-blue-500">Next</span>
            <span className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
              AI
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8 font-medium text-sm text-slate-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors cursor-pointer">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors cursor-pointer">How it Works</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors cursor-pointer">For Hospitals</button>
          </div>

          {/* Action Buttons & Mobile Hamburger */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button 
              onClick={onLoginClick}
              className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm text-white hover:bg-slate-800 transition-colors border border-slate-700 active:scale-95"
            >
              Staff Login
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:inline-flex px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              Book a Demo
            </button>
            
            {/* Mobile Hamburger Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-3">
            <button 
              onClick={() => scrollToSection('features')} 
              className="block w-full text-left py-2 px-3 rounded-lg text-slate-300 font-medium hover:bg-slate-900 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="block w-full text-left py-2 px-3 rounded-lg text-slate-300 font-medium hover:bg-slate-900 transition-colors"
            >
              How it Works
            </button>
            <button 
              onClick={() => scrollToSection('pricing')} 
              className="block w-full text-left py-2 px-3 rounded-lg text-slate-300 font-medium hover:bg-slate-900 transition-colors"
            >
              For Hospitals
            </button>
            <div className="pt-2 border-t border-slate-800">
              <button 
                onClick={() => { setMobileMenuOpen(false); setIsModalOpen(true); }}
                className="w-full text-center py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md"
              >
                Book a Demo
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 md:pt-32 pb-16 sm:pb-28 md:pb-40 text-center overflow-hidden">
        
        {/* Glow Spheres with mobile boundaries */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] md:w-[750px] h-[250px] sm:h-[350px] bg-blue-600/20 blur-[90px] sm:blur-[120px] rounded-full pointer-events-none animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] sm:w-[350px] md:w-[450px] h-[200px] sm:h-[280px] bg-purple-600/20 blur-[80px] sm:blur-[100px] rounded-full pointer-events-none animate-pulse"></div>

        {/* Top Badge with Floating Animation */}
        <div className="inline-flex items-center max-w-full mb-4 sm:mb-6 px-3.5 sm:px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs sm:text-sm font-bold tracking-wide backdrop-blur-sm animate-float shadow-lg shadow-blue-500/10">
          <span className="truncate">🚀 The Next Gen Hospital Management OS</span>
        </div>
        
        {/* Responsive Heading with Animated Gradient */}
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-4 sm:mb-8 leading-[1.12] sm:leading-tight relative z-10">
          Zero wait times. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 animate-gradient">
            Infinite efficiency.
          </span>
        </h1>
        
        {/* Description */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-xl text-slate-400 mb-8 sm:mb-12 leading-relaxed relative z-10 px-2">
          ArogyaNext AI is the complete operating system for modern clinics. From voice-activated mobile booking to real-time TV queues, we eliminate the chaos of the waiting room.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 relative z-10 max-w-xs sm:max-w-none mx-auto w-full">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-xl hover:-translate-y-0.5 active:scale-95"
          >
            Start Free Trial
          </button>
          <button 
            onClick={() => scrollToSection('simulator')}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg border border-slate-700 hover:border-slate-500 text-white bg-slate-800/50 backdrop-blur-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🎮 Try Live Simulator</span>
          </button>
        </div>

        {/* --- TRUST & IMPACT METRICS RIBBON --- */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto relative z-10">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">85%</p>
            <p className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Wait Time Cut</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">&lt;50ms</p>
            <p className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Cloud Sync</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">6 Lang</p>
            <p className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Voice Triage</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">100%</p>
            <p className="text-[11px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">On-Device OCR</p>
          </div>
        </div>
      </div>

      {/* --- INTERACTIVE LIVE FEATURE SIMULATOR --- */}
      <div id="simulator" className="py-12 sm:py-16 bg-slate-950/80 border-t border-slate-800 relative scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>⚡ Hands-on Preview</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">Experience ArogyaNext In Action</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl mx-auto">Interact with the core modules below to see how speech triage, OCR parsing, and proximity countdown alerts work in real time.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Simulator Tabs */}
            <div className="flex border-b border-slate-800 pb-4 mb-6 gap-2 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActivePlaygroundTab('ocr')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activePlaygroundTab === 'ocr' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-800/70 text-slate-400 hover:text-white'
                }`}
              >
                <span>📷</span>
                <span>On-Device ML Kit OCR</span>
              </button>
              <button 
                onClick={() => setActivePlaygroundTab('voice')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activePlaygroundTab === 'voice' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-800/70 text-slate-400 hover:text-white'
                }`}
              >
                <span>🎙️</span>
                <span>6-Language Voice AI</span>
              </button>
              <button 
                onClick={() => setActivePlaygroundTab('proximity')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activePlaygroundTab === 'proximity' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-800/70 text-slate-400 hover:text-white'
                }`}
              >
                <span>🎟️</span>
                <span>Proximity Voice Countdown</span>
              </button>
            </div>

            {/* TAB 1: OCR SIMULATOR */}
            {activePlaygroundTab === 'ocr' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Camera Capture</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">Edge ML Processed</span>
                  </div>
                  <div className="border-2 border-dashed border-indigo-500/40 rounded-xl p-4 bg-indigo-950/20 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl mb-2">📄</span>
                    <p className="font-bold text-white text-sm">Sample Paper Slip #Rx-8921</p>
                    <p className="text-[11px] text-slate-400 mt-1">Simulated camera input • Privacy protected</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-indigo-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span>✨</span> Extracted Digital Text
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">0.12s latency</span>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-3 font-mono text-xs text-slate-200 border border-slate-800 whitespace-pre-wrap leading-relaxed">
                      {"[Prior Prescription Notes]:\n1. Tab. Dolo 650mg - 1x BD (3 Days)\n2. Cap. Amoxicillin 500mg - 1x TDS\n3. Syrup Ascoril LS - 5ml at bedtime\nDiagnosis: Acute bronchitis with mild fever"}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
                    <span className="text-emerald-400">✓</span> Auto-syncs directly to attending doctor's cabin screen
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: MULTI-LANGUAGE VOICE SIMULATOR */}
            {activePlaygroundTab === 'voice' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Select a regional Indian language to hear live voice triage:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {sampleLanguages.map((lang) => (
                    <button
                      key={lang.name}
                      onClick={() => setTestLanguage(lang.name)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        testLanguage === lang.name 
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <p className="text-xs font-bold">{lang.native}</p>
                      <p className="text-[10px] text-slate-500">{lang.name}</p>
                    </button>
                  ))}
                </div>

                {(() => {
                  const currentSample = sampleLanguages.find(l => l.name === testLanguage) || sampleLanguages[0];
                  return (
                    <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Recognized Patient Speech:</span>
                        <p className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">"{currentSample.text}"</p>
                        <p className="text-xs text-slate-400 mt-1">Mapped Specialist: <span className="text-emerald-400 font-bold">General Medicine / Pulmonology</span></p>
                      </div>
                      <button
                        onClick={() => handleTestSpeech(currentSample.voice)}
                        className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center gap-2 flex-shrink-0 transition-all ${
                          isPlayingAudio ? 'bg-amber-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 active:scale-95'
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
                <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Simulate Patients Ahead: <span className="text-emerald-400 font-mono text-base font-black">{testSpotsAway}</span>
                  </label>
                  <input 
                    type="range" min="0" max="4" value={testSpotsAway} 
                    onChange={(e) => setTestSpotsAway(parseInt(e.target.value))} 
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                    <span>0 (Your Turn!)</span>
                    <span>1 spot</span>
                    <span>2 spots</span>
                    <span>3 spots</span>
                    <span>4 spots</span>
                  </div>
                </div>

                <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  testSpotsAway === 0 
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.25)]' 
                    : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Smartphone Alert Preview</span>
                    <span className="text-[10px] text-slate-400 font-mono">Est. Wait: ~{testSpotsAway * 5} mins</span>
                  </div>
                  <h4 className="text-lg font-black text-white">
                    {testSpotsAway === 0 ? '🚨 Please Step into Doctor Cabin 1!' : `⏳ Token S-14: You are ${testSpotsAway} spot${testSpotsAway > 1 ? 's' : ''} away.`}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    {testSpotsAway === 0 
                      ? 'Doctor is ready. Proceed directly to the examination desk.' 
                      : 'Please make your way toward the waiting lobby.'}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => handleTestSpeech(testSpotsAway === 0 ? "Token number S 14, please step into Cabin 1 now." : `Token S 14, you are ${testSpotsAway} spots away. Please head towards the lobby.`)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>🔊</span>
                      <span>Speak Alert</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- UPGRADED FEATURES GRID (With OCR, Multi-Language & Proximity) --- */}
      <div id="features" className="bg-slate-950 py-16 sm:py-24 md:py-32 border-t border-slate-800 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
              <span>✨ Version 2.0 Architectural Upgrades</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-6">Everything your hospital needs.</h2>
            <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">From paper prescription OCR scanning to multi-lingual voice triage, ArogyaNext unifies patients and clinicians in one frictionless loop.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            
            {/* Feature 1: On-Device Prescription OCR */}
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-indigo-500/50 transition-colors group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-5 sm:mb-6 group-hover:scale-110 transition-transform">📷</div>
              <div className="inline-block px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] font-black uppercase tracking-wider mb-2 border border-indigo-500/20">Google ML Kit</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">On-Device Prescription OCR</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">Patients take a photo of old paper prescriptions. Privacy-focused on-device text recognition instantly extracts doctor notes, previous medications, and reported symptoms directly for the doctor to review.</p>
            </div>

            {/* Feature 2: Multi-Language Voice AI */}
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-blue-500/50 transition-colors group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-5 sm:mb-6 group-hover:scale-110 transition-transform">🎙️</div>
              <div className="inline-block px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px] font-black uppercase tracking-wider mb-2 border border-blue-500/20">6 Regional Languages</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Multi-Language Voice AI</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">Patients speak in English, Hindi (हिन्दी), Tamil (தமிழ்), Telugu (తెలుగు), Marathi (मराठी), or Bengali (বাংলা). High-accuracy speech recognition eliminates the digital divide for elderly and regional citizens.</p>
            </div>

            {/* Feature 3: Visual & Audio AI Symptom Triage */}
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-purple-500/50 transition-colors group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-5 sm:mb-6 group-hover:scale-110 transition-transform">🧠</div>
              <div className="inline-block px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px] font-black uppercase tracking-wider mb-2 border border-purple-500/20">Visual Body Map & Audio</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Visual & Audio AI Triage</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">Interactive body map regions (Head, Chest, Digestion, Limbs), universal emoji cards, color-coded pain scale, and Text-to-Speech audio guidance (`Listen 🔊`) ensure even illiterate patients select the right specialist.</p>
            </div>

            {/* Feature 4: Live Queue Proximity Alerts */}
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-emerald-500/50 transition-colors group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-5 sm:mb-6 group-hover:scale-110 transition-transform">🎟️</div>
              <div className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-2 border border-emerald-500/20">0–4 Spots Away</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Live Proximity Voice Alerts</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">Patients receive live estimated wait times (~5 min per token) and automated voice proximity callouts when 4, 3, 2, 1, or 0 spots away with interactive check-in (`[ Proceed ]` / `[ Cancel ]`).</p>
            </div>

            {/* Feature 5: Senior-Friendly Material 3 Design */}
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-orange-500/50 transition-colors group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-5 sm:mb-6 group-hover:scale-110 transition-transform">👵</div>
              <div className="inline-block px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 text-[10px] font-black uppercase tracking-wider mb-2 border border-orange-500/20">Universal Accessibility</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Senior-Friendly Patient UI</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">Large high-contrast touch targets (≥48dp), rounded Material 3 cards, an interactive 4-step onboarding walkthrough, and instant 1-tap demo check-ins make the app effortless for all generations.</p>
            </div>

            {/* Feature 6: Voice-Enabled TV Signage & Analytics */}
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-pink-500/50 transition-colors group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-pink-500/10 text-pink-400 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-5 sm:mb-6 group-hover:scale-110 transition-transform">📺</div>
              <div className="inline-block px-2 py-0.5 rounded bg-pink-500/10 text-pink-300 text-[10px] font-black uppercase tracking-wider mb-2 border border-pink-500/20">Broadcast Displays</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Smart TV Lobby Signage</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">Smart TVs in hospital waiting rooms display neon live queues, continuous scrolling notice tickers, and spoken token announcements in real time as doctors click 'Call In'.</p>
            </div>

            {/* FEATURE 7: E-Pharmacy Sync */}
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-teal-500/50 transition-all group md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-500/10 text-teal-400 rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(20,184,166,0.2)]">💊</div>
              
              <div>
                <div className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 bg-teal-500/20 text-teal-300 text-[10px] sm:text-xs font-black tracking-widest uppercase rounded-md mb-2 sm:mb-3 border border-teal-500/30">Direct In-House Revenue</div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2 sm:mb-3">Instant E-Pharmacy Routing & OCR Sync</h3>
                <p className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-4xl">Doctors review the patient's scanned paper prescription, generate a digital prescription, and with one click send the medicine order to the in-house pharmacy counter. Medicines are dispensed before the patient walks in.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- HOW IT WORKS SECTION --- */}
      <div id="how-it-works" className="py-16 sm:py-24 md:py-32 scroll-mt-20 border-t border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-6">How ArogyaNext flows.</h2>
            <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">From paper photo or voice input to the doctor's desk and hospital pharmacy.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-900 via-blue-500/50 to-purple-900 z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center p-4 rounded-2xl bg-slate-950/40 md:bg-transparent border border-slate-800 md:border-none">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-950 border-4 border-slate-800 group-hover:border-indigo-500 rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-6 shadow-xl transition-colors">1️⃣</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Scan & Voice Book</h3>
              <p className="text-slate-400 text-xs sm:text-sm">Patient speaks in their native language or photographs an old prescription with ML Kit OCR.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center p-4 rounded-2xl bg-slate-950/40 md:bg-transparent border border-slate-800 md:border-none">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-950 border-4 border-slate-800 group-hover:border-purple-500 rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-6 shadow-xl transition-colors">2️⃣</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Visual AI Triage</h3>
              <p className="text-slate-400 text-xs sm:text-sm">Universal body map and emoji pain scale match specialist. Live token queue is generated.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center p-4 rounded-2xl bg-slate-950/40 md:bg-transparent border border-slate-800 md:border-none">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-950 border-4 border-slate-800 group-hover:border-blue-500 rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-6 shadow-xl transition-colors">3️⃣</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Proximity Alert</h3>
              <p className="text-slate-400 text-xs sm:text-sm">Phone speaks alert at 0–4 spots away. Waiting TV lobby announces token aloud.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center p-4 rounded-2xl bg-slate-950/40 md:bg-transparent border border-slate-800 md:border-none">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-950 border-4 border-slate-800 group-hover:border-emerald-500 rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-4 sm:mb-6 shadow-xl transition-colors">4️⃣</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Consult & Dispense</h3>
              <p className="text-slate-400 text-xs sm:text-sm">Doctor checks scanned notes, e-signs prescription; hospital pharmacy packs medicines instantly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- PRICING SECTION --- */}
      <div id="pricing" className="py-16 sm:py-24 md:py-32 scroll-mt-20 border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-6">Simple, scalable pricing.</h2>
            <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">No hidden installation fees. Pay only for the size of your workforce.</p>
          </div>

          <div className="max-w-md mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] sm:rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            
            <div className="relative bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-center py-2.5 sm:py-3">
                <p className="text-white font-black text-xs sm:text-sm tracking-widest uppercase animate-pulse">
                  🚀 First 50 Clinics: 6 Months Free
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Clinic Pro Plan</h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-5 sm:mb-6">Full access to the entire ArogyaNext ecosystem.</p>
                
                <div className="mb-5 sm:mb-6">
                  <span className="text-4xl sm:text-5xl font-black text-white">₹999</span>
                  <span className="text-slate-400 text-sm font-medium"> / month base</span>
                </div>
                
                <div className="bg-slate-800/60 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8 border border-slate-700/50 inline-block">
                  <span className="text-blue-400 font-bold text-sm sm:text-base tracking-wide">+ ₹500 / month</span>
                  <span className="text-slate-400 text-xs sm:text-sm ml-2">per active doctor</span>
                </div>

                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-slate-300 text-xs sm:text-sm font-medium">
                  <li className="flex items-center"><span className="text-emerald-500 mr-2.5 text-base sm:text-lg">✓</span> Unlimited Patient Bookings</li>
                  <li className="flex items-center"><span className="text-emerald-500 mr-2.5 text-base sm:text-lg">✓</span> Unlimited Support Staff Logins</li>
                  <li className="flex items-center"><span className="text-emerald-500 mr-2.5 text-base sm:text-lg">✓</span> Voice-Enabled TV Signage</li>
                  <li className="flex items-center"><span className="text-emerald-500 mr-2.5 text-base sm:text-lg">✓</span> Director Analytics Dashboard</li>
                  <li className="flex items-center"><span className="text-emerald-500 mr-2.5 text-base sm:text-lg">✓</span> AI Triage & Voice Assistant</li>
                </ul>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-white hover:bg-slate-100 text-slate-900 font-black py-3.5 sm:py-4 rounded-xl transition-all shadow-md active:scale-98"
                >
                  Claim Your 6-Month Pilot
                </button>
                <p className="text-center text-slate-500 text-[11px] sm:text-xs mt-3 sm:mt-4 font-medium">
                  No credit card required for pilot setup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CTA SECTION --- */}
      <div className="py-16 sm:py-24 md:py-32 relative overflow-hidden border-t border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-950/20"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-8">Ready to upgrade your hospital?</h2>
          <p className="text-sm sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-10 max-w-2xl mx-auto">Join the network of modern clinics eliminating wait times and boosting patient satisfaction.</p>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-600/30 transition-all active:scale-95"
          >
            Book a Full System Demo
          </button>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="text-lg sm:text-xl font-black tracking-wider text-slate-400">
            Arogya<span className="text-blue-500">Next</span>
          </div>
          <div className="text-slate-500 text-xs sm:text-sm font-medium">
            © {new Date().getFullYear()} ArogyaNext Technologies. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}