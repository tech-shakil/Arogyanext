import { useState } from 'react';
import { auth, db } from './firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; 
import { doc, setDoc, getDoc } from 'firebase/firestore'; 

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
            throw new Error("Firebase: Invalid Hospital ID. Please ask your admin for the correct code.");
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

  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        <div className="bg-slate-50 p-6 sm:p-8 text-center border-b border-slate-100">
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-slate-800 flex items-center justify-center">
            Arogya<span className="text-blue-600">Next</span>
            <span className="ml-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded font-black tracking-widest">AI</span>
          </h1>
          <p className="text-slate-500 mt-1 sm:mt-2 text-xs sm:text-sm font-medium">Hospital Management Portal</p>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">
            {isForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Staff Account')}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 text-xs sm:text-sm font-bold border border-red-100">
              ⚠️ {error}
            </div>
          )}

          {resetMessage && (
            <div className="bg-emerald-50 text-emerald-700 p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 text-xs sm:text-sm font-bold border border-emerald-100">
              ✅ {resetMessage}
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handlePasswordReset} className="space-y-4 sm:space-y-5">
              <p className="text-xs sm:text-sm text-slate-500 mb-4">Enter your email address and we will send you a secure link to reset your password.</p>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1.5">Email Address</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm rounded-xl border focus:border-blue-500 focus:ring-2 outline-none bg-slate-50 transition-all" 
                  placeholder="admin@hospital.com"
                />
              </div>
              <button 
                type="submit" disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-2 active:scale-98"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <div className="mt-4 sm:mt-6 text-center">
                <button 
                  type="button" 
                  onClick={() => { setIsForgotPassword(false); setError(''); setResetMessage(''); }}
                  className="text-slate-500 hover:text-blue-600 text-xs sm:text-sm font-bold transition-colors"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>

          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1.5">Full Name</label>
                      <input 
                        type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm rounded-xl border focus:border-blue-500 focus:ring-2 outline-none bg-slate-50 transition-all" 
                        placeholder="e.g. Dr. Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1.5">Staff Role</label>
                      <select 
                        required value={role} onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm rounded-xl border focus:border-blue-500 focus:ring-2 outline-none bg-slate-50 transition-all"
                      >
                        <option value="Receptionist">Receptionist</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Pharmacist">Pharmacist</option>
                        <option value="Hospital Admin">Hospital Admin</option>
                      </select>
                    </div>
                    {role !== 'Super Admin' && (
                      <div>
                        <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1.5">Hospital Access Code</label>
                        <input 
                          type="text" required value={hospitalId} onChange={(e) => setHospitalId(e.target.value)}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm rounded-xl border focus:border-blue-500 focus:ring-2 outline-none bg-slate-50 transition-all uppercase" 
                          placeholder="e.g. HOSP_X92K"
                        />
                      </div>
                    )}
                  </>
                )}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1.5">Email Address</label>
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm rounded-xl border focus:border-blue-500 focus:ring-2 outline-none bg-slate-50 transition-all" 
                    placeholder="name@hospital.com"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-slate-600">Password</label>
                    {isLogin && (
                      <button 
                        type="button"
                        onClick={() => { setIsForgotPassword(true); setError(''); }}
                        className="text-blue-600 hover:text-blue-700 text-xs font-bold transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-3.5 sm:pl-4 pr-11 py-2.5 sm:py-3 text-sm rounded-xl border focus:border-blue-500 focus:ring-2 outline-none bg-slate-50 transition-all" 
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-3 active:scale-98"
                >
                  {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              <div className="mt-6 sm:mt-8 text-center">
                <button 
                  type="button" 
                  onClick={() => { setIsLogin(!isLogin); setError(''); setShowPassword(false); }}
                  className="text-slate-500 hover:text-blue-600 text-xs sm:text-sm font-bold transition-colors"
                >
                  {isLogin ? "Need staff access? Request an account" : "Already have an account? Sign in"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}