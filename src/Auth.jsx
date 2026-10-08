import { useState } from 'react';
import { auth, db } from './firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; 
import { doc, setDoc, getDoc } from 'firebase/firestore'; 
import { 
  Eye, 
  EyeOff, 
  Stethoscope, 
  Pill, 
  Building2, 
  ClipboardList, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); 
  const [hospitalId, setHospitalId] = useState('');
  const [role, setRole] = useState('Receptionist');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  
  // State for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const finalHospitalId = role === 'Super Admin' ? 'SYSTEM_MASTER' : hospitalId.toUpperCase();

        if (role !== 'Super Admin') {
          const hospitalRef = doc(db, 'hospitals', finalHospitalId);
          const hospitalSnap = await getDoc(hospitalRef);
          
          if (!hospitalSnap.exists()) {
            throw new Error("Invalid Hospital ID. Please check with your clinical administrator.");
          }
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: email,
          fullName: fullName,
          hospitalId: finalHospitalId, 
          role: role,
          createdAt: new Date().toISOString()
        });

        if (role === 'Doctor') {
          await setDoc(doc(db, 'doctors', userCredential.user.uid), {
            name: fullName, 
            hospitalId: finalHospitalId, 
            specialty: "General", 
            isActive: true
          });
        }
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', '')); 
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setResetMessage('');
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setIsLoading(false);
    }
  };

  const rolesList = [
    { id: 'Receptionist', label: 'Reception', icon: ClipboardList },
    { id: 'Doctor', label: 'Doctor', icon: Stethoscope },
    { id: 'Pharmacist', label: 'Pharmacy', icon: Pill },
    { id: 'Hospital Admin', label: 'Admin', icon: Building2 },
  ];

  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4 font-sans">
      <div className="max-w-md w-full bg-[#090D16] rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden border border-white/15 specular-border">
        
        {/* Header with Glowing Medical Mark */}
        <div className="p-6 sm:p-8 text-center border-b border-white/[0.08] relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-blue-600 to-cyan-400 flex items-center justify-center font-black text-white text-xl mx-auto mb-3 shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-white/20">
            ✚
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            Arogya<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">Next</span>
          </h1>
          <p className="text-slate-400 mt-1 text-xs font-mono uppercase tracking-widest">
            Clinical Operating System • Staff Portal
          </p>
        </div>

        <div className="p-6 sm:p-8">
          
          {/* Segmented Sign In / Register Tab */}
          {!isForgotPassword && (
            <div className="bg-white/[0.03] p-1 rounded-full border border-white/10 flex mb-6">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isLogin ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  !isLogin ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Register Staff
              </button>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 text-rose-300 p-3.5 rounded-2xl mb-5 text-xs font-semibold border border-rose-500/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resetMessage && (
            <div className="bg-emerald-500/10 text-emerald-300 p-3.5 rounded-2xl mb-5 text-xs font-semibold border border-emerald-500/30 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{resetMessage}</span>
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                Enter your registered work email to receive a secure recovery authorization link.
              </p>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-white/15 bg-white/[0.03] focus:bg-white/[0.06] text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" 
                    placeholder="doctor@hospital.com"
                  />
                </div>
              </div>
              <button 
                type="submit" disabled={isLoading}
                className="w-full bg-white hover:bg-slate-100 text-black font-extrabold py-3.5 rounded-full transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] mt-2 active:scale-98 cursor-pointer text-sm"
              >
                {isLoading ? 'Transmitting...' : 'Send Reset Link'}
              </button>
              <div className="mt-4 text-center">
                <button 
                  type="button" 
                  onClick={() => { setIsForgotPassword(false); setError(''); setResetMessage(''); }}
                  className="text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  ← Return to Sign In
                </button>
              </div>
            </form>

          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-white/15 bg-white/[0.03] focus:bg-white/[0.06] text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" 
                        placeholder="Dr. Rajesh Sharma"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-2">
                      Clinical Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {rolesList.map((r) => {
                        const Icon = r.icon;
                        const isSelected = role === r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setRole(r.id)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                                : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{r.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {role !== 'Super Admin' && (
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                        Hospital Access Code
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" required value={hospitalId} onChange={(e) => setHospitalId(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-white/15 bg-white/[0.03] focus:bg-white/[0.06] text-white font-mono uppercase placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" 
                          placeholder="HOSP_BWINFN"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-white/15 bg-white/[0.03] focus:bg-white/[0.06] text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" 
                    placeholder="doctor@hospital.com"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                    Password
                  </label>
                  {isLogin && (
                    <button 
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setError(''); }}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 text-sm rounded-xl border border-white/15 bg-white/[0.03] focus:bg-white/[0.06] text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" 
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" disabled={isLoading}
                className="w-full bg-white hover:bg-slate-100 text-black font-extrabold py-3.5 rounded-full transition-all shadow-[0_0_30px_rgba(255,255,255,0.25)] mt-3 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <span>{isLoading ? 'Authorizing...' : (isLogin ? 'Sign In to Workspace' : 'Initialize Account')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}