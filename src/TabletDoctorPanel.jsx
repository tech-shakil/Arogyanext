import { useState, useRef, useEffect } from 'react';
import { db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function TabletDoctorPanel() {
  // --- STATE ---
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [digitalPrescription, setDigitalPrescription] = useState("");
  
  // Dummy patient for the demo
  const currentPatient = { id: "demo123", patientName: "Rahul Sharma", tokenNumber: "T-45" };

  // --- SETUP CANVAS ---
  useEffect(() => {
    const canvas = canvasRef.current;
    // Make canvas sharp on high-res tablet screens
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    canvas.style.width = `${canvas.offsetWidth}px`;
    canvas.style.height = `${canvas.offsetHeight}px`;

    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.lineCap = "round";
    context.strokeStyle = "#1e3a8a"; // Deep blue ink
    context.lineWidth = 3;
    contextRef.current = context;
  }, []);

  // --- DRAWING LOGIC (Mouse & Stylus/Touch) ---
  const startDrawing = ({ nativeEvent }) => {
    // Prevent scrolling while drawing on a tablet
    nativeEvent.preventDefault(); 
    
    // Support both mouse and touch coordinates
    const offsetX = nativeEvent.offsetX || nativeEvent.touches?.[0]?.clientX - canvasRef.current.getBoundingClientRect().left;
    const offsetY = nativeEvent.offsetY || nativeEvent.touches?.[0]?.clientY - canvasRef.current.getBoundingClientRect().top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    nativeEvent.preventDefault();

    const offsetX = nativeEvent.offsetX || nativeEvent.touches?.[0]?.clientX - canvasRef.current.getBoundingClientRect().left;
    const offsetY = nativeEvent.offsetY || nativeEvent.touches?.[0]?.clientY - canvasRef.current.getBoundingClientRect().top;

    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    setDigitalPrescription("");
  };

  // --- AI HANDWRITING RECOGNITION (Simulation) ---
  const processHandwriting = () => {
    setIsProcessing(true);
    
    // In a real app, you would send the canvas image (canvas.toDataURL()) to Google Cloud Vision API here.
    // We will simulate the AI taking 2 seconds to read the doctor's handwriting.
    setTimeout(() => {
      setDigitalPrescription("1. Dolo 650mg - 1 Morning, 1 Night (After food)\n2. Azithromycin 500mg - 1x Daily\n3. Cough Syrup - 2 tsp at night");
      setIsProcessing(false);
    }, 2000);
  };

  const sendToPharmacy = async () => {
    if (!digitalPrescription) {
      alert("Please process the handwriting or type a prescription first.");
      return;
    }
    
    try {
      // In a real app, update the actual Firebase document
      alert("✅ Prescription sent instantly to the Pharmacy Hub!");
      clearPad();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6 flex flex-col md:flex-row gap-6 font-sans text-slate-300">
      
      {/* LEFT SIDE: The Freehand Stylus Pad */}
      <div className="w-full md:w-1/2 flex flex-col h-[85vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-black text-white flex items-center">
            <span className="text-blue-500 mr-3">✍️</span> Smart Rx Pad
          </h2>
          <button onClick={clearPad} className="text-sm font-bold text-slate-400 hover:text-red-400 transition-colors">
            🗑️ Clear Pad
          </button>
        </div>

        {/* The Canvas Area */}
        <div className="flex-1 bg-white rounded-3xl relative shadow-inner overflow-hidden border border-slate-700">
          {/* Faint ruling lines to look like a physical notepad */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e2e8f0 31px, #e2e8f0 32px)', backgroundPositionY: '32px' }}></div>
          
          <div className="absolute top-4 left-6 pointer-events-none">
            <span className="text-4xl font-black text-blue-900/10 font-serif italic">Rx</span>
          </div>

          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            className="w-full h-full cursor-crosshair touch-none absolute inset-0"
          />
        </div>

        <button 
          onClick={processHandwriting}
          disabled={isProcessing}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center"
        >
          {isProcessing ? (
            <span className="animate-pulse">🤖 AI Reading Handwriting...</span>
          ) : (
            <span>✨ Process Handwriting (OCR)</span>
          )}
        </button>
      </div>

      {/* RIGHT SIDE: Digital Sync & Pharmacy Interface */}
      <div className="w-full md:w-1/2 flex flex-col h-[85vh]">
        <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">Active Patient</p>
              <h3 className="text-3xl font-black text-white">{currentPatient.patientName}</h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-1">Token</p>
              <p className="text-2xl font-black text-blue-500">{currentPatient.tokenNumber}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-slate-900 rounded-3xl border border-slate-700 flex flex-col relative overflow-hidden">
          <div className="bg-slate-800/50 p-4 border-b border-slate-700">
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest flex items-center">
              <span className="mr-2">💻</span> Digital Translation
            </p>
          </div>
          
          <textarea 
            value={digitalPrescription}
            onChange={(e) => setDigitalPrescription(e.target.value)}
            placeholder="Digital text will appear here after AI processing. You can also type manually to make corrections..."
            className="flex-1 w-full bg-transparent text-white p-6 outline-none resize-none font-medium leading-relaxed"
          ></textarea>
        </div>

        <button 
          onClick={sendToPharmacy}
          className="mt-6 w-full bg-teal-600 hover:bg-teal-500 text-white font-black py-5 rounded-2xl text-xl shadow-lg shadow-teal-600/20 transition-all"
        >
          ✅ Approve & Send to Pharmacy
        </button>
      </div>

    </div>
  );
}