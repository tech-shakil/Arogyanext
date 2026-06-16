import { useState } from 'react';

export default function LandingPage({ onLoginClick }) {
  // --- MODAL & FORM STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState('form'); 
  
  // Pre-filled with your data!
  const [hospName, setHospName] = useState('');
  const [userName, setUserName] = useState('Md Shakil Akhtar');
  const [email, setEmail] = useState('');

  // Smooth scroll function for the navigation links
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle the Demo Form Submission
  const handleDemoSubmit = (e) => {
    e.preventDefault();
    // Later we will link this to Firebase to actually collect the leads!
    setModalState('success');
    setTimeout(() => {
      setIsModalOpen(false);
      setModalState('form'); 
      setHospName(''); // Clear hospital name for the next demo
      setEmail('');    // Clear email for the next demo
    }, 3000); 
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-300 selection:bg-blue-500/30 relative">
      
      {/* --- POPUP DEMO MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white text-xl"
            >
              ✕
            </button>

            {modalState === 'form' ? (
              <>
                <h3 className="text-2xl font-black text-white mb-2">Request a Demo</h3>
                <p className="text-slate-400 mb-6 text-sm">Leave your details and our team will set up your hospital's custom ArogyaNext workspace.</p>
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <input 
                    type="text" required placeholder="Hospital / Clinic Name" 
                    value={hospName} onChange={(e) => setHospName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                  />
                  <input 
                    type="text" required placeholder="Your Name" 
                    value={userName} onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                  />
                  <input 
                    type="email" required placeholder="Work Email" 
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                  />
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 mt-2">
                    Submit Request
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-2xl font-black text-white mb-2">Request Sent!</h3>
                <p className="text-slate-400">Our onboarding team will contact you within 24 hours.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- NAVBAR --- */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black tracking-wider text-white flex items-center cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            Arogya<span className="text-blue-500">Next</span>
            <span className="ml-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] px-2 py-1 rounded font-black tracking-widest uppercase">AI</span>
          </div>
          <div className="hidden md:flex space-x-8 font-medium text-sm text-slate-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How it Works</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">For Hospitals</button>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={onLoginClick}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-white hover:bg-slate-800 transition-colors border border-slate-700"
            >
              Staff Login
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all"
            >
              Book a Demo
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-40 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-bold tracking-wide backdrop-blur-sm">
          🚀 The Next Generation of Hospital Management
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight mb-8 leading-tight relative z-10">
          Zero wait times. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Infinite efficiency.
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-12 leading-relaxed relative z-10">
          ArogyaNext AI is the complete operating system for modern clinics. From voice-activated mobile booking to real-time TV queues, we eliminate the chaos of the waiting room.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-lg bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-xl hover:-translate-y-1"
          >
            Start Free Trial
          </button>
          <button 
            onClick={() => scrollToSection('features')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg border border-slate-700 hover:border-slate-500 text-white bg-slate-800/50 backdrop-blur-md transition-all"
          >
            Explore Features
          </button>
        </div>
      </div>

      {/* --- UPGRADED FEATURES GRID (With Pharmacy) --- */}
      <div id="features" className="bg-slate-950 py-32 border-t border-slate-800 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Everything your hospital needs.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Stop using five different software tools. ArogyaNext unifies the patient journey with cutting-edge AI and seamless real-time syncing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1: AI Voice Booking */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-blue-500/50 transition-colors group">
              <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🎙️</div>
              <h3 className="text-xl font-bold text-white mb-3">AI Voice Booking</h3>
              <p className="text-slate-400 leading-relaxed">Perfect for elderly patients. Just tap the microphone and say <span className="text-slate-300 italic">"I have chest pain."</span> The AI instantly flags emergencies and pre-fills the booking.</p>
            </div>

            {/* Feature 2: Smart Triage */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-purple-500/50 transition-colors group">
              <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🤖</div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Symptom Triage</h3>
              <p className="text-slate-400 leading-relaxed">Stop guessing which doctor to see. Patients select their symptoms, and our logic engine automatically routes them to the correct specialist.</p>
            </div>

            {/* Feature 3: Voice TV Signage */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-emerald-500/50 transition-colors group">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">📺</div>
              <h3 className="text-xl font-bold text-white mb-3">Voice-Enabled TV Signage</h3>
              <p className="text-slate-400 leading-relaxed">Transform your lobby. Smart TVs display the live queue and use native Text-to-Speech to physically call out token numbers so patients never miss their turn.</p>
            </div>

            {/* Feature 4: Patient App */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-orange-500/50 transition-colors group">
              <div className="w-14 h-14 bg-orange-500/10 text-orange-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">📱</div>
              <h3 className="text-xl font-bold text-white mb-3">Patient Mobile App</h3>
              <p className="text-slate-400 leading-relaxed">Patients book from home, view estimated wait times, and track their live queue status, instantly eliminating physical crowding in the waiting room.</p>
            </div>

            {/* Feature 5: Doctor Dashboard */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-pink-500/50 transition-colors group">
              <div className="w-14 h-14 bg-pink-500/10 text-pink-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">👨‍⚕️</div>
              <h3 className="text-xl font-bold text-white mb-3">Frictionless Doctor Panel</h3>
              <p className="text-slate-400 leading-relaxed">A distraction-free interface for doctors to see who is up next, view pre-filled symptoms, and trigger the TV voice announcement with one click.</p>
            </div>

            {/* Feature 6: Director Analytics */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-indigo-500/50 transition-colors group">
              <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-xl font-bold text-white mb-3">Director Analytics Hub</h3>
              <p className="text-slate-400 leading-relaxed">Give hospital management a real-time, bird's-eye view of active doctors, patient load distribution, and critical ER cases across the facility.</p>
            </div>

            {/* NEW MASSIVE FEATURE 7: E-Pharmacy Sync */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-teal-500/50 transition-all group md:col-span-2 lg:col-span-3 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="w-20 h-20 bg-teal-500/10 text-teal-400 rounded-3xl flex items-center justify-center text-4xl flex-shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(20,184,166,0.2)]">💊</div>
              
              <div>
                <div className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 text-xs font-black tracking-widest uppercase rounded-md mb-3 border border-teal-500/30">New Feature</div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3">Instant E-Pharmacy Routing</h3>
                <p className="text-slate-400 text-lg leading-relaxed max-w-4xl">Doctors write digital prescriptions directly inside their dashboard. The moment the consultation ends, the medicine list is instantly beamed to your in-house pharmacy. The medicine is packed and ready before the patient even reaches the counter, ensuring a zero-wait checkout and keeping pharmacy revenue inside your hospital.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- HOW IT WORKS SECTION --- */}
      <div id="how-it-works" className="py-32 scroll-mt-20 border-t border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">How ArogyaNext flows.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">A seamless loop from the patient's living room to the doctor's consultation desk.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-900 via-blue-500/50 to-purple-900 z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-slate-950 border-4 border-slate-800 group-hover:border-blue-500 rounded-full flex items-center justify-center text-3xl mb-6 shadow-xl transition-colors">1️⃣</div>
              <h3 className="text-xl font-bold text-white mb-2">Patient Books</h3>
              <p className="text-slate-400 text-sm">Patient books via the mobile app or AI voice assistant and gets a live digital token.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-slate-950 border-4 border-slate-800 group-hover:border-blue-500 rounded-full flex items-center justify-center text-3xl mb-6 shadow-xl transition-colors">2️⃣</div>
              <h3 className="text-xl font-bold text-white mb-2">Smart Queue</h3>
              <p className="text-slate-400 text-sm">Patient arrives just in time. The Waiting Room TV auto-syncs to show who is "Up Next".</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-slate-950 border-4 border-slate-800 group-hover:border-purple-500 rounded-full flex items-center justify-center text-3xl mb-6 shadow-xl transition-colors">3️⃣</div>
              <h3 className="text-xl font-bold text-white mb-2">Doctor Calls</h3>
              <p className="text-slate-400 text-sm">Doctor clicks "Call Next". The TV visually updates and announces the token aloud.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-slate-950 border-4 border-slate-800 group-hover:border-emerald-500 rounded-full flex items-center justify-center text-3xl mb-6 shadow-xl transition-colors">4️⃣</div>
              <h3 className="text-xl font-bold text-white mb-2">Director Tracks</h3>
              <p className="text-slate-400 text-sm">Hospital Admin watches the entire ecosystem flow via the real-time analytics panel.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- PRICING SECTION --- */}
      <div id="pricing" className="py-32 scroll-mt-20 border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Simple, scalable pricing.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">No hidden installation fees. Pay only for the size of your workforce.</p>
          </div>

          <div className="max-w-md mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-center py-3">
                <p className="text-white font-black text-sm tracking-widest uppercase animate-pulse">
                  🚀 First 50 Clinics: 6 Months Free
                </p>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Clinic Pro Plan</h3>
                <p className="text-slate-400 text-sm mb-6">Full access to the entire ArogyaNext ecosystem.</p>
                
                <div className="mb-6">
                  <span className="text-5xl font-black text-white">₹999</span>
                  <span className="text-slate-500 font-medium"> / month base</span>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-4 mb-8 border border-slate-700/50 inline-block">
                  <span className="text-blue-400 font-bold tracking-wide">+ ₹500 / month</span>
                  <span className="text-slate-400 text-sm ml-2">per active doctor</span>
                </div>

                <ul className="space-y-4 mb-8 text-slate-300 text-sm font-medium">
                  <li className="flex items-center"><span className="text-emerald-500 mr-3 text-lg">✓</span> Unlimited Patient Bookings</li>
                  <li className="flex items-center"><span className="text-emerald-500 mr-3 text-lg">✓</span> Unlimited Support Staff Logins</li>
                  <li className="flex items-center"><span className="text-emerald-500 mr-3 text-lg">✓</span> Voice-Enabled TV Signage</li>
                  <li className="flex items-center"><span className="text-emerald-500 mr-3 text-lg">✓</span> Director Analytics Dashboard</li>
                  <li className="flex items-center"><span className="text-emerald-500 mr-3 text-lg">✓</span> AI Triage & Voice Assistant</li>
                </ul>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-white hover:bg-slate-100 text-slate-900 font-black py-4 rounded-xl transition-all shadow-md hover:-translate-y-0.5"
                >
                  Claim Your 6-Month Pilot
                </button>
                <p className="text-center text-slate-500 text-xs mt-4 font-medium">
                  No credit card required for pilot setup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CTA SECTION --- */}
      <div className="py-32 relative overflow-hidden border-t border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-950/20"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl font-black text-white mb-8">Ready to upgrade your hospital?</h2>
          <p className="text-xl text-slate-400 mb-10">Join the network of modern clinics eliminating wait times and boosting patient satisfaction.</p>
          <button onClick={() => setIsModalOpen(true)} className="px-10 py-5 rounded-2xl font-black text-xl bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-600/30 transition-all hover:scale-105">
            Book a Full System Demo
          </button>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-xl font-black tracking-wider text-slate-500 mb-4 md:mb-0">
            Arogya<span className="text-slate-400">Next</span>
          </div>
          <div className="text-slate-600 text-sm font-medium">
            © {new Date().getFullYear()} ArogyaNext Technologies. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}